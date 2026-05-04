import api from './api.js'

export default {
  async login(email, password) {
    const { data } = await api.post('/seconnecter', { email, password })
    localStorage.setItem('token', data.token)
    return data
  },

  async signup(payload) {
    const { data } = await api.post('/sinscrire', payload)
    localStorage.setItem('token', data.token)
    return data
  },

  async forgotPassword(email) {
    return api.post('/mot-de-passe-oublie', { email })
  },

  async verifyCode(email, code) {
    return api.post('/verifier-code', { email, code })
  },

  async resendCode(email) {
    return api.post('/renvoyer-code', { email })
  },

  async resetPassword(payload) {
    // payload: { email, code, newPassword }
    return api.post('/reinitialiser-mot-de-passe', payload)
  },

  logout() {
    localStorage.removeItem('token')
  }
}