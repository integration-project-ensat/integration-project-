import api from '@/services/api.js'

export default {
  getStudentDashboard(params) {
    return api.get('/student/dashboard', { params })
  },

  getOpportunities() {
    return api.get('/student/opportunities')
  },

  getProfessionnels() {
    return api.get('/student/professionnels')
  },

  getRecentActivity() {
    return api.get('/student/recent-activity')
  },

  getProfileProgress() {
    return api.get('/student/profile-progress')
  },
}
