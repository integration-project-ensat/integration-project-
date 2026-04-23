import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createBadge = (data) =>
  prisma.badge.create({ data })

export const findAllBadges = () =>
  prisma.badge.findMany({ include: { regle: true } })

export const attribuerBadge = (id_utilisateur, id_badge) =>
  prisma.utilisateurBadge.create({
    data: { id_utilisateur, id_badge, date_attribution: new Date() }
  })

export const findBadgesUser = (id_utilisateur) =>
  prisma.utilisateurBadge.findMany({
    where: { id_utilisateur },
    include: { badge: true }
  })
