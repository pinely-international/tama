import "./Cart.scss"

import { Events, Proton } from "@denshya/proton"
import Price from "@/utils/price"

import MarketContext from "../../context/MarketContext"
import { cartTotal } from "../../processes"
import { STATIC_PRODUCTS } from "../../mock"



interface CartProps { }

function Cart(this: Proton.Shell, props: CartProps) {
  const market = this.context.require(MarketContext)

  const total = Events.State.compute([new Events.State(STATIC_PRODUCTS), market.cart], cartTotal)

  return (
    <div className="cart">
      {total.to(Price.format)}
    </div>
  )
}

export default Cart
