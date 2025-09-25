import "./MarketFilters.scss"

import { Proton } from "@denshya/proton"

import Icon from "@/app/ui/Icon/Icon"
import MarketModel from "../../models/MarketModel"
import { State } from "@denshya/reactive"
import Button from "@/app/ui/Button/Button"


interface MarketFiltersProps { }

function MarketFilters(this: Proton.Component, props: MarketFiltersProps) {
  const market = this.tree.context.require(MarketModel)

  const expanded = new State(false)

  return (
    <>
      <Button onClick={() => expanded.set(it => !it)}><Icon name="funnel" /> Filter</Button>
      <div className="market-filters">
        <div className="market-filters__header">
          <div className="market-filters__title">Filters</div>
          <button type="button" on={{ click: () => expanded.set(false) }}>
            <Icon name="cross" />
          </button>
        </div>
      </div>
    </>
  )
}

export default MarketFilters

// function MarketFiltersIcon() {
//   return (
//     <Button>

//     </Button>
//   )
// }
