import api from '@/services/api.js'

export default {
  getAdminDashboard(params) {
    return api.get('/admin/dashboard', { params })
  },

  getAdminStudents(params) {
    return api.get('/admin/etudiants', { params })
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
}

