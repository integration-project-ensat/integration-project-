import api from './api'

export const connexionService = {
  getConnexions() {
    return api.get('/connexions')
  },

  createConnexion(payload) {
    return api.post('/connexions', payload)
  },

  accepterConnexion(id) {
    return api.patch(`/connexions/${id}/accepter`)
  },

  refuserConnexion(id) {
    return api.patch(`/connexions/${id}/refuser`)
  },
}
