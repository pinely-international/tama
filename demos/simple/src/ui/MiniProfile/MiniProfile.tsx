import "./MiniProfile.scss"

import User from "@/user/User"
import { Events, Proton } from "@denshya/proton"

import ColoredLetter from "../ColoredLetter/ColoredLetter"
import { Simplify } from "type-fest"


interface MiniProfileProps {
  user: User | Events.State<User>
}

function MiniProfile(this: Proton.Shell, props: MiniProfileProps) {
  const user = Events.State.from(props.user)

  this.view.set(
    <div className="mini-profile">
      <div className="mini-profile__profile">
        <div className="mini-profile__letter">
          <ColoredLetter letter={user.to(user => user.firstName[0])} />
        </div>
        <img className="mini-profile__avatar" src={user.$.avatar.required} alt="avatar" />
        <div className="mini-profile__info">
          <div className="mini-profile__name">{user.$.firstName} {user.$.lastName.to(it => it[0].toUpperCase())}</div>
          <div className="mini-profile__email">{user.$.email}</div>
        </div>
        <a className="ghost" href="/user/profile/settings" />
      </div>
    </div>
  )
}

export default MiniProfile
