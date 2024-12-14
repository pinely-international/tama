import "./AuthorPeek.scss"

import { Events, Proton } from "@denshya/proton"

import ColoredLetter from "../ColoredLetter/ColoredLetter"
import { Author } from "@/app/user/User"


interface AuthorPeekProps {
  author: Author | Events.State<Author>
}

function AuthorPeek(this: Proton.Shell, props: AuthorPeekProps) {
  const author = Events.State.from(props.author)

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
