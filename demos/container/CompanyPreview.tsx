import "./CompanyPreview.scss"
import { CompanyPreviewBehavior } from "./CompanyPreviewContainer"


interface CompanyPreviewProps extends Highlightable, Themeable {
  size?: "big"
  active?: LazySource<boolean>
  data: LazySource<CompanyBase>
}

function CompanyPreview(this: Proton.Component, props: CompanyPreviewProps) {
  this.fallback = new Proton.Fallback({})
  this.fallback.error.set(new TypeError("")) // Equals `throw new TypeError("")`.

  this.suspense.add()
  this.catch()

  return (
    <div className="company-preview" classMods={[props.active && "active", props.size, props.theme]}>
      <img className="company-preview__image" src={props.data.logo} />
      <div className="company-preview__title">{props.highlight?.(props.title) ?? props.title}</div>
    </div>
  )
}

export default CompanyPreview

  (<CompanyPreviewContainer id="123" />)
  (<CompanyPreview behavior={new CompanyPreviewBehavior("123")} />)
