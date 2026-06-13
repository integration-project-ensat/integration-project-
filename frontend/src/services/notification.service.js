import api from './api'

export const notificationService = {
  async getNotifications(type = null) {
    const params = {}
    if (type) params.type = type
    const { data } = await api.get('/notifications', { params })
    return data?.data || []
  },

  async getUnreadCount() {
    const { data } = await api.get('/notifications/unread-count')
    return data?.data?.unread || 0
  },

  async markAsRead(notificationId) {
    const { data } = await api.patch(`/notifications/${notificationId}/read`)
    return data?.data
  },

  async markAllAsRead() {
    const { data } = await api.patch('/notifications/read-all')
    return data?.data
  }
}
