const prisma = require('../../prisma/client');

const verifierUtilisateur = async (id) => {
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: BigInt(id) },
    select: {
      id_utilisateur: true,
      nom: true,
      prenom: true,
      role: true,
      est_actif: true
    }
  });

  if (!utilisateur || !utilisateur.est_actif) {
    const err = new Error('Utilisateur introuvable');
    err.statusCode = 404;
    throw err;
  }

  return utilisateur;
};

const envoyerDemande = async (demandeurId, destinataireId) => {
  if (BigInt(demandeurId) === BigInt(destinataireId)) {
    const err = new Error('Vous ne pouvez pas vous connecter avec vous-même');
    err.statusCode = 400;
    throw err;
  }

  const demandeur = await verifierUtilisateur(demandeurId);
  const destinataire = await verifierUtilisateur(destinataireId);

  if (demandeur.role === 'ADMINISTRATEUR' || destinataire.role === 'ADMINISTRATEUR') {
    const err = new Error('Les administrateurs ne participent pas aux connexions');
    err.statusCode = 403;
    throw err;
  }

  const existe = await prisma.connexion.findFirst({
    where: {
      OR: [
        {
          demandeur_id: BigInt(demandeurId),
          destinataire_id: BigInt(destinataireId)
        },
        {
          demandeur_id: BigInt(destinataireId),
          destinataire_id: BigInt(demandeurId)
        }
      ]
    }
  });

  if (existe) {
    const err = new Error('Une demande ou connexion existe déjà');
    err.statusCode = 409;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    const connexion = await tx.connexion.create({
      data: {
        demandeur_id: BigInt(demandeurId),
        destinataire_id: BigInt(destinataireId),
        statut: 'EN_ATTENTE'
      },
      include: {
        demandeur: {
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            role: true
          }
        },
        destinataire: {
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            role: true
          }
        }
      }
    });

    await tx.notification.create({
      data: {
        utilisateur_id: BigInt(destinataireId),
        type: 'DEMANDE_CONNEXION',
        message: `${demandeur.prenom} ${demandeur.nom} vous a envoyé une demande de connexion`,
        cible_id: connexion.id_connexion,
        cible_type: 'CONNEXION',
        date_reception: new Date()
      }
    });

    return connexion;
  });
};

const accepterDemande = async (connexionId, utilisateurConnecteId) => {
  const connexion = await prisma.connexion.findUnique({
    where: { id_connexion: BigInt(connexionId) },
    include: {
      demandeur: {
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          role: true
        }
      },
      destinataire: {
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          role: true
        }
      }
    }
  });

  if (!connexion) {
    const err = new Error('Demande de connexion introuvable');
    err.statusCode = 404;
    throw err;
  }

  if (connexion.demandeur.role === 'ADMINISTRATEUR' || connexion.destinataire.role === 'ADMINISTRATEUR') {
    const err = new Error('Les administrateurs ne participent pas aux connexions');
    err.statusCode = 403;
    throw err;
  }

  if (BigInt(connexion.destinataire_id) !== BigInt(utilisateurConnecteId)) {
    const err = new Error('Vous ne pouvez accepter que les demandes reçues');
    err.statusCode = 403;
    throw err;
  }

  if (connexion.statut !== 'EN_ATTENTE') {
    const err = new Error('Cette demande a déjà été traitée');
    err.statusCode = 400;
    throw err;
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.connexion.update({
      where: { id_connexion: BigInt(connexionId) },
      data: {
        statut: 'ACCEPTEE',
        date_reponse: new Date()
      },
      include: {
        demandeur: {
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            role: true
          }
        },
        destinataire: {
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            role: true
          }
        }
      }
    });

    await tx.notification.create({
      data: {
        utilisateur_id: connexion.demandeur_id,
        type: 'CONNEXION_ACCEPTEE',
        message: `${connexion.destinataire.prenom} ${connexion.destinataire.nom} a accepté votre demande de connexion`,
        cible_id: connexion.id_connexion,
        cible_type: 'CONNEXION',
        date_reception: new Date()
      }
    });

    return updated;
  });
};

