import "./ColoredLetter.scss"

import { Act, Events, Proton } from "@denshya/proton"


interface ColoredLetterProps {
  letter: Events.State<string>
  baseHSL?: Events.State<[number, number, number]>
}

function ColoredLetter(this: Proton.Shell, props: ColoredLetterProps) {
  const backgroundColor = Act.compute((letter, baseHSL) => {
    const [h, s, l] = baseHSL

    const letterIndex = alphabet.indexOf(letter.toLowerCase())
    const letterBackground = `hsl(${h / alphabet.length * letterIndex} ${s}% ${l}%)`

    return letterBackground
  }, [props.letter, props.baseHSL ?? new Events.State([255, 50, 50])])

  this.view.set(
    <span className="colored-letter" style={{ backgroundColor }}>{props.letter}</span>
  )
}

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("")

export default ColoredLetter
