import "./Market.scss"

import ProductCard from "../ProductCard/ProductCard"
import { Proton } from "@denshya/proton"
import Cart from "../Cart/Cart"
import MarketModel from "../../models/MarketModel"
import { STATIC_PRODUCTS } from "../../mock"
import Icon from "@/app/ui/Icon/Icon"
import Button from "@/app/ui/Button/Button"
import SearchBar from "@/app/ui/SearchBar/SearchBar"
import Selector from "@/app/ui/Selector/Selector"



function Market(this: Proton.Shell) {
  const market = this.context.provide(new MarketModel)

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
            <Selector placeholder={<Icon name="sort" />}>
              <option value="1">1</option>
              <option value="2">2</option>
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
