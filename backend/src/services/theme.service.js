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

const ensureStudentExists = async (id_etudiant) => {
  const student = await prisma.etudiant.findUnique({
    where: { id_utilisateur: toBigInt(id_etudiant) },
    select: { id_utilisateur: true },
  })

  if (!student) throw { status: 404, message: 'Etudiant introuvable' }

  return student.id_utilisateur
}

const saveTheme = async (id_etudiant, id_modele) => {
  if (!id_modele) {
    throw { status: 400, message: 'Le modele de portfolio est requis' }
  }

  const modele = await prisma.modelePortfolio.findUnique({
    where: { id_modele: toBigInt(id_modele) },
  })

  if (!modele) throw { status: 404, message: 'Modele introuvable' }

  const studentId = await ensureStudentExists(id_etudiant)

  const updated = await prisma.portfolio.upsert({
    where: { id_etudiant: studentId },
    update: {
      id_modele: modele.id_modele,
      theme: modele.theme || null,
      date_modification: new Date(),
    },
    create: {
      id_etudiant: studentId,
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
  const studentId = await ensureStudentExists(id_etudiant)

  const portfolio = await prisma.portfolio.upsert({
    where: { id_etudiant: studentId },
    update: {},
    create: {
      id_etudiant: studentId,
      date_modification: new Date(),
    },
    include: { modele: true },
  })

  return formatThemeForFrontend(portfolio.modele)
}

module.exports = {
  formatThemeForFrontend,
  getAllThemes,
  getThemeEtudiant,
  saveTheme,
}
