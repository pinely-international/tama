import "./ProductsTable.scss"

import { Proton, Events, Act } from '@denshya/proton';


function FilterableProductTable({ products }) {
  const searchValue = new Events.State("")
  const inStockOnly = new Events.State(false);

  return (
    <div>
      <SearchBar value={searchValue} inStockOnly={inStockOnly} />
      <ProductTable products={products} filterText={searchValue} inStockOnly={inStockOnly} />
    </div>
  );
}

function ProductCategoryRow({ category }) {
  return (
    <tr>
      <th colSpan="2">{category}</th>
    </tr>
  );
}

function ProductRow({ product }) {
  const name = product.stocked ? product.name : <span style={{ color: 'red' }}>{product.name} </span>

  return (
    <tr>
      <td>{name}</td>
      <td>{product.price}</td>
    </tr>
  );
}

function ProductTable({ products, filterText, inStockOnly }) {
  let lastCategory = null
  const productsIndex = new Events.Index(products)

  Act.on([filterText, inStockOnly], () => {
    lastCategory = null
    productsIndex.rebase()
  })

  const rows = productsIndex.map(product => {
    if (product.name.toLowerCase().indexOf(filterText.get().toLowerCase()) === -1) return
    if (inStockOnly.get() && !product.stocked) return

    if (product.category !== lastCategory) {
      lastCategory = product.category;
      return (
        <>
          <ProductCategoryRow category={product.category} />
          <ProductRow product={product} />
        </>
      )
    }

    lastCategory = product.category;
    return <ProductRow product={product} />
  })

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

function SearchBar(props: { value: Events.State<string>, inStockOnly: Events.State<boolean> }) {
  return (
    <form>
      <input value={props.value} placeholder="Search..." />
      <label>
        <input
          type="checkbox"
          checked={props.inStockOnly}
          on={{ change: event => props.inStockOnly.set(event.currentTarget.checked) }}
        />
        {' '}
        Only show products in stock
      </label>
    </form>
  );
}

const PRODUCTS = [
  { category: "Fruits", price: "$1", stocked: true, name: "Apple" },
  { category: "Fruits", price: "$1", stocked: true, name: "Dragonfruit" },
  { category: "Fruits", price: "$2", stocked: false, name: "Passionfruit" },
  { category: "Vegetables", price: "$2", stocked: true, name: "Spinach" },
  { category: "Vegetables", price: "$4", stocked: false, name: "Pumpkin" },
  { category: "Vegetables", price: "$1", stocked: true, name: "Peas" }
];

export default function ProductsTableApp() {
  return <FilterableProductTable products={PRODUCTS} />;
}
