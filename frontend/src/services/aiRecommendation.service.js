import api from './api'

export function getCareerRecommendation(payload) {
  return api.post('/ai/career-recommendation', payload)
}
