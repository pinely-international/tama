import { ButtonColor } from "../kit/Button/Button"

interface ScheduleButtonProps {
  color?: ButtonColor
}

function ScheduleButton(props: ScheduleButtonProps) {
  return (
    <a className="button" classMods={props.color} href="https://calendar.app.google/AtG4TZfmPMWGKRbs5" target="_blank">Let's Talk!</a>
  )
}

export default ScheduleButton
