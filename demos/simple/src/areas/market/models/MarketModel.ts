import { Flow } from "@denshya/flow"
import { MarketProduct } from "../types"

class MarketModel {
  /** User's products cart with duplicates amount. */
  readonly cart = new Flow<Map<MarketProduct["id"], number>>(new Map)
  /** User's favourite products. */
  readonly liked = new Flow<Set<MarketProduct["id"]>>(new Set)

  readonly filters = {
    search: new Flow(""),
  } as const
  readonly sorting = {}
}

export default MarketModel
