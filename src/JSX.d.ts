import Observable from "./Observable"

export { }


document.body.addEventListener("abort")


declare global {
  type IntrinsicElementEvents = {
    [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void
  }

  interface IntrinsicAttributes {
    on?: IntrinsicElementEvents
    key?: unknown
    style?: Record<string, string | CSSUnitValue | Observable> | string | Observable<string>
    className?: string
  }
  interface ProtonSVGElement { }

  namespace JSX {
    interface Element {
      type: never
      props: never
      children: []
    }


    interface ElementTypeConstructor { }

    type ElementType = string | ElementTypeConstructor



    interface InputElementAttributes extends IntrinsicAttributes {
      value: string | Observable<string> | (Observable<string> & { set(value: string): void })
    }

    interface ButtonElementAttributes extends IntrinsicAttributes {
      type?: "button" | "reset" | "submit"
    }

    interface IntrinsicElements {
      // HTML
      a: IntrinsicAttributes
      abbr: IntrinsicAttributes
      address: IntrinsicAttributes
      area: IntrinsicAttributes
      article: IntrinsicAttributes
      aside: IntrinsicAttributes
      audio: IntrinsicAttributes
      b: IntrinsicAttributes
      base: IntrinsicAttributes
      bdi: IntrinsicAttributes
      bdo: IntrinsicAttributes
      big: IntrinsicAttributes
      blockquote: IntrinsicAttributes
      body: IntrinsicAttributes
      br: IntrinsicAttributes
      button: ButtonElementAttributes
      canvas: IntrinsicAttributes
      caption: IntrinsicAttributes
      center: IntrinsicAttributes
      cite: IntrinsicAttributes
      code: IntrinsicAttributes
      col: IntrinsicAttributes
      colgroup: IntrinsicAttributes
      data: IntrinsicAttributes
      datalist: IntrinsicAttributes
      dd: IntrinsicAttributes
      del: IntrinsicAttributes
      details: IntrinsicAttributes
      dfn: IntrinsicAttributes
      dialog: IntrinsicAttributes
      div: IntrinsicAttributes
      dl: IntrinsicAttributes
      dt: IntrinsicAttributes
      em: IntrinsicAttributes
      embed: IntrinsicAttributes
      fieldset: IntrinsicAttributes
      figcaption: IntrinsicAttributes
      figure: IntrinsicAttributes
      footer: IntrinsicAttributes
      form: IntrinsicAttributes
      h1: IntrinsicAttributes
      h2: IntrinsicAttributes
      h3: IntrinsicAttributes
      h4: IntrinsicAttributes
      h5: IntrinsicAttributes
      h6: IntrinsicAttributes
      head: IntrinsicAttributes
      header: IntrinsicAttributes
      hgroup: IntrinsicAttributes
      hr: IntrinsicAttributes
      html: IntrinsicAttributes
      i: IntrinsicAttributes
      iframe: IntrinsicAttributes
      img: IntrinsicAttributes
      input: InputElementAttributes
      ins: IntrinsicAttributes
      kbd: IntrinsicAttributes
      keygen: IntrinsicAttributes
      label: IntrinsicAttributes
      legend: IntrinsicAttributes
      li: IntrinsicAttributes
      link: IntrinsicAttributes
      main: IntrinsicAttributes
      map: IntrinsicAttributes
      mark: IntrinsicAttributes
      menu: IntrinsicAttributes
      menuitem: IntrinsicAttributes
      meta: IntrinsicAttributes
      meter: IntrinsicAttributes
      nav: IntrinsicAttributes
      noindex: IntrinsicAttributes
      noscript: IntrinsicAttributes
      object: IntrinsicAttributes
      ol: IntrinsicAttributes
      optgroup: IntrinsicAttributes
      option: IntrinsicAttributes
      output: IntrinsicAttributes
      p: IntrinsicAttributes
      param: IntrinsicAttributes
      picture: IntrinsicAttributes
      pre: IntrinsicAttributes
      progress: IntrinsicAttributes
      q: IntrinsicAttributes
      rp: IntrinsicAttributes
      rt: IntrinsicAttributes
      ruby: IntrinsicAttributes
      s: IntrinsicAttributes
      samp: IntrinsicAttributes
      search: IntrinsicAttributes
      slot: IntrinsicAttributes
      script: IntrinsicAttributes
      section: IntrinsicAttributes
      select: IntrinsicAttributes
      small: IntrinsicAttributes
      source: IntrinsicAttributes
      span: IntrinsicAttributes
      strong: IntrinsicAttributes
      style: IntrinsicAttributes
      sub: IntrinsicAttributes
      summary: IntrinsicAttributes
      sup: IntrinsicAttributes
      table: IntrinsicAttributes
      template: IntrinsicAttributes
      tbody: IntrinsicAttributes
      td: IntrinsicAttributes
      textarea: IntrinsicAttributes
      tfoot: IntrinsicAttributes
      th: IntrinsicAttributes
      thead: IntrinsicAttributes
      time: IntrinsicAttributes
      title: IntrinsicAttributes
      tr: IntrinsicAttributes
      track: IntrinsicAttributes
      u: IntrinsicAttributes
      ul: IntrinsicAttributes
      "var": IntrinsicAttributes
      video: IntrinsicAttributes
      wbr: IntrinsicAttributes
      webview: IntrinsicAttributes

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
