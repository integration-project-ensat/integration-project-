const prisma = require('../../prisma/client');
const { verifierRegleBadge } = require('./badgeEvaluation.service');

const selectBadge = {
  id_badge: true,
  nom: true,
  description: true,
  icone_url: true,
  critere_type: true,
  est_visible: true,
  mis_en_avant: true
};

const creerBadge = async (data) => {
  return prisma.badge.create({
    data: {
      nom: data.nom,
      description: data.description || null,
      icone_url: data.icone_url || null,
      critere_type: data.critere_type,
      est_visible: data.est_visible ?? true,
      mis_en_avant: data.mis_en_avant ?? false
    },
    select: selectBadge
  });
};

const getBadges = async () => {
  return prisma.badge.findMany({
    where: {
      est_visible: true
    },
    select: selectBadge,
    orderBy: {
      id_badge: 'asc'
    }
  });
};

const getAllBadgesAdmin = async () => {
  return prisma.badge.findMany({
    select: selectBadge,
    orderBy: {
      id_badge: 'asc'
    }
  });
};

const modifierBadge = async (id, data) => {
  const badge = await prisma.badge.findUnique({
    where: {
      id_badge: BigInt(id)
    }
  });

  if (!badge) {
    const err = new Error('Badge introuvable');
    err.statusCode = 404;
    throw err;
  }

  return prisma.badge.update({
    where: {
      id_badge: BigInt(id)
    },
    data: {
      nom: data.nom,
      description: data.description,
      icone_url: data.icone_url,
      critere_type: data.critere_type,
      est_visible: data.est_visible,
      mis_en_avant: data.mis_en_avant
    },
    select: selectBadge
  });
};

const supprimerBadge = async (id) => {
  const badge = await prisma.badge.findUnique({
    where: {
      id_badge: BigInt(id)
    }
  });

  if (!badge) {
    const err = new Error('Badge introuvable');
    err.statusCode = 404;
    throw err;
  }

  await prisma.badge.delete({
    where: {
      id_badge: BigInt(id)
    }
  });

  return true;
};

const getMesBadges = async (etudiantId) => {
  return prisma.profilBadge.findMany({
    where: {
      id_etudiant: BigInt(etudiantId)
    },
    include: {
      badge: {
        select: selectBadge
      }
    },
    orderBy: {
      date_attribution: 'desc'
    }
  });
};

const evaluerEtAttribuerBadges = async (etudiantId) => {
  const etudiant = await prisma.etudiant.findUnique({
    where: {
      id_utilisateur: BigInt(etudiantId)
    }
  });

  if (!etudiant) {
    const err = new Error('Étudiant introuvable');
    err.statusCode = 404;
    throw err;
  }

  const regles = await prisma.regleBadge.findMany({
    where: {
      est_valide: true,
      badge: {
        est_visible: true
      }
    },
    include: {
      badge: true
    }
  });

  const nouveauxBadges = [];

  for (const regle of regles) {
    const dejaAttribue = await prisma.profilBadge.findUnique({
      where: {
        id_etudiant_id_badge: {
          id_etudiant: BigInt(etudiantId),
          id_badge: regle.id_badge
        }
      }
    });

    if (dejaAttribue) continue;

    const eligible = await verifierRegleBadge(
      etudiantId,
      regle.criteres || {}
    );

    if (!eligible) continue;

    const attribution = await prisma.$transaction(async (tx) => {
      const badgeAttribue = await tx.profilBadge.create({
        data: {
          id_etudiant: BigInt(etudiantId),
          id_badge: regle.id_badge,
          date_attribution: new Date()
        },
        include: {
          badge: {
            select: selectBadge
          }
        }
      });

      await tx.notification.create({
        data: {
          utilisateur_id: BigInt(etudiantId),
          type: 'BADGE_OBTENU',
          message: `Vous avez obtenu le badge "${regle.badge.nom}"`,
          cible_id: regle.id_badge,
          cible_type: 'BADGE',
          date_reception: new Date()
        }
      });

      return badgeAttribue;
    });

    nouveauxBadges.push(attribution);
  }

  return nouveauxBadges;
};

module.exports = {
  creerBadge,
  getBadges,
  getAllBadgesAdmin,
  modifierBadge,
  supprimerBadge,
  getMesBadges,
  evaluerEtAttribuerBadges
};