import "./AuthorPeek.scss"

import { Proton } from "@denshya/proton"

import ColoredLetter from "../ColoredLetter/ColoredLetter"
import { Author } from "@/app/user/User"
import { Flow, Flowable } from "@denshya/flow"


interface AuthorPeekProps {
  author: Flowable<Author>
}

function AuthorPeek(this: Proton.Component, props: AuthorPeekProps) {
  const author = Flow.from(props.author)

  return (
    <div className="author-peek">
      <div className="author-peek__letter" mounted={author.$.avatar.isNullish}>
        <ColoredLetter letter={author.to(it => it.username[0])} />
      </div>
      <img className="author-peek__avatar" src={author.$.avatar.required} alt="avatar" />
      <div className="author-peek__name">{author.$.username}</div>
    </div>
  )
}

export default AuthorPeek
