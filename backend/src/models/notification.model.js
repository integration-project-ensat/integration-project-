const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const NOTIFICATION_ID_FIELDS = ['id_notification', 'utilisateur_id', 'cible_id']

const createNotification = (data) =>
  prisma.notification.create({
    data: normalizeBigIntFields(data, NOTIFICATION_ID_FIELDS),
  })

const findNotificationsUser = (id_utilisateur) =>
  prisma.notification.findMany({
    where: { utilisateur_id: toBigInt(id_utilisateur) },
    orderBy: { date_reception: 'desc' },
  })

const marquerLu = (id_notification) =>
  prisma.notification.update({
    where: { id_notification: toBigInt(id_notification) },
    data: { lu: true },
  })

const countNonLus = (id_utilisateur) =>
  prisma.notification.count({
    where: { utilisateur_id: toBigInt(id_utilisateur), lu: false },
  })

module.exports = {
  createNotification,
  findNotificationsUser,
  marquerLu,
  countNonLus,
}
