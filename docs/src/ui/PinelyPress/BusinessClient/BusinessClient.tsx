import "./BusinessClient.scss"


interface BusinessClientProps {
  color?: string
  image: string | JSX.Element
  name: string
  location: string
  tags: string[]
  website: string
}

function BusinessClient(props: BusinessClientProps) {
  return (
    <div className="business-client">
      <div className="business-client__face">
        <div className="business-client__logo">
          {typeof props.image === "string" ? (
            <img src={props.image} alt={props.name + "'s logo/avatar"} />
          ) : (
            props.image
          )}
        </div>
        <hgroup>
          <b>{props.name}</b>
          <span>{props.location}</span>
        </hgroup>
      </div>
      <div className="business-client__tags">
        {props.tags.map(tag => <span>{tag}</span>)}
      </div>
      <a href={props.website} target="_blank">{new URL(props.website).hostname}</a>
    </div>
  )
}

export default BusinessClient
