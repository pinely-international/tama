import "./ProgressBar.scss"



interface ProgressBarProps {
  /** Normalized. */
  value: number

  color?: "red"
}

function ProgressBar(props: ProgressBarProps) {
  return (
    <div className="progress-bar" style={{ "--progress": props.value }} aria={{ ariaHidden: "true" }}>
      <div className="progress-bar__filled" classMods={[props.color]} />
      <div className="progress-bar__unfilled" />
    </div>
  )
}

export default ProgressBar
