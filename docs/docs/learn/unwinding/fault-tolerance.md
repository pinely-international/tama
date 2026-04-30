# Fault Tolerance

Tama is designed so that a failed component does not automatically imply that the whole parent render tree must fail with it.

## What Is Confirmed In This Checkout

- if a component factory throws during inflation, Tama isolates that failure to the failing component slot
- parent views can continue rendering around that missing subtree
- a low-level tree error channel exists as `this.tree.catch(...)`
