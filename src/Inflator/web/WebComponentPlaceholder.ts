import { ProtonShell } from "@/Proton/ProtonShell"

import WebTempFragment from "./WebTempFragment"


class WebComponentPlaceholder extends Comment {
  /**
   * @returns actual node of `WebComponentPlaceholder` if `item` is of its instance.
   * @returns `item` itself if `item` is instance of `Node`.
   * @returns null if `item` is NOT instance of `Node`.
   */
  static actualOf(item: unknown): WebComponentPlaceholder | Node | null {
    if (item instanceof WebTempFragment) return item.target
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

export default WebComponentPlaceholder
