import { Events } from "@denshya/proton"
import { MarketProduct } from "../types"

class MarketContext {
  /** User's products cart with duplicates amount. */
  readonly cart = new Events.State<Map<MarketProduct["id"], number>>(new Map)
  /** User's favourites products. */
  readonly liked = new Events.State<Set<MarketProduct["id"]>>(new Set)
}

export default MarketContext
