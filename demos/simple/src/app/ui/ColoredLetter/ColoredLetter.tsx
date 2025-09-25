import "./ColoredLetter.scss"

import { State } from "@denshya/reactive"

import { Proton } from "@denshya/proton"


interface ColoredLetterProps {
  letter: State<string>
  baseHSL?: State<[number, number, number]>
}

function ColoredLetter(this: Proton.Component, props: ColoredLetterProps) {
  // const backgroundColor = Act.compute((letter, baseHSL) => {
  //   const [h, s, l] = baseHSL ?? [255, 50, 50]

  //   const letterIndex = alphabet.indexOf(letter.toLowerCase())
  //   const letterBackground = `hsl(${h / alphabet.length * letterIndex} ${s}% ${l}%)`

  //   return letterBackground
  // }, [props.letter, ads])

  // return (
  //   <span className="colored-letter" style={{ backgroundColor }}>{props.letter}</span>
  // )
}

const ads = new State([255, 50, 50])

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("")

export default ColoredLetter
