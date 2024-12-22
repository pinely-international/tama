import "./MiniProfile.scss"

import { Proton } from "@denshya/proton"

import ColoredLetter from "../ColoredLetter/ColoredLetter"
import UserContext from "@/UserContext"
import { Flow } from "@denshya/flow"


interface MiniProfileProps { }

function MiniProfile(this: Proton.Shell, props: MiniProfileProps) {
  const userContext = this.context.require(UserContext)

  const user = userContext.user
  const userAvatar = user.$.avatar

  const inputValue = new Flow("")
  const inputMounted = new Flow(false)

  inputValue.sets(userAvatar)

  return (
    <div className="mini-profile">
      <div className="mini-profile__profile">
        <button className="mini-profile__letter" mounted={userAvatar.is(it => !it)}>
          <ColoredLetter letter={user.to(user => user.firstName[0])} />
        </button>
        <img className="mini-profile__avatar" src={userAvatar.required} alt="avatar" />
        <input value={inputValue} mounted={inputMounted} />
        <div className="mini-profile__info">
          <div className="mini-profile__name">{user.$.firstName} {user.to(user => user.lastName[0])}.</div>
          <div className="mini-profile__email">{user.$.email}</div>
        </div>
      </div>
      <button type="button" on={{ click: () => inputMounted.set(it => !it) }} style={{ position: "absolute", inset: "0" }} />
    </div>
  )
}

export default MiniProfile
