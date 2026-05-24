const { v4: uuidv4 } = require('uuid')
const { prisma, toBigInt } = require('../models/prisma')

const coerceBoolean = (value) => {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false

  const error = new Error('La visibilite doit etre un booleen')
  error.status = 400
  throw error
}

const pickPortfolioFields = (data = {}) => ({
  ...(data.titre !== undefined && { titre: data.titre }),
  ...(data.objectif_pro !== undefined && { objectif_pro: data.objectif_pro }),
  ...(data.theme !== undefined && { theme: data.theme }),
  ...(data.id_modele !== undefined && { id_modele: toBigInt(data.id_modele) }),
})

const getPortfolio = async (id_etudiant, demandeurId) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id_etudiant: toBigInt(id_etudiant) },
    include: {
      modele: true,
      commentaires: true,
      recommandations: true,
    },
  })

  if (!portfolio) throw { status: 404, message: 'Portfolio non trouve' }

  if (!portfolio.est_public && toBigInt(demandeurId) !== toBigInt(id_etudiant)) {
    throw { status: 403, message: 'Portfolio prive' }
  }

  return portfolio
}

const getPortfolioByLien = async (url_public) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { url_public },
    include: { modele: true },
  })

  if (!portfolio) throw { status: 404, message: 'Lien invalide ou portfolio introuvable' }
  if (!portfolio.est_public) throw { status: 403, message: 'Ce portfolio est prive' }

  return portfolio
}

const updateVisibilite = async (id_etudiant, est_public) => {
  const existing = await prisma.portfolio.findUnique({
    where: { id_etudiant: toBigInt(id_etudiant) },
    select: { id_portfolio: true },
  })

  if (!existing) throw { status: 404, message: 'Portfolio non trouve' }

  return prisma.portfolio.update({
    where: { id_etudiant: toBigInt(id_etudiant) },
    data: {
      est_public: coerceBoolean(est_public),
      date_modification: new Date(),
    },
  })
}

const getLienPartage = async (id_etudiant) => {
  let portfolio = await prisma.portfolio.findUnique({
    where: { id_etudiant: toBigInt(id_etudiant) },
  })

  if (!portfolio) throw { status: 404, message: 'Portfolio non trouve' }

  if (!portfolio.url_public) {
    portfolio = await prisma.portfolio.update({
      where: { id_etudiant: toBigInt(id_etudiant) },
      data: { url_public: uuidv4() },
    })
  }

  return portfolio.url_public
}

const updatePortfolio = async (id_etudiant, data) => {
  const updateData = pickPortfolioFields(data)

  if (Object.keys(updateData).length === 0) {
    throw { status: 400, message: 'Aucun champ portfolio valide a modifier' }
  }

  const existing = await prisma.portfolio.findUnique({
    where: { id_etudiant: toBigInt(id_etudiant) },
    select: { id_portfolio: true },
  })

  if (!existing) throw { status: 404, message: 'Portfolio non trouve' }

  return prisma.portfolio.update({
    where: { id_etudiant: toBigInt(id_etudiant) },
    data: {
      ...updateData,
      date_modification: new Date(),
    },
  })
}

module.exports = {
  getPortfolio,
  getPortfolioByLien,
  updateVisibilite,
  getLienPartage,
  updatePortfolio,
}
