import "./ColoredLetter.scss"

import { Events, Proton } from "@denshya/proton"


interface ColoredLetterProps {
  letter: string
  baseHSL?: [number, number, number]
}

function ColoredLetter(this: Proton.Shell, props: Events.StateSubjectsOf<ColoredLetterProps>) {
  const letterBackground = Events.StatesTo(props, props => {
    const [h, s, l] = props.baseHSL ?? [255, 50, 50]

    const letterIndex = alphabet.indexOf(props.letter.toLowerCase())
    const letterBackground = `hsl(${h / alphabet.length * letterIndex} ${s}% ${l}%)`

    return letterBackground
  })

  this.view.set(
    <span className="colored-letter" style={{ backgroundColor: letterBackground }}>{props.$.letter}</span>
  )
}

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("")

export default ColoredLetter
