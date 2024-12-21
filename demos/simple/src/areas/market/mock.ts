import { MarketProduct } from "./types"


export const STATIC_PRODUCTS: MarketProduct[] = Array(20).fill(0).map((_, index) => ({
  id: index.toString(),
  author: { username: "FrameMuse", avatar: `https://picsum.photos/id/${index}/200` },
  preview: `https://picsum.photos/id/${index + 50}/200/300`,
  price: Math.random() * 1000,
  discount: Math.floor(Math.random() * 100),
  title: "Кофемолка ручная жерновая adlasldasdasdasdasd"
}))
