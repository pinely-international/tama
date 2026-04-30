declare namespace JSX {
  interface Element { }
  interface ElementChildrenAttribute { children: {} }
  interface IntrinsicElements {
    [elementName: string]: any
  }
}