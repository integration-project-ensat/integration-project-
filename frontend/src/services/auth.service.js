// Service d'authentification. Gère le login/logout SSO Keycloak, le refresh token automatique, et la récupération du rôle utilisateur depuis le token JWT.
import api from './api.js'

export default {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    return data
  },

  async signup(payload) {
    // payload: { firstName, lastName, email, password, role }
    const { data } = await api.post('/auth/signup', payload)
    localStorage.setItem('token', data.token)
    return data
  },

  logout() {
    localStorage.removeItem('token')
  }
}