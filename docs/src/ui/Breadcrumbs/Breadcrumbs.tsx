import "./Breadcrumbs.scss"

import Link from "@/app/navigation/Link"
import { State, StateArray } from "@denshya/reactive"
import { startCase } from "lodash-es"
import Icon from "../static/Icon/Icon"


type BreadcrumbsProps = {
  path: State<string>
}

export default function Breadcrumbs(props: BreadcrumbsProps) {
  const slugs = new StateArray(props.path.to(path => path.split("/").filter(Boolean)))

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {slugs.map((slug, index) => (
          <li>
            {index !== 0 ? <Icon name="chevron-right" /> : null}
            <Link to={"/" + slugs.current.slice(0, index + 1).join("/")}>{startCase(slug)}</Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
