import { Emitter, Flow, Messager } from "@denshya/flow"

type Company = {
  id: string
  name: string
  logo: string
}
class CompanyDAO { }

interface CompanyUpdateDTO {
  companyName: string
  companyLogo: string
}
interface CompanyFiltersDTO { }



class ResourceAccessError extends Error {
  constructor(message: string, readonly timestamp: number) { super(message) }
}
interface ResourceAccess<T> {
  data: T | null
  error: ResourceAccessError | null
  timestamp: number
}
interface ResourceAccessState<T> {
  current: ResourceAccess<T>
  initial: ResourceAccess<T>
  accesses: ResourceAccess<T>[]
}


const NULL_RESOURCE_ACCESS: ResourceAccess<never> = { data: null, error: null, timestamp: Date.now() }


interface ResourcePersistor { }

abstract class ResourceReference {
  private static instances: Map<string, unknown> = new Map

  constructor(...keys: unknown[]) {
    const keysHash = this.hashing(keys)

    if (ResourceReference.instances.has(keysHash)) {
      return ResourceReference.instances.get(keysHash)! as never
    }
    ResourceReference.instances.set(keysHash, this)
  }

  protected hashing(value: unknown): string { return JSON.stringify(value) }
}


interface ResourceCacheEvents<T> {
  change: T | null
  invalidate: void
}

class ResourceCache<T> {
  /** Time after which the cached value is treated invalid. */
  lifespan = -1
  lastChangeAt = -1

  get expired() { return Date.now() > (this.lastChangeAt + this.lifespan) }
  get valid() { return !this.invalidated && !this.expired }

  private value: T | null = null

  set(value: T | null) {
    this.value = value
    this.lastChangeAt = Date.now()
    this.events.dispatch("change", value)
  }
  get(): T | null { return this.value }

  private invalidated = false
  /** Sends signal that current cache value is not supposed */
  invalidate() {
    this.invalidated = true
    this.events.dispatch("invalidate", void 0)
  }

  private readonly events = new Emitter<ResourceCacheEvents<T>>
  on<Name extends keyof ResourceCacheEvents<T>>(event: Name) {
    return this.events.observe(event)
  }
}

class Retrier {
  /** Max amount of retry attempts. */
  public max = 0
  /** Current amount of retry attempts. */
  public count = 0
  public get finished() { return this.count >= this.max }

  /** Interval delay until the next retry attempt. */
  public interval = 0
  /** Can be used for progressive interval. */
  public intervalInterpolation = () => 1

  public readonly required = new Set<StateReadonly<boolean>>()

  constructor() { }

  private timeout = -1
  protected async schedule(callback: () => void) {
    const required = this.required
      .values()
      .map(state => state.get() === false && new Promise(resolve => state[Symbol.subscribe](resolve)))
      .map(async value => value && (await value) === false)

    if (this.finished) return
    if (this.required.values().some(item => item.get() === false)) {
      await Promise.all(required)
    }

    this.timeout = setTimeout(callback, this.interval * this.intervalInterpolation())
  }
  protected cancel() {
    clearTimeout(this.timeout)
    this.timeout = -1
  }
}

/**
 * @Singleton
 */
export abstract class ResourceGateway<T> extends ResourceReference {
  // static from(other: unknown) { throw new Error("`from` method is not implemented") }

  protected readonly state = new Flow<T | null>(null)
  protected readonly accessState: ResourceAccessState<T> = { accesses: [], current: NULL_RESOURCE_ACCESS, initial: NULL_RESOURCE_ACCESS }
  protected readonly mutations = []

  protected readonly persistor: ResourcePersistor | null = null
  protected readonly retrier = new Retrier
  protected readonly cache = new ResourceCache<T>

  constructor(...keys: unknown[]) {
    super(...keys)


  }

  protected abstract access(): Promise<T>

  private async accessData(): Promise<T> {
    const data = await this.access()
    const access = { data, error: null, timestamp: Date.now() }

    this.accessState.accesses.push(access)
    this.accessState.current = access

    if (this.accessState.initial === NULL_RESOURCE_ACCESS) {
      this.accessState.initial = access
    }


    this.state.set(data)
    this.cache.set(data)

    return data
  }

  public async get(): Promise<T> {
    const data = await this.accessData()



    return data
  }

  public async preload() { return await this.accessData() }
  public async refresh() { }
}



class StateReadonly<T> {
  private value: T
  private messager = new Messager<T>

  constructor(initialValue: T) { this.value = initialValue }

  get() { return this.value }
  protected set(value: T) { this.messager.dispatch(value) }
  [Symbol.subscribe](next: (value: T) => void) { return this.messager.subscribe(next) }
}

abstract class WebResourceGateway<T> extends ResourceGateway<T> {
  constructor(...keys: unknown[]) {
    super(...keys)

    this.cache.lifespan = 30_000

    this.retrier.max = 10
    this.retrier.interval = 3_000
    this.retrier.intervalInterpolation = () => this.quad(1, 8, 10, this.retrier.count / this.retrier.max)

    this.retrier.required.add(WebResourceGateway.WindowFocused)
    this.retrier.required.add(WebResourceGateway.NetworkConnected)
  }

  private quad(p0: number, p1: number, p2: number, t: number) {
    return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2
  }
}
namespace WebResourceGateway {
  export const NetworkConnected = new class extends StateReadonly<boolean> {
    constructor() {
      super(window.navigator.onLine)

      window.addEventListener("online", () => this.set(true))
      window.addEventListener("offline", () => this.set(false))
    }
  }

  export const WindowFocused = new class extends StateReadonly<boolean> {
    constructor() {
      const determine = () => window.document.visibilityState !== "hidden" && !document.hidden
      super(determine())

      window.addEventListener("visibilitychange", () => this.set(determine()))
    }
  }
}



export class CompanyResource extends WebResourceGateway<Company> {
  // static from(company: Company) { return new CompanyResource(company.id) }

  private dao = new CompanyDAO

  private companies = new CompaniesResource
  private companyEvents = new CompanyEvents

  constructor(protected id: string) {
    super(id)

    this.companies.at(this.id) |> this.state.commit
    this.companyEvents.on("UPDATE", event => this.state.commit(event.company))
  }
  //#region Controls

  protected access() {
    return this.dao.find(this.id)
  }

  public async update(dto: CompanyUpdateDTO) {
    const index = this.state.commit({ logo: dto.companyLogo, name: dto.companyName })
    try {
      await this.dao.update(this.id, dto)
    } catch (error) {
      this.state.checkout(index)
    }
  }
  public async delete() {
    await this.state.transact([null, this.dao.delete(this.id)])
  }
}



export class CompaniesResource extends WebResourceGateway<Record<string, Company>> {
  private readonly dao = new CompanyDAO

  constructor(protected filters?: CompanyFiltersDTO) {
    super(filters)

    // this.supplies(CompanyResource)
  }
  protected async access() { return this.dao.findAll(this.filters) }
}
