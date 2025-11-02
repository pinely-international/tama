import "./Logo.scss"

import Link from "@/app/navigation/Link"
import Icon from "@/ui/static/Icon/Icon"


function Logo(props: { color?: "blue" }) {
  return (
    <div className="logo" classMods={[props.color]} aria={{ role: "img", ariaLabel: "Logo" }}>
      <span className="logo__text">Tama</span>
      <Link className="ghost" to="/" label="Go home" />
    </div>
  )
}

export default Logo
