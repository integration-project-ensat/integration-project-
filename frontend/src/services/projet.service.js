import api from './api'

export const projetService = {
  getMesProjets(params = {}) {
    return api.get('/projets', { params })
  },
  createProjet(payload) {
    return api.post('/projets', payload)
  },
  updateProjet(id, payload) {
    return api.patch(`/projets/${id}`, payload)
  },
  deleteProjet(id) {
    return api.delete(`/projets/${id}`)
  },
  soumettreProjet(id) {
    return api.post(`/projets/${id}/soumettre`)
  },
}
