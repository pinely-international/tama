import "./PressTopbar.scss"

import ScheduleButton from "@/ui/brand/ScheduleButton"
import Button from "@/ui/kit/Button/Button"
import Icon from "@/ui/static/Icon/Icon"


function PressTopbar() {
  return (
    <div className="press-topbar">
      <div className="press-topbar__container">
        <div className="press-topbar__logo">
          <span>Pinely</span>
          <span>{"{"}</span>
          <em>Cases</em>
        </div>
        <div className="press-topbar__secondary">
          <Button color="white"><Icon name="fountain-pen" /> Blog</Button>
          <ScheduleButton color="dark" />
        </div>
      </div>
    </div>
  )
}

export default PressTopbar
