import api from './api'
import { getApiBase } from '../utils/apiBase.js'

export const portfolioService = {
  getPortfolio(studentId) {
    return api.get(`/portfolio/${studentId}`)
  },

  getPortfolioExportHtmlUrl(studentId) {
    const apiBase = getApiBase()
    return `${apiBase.replace(/\/$/, '')}/portfolio/${studentId}/export/html`
  },

  getPortfolioExportPdfUrl(studentId) {
    const apiBase = getApiBase()
    return `${apiBase.replace(/\/$/, '')}/portfolio/${studentId}/export/pdf`
  },

  async getTemplates() {
    const { data } = await api.get('/templates')
    return data
  },

  async changeTemplate(id_modele) {
    const { data } = await api.patch('/template', {
      id_modele
    })

    return data
  }
}
