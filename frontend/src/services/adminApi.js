import api from '@/services/api.js'

export default {
  getAdminDashboard(params) {
    return api.get('/admin/dashboard', { params })
  },

  getAdminStudents(params) {
    return api.get('/admin/etudiants', { params })
  },

  getProfessionnels() {
    return api.get('/admin/professionnels')
  },

  validateProfessionnel(id) {
    return api.patch(`/admin/professionnels/${id}/valider`)
  },

  rejectProfessionnel(id) {
    return api.patch(`/admin/professionnels/${id}/refuser`)
  },

  exportAdminStudentsCSV(params) {
    return api.get('/admin/etudiants/export-csv', { params })
  },

  verifyStudentsGroup(ids) {
    return api.post('/admin/etudiants/verification-groupee', { ids })
  },

  getAdminEtablissements() {
    return api.get('/admin/etablissements')
  },

  getAdminVilles() {
    return api.get('/admin/villes')
  },

  getAdminPortfolios() {
    return api.get('/admin/portfolios')
  },
  getAdmins() {
    return api.get('/admin/admins')
  },

  deleteAdmin(id) {
    return api.delete(`/admin/admins/${id}`)
  },
  getTemplates() {
    return api.get('/admin/templates')
  },

  createTemplate(data) {
  return api.post('/admin/templates', data)
},

  deleteTemplate(id) {
    return api.delete(`/admin/templates/${id}`)
  },
  getPortfolioStats() {
  return api.get('/admin/portfolio-stats')
}
}

