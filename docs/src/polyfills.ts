/* requestIdleCallback */

window.requestIdleCallback ??= callback => {
  const start = Date.now()
  return setTimeout(() => callback({
    didTimeout: false,
    timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
  }), 1) as unknown as number
}
window.cancelIdleCallback ??= clearTimeout


/* `Array.prototype.at` */

Array.prototype.at ??= function (index) {
  if (index < 0) return this[this.length - 1 + index]
  return this[index]
}

/* iterator-helpers-polyfill */

if (window.Iterator?.prototype.filter == null) {
  const { installIntoGlobal } = await import("iterator-helpers-polyfill")
  installIntoGlobal()
}

/* URLPattern */

// @ts-expect-error `URLPattern` exists in `Global`.
if (window.URLPattern == null) {
  await import("urlpattern-polyfill")
}
