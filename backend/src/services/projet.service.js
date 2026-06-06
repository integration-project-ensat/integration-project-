const { prisma, toBigInt } = require('../models/prisma')
const notificationService = require('./notification.service')

const projetService = {
  async findAll(filters = {}) {
    const where = {}
    if (filters.etudiantId) where.id_etudiant = BigInt(filters.etudiantId)
    if (filters.statut) where.statut = filters.statut
    if (filters.professeurId) where.id_professeur = BigInt(filters.professeurId)

    return prisma.projet.findMany({
      where,
      include: {
        etudiant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
        professeur: { include: { utilisateur: { select: { nom: true, prenom: true } } } },
        technologies: { include: { technologie: true } }
      },
      orderBy: { id_projet: 'desc' }
    })
  },

  async findById(id) {
    return prisma.projet.findUnique({
      where: { id_projet: BigInt(id) },
      include: {
        etudiant: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } },
        professeur: { include: { utilisateur: { select: { nom: true, prenom: true } } } },
        technologies: { include: { technologie: true } }
      }
    })
  },

  async create(data, etudiantId) {
    const { titre, description, type, role, resultats, lien_github, id_professeur, visibilite } = data
    return prisma.projet.create({
      data: {
        titre,
        description,
        type,
        role,
        resultats,
        lien_github,
        visibilite,
        id_etudiant: BigInt(etudiantId),
        ...(id_professeur && { id_professeur: BigInt(id_professeur) }),
        statut: 'EN_ATTENTE'
      }
    })
  },

  async update(id, data, etudiantId) {
    const projet = await prisma.projet.findUnique({ where: { id_projet: BigInt(id) } })
    if (!projet) return null
    if (projet.id_etudiant !== BigInt(etudiantId)) throw { statusCode: 403, message: 'Accès refusé' }

    const { titre, description, type, role, resultats, lien_github, visibilite, id_professeur } = data
    return prisma.projet.update({
      where: { id_projet: BigInt(id) },
      data: {
        ...(titre && { titre }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(role !== undefined && { role }),
        ...(resultats !== undefined && { resultats }),
        ...(lien_github !== undefined && { lien_github }),
        ...(visibilite && { visibilite }),
        ...(id_professeur && { id_professeur: BigInt(id_professeur) }),
      }
    })
  },

  async delete(id, etudiantId) {
    const projet = await prisma.projet.findUnique({ where: { id_projet: BigInt(id) } })
    if (!projet) return null
    if (projet.id_etudiant !== BigInt(etudiantId)) throw { statusCode: 403, message: 'Accès refusé' }
    return prisma.projet.delete({ where: { id_projet: BigInt(id) } })
  },

  async changerStatut(id, statut, validateurId, { motif_refus, appreciation_professeur } = {}) {
    const projet = await prisma.projet.findUnique({ where: { id_projet: BigInt(id) } })
    if (!projet) return null

    // Enregistrer dans ElementValidable pour historisation
    // Remplacement de l'upsert incorrect (PK != id_projet) par une recherche
    // par type + reference_id, puis update/create selon le cas.
    const existingElement = await prisma.elementValidable.findFirst({
      where: { type: 'PROJET', reference_id: projet.id_projet }
    })

    if (existingElement) {
      await prisma.elementValidable.update({
        where: { id_element: existingElement.id_element },
        data: {
          statut,
          validateur_id: toBigInt(validateurId),
          date_validation: new Date(),
          motif_refus: motif_refus ?? null,
        },
      })
    } else {
      await prisma.elementValidable.create({
        data: {
          type: 'PROJET',
          reference_id: projet.id_projet,
          statut,
          validateur_id: validateurId ? toBigInt(validateurId) : undefined,
          date_soumission: new Date(),
          date_validation: new Date(),
          motif_refus: motif_refus ?? null,
        },
      })
    }

    // Créer une notification pour l'étudiant concerné
    try {
      const utilisateurId = projet.id_etudiant
      if (statut === 'VALIDE') {
        await notificationService.creerNotification({
          utilisateurId,
          type: 'VALIDATION_PROJET',
          message: `Votre projet \"${projet.titre || 'Projet'}\" a été validé.`,
          cibleId: projet.id_projet,
          cibleType: 'PROJET',
        })
      } else if (statut === 'REFUSE') {
        await notificationService.creerNotification({
          utilisateurId,
          type: 'REFUS_PROJET',
          message: `Votre projet \"${projet.titre || 'Projet'}\" a été refusé. Motif: ${motif_refus || '—'}`,
          cibleId: projet.id_projet,
          cibleType: 'PROJET',
        })
      }
    } catch (e) {
      // ne pas bloquer la validation en cas d'erreur de notification
    }

    return prisma.projet.update({
      where: { id_projet: BigInt(id) },
      data: {
        statut,
        ...(appreciation_professeur !== undefined && { appreciation_professeur })
      }
    })
  },

  async soumettre(id, etudiantId) {
    const projet = await prisma.projet.findUnique({ where: { id_projet: BigInt(id) } })
    if (!projet) return null
    if (projet.id_etudiant !== BigInt(etudiantId)) throw { statusCode: 403, message: 'Accès refusé' }

    await prisma.elementValidable.create({
      data: {
        type: 'PROJET',
        reference_id: projet.id_projet,
        statut: 'EN_ATTENTE',
        date_soumission: new Date()
      }
    })

    const updatedProjet = await prisma.projet.update({
      where: { id_projet: BigInt(id) },
      data: { statut: 'EN_ATTENTE' }
    })

    if (projet.id_professeur) {
      try {
        await notificationService.creerNotification({
          utilisateurId: projet.id_professeur,
          type: 'SOUMISSION_PROJET',
          message: `Un étudiant vous a soumis le projet "${projet.titre || 'Projet'}" pour validation.`,
          cibleId: projet.id_projet,
          cibleType: 'PROJET',
        })
      } catch (e) {}
    }

    return updatedProjet
  },

  async getHistorique(id) {
    return prisma.elementValidable.findMany({
      where: { type: 'PROJET', reference_id: BigInt(id) },
      include: {
        validateur: { select: { nom: true, prenom: true, role: true } }
      },
      orderBy: { id_element: 'desc' }
    })
  }
}

module.exports = projetService