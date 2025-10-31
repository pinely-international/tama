import "./Topbar.scss"

import Logo from "@/ui/brand/Logo/Logo"
import ScheduleButton from "@/ui/brand/ScheduleButton"
import Button from "@/ui/kit/Button/Button"
import Icon from "@/ui/static/Icon/Icon"

import Navbar from "../Navbar/Navbar"
import NavbarMobile from "../Navbar/NavbarMobile"




function Topbar() {
  return (
    <div className="topbar">
      <div className="topbar__wow">
        <Logo />
        <div className="topbar__mobile">
          <NavbarMobile.ToggleButton />
        </div>
      </div>
      <Navbar links={[]} />
      <div className="topbar__secondary">
        <Button color="white"><Icon name="fountain-pen" /> Blog</Button>
        <ScheduleButton color="pink" />
      </div>
    </div>
  )
}

export default Topbar
