interface Guarded<T extends Original, Original = unknown> {
  valid(value: Original): value is T
}

export default Guarded

