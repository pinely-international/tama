import Converter from "ansi-to-html"

import { run } from "../spec/bench"

const converter = new Converter

console.log("<pre className=\"asd\">")
await run({
  print: input => {
    console.log(converter.toHtml(input).replace(/style="color:(.*?)"/g, `style={{ color: "$1" }}`).replace(/\s{2,}/g, v => "&nbsp;".repeat(v.length)))
  }
})
console.log("</pre>")

