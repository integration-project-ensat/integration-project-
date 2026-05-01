import { normalizeBigIntFields, prisma, toBigInt } from './prisma.js'

const PUBLICATION_ID_FIELDS = ['id_publication', 'id_etudiant']
const REACTION_ID_FIELDS = ['id_reaction', 'id_auteur', 'id_publication']
const COMMENTAIRE_ID_FIELDS = ['id_commentaire', 'id_auteur', 'id_publication']

export const createPublication = (id_etudiant, data) =>
  prisma.publication.create({
    data: {
      ...normalizeBigIntFields(data, PUBLICATION_ID_FIELDS),
      id_etudiant: toBigInt(id_etudiant),
    },
  })

export const findPublicationsEtudiant = (id_etudiant) =>
  prisma.publication.findMany({
    where: { id_etudiant: toBigInt(id_etudiant) },
    include: {
      etudiant: { include: { utilisateur: true } },
      commentaires: { include: { auteur: true } },
      reactions: { include: { auteur: true } },
    },
    orderBy: { date_creation: 'desc' },
  })

export const findPublicationById = (id_publication) =>
  prisma.publication.findUnique({
    where: { id_publication: toBigInt(id_publication) },
    include: {
      etudiant: { include: { utilisateur: true } },
      commentaires: { include: { auteur: true } },
      reactions: { include: { auteur: true } },
    },
  })

export const updatePublication = (id_publication, data) =>
  prisma.publication.update({
    where: { id_publication: toBigInt(id_publication) },
    data: normalizeBigIntFields(data, PUBLICATION_ID_FIELDS),
  })

export const deletePublication = (id_publication) =>
  prisma.publication.delete({ where: { id_publication: toBigInt(id_publication) } })

export const commenterPublication = (id_publication, id_auteur, contenu) =>
  prisma.commentaire.create({
    data: {
      id_publication: toBigInt(id_publication),
      id_auteur: toBigInt(id_auteur),
      contenu,
      date: new Date(),
    },
  })

export const reagirPublication = (id_publication, id_auteur, type = 'JAIME') =>
  prisma.reaction.upsert({
    where: {
      id_auteur_id_publication: {
        id_auteur: toBigInt(id_auteur),
        id_publication: toBigInt(id_publication),
      },
    },
    update: { type },
    create: normalizeBigIntFields(
      {
        id_publication,
        id_auteur,
        type,
      },
      REACTION_ID_FIELDS,
    ),
  })

export const supprimerReactionPublication = (id_publication, id_auteur) =>
  prisma.reaction.delete({
    where: {
      id_auteur_id_publication: {
        id_auteur: toBigInt(id_auteur),
        id_publication: toBigInt(id_publication),
      },
    },
  })
