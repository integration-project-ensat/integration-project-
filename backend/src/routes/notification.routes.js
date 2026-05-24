const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notification.controller');

const {
  NotificationValidator
} = require('../validators/notification.validator');

const validate = require('../middlewares/validate');

const {
  authentifier
} = require('../middlewares/auth.middleware');

router.use(authentifier);

router.get(
  '/',
  validate(NotificationValidator.filtre),
  notificationController.getNotifications
);

router.get(
  '/unread-count',
  notificationController.getUnreadCount
);

router.patch(
  '/:id/read',
  validate(NotificationValidator.id),
  notificationController.marquerCommeLue
);

router.patch(
  '/read-all',
  notificationController.toutMarquerCommeLu
);

router.delete(
  '/:id',
  validate(NotificationValidator.id),
  notificationController.supprimerNotification
);

module.exports = router;