import "./ProductCardBuyButton.scss"

import { Events, Proton } from "@denshya/proton"
import Icon from "@/app/ui/Icon/Icon"


interface ProductCardBuyProps {
  amount: Events.State<number>
  onClick?(): void
}

function ProductCardBuy(this: Proton.Shell, props: ProductCardBuyProps) {
  props.amount[Symbol.subscribe](amount => {
    if (amount === 0) this.view.set(this.view.default)
    if (amount > 0) this.view.set(LAYOUT_AMOUNT)
  })

  const LAYOUT_AMOUNT = (
    <div className="product-card-buy">
      <button className="product-card-buy__icon" on={{ click: event => props.amount.it -= event.shiftKey ? 10 : 1 }}><Icon name="minus" /></button>
      <span>{props.amount}</span>
      <button className="product-card-buy__icon" on={{ click: event => props.amount.it += event.shiftKey ? 10 : 1 }}><Icon name="plus" /></button>
    </div>
  )

  return (
    <button className="product-card-buy-button" type="button" on={{ click: props.onClick }}>Add to cart</button>
  )
}

export default ProductCardBuy
