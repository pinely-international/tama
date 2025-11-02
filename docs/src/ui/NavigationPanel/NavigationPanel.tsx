import "./NavigationPanel.scss"

import { State } from "@denshya/reactive"
import Link from "@/app/navigation/Link"
import Icon from "../static/Icon/Icon"
import { startCase } from "lodash-es"


interface FolderTree {
  name: string
  path: string
  children: FolderTree[]
}
function NavigationPanel(props: { tree: FolderTree[], active: State<string> }) {
  return (
    <div className="navigation-panel">
      {props.tree.map(folder => (
        <NavigationTreeLink item={folder} active={props.active} />
      ))}
    </div>
  )
}

export default NavigationPanel

function NavigationTreeLink(props: { item: FolderTree, active: State<string>, level?: number }) {
  const level = props.level ?? 0
  const folder = props.item
  const active = props.active.is(folder.path)
  const expanded = new State(props.active.current.startsWith(props.item.path))

  if (folder.children.length > 0) {
    return (
      <div className="navigation-panel__folder">
        <div className="navigation-panel__link" classMods={{ active, expanded }} style={{ "--level": level }}>
          <Link to={"/" + folder.path}>{startCase(folder.name)}</Link>
          <button on={{ click: () => expanded.set(x => !x) }}><Icon name="chevron-right" /></button>
        </div>
        <div className="navigation-panel__sub-tree" classMods={{ expanded }}>
          {folder.children.map(folder => (
            <NavigationTreeLink item={folder} active={props.active} level={level + 1} />
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="navigation-panel__link" classMods={{ active }} style={{ "--level": level }}>
      <Link to={"/" + folder.path}>{startCase(folder.name)}</Link>
    </div>
  )
}
