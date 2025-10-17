export class Life {
  public alive = false;
  private controller!: AbortController;

  /** @internal */
  public enter(): void {
    this.alive = true;
    this.controller = new AbortController();
  }

  /** @internal */
  public exit(): void {
    this.alive = false;
    this.controller.abort();
  }

  public scoped(setup: (signal: AbortSignal) => void): void {
    if (!this.alive) return;
    try {
      setup(this.controller.signal);
    } catch (error) {
      console.error("Error executing a scoped lifecycle function:", error);
    }
  }
}
