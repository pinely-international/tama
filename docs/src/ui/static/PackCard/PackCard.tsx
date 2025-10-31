import "./PackCard.scss"

import Link from "@/app/navigation/Link"

import Icon, { IconName } from "../Icon/Icon"


interface PackCardProps {
  icon?: IconName
  title: unknown
  description?: unknown
  features: string[]

  buttonTitle?: string
  buttonLink?: string
}

function PackCard(props: PackCardProps) {
  return (
    <div className="pack-card">
      <div className="pack-card__header">
        <Icon name={props.icon} />
        <hgroup>
          <span className="pack-card__title">{props.title}</span>
          <p className="pack-card__description">{props.description}</p>
        </hgroup>
      </div>
      <ul className="pack-card__features">
        {props.features.map(feature => (
          <li><Icon name="check-circle" /> {feature}</li>
        ))}
      </ul>
      {props.buttonTitle && (
        <Link className="pack-card__button" to={props.buttonLink}>{props.buttonTitle}</Link>
      )}
    </div>
  )
}

export default PackCard

export function PackCardContainer(props: { children: unknown }) {
  return (
    <div className="pack-card-container">{props.children}</div>
  )
}
