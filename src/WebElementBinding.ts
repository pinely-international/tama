import Accessor from "./Accessor"

const nativeDescriptors: PropertyDescriptorMap = {}

function getNativeDescriptor(instance: Node, property: keyof never): PropertyDescriptor {
  if (instance instanceof Node === false) {
    throw new TypeError("This type of instance is not supported: " + instance, { cause: { instance } })
  }

  if (instance.constructor.name in nativeDescriptors === false) {
    const descriptor = Object.getOwnPropertyDescriptor(instance.constructor.prototype, property)
    if (descriptor == null) {
      throw new TypeError("This instance constructor does provide a property descriptor for: " + String(property), { cause: { property } })
    }

    nativeDescriptors[instance.constructor.name] = descriptor
  }

  return nativeDescriptors[instance.constructor.name]
}


namespace WebNodeBinding {
  export function dualSignalBind<T extends Node>(node: T, key: keyof T, value: unknown, changeEventKey: string) {
    const accessor = Accessor.extractObservable(value)
    if (accessor == null) return

    const descriptor = getNativeDescriptor(node, key)

    if (accessor.get) descriptor.set!.call(node, accessor.get())
    if (accessor.set) {
      Object.defineProperty(node, key, {
        get: () => descriptor.get!.call(node),
        set: value => {
          descriptor.set!.call(node, value)
          accessor.set!(value)
        }
      })

      node.addEventListener(changeEventKey, event => accessor.set!((event.currentTarget as T)[key]))
    }
    accessor.subscribe?.(value => {
      value = accessor.get?.() ?? value
      if (value === descriptor.get!.call(node)) return

      descriptor.set!.call(node, value)
    })
  }

  export function asd(target, source, key: keyof never) {
    if (typeof source[key] === "string") target[key].baseVal = source[key]
    if (typeof source[key] === "object") {
      const accessor = Accessor.extractObservable(source[key])
      if (accessor != null) {
        target[key].baseVal = String(accessor.get?.() ?? "")
        accessor.subscribe?.(value => target[key].baseVal = String(accessor.get?.() ?? value))
      } else {
        target[key].baseVal = source[key].baseVal
      }
    }
  }
}

export default WebNodeBinding

