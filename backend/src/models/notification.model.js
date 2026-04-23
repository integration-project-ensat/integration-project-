import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createNotification = (data) =>
  prisma.notification.create({ data })

export const findNotificationsUser = (id_utilisateur) =>
  prisma.notification.findMany({
    where: { id_utilisateur },
    orderBy: { createdAt: 'desc' }
  })

export const marquerLu = (id_notification) =>
  prisma.notification.update({
    where: { id_notification },
    data: { lu: true }
  })

export const countNonLus = (id_utilisateur) =>
  prisma.notification.count({
    where: { id_utilisateur, lu: false }
  })
