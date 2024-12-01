import "./ColoredLetter.scss"

import { Proton } from "@denshya/proton"


interface ColoredLetterProps {
  letter: string
  baseHSL?: [number, number, number]
}

function ColoredLetter(this: Proton.Shell, props: ColoredLetterProps) {
  const [h, s, l] = props.baseHSL ?? [255, 50, 50]

  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("")

  const letterIndex = alphabet.indexOf(props.letter.toLowerCase())
  const letterBackground = `hsl(${h / alphabet.length * letterIndex} ${s}% ${l}%)`

  this.view.set(
    <span className="colored-letter" style={{ backgroundColor: letterBackground }}>{props.letter}</span>
  )
}

export default ColoredLetter
