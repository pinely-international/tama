import "./ProductCard.scss"

import { MarketProduct } from "../../types"
import { Events, Proton } from "@denshya/proton"
import Button from "@/app/ui/Button/Button"
import Price from "@/utils/price"
import MarketContext from "../../context/MarketContext"
import Icon from "@/app/ui/Icon/Icon"
import { bem } from "@/utils/bem"


interface ProductCardProps extends MarketProduct { }

function ProductCard(this: Proton.Shell, props: ProductCardProps) {
  const market = this.context.require(MarketContext)

  const chosen = market.cart.to(it => it.has(props.id))
  const liked = market.liked.to(it => it.has(props.id))

  const likeButtonClassName = new Events.State(bem("product-card__like", { active: liked.get() }))
  liked[Symbol.subscribe](active => likeButtonClassName.set(bem("product-card__like", { active })))

  return (
    <div className="product-card">
      <img className="product-card__image" src={props.preview} alt="Preview" />
      <button className={likeButtonClassName} type="button" on={{ click: () => market.liked.set(it => liked.it ? (it.delete(props.id), it) : it.add(props.id)) }}>
        <Icon name="heart" />
      </button>
      <div className="product-card__title">{props.title}</div>
      <div className="product-card__reviews">
        <Icon name="star" />
        <strong>{4.8}</strong>
        <span>(452 reviews)</span>
      </div>
      <div className="product-card__bottom">
        <div className="product-card__price">{Price.format(props.price)}</div>
        <div className="product-card__price-old">{Price.format(props.price * props.discount / 100)}</div>
        <div className="product-card__discount">{props.discount}%</div>
      </div>
      <Button color={chosen.to<string>(it => it ? "green" : "")} onClick={() => market.cart.set(it => it.add(props.id))}>
        {chosen.to(it => it ? "In cart" : "Buy")}
      </Button>
    </div >
  )
}

export default ProductCard
