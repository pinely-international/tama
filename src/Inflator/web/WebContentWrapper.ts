class WebProtonContentWrapper extends HTMLElement {
  constructor() {
    super()

    this.style.display = "contents"
  }
}

window.customElements.define("contents-fragment", WebProtonContentWrapper)
document.createElement("contents-fragment")
