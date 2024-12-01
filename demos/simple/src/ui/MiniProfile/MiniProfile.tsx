import "./MiniProfile.scss"

import User from "@/user/User"
import { Events, Proton } from "@denshya/proton"

import ColoredLetter from "../ColoredLetter/ColoredLetter"


interface MiniProfileProps {
  user: User
}

function MiniProfile(this: Proton.Shell, props: MiniProfileProps) {
  this.view.set(
    <div className="mini-profile">
      <div className="mini-profile__profile">
        <div mounted={props.user.avatar != null} className="mini-profile__letter">
          <ColoredLetter letter={props.user.firstName[0]} />
        </div>
        {/* {props.user.avatar != null && (
          <img className="mini-profile__avatar" src={props.user.avatar} alt="avatar" />
        )} */}
        {props.user.if(user => user.avatar != null && (
          <img className="mini-profile__avatar" src={props.user.it.avatar} alt="avatar" />
        ))}
        {this.inflator.match(
          props.user,
          user => user.avatar != null,
          (<img className="mini-profile__avatar" src={props.user.it.avatar} alt="avatar" />)
        )}
        {this.inflator.match(props.user).with(user => user.avatar != null, () => (
          <img className="mini-profile__avatar" src={props.user.$.avatar} alt="avatar" />
        ))}
        {Events.Match(props.user).with(user =>)props.user.if(user => user.avatar != null && (
        <img className="mini-profile__avatar" src={props.user.it.avatar} alt="avatar" />
        ))}
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
