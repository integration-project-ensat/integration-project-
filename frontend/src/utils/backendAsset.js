const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || '/api'

function getBackendOrigin() {
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

export function resolveBackendAsset(path) {
  const value = String(path || '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value

  const origin = getBackendOrigin()
  if (value.startsWith('/')) return `${origin}${value}`
  if (value.startsWith('uploads/')) return `${origin}/${value}`

  return ''
}

