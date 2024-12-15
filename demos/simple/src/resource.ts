type Company = {}
type Hashable<K extends keyof never, T> = Record<K, T> | [K, T][]

interface ResourceState<T> extends Observable<T> {
  data: T | null
  dataInitial: T | null

  error: Error | null
  errored: boolean
  erroredAt: Date

  updates: unknown[]
  updated: boolean
  updatedAt: Date

  set(newData: T | null): void
  reset(): void
  recover(): void
}


class StateGit<T> {
  readonly current: StateCommit<T>
  readonly initial: StateCommit<T>
  readonly commits: StateCommit<T>[] = []

  constructor(initial: StateCommit<T>) {
    this.initial = initial
    this.current = initial
  }

  protected pushCommit(commit: StateCommit<T>): void {
    this.commits.push(commit)
  }

  public commit(newData: Partial<T> | null): void {
    this.pushCommit({ date: new Date, data: newData, error: null })
  }

  public async optimistic(scope: () => void | Promise<void>): Promise<void> {
    const branch = this.branches

    try {
      await scope()
    } catch (error) {


      throw error
    }
  }

  public async transact(operations: AsyncIterable<Operation<T>> | (Operation<T | Promise<void>>)[]): Promise<void> { }
}

type Operation<T> = Partial<T> | null | void

interface StateCommit<T> {
  date: Date
  data: T | null
  error: Error | null
}


interface ResourceStateIterable<T> extends ResourceState<Iterable<T>>, Set<T> { }
interface ResourceStateHashable<K extends keyof never, T> extends ResourceState<Hashable<K, T>>, ReadonlyMap<string, T> { }

interface ResourcePersist { }

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

class ResourceRetrier {
  public accounts(observable: Observable<boolean>) { }
}

/**
 * @Singleton
 */
export abstract class ExternalResource<T> extends ResourceReference implements Observable<T> {
  static from<C extends { prototype: unknown, constructor: unknown } = never>(resource: C) { throw new Error("Method is not implemented") }

  protected readonly keys: readonly string[]
  protected readonly state: StateGit<T>

  protected readonly persistor: ResourcePersist | null = null
  protected readonly retrier = new ResourceRetrier

  protected abstract subscriptions(): Iterable<Subscription | (() => void)>

  subscribe(next?: ((value: T) => void) | undefined): Subscription {
    throw new Error("Method not implemented.")
  }
  when<S extends T>(predicate: (value: T) => unknown): Observable<S> {
    throw new Error("Method not implemented.")
  }

  supplies<U>(resource: new (...keys: never[]) => ExternalResource<U | T>): void { }


  protected optimistic(attempt: () => void | Promise<void>): Observable<void> {

  }

  abstract get(): Promise<T>


  public dispatch(event: ResourceEvent) { }
  public broadcast(event: ResourceEvent) { }

  public refetch() { }
  public invalidate() { }
}

export interface ExternalResourceIterable<T> {
  readonly keys: readonly string[]
  readonly state: ResourceStateIterable<T>
  readonly persist: ResourcePersist

  get(): Promise<T>
  put(newData: T): Promise<T>

  delete(): Promise<void>
  deleteItem(item: T): Promise<null>
}

export abstract class ExternalResourceHashable<K extends keyof never, T> extends ResourceReference implements Observable<T>, ObservableRecord<K, T> {
  [Symbol.dispose](): void {
    throw new Error("Method not implemented.")
  }
  subscribe(next?: ((value: T) => void) | undefined): Subscription {
    throw new Error("Method not implemented.")
  }
  when<S extends T>(predicate: (value: T) => unknown): Observable<S> {
    throw new Error("Method not implemented.")
  }
  /**
   * Shorthand for `when(item => item.key === key)`
  */
  at(key: K): Observable<T> {
    throw new Error("Method not implemented.")
  }

  shares(observableState: Observable<StateCommit<T>>): Observable<T> {
    throw new Error("Method not implemented.")
  }

  abstract readonly keys: readonly string[]
  abstract readonly state: ResourceStateHashable<K, T>
  abstract readonly persist: ResourcePersist

  abstract get(): Promise<ReadonlyMap<K, T>>
}

class NetworkObserver {
  static readonly state: Observable<boolean>
}

export class CompanyResource extends ExternalResource<Company> {
  static from(company: Company) { return new CompanyResource(company.id) }

  private dao = new CompanyDAO(this.id)

  private companies = new CompaniesResource
  private companyEvents = new CompanyEvents

  constructor(protected id: string) {
    super(id)

    this.retrier.requires(NetworkObserver.state, true)
  }

  protected *subscriptions() {
    yield this.companies.at(this.id).subscribe(this.state.commit)
    yield this.companyEvents.on("UPDATE", event => this.state.commit(event.company))
  }

  //#region Controls

  public async get() {
    const company = await this.dao.find(this.id)
    this.state.commit(company)
    return company
  }

  public async update(dto: CompanyUpdateDTO) {
    await this.state.conduct(this.optimisticUpdate(dto))
    await this.state.conduct(async transaction => {
      // transaction.setup({ abortTime: Infinity })
      await new Promise(() => { })

      transaction.yield({ title: dto.companyName, logo: dto.companyLogo })
      transaction.trial(this.dao.update(this.id, dto))

      await new Promise(() => { })

      transaction.yield({ title: dto.companyName, logo: dto.companyLogo })
      transaction.trial(this.dao.update(this.id, dto))
    })

    await this.state.optimistic(() => {
      this.onUpdate(dto)
      return this.dao.update(this.id, dto)
    })
  }
  private *optimisticUpdate(dto: CompanyUpdateDTO) {
    yield { title: dto.companyName, logo: dto.companyLogo }
    yield this.dao.update(this.id, dto)
  }

  public async delete() {
    await this.state.transact([null, this.dao.delete(this.id)])
  }

  //#region Events

  @InjectEvent(CompanyUpdateEvent)
  protected onUpdate(@EventSelect("dto") dto: CompanyUpdateDTO) {
    this.state.commit({
      logo: dto.companyLogo && URL.createObjectURL(dto.companyLogo),
      title: dto.companyName,
    })
  }
}



export class CompaniesResource extends ExternalResource<Record<string, Company>> {
  constructor(protected filters?: CompanyFiltersDTO) {
    super()

    this.supplies(CompanyResource)
  }
}


interface Subscription {
  unsubscribe(): void
}



export interface Observable<T> extends Disposable {
  subscribe(next?: (value: T) => void): Subscription

  when<S extends T>(predicate: (value: T) => unknown): Observable<S>
}

interface ObservableInterop<T> {
  [Symbol.observable](): {
    subscribe(next?: (value: T) => void): Subscription
  }
}

/**
 * Can be a plain record or a
 */
export interface ObservableRecord<K extends keyof never, T> {
  at(key: K): Observable<T>
}
