export function getApiBase() {
  const explicitBase = import.meta.env.VITE_API_BASE_URL
  if (explicitBase) {
    return explicitBase
  }

  return '/api'
}

export function getApiOrigin() {
  const apiBase = getApiBase()

  if (typeof window === 'undefined') {
    return ''
  }

  if (/^https?:\/\//i.test(apiBase)) {
    try {
      return new URL(apiBase, window.location.origin).origin
    } catch {
      return window.location.origin
    }
  }

  return window.location.origin
}
