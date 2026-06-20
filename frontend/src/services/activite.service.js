import api from './api'

export const activiteService = {
  getMesActivites(params = {}) {
    return api.get('/activites', { params })
  },
  createActivite(payload) {
    return api.post('/activites', payload)
  },
  updateActivite(id, payload) {
    return api.patch(`/activites/${id}`, payload)
  },
  deleteActivite(id) {
    return api.delete(`/activites/${id}`)
  },
}
