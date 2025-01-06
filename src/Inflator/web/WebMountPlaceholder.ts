class WebMountPlaceholder extends Comment {
  constructor(private element: Node, name: string) { super(name) }

  override appendChild<T extends Node>(node: T): T {
    return this.element.appendChild(node)
  }
}

export default WebMountPlaceholder
