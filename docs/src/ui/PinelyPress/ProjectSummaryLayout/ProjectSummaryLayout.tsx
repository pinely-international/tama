import "./ProjectSummaryLayout.scss"


interface ProjectSummaryLayoutProps {
  children: unknown
}

function ProjectSummaryLayout(props: ProjectSummaryLayoutProps) {
  return (
    <div className="project-summary-layout">{props.children}</div>
  )
}

export default ProjectSummaryLayout
