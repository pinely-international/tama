import "./ProductPage.scss"

import { Flow } from "@denshya/flow"
import { Proton } from "@denshya/proton"

import Icon from "@/app/ui/Icon/Icon"
import LoaderCover from "@/app/ui/Loader/LoaderCover"
import { NavLink, RouteContext } from "@/navigation"
import Price from "@/utils/price"

import { STATIC_PRODUCTS } from "../../mock"

const getProductById = (id: string) => {
  const value = STATIC_PRODUCTS.find(product => product.id === id)
  if (value == null) throw new TypeError("Product is not found of id " + id)

  return value
}

const requireRouteParam = (id?: string | null) => {
  if (id == null) throw new TypeError("This page can't be accessed without `id`")

  return id
}

async function* ProductPage(this: Proton.Component) {
  yield <LoaderCover />
  await new Promise(r => setTimeout(r, 1_000))

  const route = this.context.require(RouteContext)

  const id = route.$.pathname.$.groups.$.id.to(requireRouteParam)
  const product = id.to(getProductById)

  return (
    <div className="product-page">
      <div className="product-page__banner">
        <img className="product-page__image" src={product.$.preview} alt="Preview" loading="lazy" />
      </div>

      <div className="product-page__info">
        <div className="product-page__title">{product.$.title}</div>
        <div className="product-page__reviews">
          <Icon name="star" />
          <strong>{4.8}</strong>
          <span>(452 reviews)</span>
          <NavLink className="ghost" to={Flow.f`/market/product/${id}/reviews`} />
        </div>
        <div className="product-page__pricing">
          <div className="product-page__price">{product.to(it => Price.format(it.price * (1 - (it.discount / 100))))}</div>
          <div className="product-page__price-old">{product.$.price.to(Price.format)}</div>
          <div className="product-page__discount">{product.$.discount}%</div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage
