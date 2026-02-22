import { State } from "@denshya/reactive";
import { Tama } from ".";
import { MountObserver } from "./MountObserver";
import { MountRoutine } from "./MountRoutine";
import { ProtonComponent } from "./Proton/ProtonComponent";
import { ProtonRef as Ref } from "./Proton/ProtonRef";
import { EventDelegator } from "./EventDelegator";


namespace AppTheme {
  export const defaultBehavior = {}
}

namespace AppLocale {
  export let region = new State("en-US")

  export function text(key: string) { }
  export function date(key: string) { }
  export function time(key: string) { }
}

function snapToTop(element: HTMLElement) { }

async function Navbar(this: ProtonComponent & { disposal: DisposableStack & { signal: AbortSignal } }) {
  this.use(AppTheme.defaultBehavior)

  const price = new State(0)
  const loading = new State(false)

  const navRef = new Ref<HTMLElement | null>(null);
  const navLifecycle = new MountRoutine(() => {
    Ref.assert(navRef)
    snapToTop(navRef.current)

    price.set(123)

    console.log("Nav mounted!");
    // logic: e.g., start a socket connection
    return () => console.log("Nav unmounted!");
  })

  // new MountObserver(new MountRoutine(() => { }))
  // new MountObserver(navLifecycle).observe(new Text)

  this.view.subscribe(node => { })
  this.view.life = new MountRoutine(() => { })

  State
    .collect([loading, price])
    .subscribe(() => { }, this.disposal)




  const observer = new QueryObserver(queryClient, {
    queryKey: ["todos"],
    queryFn: fetchTodos,
    staleTime: 1000 * 60,
  })

  const todos = State.from(observer)
  // 4. Subscribe to updates
  todos.subscribe(todos => {
    if (todos.isLoading) {
      console.log('Loading...')
    } else if (todos.isError) {
      console.error('Error:', todos.error)
    } else {
      console.log('Data:', todos.data)
    }
  })

  return (
    <nav ref={[navRef, MountObserver.with(navLifecycle)]}>
      <a on={{ click: event => event.target }}>Some text</a>
      <a>{AppLocale.text("link1")}</a>
    </nav>
  )
}

function Navbar() {
  const navRef = new Ref<HTMLElement | null>(null);
  const navMountRoutine = new MountRoutine(() => {
    Ref.assert(navRef)
    snapToTop(navRef.current)

    console.log("Nav mounted!");
    // logic: e.g., start a socket connection
    return () => console.log("Nav unmounted!");
  })

  return (
    <nav ref={[navRef, MountObserver.with(navMountRoutine)]} />
  )
}

function Navbar() {
  const navRef = useRef<HTMLElement>()
  useEffect(() => {
    if (navRef == null) return // <== Pitfall
    snapToTop(navRef.current)

    console.log("Nav mounted!");
    // logic: e.g., start a socket connection
    return () => console.log("Nav unmounted!");
  }, [])

  return <nav ref={navRef} />
}





function UserView(props: { name: string }) {
  return new JSXDiffRoutine(props => (
    <div>{props.name}</div>
  ))

  return (
    <div>{props.name}</div>
  )
}

function UserContainer() {
  return <Suspense><UserView /></Suspense>
}



class CustomBehavior extends Tama.Behavior { }
