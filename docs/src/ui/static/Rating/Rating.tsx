import "./Rating.scss"

import Icon from "../Icon/Icon"


interface RatingProps {
  value: number
  max?: number
}

function Rating(props: RatingProps) {
  return (
    <div className="rating">
      <span className="rating__value">{(props.value).toLocaleString(undefined, { minimumSignificantDigits: 2 })}</span>
      <div className="rating__stars">
        <Icon name="star" />
        <Icon name="star" />
        <Icon name="star" />
        <Icon name="star" />
        <Icon name="star" />
      </div>
    </div>
  )
}

export default Rating
