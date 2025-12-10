import "./Topbar.scss"

import Logo from "@/ui/brand/Logo/Logo"
import Icon from "@/ui/static/Icon/Icon"

import Link from "@/app/navigation/Link"
import Navbar from "../Navbar/Navbar"
import NavbarMobile from "../Navbar/NavbarMobile"


function Topbar() {
  return (
    <div className="topbar">
      <div className="topbar__container">
        <div className="topbar__wow">
          <Logo />
          <div className="topbar__mobile">
            <NavbarMobile.ToggleButton />
          </div>
        </div>
        <Navbar links={[]} />
        <div className="topbar__secondary">
          <Link to="https://github.com/pinely-international/tama"><Icon name="github" /></Link>
          <Link to="https://discord.gg/sHp2pxrSws"><Icon name="discord" /></Link>
          <Link to="https://bsky.app/profile/denshya.bsky.social"><Icon name="bluesky" /></Link>
        </div>
      </div>
    </div>
  )
}

export default Topbar
