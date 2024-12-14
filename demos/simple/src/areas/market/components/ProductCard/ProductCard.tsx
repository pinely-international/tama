import "./ProductCard.scss"

import { MarketProduct } from "../../types"
import { Events, Proton } from "@denshya/proton"
import AuthorPeek from "@/app/ui/AuthorPeek/AuthorPeek"
import Button from "@/app/ui/Button/Button"
import Price from "@/utils/price"


interface ProductCardProps extends MarketProduct { }

function ProductCard(this: Proton.Shell, props: ProductCardProps) {
  const context = this.context.require(ProductCard.Context)

  const isChosen = context.chosen.to(it => it.has(props.id))

  return (
    <div className="product-card">
      <img className="product-card__image" src={props.preview} alt="Preview" />
      <div className="product-card__title">{props.title}</div>
      <AuthorPeek author={props.author} />
      <div className="product-card__bottom">
        <div className="product-card__price">{Price.format(props.price)}</div>
        <Button color={isChosen.to<string>(it => it ? "green" : "")} onClick={() => context.chosen.set(it => it.add(props.id))}>
          {isChosen.to(it => it ? "In cart" : "Buy")}
        </Button>
      </div>
    </div>
  )
}

export default ProductCard


ProductCard.Context = class {
  constructor(readonly chosen: Events.State<Set<string>>) { }
}