const refuserDemande = async (connexionId, utilisateurConnecteId) => {
  const connexion = await prisma.connexion.findUnique({
    where: { id_connexion: BigInt(connexionId) },
    include: {
      demandeur: {
        select: {
          id_utilisateur: true,
          role: true
        }
      },
      destinataire: {
        select: {
          id_utilisateur: true,
          role: true
        }
      }
    }
  });

  if (!connexion) {
    const err = new Error('Demande de connexion introuvable');
    err.statusCode = 404;
    throw err;
  }

  if (connexion.demandeur.role === 'ADMINISTRATEUR' || connexion.destinataire.role === 'ADMINISTRATEUR') {
    const err = new Error('Les administrateurs ne participent pas aux connexions');
    err.statusCode = 403;
    throw err;
  }

  if (BigInt(connexion.destinataire_id) !== BigInt(utilisateurConnecteId)) {
    const err = new Error('Vous ne pouvez refuser que les demandes reçues');
    err.statusCode = 403;
    throw err;
  }

  if (connexion.statut !== 'EN_ATTENTE') {
    const err = new Error('Cette demande a déjà été traitée');
    err.statusCode = 400;
    throw err;
  }

  return prisma.connexion.update({
    where: { id_connexion: BigInt(connexionId) },
    data: {
      statut: 'REFUSEE',
      date_reponse: new Date()
    }
  });
};

const getMesDemandes = async (utilisateurId) => {
  return prisma.connexion.findMany({
    where: {
      demandeur_id: BigInt(utilisateurId),
      demandeur: {
        role: { not: 'ADMINISTRATEUR' }
      },
      destinataire: {
        role: { not: 'ADMINISTRATEUR' }
      }
    },
    include: {
      destinataire: {
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
          profil: true
        }
      }
    },
    orderBy: {
      date_demande: 'desc'
    }
  });
};

const getDemandesRecues = async (utilisateurId) => {
  return prisma.connexion.findMany({
    where: {
      destinataire_id: BigInt(utilisateurId),
      statut: 'EN_ATTENTE',
      demandeur: {
        role: { not: 'ADMINISTRATEUR' }
      },
      destinataire: {
        role: { not: 'ADMINISTRATEUR' }
      }
    },
    include: {
      demandeur: {
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
          profil: true
        }
      }
    },
    orderBy: {
      date_demande: 'desc'
    }
  });
};

const getMesConnexions = async (utilisateurId) => {
  return prisma.connexion.findMany({
    where: {
      statut: 'ACCEPTEE',
      OR: [
        { demandeur_id: BigInt(utilisateurId) },
        { destinataire_id: BigInt(utilisateurId) }
      ],
      demandeur: {
        role: { not: 'ADMINISTRATEUR' }
      },
      destinataire: {
        role: { not: 'ADMINISTRATEUR' }
      }
    },
    include: {
      demandeur: {
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
          profil: true
        }
      },
      destinataire: {
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          email: true,
          role: true,
          profil: true
        }
      }
    },
    orderBy: {
      date_reponse: 'desc'
    }
  });
};

const supprimerConnexion = async (connexionId, utilisateurConnecteId) => {
  const connexion = await prisma.connexion.findUnique({
    where: { id_connexion: BigInt(connexionId) }
  });

  if (!connexion) {
    const err = new Error('Connexion introuvable');
    err.statusCode = 404;
    throw err;
  }

  const estParticipant =
    BigInt(connexion.demandeur_id) === BigInt(utilisateurConnecteId) ||
    BigInt(connexion.destinataire_id) === BigInt(utilisateurConnecteId);

  if (!estParticipant) {
    const err = new Error('Action non autorisée');
    err.statusCode = 403;
    throw err;
  }

  await prisma.connexion.delete({
    where: { id_connexion: BigInt(connexionId) }
  });

  return true;
};

module.exports = {
  envoyerDemande,
  accepterDemande,
  refuserDemande,
  getMesDemandes,
  getDemandesRecues,
  getMesConnexions,
  supprimerConnexion
};