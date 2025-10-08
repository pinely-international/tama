interface Accessor<T> {
  get(): T
  set(value: T): void
}

export interface AccessorGet<T> { get(): T }
export interface AccessorSet<T> { set(value: T): void }

export type Accessible<T> = Partial<Accessor<T>>

export default Accessor
