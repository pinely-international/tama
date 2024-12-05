import { Accessible, AccessorGet } from "./Accessor"
import Guarded from "./Guarded"
import Observable from "./Observable"

export { }


declare global {
  namespace JSX {
    interface ProtonSVGElement { }
    interface Element {
      type: never
      props: never
      children: []
    }

    interface ElementTypeConstructor { }
    type ElementType = string | ElementTypeConstructor


    type AttributeValue<T> =
      | T
      | Observable<T>
      | Accessible<T>
      | (Observable<T> & Accessible<T>)
      | (Guarded<T> & Observable<T>)
      | (Guarded<T> & Accessible<T>)
      | (Guarded<T> & Observable<T> & Accessible<T>)

    type ElementEvents = {
      [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void
    }

    interface IntrinsicAttributes {
      mounted?: AccessorGet<T> & Observable<T>
    }

    interface ElementAttributes extends IntrinsicAttributes {
      on?: ElementEvents

      style?: AttributeValue<Record<string, AttributeValue<string | CSSUnitValue>> | string>
      className?: AttributeValue<string>
    }




    interface InputElementAttributes extends ElementAttributes {
      value?: AttributeValue<string>
    }

    interface ButtonElementAttributes extends ElementAttributes {
      type?: AttributeValue<"button" | "reset" | "submit">
    }

    interface ImageElementAttributes extends ElementAttributes {
      src?: AttributeValue<string>
      alt?: AttributeValue<string>
    }

    interface AnchorElementAttributes extends ElementAttributes {
      href?: AttributeValue<string>
    }

    interface IntrinsicElements {
      // HTML
      a: AnchorElementAttributes
      abbr: ElementAttributes
      address: ElementAttributes
      area: ElementAttributes
      article: ElementAttributes
      aside: ElementAttributes
      audio: ElementAttributes
      b: ElementAttributes
      base: ElementAttributes
      bdi: ElementAttributes
      bdo: ElementAttributes
      big: ElementAttributes
      blockquote: ElementAttributes
      body: ElementAttributes
      br: ElementAttributes
      button: ButtonElementAttributes
      canvas: ElementAttributes
      caption: ElementAttributes
      center: ElementAttributes
      cite: ElementAttributes
      code: ElementAttributes
      col: ElementAttributes
      colgroup: ElementAttributes
      data: ElementAttributes
      datalist: ElementAttributes
      dd: ElementAttributes
      del: ElementAttributes
      details: ElementAttributes
      dfn: ElementAttributes
      dialog: ElementAttributes
      div: ElementAttributes
      dl: ElementAttributes
      dt: ElementAttributes
      em: ElementAttributes
      embed: ElementAttributes
      fieldset: ElementAttributes
      figcaption: ElementAttributes
      figure: ElementAttributes
      footer: ElementAttributes
      form: ElementAttributes
      h1: ElementAttributes
      h2: ElementAttributes
      h3: ElementAttributes
      h4: ElementAttributes
      h5: ElementAttributes
      h6: ElementAttributes
      head: ElementAttributes
      header: ElementAttributes
      hgroup: ElementAttributes
      hr: ElementAttributes
      html: ElementAttributes
      i: ElementAttributes
      iframe: ElementAttributes
      img: ImageElementAttributes
      input: InputElementAttributes
      ins: ElementAttributes
      kbd: ElementAttributes
      keygen: ElementAttributes
      label: ElementAttributes
      legend: ElementAttributes
      li: ElementAttributes
      link: ElementAttributes
      main: ElementAttributes
      map: ElementAttributes
      mark: ElementAttributes
      menu: ElementAttributes
      menuitem: ElementAttributes
      meta: ElementAttributes
      meter: ElementAttributes
      nav: ElementAttributes
      noindex: ElementAttributes
      noscript: ElementAttributes
      object: ElementAttributes
      ol: ElementAttributes
      optgroup: ElementAttributes
      option: ElementAttributes
      output: ElementAttributes
      p: ElementAttributes
      param: ElementAttributes
      picture: ElementAttributes
      pre: ElementAttributes
      progress: ElementAttributes
      q: ElementAttributes
      rp: ElementAttributes
      rt: ElementAttributes
      ruby: ElementAttributes
      s: ElementAttributes
      samp: ElementAttributes
      search: ElementAttributes
      slot: ElementAttributes
      script: ElementAttributes
      section: ElementAttributes
      select: ElementAttributes
      small: ElementAttributes
      source: ElementAttributes
      span: ElementAttributes
      strong: ElementAttributes
      style: ElementAttributes
      sub: ElementAttributes
      summary: ElementAttributes
      sup: ElementAttributes
      table: ElementAttributes
      template: ElementAttributes
      tbody: ElementAttributes
      td: ElementAttributes
      textarea: ElementAttributes
      tfoot: ElementAttributes
      th: ElementAttributes
      thead: ElementAttributes
      time: ElementAttributes
      title: ElementAttributes
      tr: ElementAttributes
      track: ElementAttributes
      u: ElementAttributes
      ul: ElementAttributes
      "var": ElementAttributes
      video: ElementAttributes
      wbr: ElementAttributes
      webview: ElementAttributes

      // SVG
      svg: ProtonSVGElement

      animate: ProtonSVGElement // TODO: It is SVGAnimateElement but is not in TypeScript's lib.dom.d.ts for now.
      animateMotion: ProtonSVGElement
      animateTransform: ProtonSVGElement // TODO: It is SVGAnimateTransformElement but is not in TypeScript's lib.dom.d.ts for now.
      circle: ProtonSVGElement
      clipPath: ProtonSVGElement
      defs: ProtonSVGElement
      desc: ProtonSVGElement
      ellipse: ProtonSVGElement
      feBlend: ProtonSVGElement
      feColorMatrix: ProtonSVGElement
      feComponentTransfer: ProtonSVGElement
      feComposite: ProtonSVGElement
      feConvolveMatrix: ProtonSVGElement
      feDiffuseLighting: ProtonSVGElement
      feDisplacementMap: ProtonSVGElement
      feDistantLight: ProtonSVGElement
      feDropShadow: ProtonSVGElement
      feFlood: ProtonSVGElement
      feFuncA: ProtonSVGElement
      feFuncB: ProtonSVGElement
      feFuncG: ProtonSVGElement
      feFuncR: ProtonSVGElement
      feGaussianBlur: ProtonSVGElement
      feImage: ProtonSVGElement
      feMerge: ProtonSVGElement
      feMergeNode: ProtonSVGElement
      feMorphology: ProtonSVGElement
      feOffset: ProtonSVGElement
      fePointLight: ProtonSVGElement
      feSpecularLighting: ProtonSVGElement
      feSpotLight: ProtonSVGElement
      feTile: ProtonSVGElement
      feTurbulence: ProtonSVGElement
      filter: ProtonSVGElement
      foreignObject: ProtonSVGElement
      g: ProtonSVGElement
      image: ProtonSVGElement
      line: ProtonSVGElement
      linearGradient: ProtonSVGElement
      marker: ProtonSVGElement
      mask: ProtonSVGElement
      metadata: ProtonSVGElement
      mpath: ProtonSVGElement
      path: ProtonSVGElement
      pattern: ProtonSVGElement
      polygon: ProtonSVGElement
      polyline: ProtonSVGElement
      radialGradient: ProtonSVGElement
      rect: ProtonSVGElement
      set: ProtonSVGElement
      stop: ProtonSVGElement
      switch: ProtonSVGElement
      symbol: ProtonSVGElement
      text: ProtonSVGElement
      textPath: ProtonSVGElement
      tspan: ProtonSVGElement
      use: ProtonSVGElement
      view: ProtonSVGElement
    }
  }
}
