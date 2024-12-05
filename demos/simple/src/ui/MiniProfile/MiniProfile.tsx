import "./MiniProfile.scss"

import User from "@/user/User"
import { Events, Proton } from "@denshya/proton"

import ColoredLetter from "../ColoredLetter/ColoredLetter"


interface MiniProfileProps {
  user: User | Events.State<User>
}

function MiniProfile(this: Proton.Shell, props: MiniProfileProps) {
  const user = Events.State.from(props.user)
  const userAvatar = user.$.avatar

  const inputValue = new Events.State("")
  const inputMounted = new Events.State(false)

  inputValue.sets(userAvatar)

  this.view.set(
    <div className="mini-profile">
      <div className="mini-profile__profile">
        <button className="mini-profile__letter" mounted={userAvatar.is(it => it == null)}>
          <ColoredLetter letter={user.to(user => user.firstName[0])} />
        </button>
        <input value={inputValue} mounted={inputMounted} />
        <img className="mini-profile__avatar" src={userAvatar.required} alt="avatar" />
        <div className="mini-profile__info">
          <div className="mini-profile__name">{user.$.firstName} {user.$.lastName.to(it => it[0].toUpperCase())}</div>
          <div className="mini-profile__email">{user.$.email}</div>
        </div>
      </div>
      <button type="button" on={{ click: () => inputMounted.set(it => !it) }} style={{ position: "absolute", inset: "0" }} />
    </div>
  )
}

export default MiniProfile
