import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const soumettreElement = (data) =>
  prisma.elementValide.create({
    data: { ...data, statut: 'en_attente', date_soumission: new Date() }
  })

export const validerElement = (id_element, validateur_id) =>
  prisma.elementValide.update({
    where: { id_element },
    data: { statut: 'valide', date_validation: new Date(), validateur_id }
  })

export const rejeterElement = (id_element, validateur_id) =>
  prisma.elementValide.update({
    where: { id_element },
    data: { statut: 'rejete', date_validation: new Date(), validateur_id }
  })

export const findElementsEnAttente = () =>
  prisma.elementValide.findMany({ where: { statut: 'en_attente' } })
