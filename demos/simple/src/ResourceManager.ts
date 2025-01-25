// Manages many similar resources.

class ResourceManager<T> {
  constructor(asd: T) { }

  find(...keys: ConstructorParameters<T>): InstanceType<T>[]
}

export default ResourceManager
