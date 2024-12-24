import "./MarketFilters.scss"

import { Proton } from "@denshya/proton"

import Icon from "@/app/ui/Icon/Icon"
import MarketModel from "../../models/MarketModel"
import { Flow } from "@denshya/flow"
import Button from "@/app/ui/Button/Button"


interface MarketFiltersProps { }

function MarketFilters(this: Proton.Shell, props: MarketFiltersProps) {
  const market = this.context.require(MarketModel)

  const expanded = new Flow(false)

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
