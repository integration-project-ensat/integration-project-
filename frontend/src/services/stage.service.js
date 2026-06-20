import api from './api'

export const stageService = {
  getMesStages(params = {}) {
    return api.get('/stages', { params })
  },
  createStage(payload) {
    return api.post('/stages', payload)
  },
  updateStage(id, payload) {
    return api.patch(`/stages/${id}`, payload)
  },
  deleteStage(id) {
    return api.delete(`/stages/${id}`)
  },
}
