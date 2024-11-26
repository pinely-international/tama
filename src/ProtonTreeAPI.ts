interface ProtonTreeAPI {
  set(subject: unknown): void
  /**
   * Removes the view tree from document, but saves the reference to the anchor elements - the next `set` will work.
   */
  detach(): void
}

export default ProtonTreeAPI
