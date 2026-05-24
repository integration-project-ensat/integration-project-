const { prisma, toBigInt } = require('../models/prisma')

const normalizeSections = (modele) => {
  if (Array.isArray(modele.structure?.sections)) return modele.structure.sections

  if (typeof modele.sections === 'string') {
    return modele.sections
      .split(',')
      .map((section) => section.trim())
      .filter(Boolean)
  }

  return []
}

const formatThemeForFrontend = (modele) => {
  if (!modele) return null

  const id = modele.id_modele.toString()

  return {
    id,
    id_modele: id,
    nom: modele.nom,
    name: modele.nom,
    theme: modele.theme,
    sections: normalizeSections(modele),
    structure: modele.structure,
  }
}

const getAllThemes = async () => {
  const themes = await prisma.modelePortfolio.findMany({
    orderBy: { nom: 'asc' },
  })

  return themes.map(formatThemeForFrontend)
}

const saveTheme = async (id_etudiant, id_modele) => {
  if (!id_modele) {
    throw { status: 400, message: 'Le modele de portfolio est requis' }
  }

  const modele = await prisma.modelePortfolio.findUnique({
    where: { id_modele: toBigInt(id_modele) },
  })

  if (!modele) throw { status: 404, message: 'Modele introuvable' }

  const portfolio = await prisma.portfolio.findUnique({
    where: { id_etudiant: toBigInt(id_etudiant) },
    select: { id_portfolio: true },
  })

  if (!portfolio) throw { status: 404, message: 'Portfolio non trouve' }

  const updated = await prisma.portfolio.update({
    where: { id_etudiant: toBigInt(id_etudiant) },
    data: {
      id_modele: modele.id_modele,
      theme: modele.theme || null,
      date_modification: new Date(),
    },
    include: { modele: true },
  })

  return {
    portfolio: updated,
    theme: formatThemeForFrontend(updated.modele),
  }
}

const getThemeEtudiant = async (id_etudiant) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id_etudiant: toBigInt(id_etudiant) },
    include: { modele: true },
  })

  if (!portfolio) throw { status: 404, message: 'Portfolio non trouve' }

  return formatThemeForFrontend(portfolio.modele)
}

module.exports = {
  formatThemeForFrontend,
  getAllThemes,
  getThemeEtudiant,
  saveTheme,
}
