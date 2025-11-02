import "./TableOfContents.scss"

import Link from "@/app/navigation/Link"
import JSXParser from "@/JSXParser"
import { StateArray } from "@denshya/reactive"
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
          <Link to={"#" + snakeCase(item.text)} className="table-of-contents__link">{JSXParser.fromMarkdown(item.text)}</Link>
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
