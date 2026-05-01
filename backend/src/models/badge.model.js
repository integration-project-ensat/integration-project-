import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

export const createBadge = (data) =>
  prisma.badge.create({
    data: normalizeBigIntFields(data, ['id_badge']),
  })

export const findAllBadges = () =>
  prisma.badge.findMany({ include: { regles: true } })

export const attribuerBadge = async (id_utilisateur, id_badge) => {
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

export const findBadgesUser = async (id_utilisateur) => {
  const profil = await prisma.profil.findUnique({
    where: { id_utilisateur: toBigInt(id_utilisateur) },
  })

  if (!profil) return []

  return prisma.profilBadge.findMany({
    where: { id_profil: profil.id_profil },
    include: { badge: true },
  })
}
