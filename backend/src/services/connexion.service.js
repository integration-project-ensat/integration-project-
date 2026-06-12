const { prisma } = require("../models/prisma");

const createServiceError = (statusCode, message) => {
  const error = new Error(message)
  error.statusCode = statusCode
  error.status = statusCode
  return error
}

const userSelect = {
  id_utilisateur: true,
  nom: true,
  prenom: true,
  email: true,
  role: true,
  profil: true,
  etudiant: {
    select: {
      filiere: true,
      badges: {
        select: {
          badge: {
            select: {
              nom: true,
              icone_url: true,
            },
          },
        },
      },
    },
  },
};

const includeUsers = {
  demandeur: { select: userSelect },
  destinataire: { select: userSelect },
};

const verifierUtilisateur = async (id) => {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: BigInt(id) },
    select: {
      id_utilisateur: true,
      nom: true,
      prenom: true,
      role: true,
      est_actif: true,
    },
  });

  if (!utilisateur || !utilisateur.est_actif) {
    throw createServiceError(404, "Utilisateur introuvable");
  }

  return utilisateur;
};

const pairWhere = (userAId, userBId) => ({
  OR: [
    {
      demandeur_id: BigInt(userAId),
      destinataire_id: BigInt(userBId),
    },
    {
      demandeur_id: BigInt(userBId),
      destinataire_id: BigInt(userAId),
    },
  ],
});

const pairLockKey = (userAId, userBId) => {
  const first = BigInt(userAId) < BigInt(userBId) ? BigInt(userAId) : BigInt(userBId);
  const second = BigInt(userAId) < BigInt(userBId) ? BigInt(userBId) : BigInt(userAId);
  return `${first}:${second}`;
};

const lockPair = async (tx, userAId, userBId) => {
  const lockKey = pairLockKey(userAId, userBId);
  await tx.$executeRaw`
    SELECT pg_advisory_xact_lock(
      ('x' || substr(md5(${lockKey}), 1, 16))::bit(64)::bigint
    )
  `;
};

const assertNotAdminConnection = (userA, userB) => {
  if (userA.role === "ADMINISTRATEUR" || userB.role === "ADMINISTRATEUR") {
    throw createServiceError(403, "Les administrateurs ne participent pas aux connexions");
  }
};

const mapStatus = (connexion, utilisateurId) => {
  const isRequester = connexion
    ? BigInt(connexion.demandeur_id) === BigInt(utilisateurId)
    : false;

  return {
    isConnected: connexion?.statut === "ACCEPTEE",
    requestSent: connexion?.statut === "EN_ATTENTE" && isRequester,
    requestReceived: connexion?.statut === "EN_ATTENTE" && !isRequester,
    status: connexion?.statut ?? "NONE",
    connexionId: connexion?.id_connexion?.toString() ?? null,
  };
};

