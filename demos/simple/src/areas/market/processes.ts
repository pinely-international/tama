import Percentage from "@/utils/Percentage"
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

export function cartTotals(products: MarketProduct[], cart: Map<MarketProduct["id"], number>) {
  return products.reduce((result, product) => {
    const amount = cart.get(product.id)

    if (amount == null) return result
    if (amount === 0) return result

    const price = product.price * amount

    result.raw += price
    result.discount += price * Percentage.multiplier(product.discount)

    result.discountPercent = Math.floor((result.discount / result.raw) * 100)
    result.subtotal = result.raw - result.discount

    return result
  }, { raw: 0, discount: 0, discountPercent: 0, subtotal: 0 })
}
