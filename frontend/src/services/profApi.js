import api from '@/services/api.js'

export default {
  getProfDashboard() {
    return api.get('/prof/dashboard')
  },

  getProDashboard() {
    return api.get('/pro/dashboard')
  }
}
