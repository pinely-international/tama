function queryAPI() {
  return new QueryObserver({ key: ["key"] })
}

function Component() {
  const lifecycle = new Tama.Lifecycle
  lifecycle.adopt()


  return <div ref={[lifecycle]} />
}

export default Component
