import "./Market.scss"

import ProductCard from "../ProductCard/ProductCard"
import { Events, Proton } from "@denshya/proton"
import { MarketProduct } from "../../types"
import Cart from "../Cart/Cart"
import CartContext from "../../context/CartContext"


interface MarketProps { }

function Market(this: Proton.Shell, props: MarketProps) {
  const cart = new Events.State<Set<MarketProduct["id"]>>(new Set)

  this.context.provide(new CartContext(cart))

  return (
    <div className="market">
      <div className="market__filters"></div>
      <div className="market__products">
        {products.map(product => (
          <ProductCard {...product} />
        ))}
      </div>
      <div className="market__checkout">
        <Cart products={cart.to(cart => products.filter(product => cart.has(product.id)))} />
      </div>
    </div>
  )
}

export default Market



const preview = () => `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/200/300`
const avatar = () => `https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/200`
const price = () => Math.random() * 1000


const products: MarketProduct[] = Array(20).fill(0).map((_, i) => ({
  id: i.toString(),
  author: { username: "FrameMuse", avatar: avatar() },
  preview: preview(),
  price: price(),
  title: "NFT Art - " + i
}))
