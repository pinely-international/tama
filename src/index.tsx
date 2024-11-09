/* eslint-disable unused-imports/no-unused-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Proton from "./Proton"

function ComponentGod(this: ProtonShell) {
  return this
}

console.log(
  <div>
    <span on={{}} key="key">Bitch</span>
    {123}
    {new Promise(() => { })}
    <ComponentGod />
  </div>
)




declare global {
  interface ProtonHTMLElement {
    on?: {}
    key?: unknown
  }
  interface ProtonSVGElement { }
  interface ProtonShell { }

  namespace JSX {
    type ElementType = string | ProtonShell
    interface Element { } // Maybe needed.

    interface IntrinsicElements {
      // HTML
      a: ProtonHTMLElement
      abbr: ProtonHTMLElement
      address: ProtonHTMLElement
      area: ProtonHTMLElement
      article: ProtonHTMLElement
      aside: ProtonHTMLElement
      audio: ProtonHTMLElement
      b: ProtonHTMLElement
      base: ProtonHTMLElement
      bdi: ProtonHTMLElement
      bdo: ProtonHTMLElement
      big: ProtonHTMLElement
      blockquote: ProtonHTMLElement
      body: ProtonHTMLElement
      br: ProtonHTMLElement
      button: ProtonHTMLElement
      canvas: ProtonHTMLElement
      caption: ProtonHTMLElement
      center: ProtonHTMLElement
      cite: ProtonHTMLElement
      code: ProtonHTMLElement
      col: ProtonHTMLElement
      colgroup: ProtonHTMLElement
      data: ProtonHTMLElement
      datalist: ProtonHTMLElement
      dd: ProtonHTMLElement
      del: ProtonHTMLElement
      details: ProtonHTMLElement
      dfn: ProtonHTMLElement
      dialog: ProtonHTMLElement
      div: ProtonHTMLElement
      dl: ProtonHTMLElement
      dt: ProtonHTMLElement
      em: ProtonHTMLElement
      embed: ProtonHTMLElement
      fieldset: ProtonHTMLElement
      figcaption: ProtonHTMLElement
      figure: ProtonHTMLElement
      footer: ProtonHTMLElement
      form: ProtonHTMLElement
      h1: ProtonHTMLElement
      h2: ProtonHTMLElement
      h3: ProtonHTMLElement
      h4: ProtonHTMLElement
      h5: ProtonHTMLElement
      h6: ProtonHTMLElement
      head: ProtonHTMLElement
      header: ProtonHTMLElement
      hgroup: ProtonHTMLElement
      hr: ProtonHTMLElement
      html: ProtonHTMLElement
      i: ProtonHTMLElement
      iframe: ProtonHTMLElement
      img: ProtonHTMLElement
      input: ProtonHTMLElement
      ins: ProtonHTMLElement
      kbd: ProtonHTMLElement
      keygen: ProtonHTMLElement
      label: ProtonHTMLElement
      legend: ProtonHTMLElement
      li: ProtonHTMLElement
      link: ProtonHTMLElement
      main: ProtonHTMLElement
      map: ProtonHTMLElement
      mark: ProtonHTMLElement
      menu: ProtonHTMLElement
      menuitem: ProtonHTMLElement
      meta: ProtonHTMLElement
      meter: ProtonHTMLElement
      nav: ProtonHTMLElement
      noindex: ProtonHTMLElement
      noscript: ProtonHTMLElement
      object: ProtonHTMLElement
      ol: ProtonHTMLElement
      optgroup: ProtonHTMLElement
      option: ProtonHTMLElement
      output: ProtonHTMLElement
      p: ProtonHTMLElement
      param: ProtonHTMLElement
      picture: ProtonHTMLElement
      pre: ProtonHTMLElement
      progress: ProtonHTMLElement
      q: ProtonHTMLElement
      rp: ProtonHTMLElement
      rt: ProtonHTMLElement
      ruby: ProtonHTMLElement
      s: ProtonHTMLElement
      samp: ProtonHTMLElement
      search: ProtonHTMLElement
      slot: ProtonHTMLElement
      script: ProtonHTMLElement
      section: ProtonHTMLElement
      select: ProtonHTMLElement
      small: ProtonHTMLElement
      source: ProtonHTMLElement
      span: ProtonHTMLElement
      strong: ProtonHTMLElement
      style: ProtonHTMLElement
      sub: ProtonHTMLElement
      summary: ProtonHTMLElement
      sup: ProtonHTMLElement
      table: ProtonHTMLElement
      template: ProtonHTMLElement
      tbody: ProtonHTMLElement
      td: ProtonHTMLElement
      textarea: ProtonHTMLElement
      tfoot: ProtonHTMLElement
      th: ProtonHTMLElement
      thead: ProtonHTMLElement
      time: ProtonHTMLElement
      title: ProtonHTMLElement
      tr: ProtonHTMLElement
      track: ProtonHTMLElement
      u: ProtonHTMLElement
      ul: ProtonHTMLElement
      "var": ProtonHTMLElement
      video: ProtonHTMLElement
      wbr: ProtonHTMLElement
      webview: ProtonHTMLElement

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
