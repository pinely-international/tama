import "./Market.scss"

import ProductCard from "../ProductCard/ProductCard"
import { Events, Proton } from "@denshya/proton"
import { MarketProduct } from "../../types"


interface MarketProps { }

function Market(this: Proton.Shell, props: MarketProps) {
  const chosenProducts = new Events.State<Set<MarketProduct["id"]>>(new Set)

  this.context.provide(new ProductCard.Context(chosenProducts))

  const preview = () => `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/200/300`
  const avatar = () => `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/200`
  const price = () => Math.random() * 1000

  return (
    <div className="market">
      <div className="market__filters"></div>
      <div className="market__products">
        <ProductCard id="1" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="2" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="3" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="4" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="5" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="6" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="7" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="8" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="9" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="10" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="11" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="12" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="12" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="13" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="14" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="15" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="16" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
        <ProductCard id="17" price={price()} title="NFT Art" preview={preview()} author={{ username: "FrameMuse", avatar: avatar() }} />
      </div>
      <div className="market__checkout"></div>
    </div>
  )
}

export default Market
