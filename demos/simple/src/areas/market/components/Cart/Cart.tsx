import "./Cart.scss"

import { Proton } from "@denshya/proton"
import Price from "@/utils/price"

import MarketContext from "../../context/MarketContext"
import { cartTotal } from "../../processes"
import { STATIC_PRODUCTS } from "../../mock"



interface CartProps { }

function Cart(this: Proton.Shell, props: CartProps) {
  const market = this.context.require(MarketContext)

  const total = market.cart.to(cart => cartTotal(STATIC_PRODUCTS, cart))

  return (
    <div className="cart">
      {total.to(Price.format)}
    </div>
  )
}

export default Cart
