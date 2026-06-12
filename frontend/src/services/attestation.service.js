import api from './api'

export const attestationService = {
  getAttestations(params = {}) {
    return api.get('/attestations', { params })
  },
  createAttestation(payload) {
    return api.post('/attestations', payload)
  },
  deleteAttestation(id) {
    return api.delete(`/attestations/${id}`)
  },
}