const connexionService = {
  async envoyerDemande(demandeurId, destinataireId) {
    if (BigInt(demandeurId) === BigInt(destinataireId)) {
      throw createServiceError(400, "Vous ne pouvez pas vous connecter avec vous-mÃªme");
    }

    const demandeur = await verifierUtilisateur(demandeurId);
    const destinataire = await verifierUtilisateur(destinataireId);
    assertNotAdminConnection(demandeur, destinataire);

    return prisma.$transaction(async (tx) => {
      await lockPair(tx, demandeurId, destinataireId);

      await tx.connexion.deleteMany({
        where: {
          ...pairWhere(demandeurId, destinataireId),
          statut: "REFUSEE",
        },
      });

      const alreadyConnected = await tx.connexion.findFirst({
        where: {
          ...pairWhere(demandeurId, destinataireId),
          statut: "ACCEPTEE",
        },
      });

      if (alreadyConnected) {
        throw createServiceError(409, "Users are already connected");
      }

      const pendingRequest = await tx.connexion.findFirst({
        where: {
          ...pairWhere(demandeurId, destinataireId),
          statut: "EN_ATTENTE",
        },
      });

      if (pendingRequest) {
        throw createServiceError(409, "Request already exists");
      }

      const connexion = await tx.connexion.create({
        data: {
          demandeur_id: BigInt(demandeurId),
          destinataire_id: BigInt(destinataireId),
          statut: "EN_ATTENTE",
        },
        include: includeUsers,
      });

      await tx.notification.create({
        data: {
          utilisateur_id: BigInt(destinataireId),
          type: "DEMANDE_CONNEXION",
          message: `${demandeur.prenom} ${demandeur.nom} vous a envoyÃ© une demande de connexion`,
          cible_id: connexion.id_connexion,
          cible_type: "CONNEXION",
          date_reception: new Date(),
        },
      });

      return connexion;
    });
  },

  async changerStatut(connexionId, utilisateurId, statut) {
    const connexion = await prisma.connexion.findUnique({
      where: { id_connexion: BigInt(connexionId) },
      include: includeUsers,
    });

    if (!connexion) return null;

    assertNotAdminConnection(connexion.demandeur, connexion.destinataire);

    if (BigInt(connexion.destinataire_id) !== BigInt(utilisateurId)) {
      throw createServiceError(403, "Vous ne pouvez traiter que les demandes reÃ§ues");
    }

    if (connexion.statut !== "EN_ATTENTE") {
      throw createServiceError(400, "Cette demande a dÃ©jÃ  Ã©tÃ© traitÃ©e");
    }

    return prisma.$transaction(async (tx) => {
      await lockPair(tx, connexion.demandeur_id, connexion.destinataire_id);

      if (statut === "ACCEPTEE") {
        const alreadyConnected = await tx.connexion.findFirst({
          where: {
            ...pairWhere(connexion.demandeur_id, connexion.destinataire_id),
            statut: "ACCEPTEE",
            NOT: { id_connexion: connexion.id_connexion },
          },
        });

        if (alreadyConnected) {
          throw createServiceError(409, "Users are already connected");
        }
      }

      if (statut === "REFUSEE") {
        await tx.notification.create({
          data: {
            utilisateur_id: connexion.demandeur_id,
            type: "CONNEXION_REFUSEE",
            message: `${connexion.destinataire.prenom} ${connexion.destinataire.nom} a refusÃ© votre demande de connexion`,
            cible_id: connexion.id_connexion,
            cible_type: "CONNEXION",
            date_reception: new Date(),
          },
        });

        await tx.connexion.deleteMany({
          where: {
            ...pairWhere(connexion.demandeur_id, connexion.destinataire_id),
            statut: "EN_ATTENTE",
          },
        });

        return connexion;
      }

      const updated = await tx.connexion.update({
        where: { id_connexion: BigInt(connexionId) },
        data: { statut, date_reponse: new Date() },
        include: includeUsers,
      });

      await tx.connexion.deleteMany({
        where: {
          ...pairWhere(connexion.demandeur_id, connexion.destinataire_id),
          id_connexion: { not: connexion.id_connexion },
        },
      });

      await tx.notification.create({
        data: {
          utilisateur_id: connexion.demandeur_id,
          type: "CONNEXION_ACCEPTEE",
          message: `${connexion.destinataire.prenom} ${connexion.destinataire.nom} a acceptÃ© votre demande de connexion`,
          cible_id: connexion.id_connexion,
          cible_type: "CONNEXION",
          date_reception: new Date(),
        },
      });

      return updated;
    });
  },

  async findMine(utilisateurId) {
    return prisma.connexion.findMany({
      where: {
        OR: [
          { demandeur_id: BigInt(utilisateurId) },
          { destinataire_id: BigInt(utilisateurId) },
        ],
      },
      include: includeUsers,
      orderBy: { date_demande: "desc" },
    });
  },

  async getMesDemandes(utilisateurId) {
    return prisma.connexion.findMany({
      where: {
        demandeur_id: BigInt(utilisateurId),
        statut: "EN_ATTENTE",
        demandeur: { role: { not: "ADMINISTRATEUR" } },
        destinataire: { role: { not: "ADMINISTRATEUR" } },
      },
      include: { destinataire: { select: userSelect } },
      orderBy: { date_demande: "desc" },
    });
  },

  async getDemandesRecues(utilisateurId) {
    return prisma.connexion.findMany({
      where: {
        destinataire_id: BigInt(utilisateurId),
        statut: "EN_ATTENTE",
        demandeur: { role: { not: "ADMINISTRATEUR" } },
        destinataire: { role: { not: "ADMINISTRATEUR" } },
      },
      include: { demandeur: { select: userSelect } },
      orderBy: { date_demande: "desc" },
    });
  },

  async getMesConnexions(utilisateurId) {
    return prisma.connexion.findMany({
      where: {
        statut: "ACCEPTEE",
        OR: [
          { demandeur_id: BigInt(utilisateurId) },
          { destinataire_id: BigInt(utilisateurId) },
        ],
        demandeur: { role: { not: "ADMINISTRATEUR" } },
        destinataire: { role: { not: "ADMINISTRATEUR" } },
      },
      include: includeUsers,
      orderBy: { date_reponse: "desc" },
    });
  },

  async supprimerConnexion(connexionId, utilisateurId) {
    const connexion = await prisma.connexion.findUnique({
      where: { id_connexion: BigInt(connexionId) },
    });

    if (!connexion) throw createServiceError(404, "Connexion introuvable");

    const estParticipant =
      BigInt(connexion.demandeur_id) === BigInt(utilisateurId) ||
      BigInt(connexion.destinataire_id) === BigInt(utilisateurId);

    if (!estParticipant) {
      throw createServiceError(403, "Action non autorisÃ©e");
    }

    if (
      connexion.statut === "EN_ATTENTE" &&
      BigInt(connexion.demandeur_id) !== BigInt(utilisateurId)
    ) {
      throw createServiceError(403, "Seul le demandeur peut annuler une demande en attente");
    }

    if (!["ACCEPTEE", "EN_ATTENTE"].includes(connexion.statut)) {
      throw createServiceError(422, "Cette relation ne peut pas Ãªtre supprimÃ©e");
    }

    await prisma.$transaction(async (tx) => {
      await lockPair(tx, connexion.demandeur_id, connexion.destinataire_id);

      await tx.connexion.deleteMany({
        where: {
          ...pairWhere(connexion.demandeur_id, connexion.destinataire_id),
          statut: { in: ["ACCEPTEE", "EN_ATTENTE"] },
        },
      });
    });

    return true;
  },

  async getStatus(utilisateurId, targetUserId) {
    if (BigInt(utilisateurId) === BigInt(targetUserId)) {
      return {
        isConnected: false,
        requestSent: false,
        requestReceived: false,
        status: "SELF",
        connexionId: null,
      };
    }

    await verifierUtilisateur(targetUserId);

    const connected = await prisma.connexion.findFirst({
      where: {
        ...pairWhere(utilisateurId, targetUserId),
        statut: "ACCEPTEE",
      },
    });

    if (connected) return mapStatus(connected, utilisateurId);

    const pending = await prisma.connexion.findFirst({
      where: {
        ...pairWhere(utilisateurId, targetUserId),
        statut: "EN_ATTENTE",
      },
      orderBy: { date_demande: "desc" },
    });

    return mapStatus(pending, utilisateurId);
  },
};

module.exports = connexionService;
