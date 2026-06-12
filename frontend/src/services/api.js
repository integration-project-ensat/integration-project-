// Instance Axios centralisée. Configure la baseURL vers le backend et injecte automatiquement le token JWT Bearer dans chaque requête via un intercepteur.
// Contenu type
import axios from 'axios'
import { getApiBase } from '../utils/apiBase.js'

const api = axios.create({
  baseURL: getApiBase(),
  headers: { Accept: 'application/json' },
  withCredentials: true
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    const requestUrl = err.config?.url || ''
    const message = err.response?.data?.message || ''
    const shouldClearSession =
      status === 401 &&
      (
        requestUrl.includes('/auth/me') ||
        /session expir|session invalid|token invalide/i.test(message)
      )

    if (shouldClearSession) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('user')
    }
    return Promise.reject(err)
  }
)

export default api
