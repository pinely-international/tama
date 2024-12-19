import { Events } from "@denshya/proton"
import { MarketProduct } from "../types"

class MarketContext {
  /** User's products cart. */
  readonly cart = new Events.State<Set<MarketProduct["id"]>>(new Set)
  /** User's favourites products. */
  readonly liked = new Events.State<Set<MarketProduct["id"]>>(new Set)
}

export default MarketContext
