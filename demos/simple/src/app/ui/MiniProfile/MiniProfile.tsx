import "./MiniProfile.scss"

import { State } from "@denshya/reactive"
import { Mount, Proton } from "@denshya/proton"

import UserContext from "@/UserContext"

import ColoredLetter from "../ColoredLetter/ColoredLetter"


interface MiniProfileProps { }

function MiniProfile(this: Proton.Component, props: MiniProfileProps) {
  const userContext = this.tree.context.require(UserContext)

  const user = userContext.user
  const userAvatar = user.$.avatar

  const inputValue = new State("")
  const inputMounted = new State(false)

  inputValue.sets(userAvatar)

  return (
    <div className="mini-profile">
      <div className="mini-profile__profile">
        <button className="mini-profile__letter" mounted={userAvatar.is(it => !it)}>
          <ColoredLetter letter={user.$.firstName.$[0]} />
        </button>
        <img className="mini-profile__avatar" src={Mount.If(userAvatar)} alt="avatar" />
        <input value={inputValue} mounted={inputMounted} />
        <div className="mini-profile__info">
          <div className="mini-profile__name">{user.$.firstName} {user.$.lastName.$[0]}.</div>
          <div className="mini-profile__email">{user.$.email}</div>
        </div>
      </div>
      <button type="button" on={{ click: () => inputMounted.set(it => !it) }} style={{ position: "absolute", inset: "0" }} />
    </div>
  )
}

export default MiniProfile
