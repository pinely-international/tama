import "./ProductFilters.scss"


interface ProductFiltersProps { }

function ProductFilters(props: ProductFiltersProps) {
  return (
    <div className="product-filters">
      <div className="product-filters__header">
        <div className="product-filters__title">Filters</div>
      </div>
    </div>
  )
}

export default ProductFilters
