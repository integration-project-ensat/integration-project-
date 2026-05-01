const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const createBadge = (data) =>
  prisma.badge.create({
    data: normalizeBigIntFields(data, ['id_badge']),
  })

const findAllBadges = () =>
  prisma.badge.findMany({ include: { regles: true } })

const attribuerBadge = async (id_utilisateur, id_badge) => {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!profil) {
    throw new Error('Profil introuvable pour cet utilisateur')
  }

  return prisma.profilBadge.create({
    data: {
      id_profil: profil.id_profil,
      id_badge: toBigInt(id_badge),
      date_attribution: new Date(),
    },
  })
}

const findBadgesUser = async (id_utilisateur) => {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!profil) return []

  return prisma.profilBadge.findMany({
    where: { id_profil: profil.id_profil },
    include: { badge: true },
  })
}

module.exports = {
  createBadge,
  findAllBadges,
  attribuerBadge,
  findBadgesUser,
}
