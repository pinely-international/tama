import { MarketProduct } from "./types"

export function cartPriceTotal(products: MarketProduct[], cart: Map<MarketProduct["id"], number>) {
  return products.reduce((result, next) => {
    const amount = cart.get(next.id)
    if (amount == null) return result

    return result + (next.price * amount)
  }, 0)
}

export function cartDiscountTotal(products: MarketProduct[], cart: Map<MarketProduct["id"], number>) {
  return products.reduce((result, next) => {
    const amount = cart.get(next.id)
    if (amount == null) return result

    return result + (next.discount * amount)
  }, 0)
}
