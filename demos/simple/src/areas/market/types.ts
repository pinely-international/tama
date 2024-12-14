import { Author } from "@/app/user/User"

export interface MarketProduct {
  id: string
  preview: string
  title: string
  price: number
  author: Author
}
