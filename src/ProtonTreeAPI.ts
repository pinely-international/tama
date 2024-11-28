interface ProtonViewAPI {
  set(subject: unknown): void
  transit(subject: unknown): ViewTransition
  /**
   * Removes the view tree from document, but saves the reference to the anchor elements - the next `set` will work.
   */
  detach(): void
  catch(catchClause: (thrown: unknown) => void): void
}

export default ProtonViewAPI
