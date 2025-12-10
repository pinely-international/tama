import "./Footer.scss"

import Link from "@/app/navigation/Link"
import Logo from "@/ui/brand/Logo/Logo"
import ScheduleButton from "@/ui/brand/ScheduleButton"
import Button from "@/ui/kit/Button/Button"
import Icon from "@/ui/static/Icon/Icon"


function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer__top">
        <div className="footer__secondary">
          <Logo color="blue" />
          <Button color="white"><Icon name="fountain-pen" /> Blog</Button>
          <ScheduleButton color="blue" />
        </div>
        <div className="footer__sitemap">
          <menu></menu>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© 2020-{new Date().getFullYear()} <b>Pinely International</b>, All rights reserved.</span>
        <menu>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/cookies">Cookie Policy</Link>
        </menu>
      </div>
    </footer>
  )
}

export default Footer
