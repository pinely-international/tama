import { AccessorGet } from "@/Accessor"
import Observable from "@/Observable"
import { Primitive } from "type-fest"
import Inflator from "../Inflator"

class TelegrafInflator extends Inflator {
  protected inflatePrimitive(primitive: Primitive): unknown {
    throw new Error("Method not implemented.")
  }
  protected inflateFragment(): unknown {
    throw new Error("Method not implemented.")
  }
  protected inflateIterable<T>(iterable: Iterable<T>): unknown {
    throw new Error("Method not implemented.")
  }
  protected inflateAsyncIterable<T>(asyncIterable: AsyncIterable<T>): unknown {
    throw new Error("Method not implemented.")
  }
  protected inflateObservable<T>(observable: Observable<T> & AccessorGet<T>): unknown {
    throw new Error("Method not implemented.")
  }
  protected clone(): Inflator {
    throw new Error("Method not implemented.")
  }

}

export default TelegrafInflator



function Component(this: Context) {
  return (
    <message>
      <triggers>
        <start />
        <hears>Sex</hears>
        <command>/sexy</command>
        <message>Gay me</message>
      </triggers>
      <reply silent>
        {/* Observables will keep updating the message on change for some time. */}
        <text>Hello {this.state.role} <sticker name="gay" /></text>
        <attach asFiles>
          <image />
          <video />
          <file />
        </attach>
        <buttons>
          <button type="query" value="gay">Become Gay</button>
          <button type="link" to={() => <HowToBeGay sex />}>How to be a Gay?</button>
        </buttons>
      </reply>
    </message>
  )
}

function HowToBeGay(props: { sex?: boolean }) {
  return (
    <scene>

    </scene>
  )
}
