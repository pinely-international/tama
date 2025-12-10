import "./TableOfContents.scss"

import Link from "@/app/navigation/Link"
import { State, StateArray } from "@denshya/reactive"
import { snakeCase } from "lodash-es"


interface TableOfContentsProps {
  items: StateArray<PageContentItem>
}

function TableOfContents(props: TableOfContentsProps) {
  return (
    <div className="table-of-contents">
      <div className="table-of-contents__title">On this page</div>
      {props.items.map(item => (
        <div className="table-of-contents__item" style={{ marginLeft: `${(item.level - 2) * 8}px` }}>
          <Link to={"#" + snakeCase(item.text)} className="table-of-contents__link">{item.text}</Link>
        </div>
      ))}
      {State.from(props.items).to(items => items.length === 0 && (
        <div className="table-of-contents__placeholder">
          <span aria={{ ariaLabel: "speechless because not a single heading was put" }}>(`•ω•`)?</span>
        </div>
      ))}
    </div>
  )
}

export default TableOfContents



interface PageContentItem {
  element?: Element
  withinViewport?: boolean

  level: number
  text: string
}
