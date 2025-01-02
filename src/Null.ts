/** @internal */
namespace Null {
  export const ARRAY = Object.freeze(Object.seal([])) as never[]
  export const OBJECT = Object.freeze(Object.seal({}))
  export const FUNCTION = Object.freeze(Object.seal(() => { }))
}

export default Null
