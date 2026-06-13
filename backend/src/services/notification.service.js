const prisma = require('../../prisma/client');

const userSelect = {
  id_utilisateur: true,
  nom: true,
  prenom: true,
  role: true,
  profil: {
    select: {
      photo_profil: true
    }
  }
};

const includeUsers = {
  demandeur: { select: userSelect },
  destinataire: { select: userSelect }
};

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

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: {
      date_reception: 'desc'
    }
  });

  const connectionIds = [...new Set(
    notifications
      .filter((notification) => notification.cible_type === 'CONNEXION' && notification.cible_id)
      .map((notification) => notification.cible_id.toString())
  )];

  if (!connectionIds.length) {
    return notifications;
  }

  const connectionTargets = await prisma.connexion.findMany({
    where: {
      id_connexion: {
        in: connectionIds.map((id) => BigInt(id))
      }
    },
    include: includeUsers
  });

  const connectionMap = new Map(
    connectionTargets.map((connexion) => [connexion.id_connexion.toString(), connexion])
  );

  return notifications.map((notification) => {
    if (notification.cible_type !== 'CONNEXION' || !notification.cible_id) {
      return notification;
    }

    const connexion = connectionMap.get(notification.cible_id.toString());
    if (!connexion) return notification;

    const targetUser =
      notification.type === 'DEMANDE_CONNEXION'
        ? connexion.demandeur
        : connexion.destinataire;

    return {
      ...notification,
      avatar: targetUser?.profil?.photo_profil || null,
      actor_user_id: targetUser?.id_utilisateur?.toString() || null,
      actor_role: targetUser?.role || null,
    };
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
