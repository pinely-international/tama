import "./Cart.scss"

import { Events, Proton } from "@denshya/proton"
import Price from "@/utils/price"

import MarketContext from "../../context/MarketContext"
import { cartDiscountTotal, cartPriceTotal } from "../../processes"
import { STATIC_PRODUCTS } from "../../mock"
import ButtonLink from "@/app/ui/Button/ButtonLink"
import Icon from "@/app/ui/Icon/Icon"



interface CartProps { }

function Cart(this: Proton.Shell, props: CartProps) {
  const market = this.context.require(MarketContext)

  const size = market.cart.to(cart => cart.values().reduce((result, next) => result + (next && 1), 0))

  const rawTotal = market.cart.to(cart => cartPriceTotal(STATIC_PRODUCTS, cart))

  const discountTotal = market.cart.to(cart => cartDiscountTotal(STATIC_PRODUCTS, cart))
  const discount = Events.State.compute([rawTotal, discountTotal], (price, discount) => price * (discount / 100))
  const subtotal = Events.State.compute([rawTotal, discountTotal], (price, discount) => price * (1 - (discount / 100)))

  return (
    <div className="cart">
      <div className="cart__title">Cart Summary</div>
      <div className="cart__properties">
        <div className="cart__property">
          <span>Items:</span>
          <b>{size}</b>
        </div>
        <div className="cart__property">
          <span>Raw total:</span>
          <b>{rawTotal.to(Price.format)}</b>
        </div>
        <div className="cart__property">
          <span>Discount:</span>
          <em>- {discount.to(Price.format)}</em>
        </div>
        <hr />
        <div className="cart__property">
          <span>Subtotal:</span>
          <b>{subtotal.to(Price.format)}</b>
        </div>
      </div>
      <ButtonLink to="/market/cart">
        <div className="cart__button">
          <span>View cart</span>
          <Icon name="arrow-right" />
        </div>
      </ButtonLink>
    </div>
  )
}

export default Cart
