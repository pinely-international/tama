import { State } from "@denshya/reactive"
import { MarketProduct } from "../types"

class MarketModel {
  /** User's products cart [id => amount]. */
  readonly cart = new State<Map<MarketProduct["id"], number>>(new Map)
  /** User's favourite products by id. */
  readonly liked = new State<Set<MarketProduct["id"]>>(new Set)

  readonly filters = {
    search: new State(""),
  } as const
  readonly sorting = {}
}

export default MarketModel
