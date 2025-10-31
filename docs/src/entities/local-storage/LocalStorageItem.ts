import { State } from "@denshya/reactive"

namespace LocalStorageItem {
  export const cookieConsent = new State<boolean | null>(localStorage.getItem("cookie_consent") != null ? localStorage.getItem("cookie_consent") === "true" : null)
  cookieConsent.subscribe(value => {
    if (value === null) {
      localStorage.removeItem("cookie_consent")
      return
    }
    localStorage.setItem("cookie_consent", value.toString())
  })
}

export default LocalStorageItem
