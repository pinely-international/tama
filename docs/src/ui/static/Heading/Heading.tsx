import "./Heading.scss"


interface HeadingProps {
  title: string
  brief: string

  color?: "blue"
}

function Heading(props: HeadingProps) {
  return (
    <hgroup className="heading" classMods={[props.color]}>
      <h2>{props.title}</h2>
      <span>{props.brief}</span>
    </hgroup>
  )
}

export default Heading
