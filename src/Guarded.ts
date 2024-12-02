import Accessor from "./Accessor"
import Observable from "./Observable"

interface Guarded<T extends Original, Original = unknown> {
  is(): this is NoInfer<T>
}

export default Guarded


type Guard<T, U> = (T & { is: true }) | (U & { is: false })
// type GuardFn<T, U> = () => ()

export interface ObservableAccessor<T> extends Observable<T>, Accessor<T> { }
export interface GuardedObservableAccessor<T extends Original, Original = unknown> extends Guarded<ObservableAccessor<T>, ObservableAccessor<Original>>, ObservableAccessor<Original> { }



const avatar: GuardedObservableAccessor<string, string | undefined> = {} as never


function asd() {
  if (!avatar.is()) return
  avatar.get()

  // avatar.is()
  // avatar.get()
}

asd()


type asd = ObservableAccessor<string | undefined & {}>
