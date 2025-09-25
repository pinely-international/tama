import "./Market.scss"

import { Proton } from "@denshya/proton"

import Button from "@/app/ui/Button/Button"
import Icon from "@/app/ui/Icon/Icon"
import SearchBar from "@/app/ui/SearchBar/SearchBar"
import Selector from "@/app/ui/Selector/Selector"

import { STATIC_PRODUCTS } from "../../mock"
import MarketModel from "../../models/MarketModel"
import Cart from "../Cart/Cart"
import ProductCard from "../ProductCard/ProductCard"



function Market(this: Proton.Component) {
  const market = this.tree.context.provide(new MarketModel)

  const points = (
    <>
      <p>Show popover for failed optimistic updates</p>
      <p>Dedicate space for sync progress, may contain a count of <b>pending</b> requests</p>
      <p>Collapsable Cart</p>
      <s>Visual count down of debounce</s>
    </>
  )

  return (
    <div className="market">
      <div className="market-ground">
        <div className="market-ground__header">
          <div className="market-ground__title">Products</div>
          <div className="market-ground__aside">
            <SearchBar value={market.filters.search} />
            <Button><Icon name="funnel" /></Button>
            <Selector iconName="sort" placeholder="Sorting">
              <option value="1">1</option>
              <option value="1">Price</option>
              <option value="2">Rating</option>
              <option value="3">Alphabet</option>
            </Selector>
          </div>
        </div>
        <div className="market__products">
          {STATIC_PRODUCTS.map(product => (
            <ProductCard {...product} />
          ))}
        </div>
      </div>
      <div className="market__cart"><Cart /></div>
    </div>
  )
}

export default Market
