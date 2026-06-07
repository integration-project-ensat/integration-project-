const prisma = require('../../prisma/client');

const NOTIFICATIONS_CONNEXION = [
  'DEMANDE_CONNEXION',
  'CONNEXION_ACCEPTEE',
  'CONNEXION_REFUSEE'
];

const creerNotification = async ({
  utilisateurId,
  type,
  message,
  cibleId = null,
  cibleType = null,
  canal = 'APPLICATION'
}) => {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: {
      id_utilisateur: BigInt(utilisateurId)
    },
    select: {
      id_utilisateur: true,
      role: true
    }
  });

  if (!utilisateur) {
    const err = new Error('Utilisateur introuvable');
    err.statusCode = 404;
    throw err;
  }

  if (
    utilisateur.role === 'ADMINISTRATEUR' &&
    NOTIFICATIONS_CONNEXION.includes(type)
  ) {
    return null;
  }

  return prisma.notification.create({
    data: {
      utilisateur_id: BigInt(utilisateurId),
      type,
      message,
      canal_envoi: canal,
      cible_id: cibleId ? BigInt(cibleId) : null,
      cible_type: cibleType,
      date_reception: new Date(),
      lu: false
    }
  });
};

const getNotifications = async (utilisateurId, type = null) => {
  const where = {
    utilisateur_id: BigInt(utilisateurId)
  };

  if (type) {
    where.type = type;
  }

  return prisma.notification.findMany({
    where,
    orderBy: {
      date_reception: 'desc'
    }
  });
};

const getUnreadCount = async (utilisateurId) => {
  return prisma.notification.count({
    where: {
      utilisateur_id: BigInt(utilisateurId),
      lu: false
    }
  });
};

const marquerCommeLue = async (notificationId, utilisateurId) => {
  const notification = await prisma.notification.findUnique({
    where: {
      id_notification: BigInt(notificationId)
    }
  });

  if (!notification) {
    const err = new Error('Notification introuvable');
    err.statusCode = 404;
    throw err;
  }

  if (BigInt(notification.utilisateur_id) !== BigInt(utilisateurId)) {
    const err = new Error('Accès refusé');
    err.statusCode = 403;
    throw err;
  }

  return prisma.notification.update({
    where: {
      id_notification: BigInt(notificationId)
    },
    data: {
      lu: true
    }
  });
};

const toutMarquerCommeLu = async (utilisateurId) => {
  return prisma.notification.updateMany({
    where: {
      utilisateur_id: BigInt(utilisateurId),
      lu: false
    },
    data: {
      lu: true
    }
  });
};

const supprimerNotification = async (notificationId, utilisateurId) => {
  const notification = await prisma.notification.findUnique({
    where: {
      id_notification: BigInt(notificationId)
    }
  });

  if (!notification) {
    const err = new Error('Notification introuvable');
    err.statusCode = 404;
    throw err;
  }

  if (BigInt(notification.utilisateur_id) !== BigInt(utilisateurId)) {
    const err = new Error('Accès refusé');
    err.statusCode = 403;
    throw err;
  }

  await prisma.notification.delete({
    where: {
      id_notification: BigInt(notificationId)
    }
  });

  return true;
};

module.exports = {
  creerNotification,
  getNotifications,
  getUnreadCount,
  marquerCommeLue,
  toutMarquerCommeLu,
  supprimerNotification
};