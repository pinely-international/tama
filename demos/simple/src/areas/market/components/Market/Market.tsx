import "./Market.scss"

import ProductCard from "../ProductCard/ProductCard"
import { Proton } from "@denshya/proton"
import Cart from "../Cart/Cart"
import MarketContext from "../../context/MarketContext"
import { STATIC_PRODUCTS } from "../../mock"



function Market(this: Proton.Shell) {
  this.context.provide(new MarketContext)

  return (
    <div className="market">
      <ul>
        <li>Show popover for failed optimistic updates</li>
        <li>Dedicate space for sync progress, may contain a count of <b>pending</b> requests</li>
      </ul>
      <div className="market__filters"></div>
      <div className="market__products">
        {STATIC_PRODUCTS.map(product => (
          <ProductCard {...product} />
        ))}
      </div>
      <div className="market__checkout">
        <Cart />
        {/* <Cart products={products.$.filter(product => cart.$.has(product.$.id))} /> */}
      </div>
    </div>
  )
}

export default Market
