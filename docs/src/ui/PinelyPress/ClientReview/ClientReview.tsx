import "./ClientReview.scss"

import Icon from "@/ui/static/Icon/Icon"


interface ClientReviewProps {
  criteria: Record<string, number>
  children: string
}

function ClientReview(props: ClientReviewProps) {
  return (
    <div className="client-review">
      <div className="client-review__layout">
        <div className="client-review__criteria">
          {Object.entries(props.criteria).map(([name, grade]) => <Grade name={name} value={grade} />)}
        </div>
        <p className="client-review__comment">
          <Icon name="quote" /> {props.children} <Icon name="quote" />
        </p>
      </div>
    </div>
  )
}

export default ClientReview

function Grade(props: { big?: boolean, name: string, value: number }) {
  return (
    <div className="client-review-grade" classMods={{ big: props.big }}>
      <div className="client-review-grade__name">{props.name}</div>
      <div className="client-review-grade__star">
        <Icon name="star" />
        <span>{props.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  )
}
