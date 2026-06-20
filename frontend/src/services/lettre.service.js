import api from './api'
import { getApiBase } from '../utils/apiBase.js'

export const lettreService = {
  requestRecommendationLetter(payload) {
    return api.post('/lettres', payload)
  },

  getMesLettres(studentId) {
    return api.get(`/lettres/${studentId}`)
  },

  getPdfUrl(letterId) {
    const apiBase = getApiBase()
    return `${apiBase.replace(/\/$/, '')}/lettres/${letterId}/export/pdf`
  },

  getHtmlUrl(letterId) {
    const apiBase = getApiBase()
    return `${apiBase.replace(/\/$/, '')}/lettres/${letterId}/export/html`
  },
}
