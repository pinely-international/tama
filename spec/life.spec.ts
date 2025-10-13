import { describe, expect, it, mock } from "bun:test";
import { Life } from '../src/Life';

describe('Life Class', () => {
  it('should execute a scoped function when alive', () => {
    const life = new Life();
    const scopedFn = mock();

    life.enter();
    life.scoped(scopedFn);

    expect(scopedFn).toHaveBeenCalledTimes(1);
  });

  it('should not execute a scoped function when not alive', () => {
    const life = new Life();
    const scopedFn = mock(); 

    life.scoped(scopedFn); 

    expect(scopedFn).not.toHaveBeenCalled();
  });

  it('should trigger the AbortSignal on exit', () => {
    const life = new Life();
    const cleanupFn = mock();

    life.enter();
    life.scoped(signal => {
      signal.addEventListener('abort', cleanupFn);
    });
    life.exit();

    expect(cleanupFn).toHaveBeenCalledTimes(1);
  });
});
