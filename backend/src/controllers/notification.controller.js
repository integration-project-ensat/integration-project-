const asyncHandler = require('../middlewares/asyncHandler');
const notificationService = require('../services/notification.service');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getNotifications(
    req.utilisateur.id_utilisateur,
    req.query.type || null
  );

  res.json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(
    req.utilisateur.id_utilisateur
  );

  res.json({
    success: true,
    data: {
      unread: count
    }
  });
});

const marquerCommeLue = asyncHandler(async (req, res) => {
  const notification = await notificationService.marquerCommeLue(
    req.params.id,
    req.utilisateur.id_utilisateur
  );

  res.json({
    success: true,
    message: 'Notification marquée comme lue',
    data: notification
  });
});

const toutMarquerCommeLu = asyncHandler(async (req, res) => {
  await notificationService.toutMarquerCommeLu(
    req.utilisateur.id_utilisateur
  );

  res.json({
    success: true,
    message: 'Toutes les notifications sont marquées comme lues'
  });
});

const supprimerNotification = asyncHandler(async (req, res) => {
  await notificationService.supprimerNotification(
    req.params.id,
    req.utilisateur.id_utilisateur
  );

  res.json({
    success: true,
    message: 'Notification supprimée'
  });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  marquerCommeLue,
  toutMarquerCommeLu,
  supprimerNotification
};