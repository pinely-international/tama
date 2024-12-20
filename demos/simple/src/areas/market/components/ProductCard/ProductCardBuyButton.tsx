import "./ProductCardBuyButton.scss"

import { Events, Proton } from "@denshya/proton"
import Icon from "@/app/ui/Icon/Icon"


interface ProductCardBuyButtonProps {
  amount: Events.State<number>
  onClick?(): void
}

function ProductCardBuyButton(this: Proton.Shell, props: ProductCardBuyButtonProps) {
  const layout2 = (
    <div className="product-card-buy">
      <button className="product-card-buy__icon" on={{ click: () => props.amount.it-- }}><Icon name="minus" /></button>
      <span>{props.amount}</span>
      <button className="product-card-buy__icon" on={{ click: () => props.amount.it++ }}><Icon name="plus" /></button>
    </div>
  )

  props.amount[Symbol.subscribe](amount => {
    if (amount === 0) return this.view.set(this.view.default)
    if (amount > 0) return this.view.set(layout2)
  })

  return (
    <button className="product-card-buy-button" type="button" on={{ click: props.onClick }}>Add to cart</button>
  )
}

export default ProductCardBuyButton

// (<button className={props.active.to<string>(active => bem("product-card-buy-button", { active }))} type="button" on={{ click: props.onClick }}>
// {props.active.to(it => it ? "In cart" : "Buy")}
// </button>)
