import "./ProductCard.scss"

import { State, StateOrPlain } from "@denshya/reactive"
import { Proton } from "@denshya/proton"

import Icon from "@/app/ui/Icon/Icon"
import { NavLink } from "@/navigation"
import Price from "@/utils/price"

import ProductCardBuy from "./ProductCardBuyButton"

import MarketModel from "../../models/MarketModel"
import { MarketProduct } from "../../types"


interface ProductCardProps extends MarketProduct { }

function ProductCard(this: Proton.Component, props: ProductCardProps) {
  const market = this.tree.context.require(MarketModel)

  const amount = market.cart.$.get(props.id).to(it => it ?? -1)
  const liked = market.liked.$.has(props.id)

  amount.subscribe(it => market.cart.$.set(props.id, it))

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
        <button className="product-card__like" classMods={{ active: liked }} type="button" on={{ click: () => market.liked.set(it => liked.current ? (it.delete(props.id), it) : it.add(props.id)) }}>
          <Icon name="heart" />
        </button>
      </div>
    </div>
  )
}

export default ProductCard

function useSearch(value: StateOrPlain<string | null | undefined>) {
  const valueNormalized = State.from(value).to(it => it?.toLowerCase() ?? "")

  function search(searchable: string | null | undefined, value: string): number {
    if (searchable == null) return -1

    return searchable.toLowerCase().search(value)
  }

  function highlight(searchable: StateOrPlain<string | null | undefined>) {
    function HighlightComponent() {
      const range = State.from(State.combine([searchable, valueNormalized], (searchable, value) => {

        const index = search(searchable, value)

        return {
          start: searchable?.slice(0, index),
          highlight: searchable?.slice(index, index + value.length),
          end: searchable?.slice(index + value.length)
        }
      }))

      return (
        <>
          {range.$.start}
          <em>{range.$.highlight}</em>
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
