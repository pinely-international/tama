class ViewAPI {
  test() { }
}

interface Component {
  view?: ViewAPI
}

function Component(this: Component, props) {
  this.view = new ViewAPI

  const asd = () => this.view.test()

  return
}

export default Component
