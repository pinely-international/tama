import "./MiniProfile.scss"

import User from "@/user/User"
import { Events, Proton } from "@denshya/proton"

import ColoredLetter from "../ColoredLetter/ColoredLetter"


interface MiniProfileProps {
  user: User
}

function MiniProfile(this: Proton.Shell, props: MiniProfileProps) {
  const user = new Events.State(props.user)

  this.view.set(
    <div className="mini-profile">
      <div className="mini-profile__profile">
        <div className="mini-profile__letter" mounted={user.$.avatar.ifNullable}>
          <ColoredLetter letter={props.user.firstName[0]} />
        </div>
        <img className="mini-profile__avatar" src={user.$.avatar.required} alt="avatar" />
        <div className="mini-profile__info">
          <div className="mini-profile__name">{props.user.firstName} {props.user.lastName[0].toUpperCase()}.</div>
          <div className="mini-profile__email">{props.user.email}</div>
        </div>
        <a className="ghost" href="/user/profile/settings" />
      </div>
    </div>
  )
}

export default MiniProfile
