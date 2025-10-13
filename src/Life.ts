export class Life {
  public alive = false;
  private controllers = new Set<AbortController>();

  public enter(): void {
    this.alive = true;
  }

  public exit(): void {
    this.alive = false;
    for (const controller of this.controllers) {
      controller.abort();
    }
    this.controllers.clear();
  }

  public scoped(setup: (signal: AbortSignal) => void): void {
    if (!this.alive) {
      return;
    }

    const controller = new AbortController();
    this.controllers.add(controller);

    try {
      setup(controller.signal);
    } catch (error) {
      console.error("Error executing a scoped lifecycle function:", error);
      this.controllers.delete(controller);
    }
  }

  public when(event: "enter" | "exit") {}
  public adopt(value: { onEnter?(): void; onExit?(): void }) {}
}
