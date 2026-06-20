import { getApiBase, getApiOrigin } from './apiBase.js'

const apiBase = getApiBase()

function getBackendOrigin() {
  return getApiOrigin()
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
