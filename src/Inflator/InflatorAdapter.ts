import { Simplify } from "type-fest"

import Inflator from "./Inflator"

export abstract class InflatorAdapter {
  constructor(protected readonly inflator: Inflator) { }

  // /** Tests if this adapter is applicable. */
  // abstract test(value: unknown): boolean
  /** Adapts `value` to the operable format. */
  abstract inflate(value: unknown): unknown
}

// export interface InflatorAdapterInterface {
//   readonly inflator: Inflator
//   /** Adapts `value` to the operable format. */
//   inflate(value: unknown): unknown
// }

export type InflatorAdapterObject = Simplify<InflatorAdapter>
export type InflatorAdapterConstructor = new (inflator: Inflator) => InflatorAdapterObject
