import "./PlaygroundCard.scss"
import StackblitzSVG from '@site/static/img/stackblitz.svg'

function PlaygroundCard(props: { title: string, description: string, slug: string }) {
  return (
    <div className="playground-card">
      <div className="playground-card__label">
        <StackblitzSVG height="1.25em" fill="#1389fd" />
        <span>Project on Stackblitz</span>
      </div>

      <hgroup>
        <h3 className="playground-card__title">{props.title}</h3>
        <p className="playground-card__description">{props.description}</p>
      </hgroup>

      <a href={"https://stackblitz.com/edit/" + props.slug} />
    </div>
  )
}

export default PlaygroundCard
