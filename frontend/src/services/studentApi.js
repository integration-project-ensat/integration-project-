import api from '@/services/api.js'

export default {
  // Dashboard étudiant
  getStudentDashboard(params) {
    return api.get('/student/dashboard', { params })
  },

  // Opportunités (stages, professionnels à connecter)
  getOpportunities() {
    return api.get('/student/opportunities')
  },

  // Activité récente de l'étudiant
  getRecentActivity() {
    return api.get('/student/recent-activity')
  },

  // Progression du profil
  getProfileProgress() {
    return api.get('/student/profile-progress')
  },
}
