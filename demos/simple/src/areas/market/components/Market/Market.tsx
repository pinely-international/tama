import "./Market.scss"

import ProductCard from "../ProductCard/ProductCard"
import { Proton } from "@denshya/proton"
import Cart from "../Cart/Cart"
import MarketContext from "../../context/MarketContext"
import { STATIC_PRODUCTS } from "../../mock"
import ProductFilters from "../ProductFilters/ProductFilters"



function Market(this: Proton.Shell) {
  this.context.provide(new MarketContext)

  const points = (
    <>
      <p>Show popover for failed optimistic updates</p>
      <p>Dedicate space for sync progress, may contain a count of <b>pending</b> requests</p>
    </>
  )

  return (
    <div className="market">
      <div className="market__filters"><ProductFilters /></div>
      <div className="market__products">
        {STATIC_PRODUCTS.map(product => (
          <ProductCard {...product} />
        ))}
      </div>
      <div className="market__cart"><Cart /></div>
    </div>
  )
}

export default Market
