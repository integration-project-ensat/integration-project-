import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const createProjet = (data) =>
  prisma.projet.create({ data })

export const findProjetsUser = (id_utilisateur) =>
  prisma.projet.findMany({
    where: { id_utilisateur },
    include: { technologies: { include: { technologie: true } } }
  })

export const findProjetById = (id_element) =>
  prisma.projet.findUnique({
    where: { id_element },
    include: {
      technologies: { include: { technologie: true } },
      commentaires: true,
      notes: true
    }
  })

export const updateProjet = (id_element, data) =>
  prisma.projet.update({ where: { id_element }, data })

export const deleteProjet = (id_element) =>
  prisma.projet.delete({ where: { id_element } })

export const ajouterTechnologieProjet = (id_projet, id_technologie) =>
  prisma.projetTechnologie.create({ data: { id_projet, id_technologie } })
