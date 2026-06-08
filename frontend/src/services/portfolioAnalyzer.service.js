import api from './api'

export const portfolioAnalyzerService = {
  async analyzePortfolio(studentId) {
    const { data } = await api.get(`/portfolio-analyzer/${studentId}`)
    return data?.data ?? data
  },
}
