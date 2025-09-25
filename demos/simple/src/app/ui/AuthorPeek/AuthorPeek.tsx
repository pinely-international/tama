import "./AuthorPeek.scss"

import { Proton } from "@denshya/proton"

import ColoredLetter from "../ColoredLetter/ColoredLetter"
import { Author } from "@/app/user/User"
import { State, StateOrPlain } from "@denshya/reactive"


interface AuthorPeekProps {
  author: StateOrPlain<Author>
}

function AuthorPeek(this: Proton.Component, props: AuthorPeekProps) {
  const author = State.from(props.author)

  return (
    <div className="author-peek">
      <div className="author-peek__letter" mounted={author.$.avatar.is(null)}>
        <ColoredLetter letter={author.$.username.$[0]} />
      </div>
      <img className="author-peek__avatar" src={author.$.avatar} alt="avatar" />
      <div className="author-peek__name">{author.$.username}</div>
    </div>
  )
}

export default AuthorPeek
