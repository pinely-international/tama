import "./StackCard.scss"

import Icon, { IconName } from "../Icon/Icon"


interface StackCardProps {
  icon: IconName
  title: string
  description: string
}

function StackCard(props: StackCardProps) {
  return (
    <div className="stack-card">
      <div className="stack-card__icon">
        <Icon name="world" />
      </div>
      <hgroup>
        <div>{props.title}</div>
        <p>{props.description}</p>
      </hgroup>
    </div>
  )
}

export default StackCard
