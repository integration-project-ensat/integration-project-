import api from './api'

export const portfolioService = {
  getPortfolio(studentId) {
    return api.get(`/portfolio/${studentId}`)
  },

  getPortfolioExportHtmlUrl(studentId) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
    return `${apiBase.replace(/\/$/, '')}/portfolio/${studentId}/export/html`
  },

  getPortfolioExportPdfUrl(studentId) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
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