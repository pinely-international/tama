import { Emitter } from "@denshya/reactive"

import OrderedList from "./OrderedList"

interface CustomElementLifecycle {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  attributeChangedCallback?(name: string, oldValue: string | null, newValue: string | null): void;
}

class GroupRelayElement extends HTMLElement implements CustomElementLifecycle {
  declare readonly group: Group

  connectedCallback() {
    this.style.display = "none"
    this.group.connectedCallback()
  }

  disconnectedCallback() {
    this.group.disconnectedCallback()
  }

  override remove(): void { this.group.remove() }
  override get textContent() { return this.group.textContent }

  static readonly TAG = "group-relay"
  static {
    if (window.customElements.get(GroupRelayElement.TAG) == null) {
      window.customElements.define(GroupRelayElement.TAG, GroupRelayElement)
    }
  }
}


// interface GroupOptions {
//   /**
//    * Ensures child nodes are always presented in the targeted parent.
//    */
//   lockChildren?: boolean
//   /**
//    * Pipes through child nodes to the targeted parent. Appending to the group
//    */
//   streamChildren?: boolean
// }

class Group extends DocumentFragment implements ChildNode, CustomElementLifecycle {
  events = new Emitter<{
    connected: void
    disconnected: void
  }>

  orderedNodes = new OrderedList<Node & Partial<ChildNode>>

  /**
   * Connection event relay element.
   * Initially added to the group.
   *
   * When group brings nodes to a parent, relay element relays connection callbacks and returns back to group.
   */
  relayElement = document.createElement(GroupRelayElement.TAG) as GroupRelayElement

  constructor() {
    super()

    super.appendChild(this.relayElement)
    // @ts-expect-error yes
    this.relayElement.group = this
  }

  connectedCallback() {
    // Append group nodes to targeted parent.
    this.relayElement.after(...this.orderedNodes)
    // Return tap.
    super.appendChild(this.relayElement)

    this.events.dispatch("connected", void 0)
  }

  disconnectedCallback() {
    this.events.dispatch("disconnected", void 0)
  }

  after(...nodes: (Node | string)[]): void {
    this.orderedNodes.getLast()?.after?.(...nodes)
  }
  before(...nodes: (Node | string)[]): void {
    this.orderedNodes.getFirst()?.before?.(...nodes)
  }
  remove(): void {
    this.orderedNodes.values().filter(x => x != null).forEach(node => node.remove?.())
  }
  replaceWith(...nodes: (Node | string)[]): void {
    this.after(...nodes)
    this.orderedNodes.values().filter(x => x != null).filter(x => !nodes.includes(x)).forEach(node => node.remove?.())
  }


  override get children() {
    const elements = this.orderedNodes.values().filter(node => node instanceof HTMLElement).toArray()
    const collection: HTMLCollection = elements as never


    collection.item = index => elements[index] ?? null
    collection.namedItem = name => elements.find(element => ((element as any).name || element.id) === name) ?? null

    return collection
  }
  override get childNodes() {
    const nodes: ChildNode[] = this.orderedNodes.values().filter(node => node?.replaceWith != null).toArray() as ChildNode[]
    const nodeList: NodeListOf<ChildNode> = nodes as never

    nodeList.item = index => nodes[index] ?? null
    return nodeList
  }


  createNode(value: Node | string): Node {
    if (typeof value === "string") return new Text(value)
    return value
  }

  override appendChild<T extends Node>(node: T): T {
    if (node === this.relayElement as never) return node

    this.orderedNodes.append(node)
    this.after(node)
    return node
  }
  override removeChild<T extends Node>(child: T): T {
    this.orderedNodes.delete(child)
    return child
  }

  override replaceChild<T extends Node>(node: Node, child: T): T {
    this.orderedNodes.replaceItem(child, node)
    return child
  }
  override replaceChildren(...nodes: (Node | string)[]): void {
    nodes = nodes.map(node => this.createNode(node))

    const oldNodes = [...this.orderedNodes]
    if (nodes.every(node => oldNodes.includes(node as Node))) return


    this.orderedNodes.clear()
    this.append(...nodes)

    oldNodes.at(-1)?.after?.(...nodes)
    oldNodes.forEach(node => {
      if (nodes.includes(node)) return
      node.remove?.()
    })
  }

  override append(...nodes: (Node | string)[]): void {
    const realNodes = nodes.map(node => this.createNode(node))

    // super.append(...realNodes)
    this.after(...realNodes)

    realNodes.forEach(node => this.orderedNodes.append(node))
  }
  override prepend(...nodes: (Node | string)[]): void {
    const realNodes = nodes.map(node => this.createNode(node))

    // super.prepend(...realNodes)
    this.before(...realNodes)

    realNodes.forEach(node => this.orderedNodes.prepend(node))
  }

  override insertBefore<T extends Node>(node: T, child: Node | null): T {
    if (child != null) {
      this.orderedNodes.insertBeforeItem(child, node)
    }
    return node
  }

  override contains(other: Node | null): boolean { return !!other && this.orderedNodes.has(other) }

  override get textContent() {
    if (this.orderedNodes.length === 0) return null

    return this.orderedNodes.values().map(node => node?.textContent ?? "").toArray().join("")
  }

  override get firstChild() {
    return (this.orderedNodes.getFirst() as ChildNode | undefined) ?? null
  }

  override get lastChild() {
    return (this.orderedNodes.getLast() as ChildNode | undefined) ?? null
  }

  // override getElementById(elementId: string): HTMLElement | null {}

  // static parentOf(child: ChildNode): Group | ParentNode | null { }
}

export default Group
