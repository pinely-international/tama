import "./Cart.scss"

import { Proton } from "@denshya/proton"
import Price from "@/utils/price"

import MarketContext from "../../context/MarketContext"
import { STATIC_PRODUCTS } from "../../mock"



interface CartProps { }

function Cart(this: Proton.Shell, props: CartProps) {
  const market = this.context.require(MarketContext)

  const total = market.cart.to(cart =>
    STATIC_PRODUCTS.reduce((result, next) => {
      const amount = cart.get(next.id)
      if (amount == null) return result

      return result + (next.price * amount)
    }, 0)
  )
  // const total = market.cart.to(cart => cart.entries().reduce((result, [id, amount]) => result + STATIC_PRODUCTS.price, 0))

  return (
    <div className="cart">
      {total.to(Price.format)}
    </div>
  )
}

export default Cart
