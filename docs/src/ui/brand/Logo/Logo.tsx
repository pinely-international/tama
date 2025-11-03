import "./Logo.scss"

import Link from "@/app/navigation/Link"


function Logo(props: { color?: "blue" }) {
  return (
    <div className="logo" classMods={[props.color]} aria={{ role: "img", ariaLabel: "Logo" }}>
      <span className="logo__subtext">Denshya</span>
      <span className="logo__text">Tama<span className="weak">.JS</span></span>
      <Link className="ghost" to="/" label="Go home" />
    </div>
  )
}

export default Logo
