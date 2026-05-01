import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const PROJET_ID_FIELDS = ['id_projet', 'id_etudiant', 'id_professeur']

export const createProjet = (data) =>
  prisma.projet.create({
    data: normalizeBigIntFields(data, PROJET_ID_FIELDS),
  })

export const findProjetsUser = (id_utilisateur) =>
  prisma.projet.findMany({
    where: { id_etudiant: toBigInt(id_utilisateur) },
    include: {
      technologies: { include: { technologie: true } },
      professeur: { include: { utilisateur: true } },
    },
  })

export const findProjetById = (id_projet) =>
  prisma.projet.findUnique({
    where: { id_projet: toBigInt(id_projet) },
    include: {
      technologies: { include: { technologie: true } },
      etudiant: { include: { utilisateur: true } },
      professeur: { include: { utilisateur: true } },
    },
  })

export const updateProjet = (id_projet, data) =>
  prisma.projet.update({
    where: { id_projet: toBigInt(id_projet) },
    data: normalizeBigIntFields(data, PROJET_ID_FIELDS),
  })

export const deleteProjet = (id_projet) =>
  prisma.projet.delete({ where: { id_projet: toBigInt(id_projet) } })

export const ajouterTechnologieProjet = (id_projet, id_technologie) =>
  prisma.projetTechnologie.create({
    data: {
      id_projet: toBigInt(id_projet),
      id_technologie: toBigInt(id_technologie),
    },
  })
