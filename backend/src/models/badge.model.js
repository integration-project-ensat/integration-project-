const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const createBadge = (data) =>
  prisma.badge.create({
    data: normalizeBigIntFields(data, ['id_badge']),
  })

const findAllBadges = () =>
  prisma.badge.findMany({ include: { regles: true } })

const attribuerBadge = async (id_utilisateur, id_badge) => {
  const etudiant = await prisma.etudiant.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!etudiant) {
    throw new Error('Etudiant introuvable pour cet utilisateur')
  }

  return prisma.profilBadge.upsert({
    where: {
      id_etudiant_id_badge: {
        id_etudiant: etudiant.id_utilisateur,
        id_badge: toBigInt(id_badge),
      },
    },
    update: { date_attribution: new Date() },
    create: {
      id_etudiant: etudiant.id_utilisateur,
      id_badge: toBigInt(id_badge),
      date_attribution: new Date(),
    },
  })
}

const findBadgesUser = async (id_utilisateur) => {
  const etudiant = await prisma.etudiant.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!etudiant) return []

  return prisma.profilBadge.findMany({
    where: { id_etudiant: etudiant.id_utilisateur },
    include: { badge: true },
  })
}

module.exports = {
  createBadge,
  findAllBadges,
  attribuerBadge,
  findBadgesUser,
}
