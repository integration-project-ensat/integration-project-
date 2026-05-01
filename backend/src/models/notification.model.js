import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const NOTIFICATION_ID_FIELDS = ['id_notification', 'utilisateur_id', 'cible_id']

export const createNotification = (data) =>
  prisma.notification.create({
    data: normalizeBigIntFields(data, NOTIFICATION_ID_FIELDS),
  })

export const findNotificationsUser = (id_utilisateur) =>
  prisma.notification.findMany({
    where: { utilisateur_id: toBigInt(id_utilisateur) },
    orderBy: { date_reception: 'desc' },
  })

export const marquerLu = (id_notification) =>
  prisma.notification.update({
    where: { id_notification: toBigInt(id_notification) },
    data: { lu: true },
  })

export const countNonLus = (id_utilisateur) =>
  prisma.notification.count({
    where: { utilisateur_id: toBigInt(id_utilisateur), lu: false },
  })
