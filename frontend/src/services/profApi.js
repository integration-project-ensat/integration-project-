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

  getProDashboard() {
    return api.get('/pro/dashboard')
  }
}
