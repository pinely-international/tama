import "./Loader.scss"

import Loader from "./Loader"
import { bemFlow } from "@/utils/bem"

interface LoaderCoverProps {
  absolute?: boolean
  white?: boolean
  dimmed?: boolean
}

function LoaderCover(props: LoaderCoverProps) {
  return (
    <div className={bemFlow("loader-cover", props.absolute && "absolute", props.white && "white", props.dimmed && "dimmed")}>
      <Loader className="loader-cover__loader" />
    </div>
  )
}

export default LoaderCover
