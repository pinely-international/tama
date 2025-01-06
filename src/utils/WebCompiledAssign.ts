/** @internal */
namespace WebCompiledAssign {
  export function commonNode() { }
  export function common() { }
}

export default WebCompiledAssign


const nodeWritableProps = Object.entries(Object.getOwnPropertyDescriptors(Element.prototype)).map(([key, descriptor]) => {
  return (!descriptor.set || descriptor.value instanceof Function || key.startsWith("on")) ? null : key
}).filter(Boolean)
const elementWritableProps = Object.entries(Object.getOwnPropertyDescriptors(Element.prototype)).map(([key, descriptor]) => {
  return (!descriptor.set || descriptor.value instanceof Function || key.startsWith("on")) ? null : key
}).filter(Boolean)
const htmlElementWritableProps = Object.entries(Object.getOwnPropertyDescriptors(Element.prototype)).map(([key, descriptor]) => {
  return (!descriptor.set || descriptor.value instanceof Function || key.startsWith("on")) ? null : key
}).filter(Boolean)
