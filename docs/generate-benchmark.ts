import Converter from "ansi-to-html"
import * as fs from "fs"

import { run } from "../spec/bench"

const converter = new Converter

let result = "<pre className=\"asd\">"
await run({
  print: input => {
    result += converter.toHtml(input).replace(/style="color:(.*?)"/g, `style={{ color: "$1" }}`).replace(/\s{2,}/g, v => "&nbsp;".repeat(v.length))
  }
})
result += "</pre>"

fs.writeFileSync("docs/benchmarks.md", result.trim() + "\n")
console.log("🚀 Generated benchmarks.md")
