export function compileAssign(keys: string[]): (target: object, source: object) => void {
  const l = keys.length - 1

  let functionString = "((target, source, value) => {\n"

  for (let i = l; i >= 0; --i) {
    const key = keys[i]

    functionString += "value = " + "source." + key
    functionString += "\n"
    functionString += `if (value != null) target.${key} = value`
    functionString += "\n"
  }

  functionString += "})"

  return eval(functionString)
}

export function gracefullyThrow(value: unknown): void {
  queueMicrotask(() => { throw value })
}
