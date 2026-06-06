const { prisma } = require("../models/prisma");

const includeUsers = {
  demandeur: {
    select: {
      id_utilisateur: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      profil: true,
      etudiant: { select: { filiere: true } },
    },
  },
  destinataire: {
    select: {
      id_utilisateur: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      profil: true,
      etudiant: { select: { filiere: true } },
    },
  },
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
    throw { statusCode: 404, message: "Utilisateur introuvable" };
  }
  return utilisateur;
};

const connexionService = {
  async envoyerDemande(demandeurId, destinataireId) {
    if (BigInt(demandeurId) === BigInt(destinataireId)) {
      throw {
        statusCode: 400,
        message: "Vous ne pouvez pas vous connecter avec vous-même",
      };
    }

    const demandeur = await verifierUtilisateur(demandeurId);
    const destinataire = await verifierUtilisateur(destinataireId);

    if (
      demandeur.role === "ADMINISTRATEUR" ||
      destinataire.role === "ADMINISTRATEUR"
    ) {
      throw {
        statusCode: 403,
        message: "Les administrateurs ne participent pas aux connexions",
      };
    }

    const existe = await prisma.connexion.findFirst({
      where: {
        OR: [
          {
            demandeur_id: BigInt(demandeurId),
            destinataire_id: BigInt(destinataireId),
          },
          {
            demandeur_id: BigInt(destinataireId),
            destinataire_id: BigInt(demandeurId),
          },
        ],
      },
    });

    if (existe) {
      throw {
        statusCode: 409,
        message: "Une demande ou connexion existe déjà",
      };
    }

    return prisma.$transaction(async (tx) => {
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
          message: `${demandeur.prenom} ${demandeur.nom} vous a envoyé une demande de connexion`,
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

    if (
      connexion.demandeur.role === "ADMINISTRATEUR" ||
      connexion.destinataire.role === "ADMINISTRATEUR"
    ) {
      throw {
        statusCode: 403,
        message: "Les administrateurs ne participent pas aux connexions",
      };
    }

    if (BigInt(connexion.destinataire_id) !== BigInt(utilisateurId)) {
      throw {
        statusCode: 403,
        message: "Vous ne pouvez traiter que les demandes reçues",
      };
    }

    if (connexion.statut !== "EN_ATTENTE") {
      throw { statusCode: 400, message: "Cette demande a déjà été traitée" };
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.connexion.update({
        where: { id_connexion: BigInt(connexionId) },
        data: { statut, date_reponse: new Date() },
        include: includeUsers,
      });

      if (statut === "ACCEPTEE") {
        await tx.notification.create({
          data: {
            utilisateur_id: connexion.demandeur_id,
            type: "CONNEXION_ACCEPTEE",
            message: `${connexion.destinataire.prenom} ${connexion.destinataire.nom} a accepté votre demande de connexion`,
            cible_id: connexion.id_connexion,
            cible_type: "CONNEXION",
            date_reception: new Date(),
          },
        });
      } else if (statut === "REFUSEE") {
        await tx.notification.create({
          data: {
            utilisateur_id: connexion.demandeur_id,
            type: "CONNEXION_REFUSEE",
            message: `${connexion.destinataire.prenom} ${connexion.destinataire.nom} a refusé votre demande de connexion`,
            cible_id: connexion.id_connexion,
            cible_type: "CONNEXION",
            date_reception: new Date(),
          },
        });
      }

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
        demandeur: { role: { not: "ADMINISTRATEUR" } },
        destinataire: { role: { not: "ADMINISTRATEUR" } },
      },
      include: {
        destinataire: {
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
            profil: true,
            etudiant: { select: { filiere: true } },
          },
        },
      },
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
      include: {
        demandeur: {
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
            profil: true,
            etudiant: { select: { filiere: true } },
          },
        },
      },
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

  async ensureSampleConnexions(utilisateurId, role, email) {
    const normalizedRole = String(role || "")
      .trim()
      .toUpperCase();
    const isProfessor =
      normalizedRole === "PROFESSEUR" || normalizedRole === "TEACHER";
    const isProfessional =
      normalizedRole === "PROFESSIONNEL" || normalizedRole === "PROFESSIONAL";

    if (!isProfessor && !isProfessional)
      return false;
    if (!email) return false;

    const sampleMap = {
      "prof2@plateforme.ma": [
        {
          etudiant: "etudiant3@plateforme.ma",
          statut: "EN_ATTENTE",
          delayDays: 1,
        },
        {
          etudiant: "etudiant1@plateforme.ma",
          statut: "ACCEPTEE",
          delayDays: 4,
        },
      ],
      "prof3@plateforme.ma": [
        {
          etudiant: "etudiant4@plateforme.ma",
          statut: "EN_ATTENTE",
          delayDays: 2,
        },
        {
          etudiant: "etudiant5@plateforme.ma",
          statut: "ACCEPTEE",
          delayDays: 5,
        },
      ],
      "prof1@plateforme.ma": [
        {
          etudiant: "etudiant2@plateforme.ma",
          statut: "EN_ATTENTE",
          delayDays: 3,
        },
        {
          etudiant: "etudiant1@plateforme.ma",
          statut: "ACCEPTEE",
          delayDays: 6,
        },
      ],
      "pro1@plateforme.ma": [
        {
          etudiant: "etudiant1@plateforme.ma",
          statut: "EN_ATTENTE",
          delayDays: 1,
        },
        {
          etudiant: "etudiant2@plateforme.ma",
          statut: "ACCEPTEE",
          delayDays: 4,
        },
      ],
      "pro3@plateforme.ma": [
        {
          etudiant: "etudiant3@plateforme.ma",
          statut: "EN_ATTENTE",
          delayDays: 2,
        },
        {
          etudiant: "etudiant4@plateforme.ma",
          statut: "ACCEPTEE",
          delayDays: 5,
        },
      ],
    };

    let samples = sampleMap[email.toLowerCase()];

    if (!samples?.length) {
      const fallbackStudents = await prisma.utilisateur.findMany({
        where: {
          role: "ETUDIANT",
          est_actif: true,
        },
        select: { email: true },
        orderBy: { id_utilisateur: "asc" },
        take: 2,
      });

      if (!fallbackStudents.length) return false;

      samples = fallbackStudents.map((student, index) => ({
        etudiant: student.email,
        statut: index === 0 ? "EN_ATTENTE" : "ACCEPTEE",
        delayDays: index === 0 ? 1 : 4,
      }));
    }

    const users = await prisma.utilisateur.findMany({
      where: { email: { in: samples.map((item) => item.etudiant) } },
      select: { id_utilisateur: true, email: true },
    });
    const userByEmail = new Map(
      users.map((u) => [u.email.toLowerCase(), u.id_utilisateur]),
    );

    for (const sample of samples) {
      const demanderId = userByEmail.get(sample.etudiant.toLowerCase());
      if (!demanderId) continue;

      const data = {
        demandeur_id: BigInt(demanderId),
        destinataire_id: BigInt(utilisateurId),
        statut: sample.statut,
        date_demande: new Date(
          Date.now() - (sample.delayDays ?? 1) * 24 * 3600 * 1000,
        ),
        date_reponse:
          sample.statut === "ACCEPTEE"
            ? new Date(
                Date.now() - ((sample.delayDays ?? 1) - 1) * 24 * 3600 * 1000,
              )
            : null,
      };

      const existing = await prisma.connexion.findFirst({
        where: {
          demandeur_id: BigInt(demanderId),
          destinataire_id: BigInt(utilisateurId),
        },
        select: { id_connexion: true },
      });

      if (existing) {
        await prisma.connexion.update({
          where: { id_connexion: existing.id_connexion },
          data,
        });
      } else {
        await prisma.connexion.create({ data });
      }
    }

    return true;
  },

  async supprimerConnexion(connexionId, utilisateurId) {
    const connexion = await prisma.connexion.findUnique({
      where: { id_connexion: BigInt(connexionId) },
    });

    if (!connexion) throw { statusCode: 404, message: "Connexion introuvable" };

    const estParticipant =
      BigInt(connexion.demandeur_id) === BigInt(utilisateurId) ||
      BigInt(connexion.destinataire_id) === BigInt(utilisateurId);

    if (!estParticipant)
      throw { statusCode: 403, message: "Action non autorisée" };

    if (connexion.statut !== "ACCEPTEE") {
      throw {
        statusCode: 422,
        message: "Seule une connexion acceptée peut être supprimée",
      };
    }

    await prisma.connexion.delete({
      where: { id_connexion: BigInt(connexionId) },
    });
    return true;
  },
};

module.exports = connexionService;

