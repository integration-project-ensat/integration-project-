import api from './api'

export const lettreService = {
  requestRecommendationLetter(payload) {
    return api.post('/lettres', payload)
  },

  getMesLettres(studentId) {
    return api.get(`/lettres/${studentId}`)
  },

  getPdfUrl(letterId) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || '/api'
    return `${apiBase.replace(/\/$/, '')}/lettres/${letterId}/export/pdf`
  },

  getHtmlUrl(letterId) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || '/api'
    return `${apiBase.replace(/\/$/, '')}/lettres/${letterId}/export/html`
  },
}
