import { Subscriptable, Unsubscribe } from "@/Observable";

export class Life {
  public alive = false;
  private controller!: AbortController;

  private scopedCleanups = new Set<() => void>();

  private onEnterSubscribers = new Set<() => void>();
  private onExitSubscribers = new Set<() => void>();

  /** @internal */
  public enter(): void {
    if (this.alive) return;
    this.scopedCleanups.clear();
    this.alive = true;
    this.controller = new AbortController();

    for (const callback of this.onEnterSubscribers) {
      callback();
    }
  }

  /** @internal */
  public exit(): void {
    if (!this.alive) return;
    this.alive = false;
    this.controller.abort();

    for (const callback of this.onExitSubscribers) {
      callback();
    }
    for (const cleanup of this.scopedCleanups) {
      try {
        cleanup();
      } catch (error) {
        console.error("Error executing a scoped cleanup function:", error);
      }
    }
    this.scopedCleanups.clear();
  }
  /**
   * Executes a setup function when the lifecycle enters. 
   * If the setup function returns another function, it will be treated as a 
   * cleanup callback and executed when the lifecycle exits.
   */
  public scoped(setup: (signal: AbortSignal) => void): void {
    if (!this.alive) return;
    try {
      const cleanup = setup(this.controller.signal);
      if (typeof cleanup === 'function') {
        this.scopedCleanups.add(cleanup);
      }
    } catch (error) {
      console.error("Error executing a scoped lifecycle function:", error);
    }
  }

  /**
   * Subscribes to lifecycle events.
   * @param event The event to listen for ("enter" or "exit")
   */
  public when(event: "enter" | "exit"): Subscriptable<void> {
    const subscribers = event === "enter"
      ? this.onEnterSubscribers
      : this.onExitSubscribers;

    return {
      subscribe: (callback: () => void): Unsubscribe => {
        subscribers.add(callback);
        return {
          unsubscribe: () => {
            subscribers.delete(callback);
          },
        };
      },
    };
  }

  /**
   * Adopts a piece of logic and automatically manages its lifecycle.
   * This can be an object with onEnter/onExit methods, or a startup function.
   * @param logic The logic to adopt.
   */
  public adopt(logic: {
    onEnter?: () => void;
    onExit?: () => void;
    startup?: (signal: AbortSignal) => void;
  }): void {
    if (logic.onEnter) {
      this.when("enter").subscribe(logic.onEnter);
    }
    if (logic.onExit) {
      this.when("exit").subscribe(logic.onExit);
    }
    if (logic.startup) {
      this.when("enter").subscribe(() => {
        this.scoped(logic.startup!); 
      });
    }
  }
}
