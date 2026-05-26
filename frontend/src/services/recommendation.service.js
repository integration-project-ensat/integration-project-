import api from './api'

export const recommendationService = {
  getRecommendations(params = {}) {
    return api.get('/recommandations', { params })
  },

  createRecommendation(payload) {
    return api.post('/recommandations', payload)
  },

  getRecommendationCount(params = {}) {
    return api.get('/recommandations/compteur', { params })
  },

  validerRecommendation(id) {
    return api.patch(`/recommandations/${id}/valider`)
  },

  refuserRecommendation(id, motif_refus = '') {
    return api.patch(`/recommandations/${id}/refuser`, { motif_refus })
  },

  addToPortfolio(id, payload) {
    return api.post(`/recommandations/${id}/portfolio`, payload)
  },
}
