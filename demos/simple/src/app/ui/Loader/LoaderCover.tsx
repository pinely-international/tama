import "./Loader.scss"

import Loader from "./Loader"


interface LoaderCoverProps {
  absolute?: boolean
  white?: boolean
  dimmed?: boolean
}

function LoaderCover(props: LoaderCoverProps) {
  return (
    <div className="loader-cover" classMods={props}>
      <Loader className="loader-cover__loader" />
    </div>
  )
}

export default LoaderCover
