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

describe('Life Class > when()', () => {
  it('should call when("enter") subscriber on enter', () => {
    const life = new Life();
    const enterCallback = mock();
    
    life.when("enter").subscribe(enterCallback);
    
    expect(enterCallback).not.toHaveBeenCalled();
    life.enter();
    expect(enterCallback).toHaveBeenCalledTimes(1);
    life.enter(); // Should not call again if already alive
    expect(enterCallback).toHaveBeenCalledTimes(1);
  });

  it('should call when("exit") subscriber on exit', () => {
    const life = new Life();
    const exitCallback = mock();

    life.when("exit").subscribe(exitCallback);
    
    life.enter();
    expect(exitCallback).not.toHaveBeenCalled();
    life.exit();
    expect(exitCallback).toHaveBeenCalledTimes(1);
    life.exit();
    expect(exitCallback).toHaveBeenCalledTimes(1);
  });
});

describe('Life Class > adopt()', () => {
  it('should adopt logic with onEnter and onExit', () => {
    const life = new Life();
    const logic = {
      onEnter: mock(),
      onExit: mock(),
    };

    life.adopt(logic);
    
    expect(logic.onEnter).not.toHaveBeenCalled();
    life.enter();
    expect(logic.onEnter).toHaveBeenCalledTimes(1);

    expect(logic.onExit).not.toHaveBeenCalled();
    life.exit();
    expect(logic.onExit).toHaveBeenCalledTimes(1);
  });

  it('should adopt logic with a startup function', () => {
    const life = new Life();
    const logic = {
      startup: mock((signal: AbortSignal) => {
        expect(signal).toBeInstanceOf(AbortSignal);
      }),
    };

    life.adopt(logic);
    
    expect(logic.startup).not.toHaveBeenCalled();
    life.enter();
    expect(logic.startup).toHaveBeenCalledTimes(1);
  });
});
describe('Life Class > scoped() with cleanup', () => {
  it('should execute the returned cleanup function on exit', () => {
    const life = new Life();
    const setupFn = mock();
    const cleanupFn = mock();

    life.enter();
    
    // Call scoped with a function that returns the cleanup function
    life.scoped(() => {
      setupFn();
      return cleanupFn;
    });

    // At this point, only the setup function should have been called
    expect(setupFn).toHaveBeenCalledTimes(1);
    expect(cleanupFn).not.toHaveBeenCalled();

    // Now, trigger the exit
    life.exit();

    // The cleanup function should now have been called
    expect(cleanupFn).toHaveBeenCalledTimes(1);
  });

  it('should not call cleanup function if life never exits', () => {
    const life = new Life();
    const cleanupFn = mock();

    life.enter();
    life.scoped(() => {
      return cleanupFn;
    });

    expect(cleanupFn).not.toHaveBeenCalled();
  });
  
  it('should handle multiple scoped cleanups correctly', () => {
    const life = new Life();
    const cleanup1 = mock();
    const cleanup2 = mock();
    
    life.enter();
    life.scoped(() => cleanup1);
    life.scoped(() => cleanup2);

    expect(cleanup1).not.toHaveBeenCalled();
    expect(cleanup2).not.toHaveBeenCalled();
    
    life.exit();
    
    expect(cleanup1).toHaveBeenCalledTimes(1);
    expect(cleanup2).toHaveBeenCalledTimes(1);
  });
});
