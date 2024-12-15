import "./Cart.scss"

import { Events, Proton } from "@denshya/proton"
import Price from "@/utils/price"

import { MarketProduct } from "../../types"



interface CartProps {
  products: Events.State<MarketProduct[]>
}

function Cart(props: CartProps) {
  const price = props.products.to(it => it.reduce((result, next) => result + next.price, 0))

  return (
    <div className="cart">
      {price.to(Price.format)}
    </div>
  )
}

export default Cart
