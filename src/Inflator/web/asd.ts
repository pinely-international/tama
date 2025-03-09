class WebComponentPlaceholder extends Comment {
  /**
   * @returns actual node of `WebComponentPlaceholder` if `item` is of its instance.
   * @returns `item` itself if `item` is instance of `Node`.
   * @returns null if `item` is NOT instance of `Node`.
   */
  static actualOf(item: unknown): WebComponentPlaceholder | Node | null {
    if (item instanceof WebTempFragment) return WebComponentPlaceholder.actualOf(item.target)
    if (item instanceof WebComponentPlaceholder) return item.actual
    if (item instanceof Node) return item

    return null
  }

  /**
   * The node that is supposed to be being used at current conditions.
   */
  get actual(): Node | null {
    const shellView = this.shell.getView()

    if (shellView == null) return this
    if (shellView === this) return this
    if (shellView instanceof Node === false) return null

    return WebComponentPlaceholder.actualOf(shellView)
  }

  constructor(public shell: ProtonShell, shellConstructor: Function) {
    super(shellConstructor.name)
  }

  protected safeActualParentElement() {
    const actual = this.actual
    if (actual === this) return null

    return actual?.parentElement
  }

  override get parentElement() {
    const element = super.parentElement ?? this.safeActualParentElement()
    if (element == null) {
      const shellView = this.shell.getView()
      if (shellView === this) return null
      if (shellView instanceof Node === false) return null

      return shellView.parentElement
    }

    return element
  }
}

/**
 * When faced, it is instructed to unwrap this fragment and use its target node as original.
 */
class WebTempFragment extends DocumentFragment {
  declare target: Node
}


function resolveReplacement(value: any): any {
  if (value == null) return value
  if (value.replacedWith == null) return value
  if (value === value.replacedWith) return value

  return resolveReplacement(value.replacedWith)
}


class Inflator {
  // ...
  inflateComponent(factory: Function, props: any) {
    const shell = new ProtonShell(this, this.shell)

    const componentPlaceholder = new WebComponentPlaceholder(shell, factory)
    const componentWrapper = new WebTempFragment
    componentWrapper.append(componentPlaceholder)
    componentWrapper.target = componentPlaceholder
    componentWrapper.fixedNodes = [componentPlaceholder]

    const lastAnimationFrame = -1
    let currentView: Node = componentPlaceholder

    function replace(view: unknown) {
      let nextView = view

      if (view === null) {
        nextView = componentPlaceholder
        // @ts-expect-error by design.
        nextView.replacedWith = null
      }
      if (nextView instanceof Node === false) return


      let actualNextView = nextView
      if (actualNextView.toBeReplacedWith != null) {
        const toBeReplacedWith = actualNextView.toBeReplacedWith

        actualNextView.toBeReplacedWith = null
        actualNextView = toBeReplacedWith
      }

      currentView = resolveReplacement(currentView)
      currentView.toBeReplacedWith = actualNextView

      if (currentView.replaceWith instanceof Function) {
        if (currentView.parentNode != null) {
          currentView.replaceWith(actualNextView)
          currentView.toBeReplacedWith = null
        }

        if (view !== null) {
          // @ts-expect-error by design.
          currentView.replacedWith = nextView
        } else {
          // @ts-expect-error by design.
          currentView.replacedWith = null
        }
        // @ts-expect-error by design.
        nextView.replacedWith = null
        // @ts-expect-error by design.
        actualNextView.replacedWith = null

        currentView = nextView

        return
      }
    }


    shell.on("view").subscribe(view => {
      cancelAnimationFrame(lastAnimationFrame)
      lastAnimationFrame = requestAnimationFrame(() => replace(view))
    })

    ProtonShell.evaluate(shell, factory, props)

    return componentWrapper
  }
}
