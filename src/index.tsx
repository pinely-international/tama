/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
import JSX from "./JSX"
import Proton from "./Proton"

function ComponentGod(this: ProtonShell) {
  return this
}

const jsxSample = (
  <div>
    <span on={{}} key="key">Bitch</span>
    {123}
    {new Promise(() => { })}
    <ComponentGod />
  </div>
)
console.log(jsxSample)



const jsxIntrinsicEvaluator = new JSX.HTMLIntrinsicEvaluator(
  function transformIntrinsic(input) { return input },
  function transformElement(element) { return element }
)
const jsxSampleEvaluated = jsxIntrinsicEvaluator.evaluate(jsxSample)
console.log(jsxSampleEvaluated)


const jsxPrimitiveEvaluator = new JSX.HTMLPrimitiveEvaluator
const jsxPrimitiveEvaluated = jsxPrimitiveEvaluator.evaluate(123)
console.log(jsxPrimitiveEvaluated)
