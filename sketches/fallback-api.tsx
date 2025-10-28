function CompanyPreview(this: any, props) {
  this.fallback = new Fallback({})
  this.fallback.error.set(new TypeError("")) // Equals `throw new TypeError("")`.

  // this.fallback.
  this.boundary.add(new class Fallback { }())

  this.boundary.catch(/* All */).then()
  this.boundary.catch(Error).then()
  this.boundary.catch(Promise).then()

  this.boundary.catch(Promise).then()

  this.runtime.catch(Promise).then()

  this.suspense.add()
  this.catch()

  return
}

export default CompanyPreview
