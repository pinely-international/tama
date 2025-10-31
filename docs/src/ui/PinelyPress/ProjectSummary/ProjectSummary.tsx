import "./ProjectSummary.scss"


interface ProjectSummaryProps {
  title: string
  description: string
  status: string

  children: unknown
}

function ProjectSummary(props: ProjectSummaryProps) {
  return (
    <div className="project-summary">
      <div className="project-summary__info">
        <div className="project-summary__title">
          <em>{props.title}</em>
          <span className="project-summary__status">{props.status}</span>
        </div>
        <span>{props.description}</span>
      </div>
      <p className="project-summary__summary">{props.children}</p>
    </div>
  )
}

export default ProjectSummary
