import "./ProductPage.scss"

import { RouteContext, NavLink } from "@/navigation"
import { STATIC_PRODUCTS } from "../../mock"
import Icon from "@/app/ui/Icon/Icon"
import { Flow } from "@denshya/flow"
import { Proton } from "@denshya/proton"
import Price from "@/utils/price"
import LoaderCover from "@/app/ui/Loader/LoaderCover"


function ProductPage(this: Proton.Shell) {
  const route = this.context.require(RouteContext)

  const id = route.$.pathname.$.groups.$.id.to(id => {
    if (id == null) throw new TypeError("This page can't be accessed without `id`")

    return id
  })



  const product = id.to(id => {
    const value = STATIC_PRODUCTS.find(product => product.id === id)
    if (value == null) throw new TypeError("Product is not found of id " + id)

    return value
  })
  // const product = new Flow(null)
  // productPromise.sets(async promise => {
  //   this.view.set(<LoaderCover />)
  //   const value = await promise

  //   product.set(value)
  //   this.view.reset()
  // })

  this.view.set(<LoaderCover />)
  this.suspendOf(new Promise(r => setTimeout(r, 1000)))
  // const product = await productPromise.await()

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
