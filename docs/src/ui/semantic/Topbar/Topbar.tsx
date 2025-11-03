import "./Topbar.scss"

import Logo from "@/ui/brand/Logo/Logo"
import Icon from "@/ui/static/Icon/Icon"

import ButtonLink from "@/ui/kit/Button/ButtonLink"
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
          <ButtonLink color="white" to="https://github.com/pinely-international/tama"><Icon name="github" /> Github</ButtonLink>
          <ButtonLink color="white" to="https://discord.gg/sHp2pxrSws"><Icon name="touch" /> Discord</ButtonLink>
          <ButtonLink color="white" to="/"><Icon name="github" /> BlueSky</ButtonLink>
        </div>
      </div>
    </div>
  )
}

export default Topbar
