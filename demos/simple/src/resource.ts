import { Events } from "@denshya/proton"

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

class ResourceCache {
  stale: number

  set() { }
  get() { }

  invalidate() { }
}

class Retrier {
  /** Max amount of retry attempts. */
  public max = 0
  /** Current amount of retry attempts. */
  public count = 0

  /** Interval delay until the next retry attempt. */
  public interval = 0
  /** Can be used for progressive interval. */
  public intervalInterpolation = () => 1

  constructor(readonly retryCallback: () => void) { }

  public get finished() { return this.count >= this.max }
  public readonly required = new Set<StateReadonly<boolean>>()

  private readonly callbacks = new Set<() => void>()
  protected schedule() {
    if (this.finished) return

    setTimeout(() => {
      this.retryCallback()
      this.schedule()
    }, this.interval * this.intervalInterpolation())
  }

  [Symbol.subscribe](next: () => void) {
    this.callbacks.add(next)
    return { unsubscribe: () => this.callbacks.delete(next) }
  }
}

/**
 * @Singleton
 */
export abstract class ResourceGateway<T> extends ResourceReference {
  // static from(other: unknown) { throw new Error("`from` method is not implemented") }

  protected readonly state = new Events.State<T | null>(null)
  protected readonly accessState: ResourceAccessState<T> = { accesses: [], current: NULL_RESOURCE_ACCESS, initial: NULL_RESOURCE_ACCESS }

  protected readonly persistor: ResourcePersistor | null = null
  protected readonly retrier = new Retrier
  protected readonly cache = new ResourceCache

  constructor(...keys: unknown[]) {
    super(...keys)


  }

  // protected supplies<U>(other: { from(other: unknown): ResourceGateway<U> }): void { }
  // protected optimistic(attempt: () => void | Promise<void>): Observable<void> { }


  // public $: ResourceProxy<T>
  // public it: T | null


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
  private readonly callbacks = new Set<(value: T) => void>()

  protected dispatch(value: T) {
    this.value = value
    this.callbacks.forEach(callback => callback(value))
  }

  constructor(initialValue: T) {
    this.value = initialValue
  }

  get() { return this.value }
  [Symbol.subscribe](next: (value: T) => void) {
    this.callbacks.add(next)
    return { unsubscribe: () => this.callbacks.delete(next) }
  }
}

abstract class WebResourceGateway<T> extends ResourceGateway<T> {
  constructor(...keys: unknown[]) {
    super(...keys)

    this.cache.stale = 30_000

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

      window.addEventListener("online", () => this.dispatch(true))
      window.addEventListener("offline", () => this.dispatch(false))
    }
  }

  export const WindowFocused = new class extends StateReadonly<boolean> {
    constructor() {
      const determine = () => window.document.visibilityState !== "hidden" && !document.hidden
      super(determine())

      window.addEventListener("visibilitychange", () => this.dispatch(determine()))
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

    this.companies.at(this.id).subscribe(this.state.commit)
    this.companyEvents.on("UPDATE", event => this.state.commit(event.company))
  }
  //#region Controls

  protected async access() {
    return await this.dao.find(this.id)
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
