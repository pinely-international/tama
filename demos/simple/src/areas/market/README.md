# Market

Demonstrates some level of state compexity and Tree Context application.

## Tree Context

First [`Market.tsx`](./components/Market/Market.tsx) provides a [`MarketModel`](./models/MarketModel.ts) context to its children, which contains data about search field, cart and liked products.

Then the children state that they require the context to function properly, the [`ProductCard.tsx`](./components/ProductCard/ProductCard.tsx) uses the context search field to display search entries highlights and for adding/removing cart items.

The [`Cart.tsx`](./components/Cart/Cart.tsx) uses the context to display what items and how many of them are added to the cart, then computes subtotals and totals.
