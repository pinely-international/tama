

// export class Life {
//   alive = false

//   when(event: "enter" | "exit") { }
//   adopt(value: { onEnter?(): void, onExit?(): void }) { }
// }

export class Life {
  public alive = false;
  private controllers = new Set<AbortController>();

  /**
   * Triggers the "enter" state. Called by the framework when the component mounts.
   */
  public enter(): void {
    this.alive = true;
    // In the future, this is where you would dispatch the "enter" event for `when()`.
  }

  /**
   * Triggers the "exit" state. Called by the framework when the component unmounts.
   * This is the master cleanup trigger.
   */
  public exit(): void {
    this.alive = false;
    for (const controller of this.controllers) {
      controller.abort();
    }
    this.controllers.clear();
    // In the future, this is where you would dispatch the "exit" event for `when()`.
  }

  /**
   * Implements the mentor's requested feature. Registers a setup function
   * that provides an AbortSignal for automatic cleanup on "exit".
   * @param setup A function that receives an AbortSignal for the component's scope.
   */
  public scoped(setup: (signal: AbortSignal) => void): void {
    if (!this.alive) {
      // It's often better to silently fail than to throw an error here,
      // as it can happen during race conditions in rendering.
      return;
    }

    const controller = new AbortController();
    this.controllers.add(controller);

    try {
      setup(controller.signal);
    } catch (error) {
      console.error("Error executing a scoped lifecycle function:", error);
      this.controllers.delete(controller); // Clean up if setup fails.
    }
  }

  // You can leave these as stubs for now, as they are out of scope for this task.
  public when(event: "enter" | "exit") {}
  public adopt(value: { onEnter?(): void; onExit?(): void }) {}
}
