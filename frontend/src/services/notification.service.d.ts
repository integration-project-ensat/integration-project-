export const notificationService: {
  getNotifications(type?: string): Promise<any>
  getUnreadCount(): Promise<any>
  markAsRead(id: number | string): Promise<any>
  markAllAsRead(): Promise<any>
}