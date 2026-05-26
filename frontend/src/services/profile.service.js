import api from './api'

export const profileService = {
  getProfile(id) {
    return api.get(`/profiles/${id}`)
  },

  getCurrentUser() {
    return api.get('/auth/me')
  },
}
