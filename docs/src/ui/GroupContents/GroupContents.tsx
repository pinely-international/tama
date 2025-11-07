import "./GroupContents.scss"

import Link from "@/app/navigation/Link"
import Icon from "../static/Icon/Icon"


interface GroupContentsProps {
  title: string
  contents: { title: string, description?: string, path: string }[]
}

function GroupContents(props: GroupContentsProps) {
  return (
    <>
      <h1>{props.title}</h1>
      <div className="group-contents">
        {props.contents.map(page => (
          <hgroup className="group-contents__panel">
            <span>
              <Icon name="file" />
              <h2>{page.title}</h2>
            </span>
            {page.description && <p>{page.description}</p>}
            <Link className="ghost" to={page.path} label={`Go to ${page.title}`} />
          </hgroup>
        ))}
      </div>
    </>
  )
}

export default GroupContents
