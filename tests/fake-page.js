// A page load in a fake browser, for the attribution tests. Not a test itself.

export function storage(seed = {}) {
  const items = new Map(Object.entries(seed))
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => { items.set(key, String(value)) },
    removeItem: (key) => { items.delete(key) },
  }
}

/** `country`: what /api/geo answers; the returned `geoCalls` counts the questions. */
export function openPage(url, { country = 'ES', consent = null, session = storage(), local = storage() } = {}) {
  if (consent) local.setItem('argo_cookie_consent', consent)
  const win = new EventTarget()
  win.location = new URL(url)
  win.localStorage = local
  win.sessionStorage = session
  win.setTimeout = setTimeout
  win.clearTimeout = clearTimeout
  globalThis.window = win
  globalThis.localStorage = local
  globalThis.document = { cookie: '', referrer: '', documentElement: { removeAttribute: () => {} } }
  const page = { session, local, geoCalls: 0 }
  globalThis.fetch = async () => {
    page.geoCalls += 1
    return new Response(JSON.stringify({ country }), { status: 200 })
  }
  return page
}

export const settle = () => new Promise((resolve) => { setTimeout(resolve, 5) })
