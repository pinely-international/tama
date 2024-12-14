import "./Market.scss"

import ProductCard from "../ProductCard/ProductCard"
import { Events, Proton } from "@denshya/proton"
import { MarketProduct } from "../../types"


interface MarketProps { }

function Market(this: Proton.Shell, props: MarketProps) {
  const chosenProducts = new Events.State<Set<MarketProduct["id"]>>(new Set)

  this.context.provide(new ProductCard.Context(chosenProducts))

  return (
    <div className="market">
      <div className="market__filters"></div>
      <div className="market__products">
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        {/* <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} />
        <ProductCard id="1" price={249} title="NFT Art" preview="https://cdn.prod.website-files.com/6615636a03a6003b067c36dd/661ffd0dbe9673d914edca2d_6423fc9ca8b5e94da1681a70_Screenshot%25202023-03-29%2520at%252010.53.43.jpeg" author={{ username: "FrameMuse", avatar: "https://denshya.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10409" }} /> */}
      </div>
      <div className="market__checkout"></div>
    </div>
  )
}

export default Market
