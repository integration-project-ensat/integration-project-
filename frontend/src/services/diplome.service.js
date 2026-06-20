import api from './api'

export const diplomeService = {
  getMesDiplomes() {
    return api.get('/diplomes')
  },

  createDiplome(payload) {
    return api.post('/diplomes', payload)
  },

  updateDiplome(id, payload) {
    return api.put(`/diplomes/${id}`, payload)
  },

  deleteDiplome(id) {
    return api.delete(`/diplomes/${id}`)
  },
}
