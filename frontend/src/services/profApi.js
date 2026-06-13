import api from '@/services/api.js'

export default {
  getProfDashboard() {
    return api.get('/prof/dashboard')
  },

  getAttachedStudents() {
    return api.get('/prof/etudiants')
  },

  getAttachedStudentStatus(studentId) {
    return api.get(`/prof/etudiants/${studentId}/status`)
  },

  attachStudent(payload) {
    return api.post('/prof/etudiants', payload)
  },

  importStudentsCsv(file) {
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/prof/etudiants/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  detachStudent(studentId) {
    return api.delete(`/prof/etudiants/${studentId}`)
  },

  updateValidationStatus(request, status) {
    const normalizedStatus =
      status === 'Validé' || status === 'ValidÃ©' || status === 'ValidÃƒÂ©'
        ? 'VALIDE'
        : status === 'Refusé' || status === 'RefusÃ©' || status === 'RefusÃƒÂ©'
          ? 'REFUSE'
          : 'EN_ATTENTE'

    if (request.type === 'Projet') {
      return api.patch(`/projets/${request.id}/statut`, {
        statut: normalizedStatus,
      })
    }

    if (request.type === 'Stage') {
      return api.patch(`/stages/${request.id}/statut`, {
        statut: normalizedStatus,
      })
    }

    throw new Error(`Type de validation non pris en charge : ${request.type}`)
  },

  updateRecommendationStatus(letterId, status, payload = {}) {
    const normalizedStatus =
      status === 'Acceptée' || status === 'AcceptÃ©e' || status === 'AcceptÃƒÂ©e'
        ? 'REDIGEE'
        : status === 'Refusée' || status === 'RefusÃ©e' || status === 'RefusÃƒÂ©e'
          ? 'REFUSEE'
          : 'EN_ATTENTE'

    return api.patch(`/lettres/${letterId}/statut`, {
      statut: normalizedStatus,
      contenu: payload.contenu,
      motif_refus: payload.motif_refus,
    })
  },

  getProDashboard() {
    return api.get('/pro/dashboard')
  }
}

