import "./Cart.scss"

import { Proton } from "@denshya/proton"
import Price from "@/utils/price"

import MarketModel from "../../models/MarketModel"
import { cartTotals } from "../../processes"
import { STATIC_PRODUCTS } from "../../mock"
import ButtonLink from "@/app/ui/Button/ButtonLink"
import Icon from "@/app/ui/Icon/Icon"



interface CartProps { }

function Cart(this: Proton.Shell, props: CartProps) {
  const market = this.context.require(MarketModel)

  const size = market.cart.to(cart => cart.values().reduce((result, next) => result + next, 0))
  const totals = market.cart.to(cart => cartTotals(STATIC_PRODUCTS, cart))

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
          <b>{totals.$.raw.to(Price.format)}</b>
        </div>
        <div className="cart__property">
          <span>Discount:</span>
          <em>- {totals.$.discount.to(Price.format)} ({totals.$.discountPercent}%)</em>
        </div>
        <hr />
        <div className="cart__property">
          <span>Subtotal:</span>
          <b>{totals.$.subtotal.to(Price.format)}</b>
        </div>
      </div>
      <ButtonLink to="/market/cart" color="green">
        <div className="cart__button">
          <span>View cart</span>
          <Icon name="arrow-right" />
        </div>
      </ButtonLink>
    </div>
  )
}

export default Cart
