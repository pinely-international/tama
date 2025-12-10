import "./Card.scss"

import Link from "@/app/navigation/Link"

import Icon from "../Icon/Icon"


interface CardProps {
  title: string
  description: string

  href?: string
}

function Card(props: CardProps) {
  return (
    <div className="card">
      <span><Icon name="book-read" /> {props.title}</span>
      <p>{props.description}</p>
      <Link className="ghost" to={props.href} label={`Go to ${props.title}`} />
    </div>
  )
}

export default Card
