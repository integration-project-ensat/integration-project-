const prisma = require("../../prisma/client");
const asyncHandler = require("../middlewares/asyncHandler");
const profilService = require("../services/profil.service");

const formatName = (utilisateur) => {
  if (!utilisateur) return "Utilisateur";
  return `${utilisateur.prenom || ""} ${utilisateur.nom || ""}`.trim();
};

const toInitials = (nomComplet) => {
  return nomComplet
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const mapValidationStatus = (statut) => {
  if (statut === "VALIDE") return "ValidÃ©";
  if (statut === "REFUSE") return "RefusÃ©";
  return "En attente";
};

const compareIsoDatesDesc = (left, right) => {
  const leftTime = new Date(left || 0).getTime();
  const rightTime = new Date(right || 0).getTime();
  return rightTime - leftTime;
};

const sortByPriority = (items, priorityMap) =>
  [...items].sort((left, right) => {
    const leftPriority = priorityMap[left.status] ?? 99;
    const rightPriority = priorityMap[right.status] ?? 99;

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return compareIsoDatesDesc(left.date, right.date);
  });

const getProfDashboard = asyncHandler(async (req, res) => {
  const userId = BigInt(req.utilisateur.id_utilisateur);

  const [projets, stages, lettres] = await Promise.all([
    prisma.projet.findMany({
      where: { id_professeur: userId },
      include: {
        etudiant: {
          select: {
            id_utilisateur: true,
            filiere: true,
            utilisateur: {
              select: {
                prenom: true,
                nom: true,
              },
            },
          },
        },
      },
    }),
    prisma.stage.findMany({
      where: { id_encadrant: userId },
      include: {
        etudiant: {
          select: {
            id_utilisateur: true,
            filiere: true,
            utilisateur: {
              select: {
                prenom: true,
                nom: true,
              },
            },
          },
        },
      },
    }),
    prisma.lettreRecommandation.findMany({
      where: { id_professeur: userId },
      include: {
        etudiant: {
          select: {
            id_utilisateur: true,
            filiere: true,
            utilisateur: {
              select: {
                prenom: true,
                nom: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const lettreIds = lettres.map((lettre) => lettre.id_lettre);
  const lettreValidations = lettreIds.length
    ? await prisma.elementValidable.findMany({
        where: {
          type: "RECOMMANDATION",
          reference_id: { in: lettreIds },
        },
        select: {
          reference_id: true,
          statut: true,
        },
      })
    : [];

  const lettreValidationMap = new Map(
    lettreValidations.map((item) => [
      item.reference_id.toString(),
      item.statut,
    ]),
  );

  const validationRequests = sortByPriority([
    ...projets.map((projet) => ({
      id: projet.id_projet.toString(),
      studentId: projet.etudiant?.id_utilisateur?.toString() ?? "unknown",
      studentName: formatName(projet.etudiant?.utilisateur),
      initials: toInitials(formatName(projet.etudiant?.utilisateur)),
      type: "Projet",
      title: projet.titre || "Projet",
      description: projet.description || "Validation du projet",
      date: projet.date_debut
        ? projet.date_debut.toISOString()
        : new Date().toISOString(),
      status: mapValidationStatus(projet.statut),
      attachments: [],
    })),
    ...stages.map((stage) => ({
      id: stage.id_stage.toString(),
      studentId: stage.etudiant?.id_utilisateur?.toString() ?? "unknown",
      studentName: formatName(stage.etudiant?.utilisateur),
      initials: toInitials(formatName(stage.etudiant?.utilisateur)),
      type: "Stage",
      title: stage.entreprise || "Stage",
      description: stage.missions || "Validation du stage",
      date: stage.date_debut
        ? stage.date_debut.toISOString()
        : new Date().toISOString(),
      status: mapValidationStatus(stage.statut),
      attachments: [],
    })),
  ], {
    "En attente": 0,
    "ValidÃ©": 1,
    "RefusÃ©": 2,
  });

  const recommendationRequests = sortByPriority(lettres
    .map((lettre) => {
      const validationStatut = lettreValidationMap.get(
        lettre.id_lettre.toString(),
      );
      const status =
        validationStatut === "REFUSE"
          ? "RefusÃ©e"
          : lettre.statut === "REDIGEE" || validationStatut === "VALIDE"
            ? "AcceptÃ©e"
            : "En attente";

      return {
        id: lettre.id_lettre.toString(),
        studentId: lettre.etudiant?.id_utilisateur?.toString() ?? "unknown",
        studentName: formatName(lettre.etudiant?.utilisateur),
        initials: toInitials(formatName(lettre.etudiant?.utilisateur)),
        profileInfo: lettre.etudiant?.filiere || "Ã‰tudiant",
        title: lettre.motif
          ? `Lettre ${lettre.motif.toLowerCase()}`
          : "Lettre de recommandation",
        message: lettre.contenu || "Demande de lettre de recommandation",
        date: lettre.date_souhaitee
          ? lettre.date_souhaitee.toISOString()
          : new Date().toISOString(),
        status,
        writtenLetter: lettre.contenu || null,
      };
    })
    .filter((item) => item.status !== "RefusÃ©e"), {
    "En attente": 0,
    "AcceptÃ©e": 1,
    "RefusÃ©e": 2,
  });

  const stats = {
    total: validationRequests.length,
    pending: validationRequests.filter((item) => item.status === "En attente")
      .length,
    validated: validationRequests.filter((item) => item.status === "ValidÃ©")
      .length,
    refused: validationRequests.filter((item) => item.status === "RefusÃ©")
      .length,
  };

  const recommendationStats = {
    total: recommendationRequests.length,
    pending: recommendationRequests.filter(
      (item) => item.status === "En attente",
    ).length,
    accepted: recommendationRequests.filter(
      (item) => item.status === "AcceptÃ©e",
    ).length,
    refused: 0,
  };

  return res.json({
    success: true,
    data: {
      profile: {
        name: formatName(req.utilisateur),
      },
      stats,
      validationRequests,
      recommendationRequests,
      recommendationStats,
    },
  });
});

const getProDashboard = asyncHandler(async (req, res) => {
  const userId = BigInt(req.utilisateur.id_utilisateur);

  const [
    savedProfiles,
    pendingConnections,
    acceptedConnections,
    refusedConnections,
    publishedOffers,
    currentUser,
  ] = await Promise.all([
    profilService.getMesSauvegardes(userId),
    prisma.connexion.count({
      where: {
        destinataire_id: userId,
        statut: "EN_ATTENTE",
      },
    }),
    prisma.connexion.count({
      where: {
        statut: "ACCEPTEE",
        OR: [{ demandeur_id: userId }, { destinataire_id: userId }],
      },
    }),
    prisma.connexion.count({
      where: {
        statut: "REFUSEE",
        OR: [{ demandeur_id: userId }, { destinataire_id: userId }],
      },
    }),
    prisma.poste.count({ where: { id_auteur: userId } }),
    prisma.utilisateur.findUnique({
      where: { id_utilisateur: userId },
      select: { prenom: true, nom: true },
    }),
  ]);

  const acceptedConnectionsList = await prisma.connexion.findMany({
    where: {
      statut: "ACCEPTEE",
      OR: [{ demandeur_id: userId }, { destinataire_id: userId }],
    },
    include: {
      demandeur: {
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          role: true,
          profil: { select: { adresse: true } },
          etudiant: {
            select: {
              filiere: true,
              score_credibilite: { select: { score_total: true } },
            },
          },
        },
      },
      destinataire: {
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          role: true,
          profil: { select: { adresse: true } },
          etudiant: {
            select: {
              filiere: true,
              score_credibilite: { select: { score_total: true } },
            },
          },
        },
      },
    },
    orderBy: { date_reponse: "desc" },
  });

  const interns = acceptedConnectionsList
    .map((connexion) => {
      const otherUser =
        connexion.demandeur.role === "ETUDIANT"
          ? connexion.demandeur
          : connexion.destinataire.role === "ETUDIANT"
            ? connexion.destinataire
            : null;
      if (!otherUser) return null;
      const fullName = formatName(otherUser);
      return {
        id: otherUser.id_utilisateur.toString(),
        initials: toInitials(fullName),
        name: fullName,
        school: otherUser.etudiant?.filiere || "Ãƒâ€°tudiant",
        field: otherUser.etudiant?.filiere || "Ã¢â‚¬â€",
        city: otherUser.profil?.adresse || "Ã¢â‚¬â€",
        score: Number(otherUser.etudiant?.score_credibilite?.score_total ?? 0),
        startDate: connexion.date_reponse
          ? connexion.date_reponse.toISOString().split("T")[0]
          : connexion.date_demande.toISOString().split("T")[0],
        badges: [],
        status: "Actif",
        profilePath: `/profile/student/${otherUser.id_utilisateur}?from=pro`,
        portfolioPath: `/portfolio/${otherUser.id_utilisateur}?from=pro`,
      };
    })
    .filter(Boolean);

  const savedProfilesData = savedProfiles.map((saved) => {
    const etudiant = saved.etudiant;
    const fullName = formatName(etudiant);
    return {
      id: saved.id,
      name: fullName,
      school: etudiant.etudiant?.filiere || "Ãƒâ€°tudiant",
      field: etudiant.etudiant?.filiere || "Ã¢â‚¬â€",
      city: etudiant.profil?.adresse || "Ã¢â‚¬â€",
      score: Number(etudiant.etudiant?.score_credibilite?.score_total ?? 0),
      recommendations: 0,
      badges: (etudiant.etudiant?.badges || [])
        .map((item) => item.badge?.nom)
        .filter(Boolean),
      hasPortfolio: Boolean(etudiant.etudiant?.score_credibilite),
      profilePath: `/profile/student/${etudiant.id_utilisateur}?from=pro`,
      portfolioPath: `/portfolio/${etudiant.id_utilisateur}?from=pro`,
    };
  });

  return res.json({
    success: true,
    data: {
      profile: {
        name: formatName(currentUser),
      },
      stats: {
        totalInterns: interns.length,
        activeInterns: interns.length,
        savedProfiles: savedProfilesData.length,
        publishedOffers: publishedOffers,
      },
      connections: {
        pending: pendingConnections,
        accepted: acceptedConnections,
        refused: refusedConnections,
      },
      interns,
      savedProfiles: savedProfilesData,
    },
  });
});

module.exports = {
  getProfDashboard,
  getProDashboard,
};


