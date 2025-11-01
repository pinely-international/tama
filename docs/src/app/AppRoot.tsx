import "@/assets/scss/reset.scss"
import "@/assets/scss/base.scss"
import "@/assets/scss/shiki.scss"


import NavigationEntrypoint from "./navigation/entrypoint"

function AppRoot() {
  requestIdleCallback(() => {
    const scrollTarget = window.document.getElementById(window.location.hash.substring(1))
    if (scrollTarget == null) return

    scrollTarget.scrollIntoView()
  })

  return (
    <>
      <NavigationEntrypoint />
    </>
  )
}

export default AppRoot
