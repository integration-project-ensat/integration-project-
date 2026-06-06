const { prisma, toBigInt } = require('../models/prisma')
const notificationService = require('./notification.service')

const getLettres = async (id_etudiant, demandeurId) => {
  // Propriétaire voit toutes ses lettres
  if (toBigInt(demandeurId) === toBigInt(id_etudiant)) {
    return prisma.lettreRecommandation.findMany({
      where: { id_etudiant: toBigInt(id_etudiant) },
      include: { professeur: { include: { utilisateur: true } } },
      orderBy: { id_lettre: 'desc' },
    })
  }

  // Visiteur non authentifié ou autre utilisateur ne voit que les lettres publiques
  return prisma.lettreRecommandation.findMany({
    where: { id_etudiant: toBigInt(id_etudiant), visibilite: 'PUBLIC' },
    include: { professeur: { include: { utilisateur: true } } },
    orderBy: { id_lettre: 'desc' },
  })
}

const getLettreById = async (id_lettre) => {
  const lettre = await prisma.lettreRecommandation.findUnique({
    where: { id_lettre: toBigInt(id_lettre) },
    include: { professeur: { include: { utilisateur: true } }, etudiant: { include: { utilisateur: true } } },
  })

  if (!lettre) throw { status: 404, message: 'Lettre introuvable' }
  return lettre
}

const updateVisibilite = async (id_lettre, visibilite) => {
  const existing = await prisma.lettreRecommandation.findUnique({ where: { id_lettre: toBigInt(id_lettre) }, select: { id_lettre: true } })
  if (!existing) throw { status: 404, message: 'Lettre non trouvee' }

  return prisma.lettreRecommandation.update({
    where: { id_lettre: toBigInt(id_lettre) },
    data: { visibilite },
  })
}

const updateStatut = async (id_lettre, statut, validateurId, { contenu = undefined, motif_refus = null } = {}) => {
  const lettre = await prisma.lettreRecommandation.findUnique({
    where: { id_lettre: toBigInt(id_lettre) },
    select: { id_lettre: true, id_professeur: true, id_etudiant: true, motif: true },
  })

  if (!lettre) throw { status: 404, message: 'Lettre introuvable' }
  if (lettre.id_professeur && toBigInt(lettre.id_professeur) !== toBigInt(validateurId)) {
    throw { status: 403, message: 'Acces refuse' }
  }

  const lettreData = {}
  if (statut === 'REDIGEE') {
    lettreData.statut = 'REDIGEE'
    if (contenu !== undefined) lettreData.contenu = contenu
  } else if (statut === 'EN_ATTENTE') {
    lettreData.statut = 'EN_ATTENTE'
  }

  const updatedLettre = Object.keys(lettreData).length
    ? await prisma.lettreRecommandation.update({
        where: { id_lettre: toBigInt(id_lettre) },
        data: lettreData,
      })
    : await prisma.lettreRecommandation.findUnique({
        where: { id_lettre: toBigInt(id_lettre) },
      })

  const elementStatus =
    statut === 'REDIGEE' ? 'VALIDE' : statut === 'REFUSEE' ? 'REFUSE' : 'EN_ATTENTE'

  const existingElement = await prisma.elementValidable.findFirst({
    where: {
      type: 'RECOMMANDATION',
      reference_id: toBigInt(id_lettre),
    },
    select: { id_element: true },
  })

  const elementData = {
    statut: elementStatus,
    validateur_id: toBigInt(validateurId),
    date_validation: new Date(),
    motif_refus: elementStatus === 'REFUSE' ? motif_refus : null,
  }

  if (existingElement) {
    await prisma.elementValidable.update({
      where: { id_element: existingElement.id_element },
      data: elementData,
    })
  } else {
    await prisma.elementValidable.create({
      data: {
        type: 'RECOMMANDATION',
        reference_id: toBigInt(id_lettre),
        date_soumission: new Date(),
        ...elementData,
      },
    })
  }

  try {
    if (statut === 'REDIGEE' || statut === 'REFUSEE') {
      await notificationService.creerNotification({
        utilisateurId: lettre.id_etudiant,
        type: statut === 'REDIGEE' ? 'RECOMMANDATION_ACCEPTEE' : 'RECOMMANDATION_REFUSEE',
        message:
          statut === 'REDIGEE'
            ? `Votre demande de lettre${lettre.motif ? ` (${String(lettre.motif).toLowerCase()})` : ''} a été acceptée et rédigée.`
            : `Votre demande de lettre${lettre.motif ? ` (${String(lettre.motif).toLowerCase()})` : ''} a été refusée.${motif_refus ? ` Motif: ${motif_refus}` : ''}`,
        cibleId: lettre.id_lettre,
        cibleType: 'LETTRE',
      })
    }
  } catch (e) {}

  return updatedLettre
}

module.exports = { getLettres, getLettreById, updateVisibilite, updateStatut }
