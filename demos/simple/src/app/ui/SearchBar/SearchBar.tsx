import "./SearchBar.scss"

import Icon from "../Icon/Icon"
import { Proton } from "@denshya/proton"
import { Flow } from "@denshya/flow"


interface SearchBarProps {
  value: Flow<string>
}

function SearchBar(this: Proton.Shell, props: SearchBarProps) {
  const value = Flow.from(props.value)
  const valueFilled = value.is(it => it === "")

  const LoupeIcon = this.inflator.inflate(<div><Icon name="loupe" /></div>) as HTMLElement
  const anim1 = LoupeIcon.animate(
    {
      opacity: [0.35, 1],
      clipPath: ["xywh(0 0 0% 100% round 30%)", "xywh(0 0 100% 100% round 100%)"]
    },
    {
      duration: 750,
      easing: "ease-in-out"
    }
  )
  const anim2 = LoupeIcon.animate(
    {
      opacity: 1,
      scale: ["1", "1.4", "1.2", "1"]
    },
    {
      duration: 250,
      easing: "ease"
    }
  )

  anim1.cancel()
  anim2.cancel()

  async function animateDebounce() {
    anim1.cancel()
    anim2.cancel()

    try {
      anim1.play()
      await anim1.finished

      anim2.play()
      await anim2.finished
    } catch (error) { /** Ignore animation cancels. */ }
  }

  value.sets(animateDebounce)


  return (
    <label className="search-bar">
      {LoupeIcon}
      <input className="search-bar__input" placeholder="Search..." pattern="" value={value} />
      <button className="search-bar__empty" type="button" hidden={valueFilled} on={{ click: () => value.set("") }}>
        <Icon name="cross" />
      </button>
    </label>
  )
}

export default SearchBar
