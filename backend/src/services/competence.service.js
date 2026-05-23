const prisma = require('../models/prisma')

const categoriesValides = ['TECHNIQUE', 'COMPORTEMENTALE']
const niveauxValides = ['DEBUTANT', 'INTERMEDIAIRE', 'AVANCE', 'EXPERT']

async function getAllCompetences({ categorie, search } = {}) {
  if (categorie && !categoriesValides.includes(categorie)) {
    const err = new Error('Catégorie invalide')
    err.statusCode = 400
    throw err
  }

  return prisma.competence.findMany({
    where: {
      ...(categorie && { categorie }),
      ...(search && { nom: { contains: search, mode: 'insensitive' } })
    },
    orderBy: { nom: 'asc' }
  })
}

async function getCompetencesByType({ search } = {}) {
  const competences = await prisma.competence.findMany({
    where: search ? { nom: { contains: search, mode: 'insensitive' } } : {},
    orderBy: { categorie: 'asc' }
  })
  return competences.reduce((acc, c) => {
    const cat = c.categorie ?? 'AUTRE'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {})
}

async function getCompetenceById(id) {
  return prisma.competence.findUnique({
    where: { id_competence: BigInt(id) }
  })
}

async function getSuggestionsForEtudiant(etudiantId) {
  const dejaAjoutees = await prisma.profilCompetence.findMany({
    where: { id_etudiant: BigInt(etudiantId) },
    select: { id_competence: true }
  })
  const ids = dejaAjoutees.map(c => c.id_competence)
  return prisma.competence.findMany({
    where: { id_competence: { notIn: ids } },
    take: 10,
    orderBy: { nom: 'asc' }
  })
}

async function createCompetence({ nom, categorie, niveau }) {
  if (categorie && !categoriesValides.includes(categorie)) {
    const err = new Error('Catégorie invalide')
    err.statusCode = 400
    throw err
  }
  if (niveau && !niveauxValides.includes(niveau)) {
    const err = new Error('Niveau invalide')
    err.statusCode = 400
    throw err
  }

  const existant = await prisma.competence.findFirst({ where: { nom } })
  if (existant) {
    const err = new Error('Cette compétence existe déjà')
    err.statusCode = 409
    throw err
  }

  return prisma.competence.create({ data: { nom, categorie, niveau } })
}

async function updateCompetence(id, { nom, categorie, niveau }) {
  if (categorie && !categoriesValides.includes(categorie)) {
    const err = new Error('Catégorie invalide')
    err.statusCode = 400
    throw err
  }

  const existant = await prisma.competence.findUnique({
    where: { id_competence: BigInt(id) }
  })
  if (!existant) {
    const err = new Error('Compétence introuvable')
    err.statusCode = 404
    throw err
  }

  if (nom && nom !== existant.nom) {
    const doublon = await prisma.competence.findFirst({ where: { nom } })
    if (doublon) {
      const err = new Error('Une compétence avec ce nom existe déjà')
      err.statusCode = 409
      throw err
    }
  }

  return prisma.competence.update({
    where: { id_competence: BigInt(id) },
    data: { ...(nom && { nom }), ...(categorie && { categorie }), ...(niveau && { niveau }) }
  })
}

async function deleteCompetence(id) {
  const existant = await prisma.competence.findUnique({
    where: { id_competence: BigInt(id) }
  })
  if (!existant) {
    const err = new Error('Compétence introuvable')
    err.statusCode = 404
    throw err
  }

  const utilise = await prisma.profilCompetence.count({
    where: { id_competence: BigInt(id) }
  })
  if (utilise > 0) {
    const err = new Error('Compétence utilisée par des étudiants, suppression impossible')
    err.statusCode = 409
    throw err
  }

  return prisma.competence.delete({ where: { id_competence: BigInt(id) } })
}

module.exports = {
  getAllCompetences,
  getCompetencesByType,
  getCompetenceById,
  getSuggestionsForEtudiant,
  createCompetence,
  updateCompetence,
  deleteCompetence
}