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
}
