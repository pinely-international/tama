import "./Notice.scss"

import Icon from "@/ui/static/Icon/Icon"


interface NoticeProps {
  children: unknown
}

function Notice(props: NoticeProps) {
  return (
    <div className="notice">
      <div className="notice__title">
        <Icon name="exclamation-pine" />
        <span>Info</span>
      </div>
      {props.children}
    </div>
  )
}

export default Notice
