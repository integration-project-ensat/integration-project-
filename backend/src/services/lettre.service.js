const { prisma, toBigInt } = require('../models/prisma')
const notificationService = require('./notification.service')

const normalizeMotif = (motif) => String(motif || '').trim().toUpperCase()

const ALLOWED_MOTIFS = new Set([
  'DOUBLE_DIPLOME',
  'MASTER',
  'EMPLOI',
  'STAGE',
  'INTERNATIONAL',
])

const createServiceError = (status, message) => {
  const error = new Error(message)
  error.status = status
  error.statusCode = status
  return error
}

const ensureAttachedProfessorStudent = async (professorId, studentId) => {
  const attached = await prisma.professeurEtudiant.findUnique({
    where: {
      id_professeur_id_etudiant: {
        id_professeur: toBigInt(professorId),
        id_etudiant: toBigInt(studentId),
      },
    },
    select: { id_professeur: true },
  })

  if (!attached) {
    throw createServiceError(403, "Ajoutez d'abord cet étudiant à votre liste avant de traiter sa demande.")
  }
}

const persistLetterElement = async (id_lettre, status, validateurId, motif_refus) => {
  const existingElement = await prisma.elementValidable.findFirst({
    where: {
      type: 'RECOMMANDATION',
      reference_id: toBigInt(id_lettre),
    },
    select: { id_element: true },
  })

  const elementData = {
    statut: status,
    validateur_id: toBigInt(validateurId),
    date_validation: new Date(),
    motif_refus: status === 'REFUSE' ? motif_refus : null,
  }

  if (existingElement) {
    await prisma.elementValidable.update({
      where: { id_element: existingElement.id_element },
      data: elementData,
    })
    return
  }

  await prisma.elementValidable.create({
    data: {
      type: 'RECOMMANDATION',
      reference_id: toBigInt(id_lettre),
      date_soumission: new Date(),
      ...elementData,
    },
  })
}

const notifyLetterStatusChange = async (lettre, statut, motif_refus) => {
  try {
    if (statut !== 'REDIGEE' && statut !== 'REFUSEE') return

    const motifLabel = lettre.motif ? ` (${String(lettre.motif).toLowerCase()})` : ''
    const refusalSuffix = motif_refus ? ` Motif: ${motif_refus}` : ''
    const notificationType =
      statut === 'REDIGEE' ? 'RECOMMANDATION_ACCEPTEE' : 'RECOMMANDATION_REFUSEE'
    const notificationMessage =
      statut === 'REDIGEE'
        ? `Votre demande de lettre${motifLabel} a été acceptée et rédigée.`
        : `Votre demande de lettre${motifLabel} a été refusée.${refusalSuffix}`

    await notificationService.creerNotification({
      utilisateurId: lettre.id_etudiant,
      type: notificationType,
      message: notificationMessage,
      cibleId: lettre.id_lettre,
      cibleType: 'LETTRE',
    })
  } catch (e) {}
}

const createRequest = async ({
  id_etudiant,
  id_professeur,
  motif,
  date_souhaitee,
}) => {
  const normalizedMotif = normalizeMotif(motif)

  if (!id_etudiant) throw createServiceError(401, 'Authentification requise')
  if (!id_professeur) throw createServiceError(400, 'Professeur cible requis')
  if (!ALLOWED_MOTIFS.has(normalizedMotif)) {
    throw createServiceError(400, 'Motif de lettre invalide')
  }

  const [student, professor] = await Promise.all([
    prisma.utilisateur.findUnique({
      where: { id_utilisateur: toBigInt(id_etudiant) },
      select: { id_utilisateur: true, nom: true, prenom: true, role: true },
    }),
    prisma.utilisateur.findUnique({
      where: { id_utilisateur: toBigInt(id_professeur) },
      select: { id_utilisateur: true, role: true, nom: true, prenom: true },
    }),
  ])

  if (!student || student.role !== 'ETUDIANT') {
    throw createServiceError(403, 'Seul un etudiant peut envoyer cette demande')
  }

  if (!professor || professor.role !== 'PROFESSEUR') {
    throw createServiceError(404, 'Professeur introuvable')
  }

  const existingPending = await prisma.lettreRecommandation.findFirst({
    where: {
      id_etudiant: toBigInt(id_etudiant),
      id_professeur: toBigInt(id_professeur),
      motif: normalizedMotif,
      statut: 'EN_ATTENTE',
    },
    select: { id_lettre: true },
  })

  if (existingPending) {
    throw createServiceError(
      409,
      'Une demande en attente existe deja pour ce professeur et ce motif',
    )
  }

  const created = await prisma.lettreRecommandation.create({
    data: {
      id_etudiant: toBigInt(id_etudiant),
      id_professeur: toBigInt(id_professeur),
      motif: normalizedMotif,
      date_souhaitee: date_souhaitee ? new Date(date_souhaitee) : null,
      statut: 'EN_ATTENTE',
      visibilite: 'PRIVE',
    },
    include: {
      professeur: { include: { utilisateur: true } },
      etudiant: { include: { utilisateur: true } },
    },
  })

  await prisma.elementValidable.create({
    data: {
      type: 'RECOMMANDATION',
      reference_id: created.id_lettre,
      statut: 'EN_ATTENTE',
      date_soumission: new Date(),
    },
  })

  try {
    const studentName =
      [student.prenom, student.nom].filter(Boolean).join(' ').trim() || 'Un etudiant'
    await notificationService.creerNotification({
      utilisateurId: id_professeur,
      type: 'DEMANDE_RECOMMANDATION',
      message: `${studentName} vous a envoye une demande de lettre de recommandation (${normalizedMotif.toLowerCase()}).`,
      cibleId: created.id_lettre,
      cibleType: 'LETTRE',
    })
  } catch (error) {}

  return created
}

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

  if (!lettre) throw createServiceError(404, 'Lettre introuvable')
  return lettre
}

const updateVisibilite = async (id_lettre, visibilite) => {
  const existing = await prisma.lettreRecommandation.findUnique({ where: { id_lettre: toBigInt(id_lettre) }, select: { id_lettre: true } })
  if (!existing) throw createServiceError(404, 'Lettre non trouvee')

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

  if (!lettre) throw createServiceError(404, 'Lettre introuvable')
  if (lettre.id_professeur && toBigInt(lettre.id_professeur) !== toBigInt(validateurId)) {
    throw createServiceError(403, 'Acces refuse')
  }
  await ensureAttachedProfessorStudent(validateurId, lettre.id_etudiant)

  const lettreData = {}
  if (statut === 'REDIGEE') {
    lettreData.statut = 'REDIGEE'
    if (contenu !== undefined) lettreData.contenu = contenu
  } else if (statut === 'REFUSEE') {
    lettreData.statut = 'REFUSEE'
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

  let elementStatus = 'EN_ATTENTE'
  if (statut === 'REDIGEE') {
    elementStatus = 'VALIDE'
  } else if (statut === 'REFUSEE') {
    elementStatus = 'REFUSE'
  }
  await persistLetterElement(id_lettre, elementStatus, validateurId, motif_refus)
  await notifyLetterStatusChange(lettre, statut, motif_refus)

  return updatedLettre
}

module.exports = { createRequest, getLettres, getLettreById, updateVisibilite, updateStatut }
