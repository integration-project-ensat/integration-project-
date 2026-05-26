import api from './api'

export const commentaireService = {
  getCommentaires(params = {}) {
    return api.get('/commentaires', { params })
  },

  createCommentaire(payload) {
    return api.post('/commentaires', payload)
  },

  validerCommentaire(id) {
    return api.patch(`/commentaires/${id}/valider`)
  },

  refuserCommentaire(id, motif_refus = '') {
    return api.patch(`/commentaires/${id}/refuser`, { motif_refus })
  },

  getHistorique(id) {
    return api.get(`/commentaires/${id}/historique`)
  },
}
