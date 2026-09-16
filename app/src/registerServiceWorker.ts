// Turns on the offline cache in public/sw.js.
//
// Two things to know:
// 1. Only the built app registers it. During development that cache would just
//    serve stale files and make edits look like they did nothing.
// 2. Browsers only allow service workers on https or on localhost. Opening the
//    dev server from your phone over wifi is plain http, so the worker will not
//    register there. That is expected. Offline mode gets tested against a real
//    https address later.
export function registerServiceWorker() {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker did not register:', error)
    })
  })
}
