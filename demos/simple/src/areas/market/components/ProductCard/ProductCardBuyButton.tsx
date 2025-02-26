import "./ProductCardBuyButton.scss"

import { Proton } from "@denshya/proton"
import Icon from "@/app/ui/Icon/Icon"
import { Flow } from "@denshya/flow"


interface ProductCardBuyProps {
  amount: Flow<number>
  onClick?(): void
}

function ProductCardBuy(this: Proton.Component, props: ProductCardBuyProps) {
  props.amount.sets(amount => {
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
    <button className="product-card-buy__button" type="button" on={{ click: props.onClick }}>Add to cart</button>
  )
}

export default ProductCardBuy
