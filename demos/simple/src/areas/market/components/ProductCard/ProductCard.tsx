import "./ProductCard.scss"

import { MarketProduct } from "../../types"
import { Proton } from "@denshya/proton"
import Price from "@/utils/price"
import MarketContext from "../../context/MarketContext"
import Icon from "@/app/ui/Icon/Icon"
import { bem } from "@/utils/bem"
import ProductCardBuyButton from "./ProductCardBuyButton"
import { NavLink } from "@/navigation"


interface ProductCardProps extends MarketProduct { }

function ProductCard(this: Proton.Shell, props: ProductCardProps) {
  const market = this.context.require(MarketContext)

  const amount = market.cart.to(it => it.get(props.id) ?? -1)
  // const liked = market.liked.to(it => it.has(props.id))
  const liked = market.liked.$.has(props.id)

  amount[Symbol.subscribe](it => market.cart.set(cart => cart.set(props.id, it)))

  return (
    <div className="product-card">
      <div>
        <button className={liked.to(active => bem("product-card__like", { active }))} type="button" on={{ click: () => market.liked.set(it => liked.it ? (it.delete(props.id), it) : it.add(props.id)) }}>
          <Icon name="heart" />
        </button>
      </div>
      <div className="product-card__banner">
        <img className="product-card__image" src={props.preview} alt="Preview" />
        <div className="product-card__title">{props.title}</div>
        <NavLink className="ghost" to={"/product/" + props.id} />
      </div>
      <div className="product-card__reviews">
        <Icon name="star" />
        <strong>{4.8}</strong>
        <span>(452 reviews)</span>
      </div>
      <div className="product-card__pricing">
        <div className="product-card__price">{Price.format(props.price)}</div>
        <div className="product-card__price-old">{Price.format(props.price * (1 - (props.discount / 100)))}</div>
        <div className="product-card__discount">{props.discount}%</div>
      </div>
      <ProductCardBuyButton amount={amount} onClick={() => market.cart.set(it => it.set(props.id, 1))} />
    </div>
  )
}

export default ProductCard
