const { prisma, toBigInt } = require('../models/prisma')

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

module.exports = { getLettres, getLettreById, updateVisibilite }
