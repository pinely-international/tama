# Fault Tolerance

Tama is designed with a tolerance to any kind of errors in mind.

Tama gracefully shutdowns failed part

- If error happens in a Component factory function
- If error happens in an event callback
- If error happens in a observable

Errors are never propagated to parent components, so if a part of your app fails, it just won't be rendered.
