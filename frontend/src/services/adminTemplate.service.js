import api from './api'

export const adminTemplateService = {
  async getAll() {
    const { data } = await api.get('/admin/templates')
    return data
  },

  async create(payload) {
    const { data } = await api.post('/admin/templates', payload)
    return data
  },

  async update(id, payload) {
    const { data } = await api.patch(`/admin/templates/${id}`, payload)
    return data
  },

  async delete(id) {
    const { data } = await api.delete(`/admin/templates/${id}`)
    return data
  }
}