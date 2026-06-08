import api from './api'

export const lettreService = {
  getMesLettres(studentId) {
    return api.get(`/lettres/${studentId}`)
  },

  getPdfUrl(letterId) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
    return `${apiBase}/lettres/${letterId}/export/pdf`
  },

  getHtmlUrl(letterId) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
    return `${apiBase}/lettres/${letterId}/export/html`
  },
}
