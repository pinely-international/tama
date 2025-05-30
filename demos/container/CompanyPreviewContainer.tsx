import CompanyDao from "@/entities/company/company.dao"
import { ThemeContext } from "./Theme"
import { StateOrPlain } from "@denshya/reactive"


export class CompanyResource {
  constructor(readonly id: string) { }

  get() {
    return CompanyDao.find(this.id)
  }
}

inflator.jsxAttributes.set("behavior", ProtonBehaviorAttributeSetup)



class ResourceBehavior<T> extends ProtonBehavior<{ data: StateOrPlain<unknown> }> {
  readonly theme = this.context.find(ThemeContext)
  readonly resource = new CompanyResource(this.id)
  readonly fallback = new ProtonFallback({ error: "<ErrorCover />", pending: "<LoaderCover />" })

  constructor(readonly resource: T) { super() }

  async onEnter() {
    const { data } = await this.resource.get()
    this.props.data = data
  }
  onExit() { }
}
