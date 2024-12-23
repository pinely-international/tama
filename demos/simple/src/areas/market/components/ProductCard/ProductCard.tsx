import "./ProductCard.scss"

import { MarketProduct } from "../../types"
import { Proton } from "@denshya/proton"
import Price from "@/utils/price"
import MarketModel from "../../models/MarketModel"
import Icon from "@/app/ui/Icon/Icon"
import { bem } from "@/utils/bem"
import ProductCardBuy from "./ProductCardBuyButton"
import { NavLink } from "@/navigation"
import { Flow, Flowable, FlowRead } from "@denshya/flow"


interface ProductCardProps extends MarketProduct { }

function ProductCard(this: Proton.Shell, props: ProductCardProps) {
  const market = this.context.require(MarketModel)

  const amount = market.cart.$.get(props.id).to(it => it ?? -1).from(it => it < 0 ? 0 : it)
  const liked = market.liked.$.has(props.id)

  amount.sets(it => market.cart.$.set(props.id, it))

  return (
    <div className="product-card">
      <div className="product-card__banner">
        <img className="product-card__image" src={props.preview} alt="Preview" />
        <div className="product-card__title">{useSearch(market.filters.search).highlight(props.title)}</div>
        <NavLink className="ghost" to={"/market/product/" + props.id} />
      </div>
      <div className="product-card__reviews">
        <Icon name="star" />
        <strong>{4.8}</strong>
        <span>(452 reviews)</span>
        <NavLink className="ghost" to={"/market/product/" + props.id + "/reviews"} />
      </div>
      <div className="product-card__pricing">
        <div className="product-card__price">{Price.format(props.price * (1 - (props.discount / 100)))}</div>
        <div className="product-card__price-old">{Price.format(props.price)}</div>
        <div className="product-card__discount">{props.discount}%</div>
      </div>
      <div className="product-card__asd">
        <div className="product-card__buy">
          <ProductCardBuy amount={amount} onClick={() => market.cart.$.set(props.id, 1)} />
        </div>
        <button className={liked.to(active => bem("product-card__like", { active }))} type="button" on={{ click: () => market.liked.set(it => liked.it ? (it.delete(props.id), it) : it.add(props.id)) }}>
          <Icon name="heart" />
        </button>
      </div>
    </div>
  )
}

export default ProductCard

function useSearch(value: FlowRead<string | null | undefined>) {
  const valueNormalized = Flow.from(value).to(it => it?.toLowerCase() ?? "")

  function search(searchable: string | null | undefined, value: string): number {
    if (searchable == null) return -1

    return searchable.toLowerCase().search(value)
  }

  function highlight(searchable: Flowable<string | null | undefined>) {
    function HighlightComponent() {
      const range = Flow.compute((searchable, value) => {

        const index = search(searchable, value)

        return {
          start: searchable?.slice(0, index),
          highlight: searchable?.slice(index, index + value.length),
          end: searchable?.slice(index + value.length)
        }
      }, [Flow.from(searchable), valueNormalized])

      return (
        <>
          {range.$.start}
          <em>{range.$.highlight.guard(it => !!it)}</em>
          {range.$.end}
        </>
      )
    }

    return <HighlightComponent />
  }

  return {
    highlight
  }
}
