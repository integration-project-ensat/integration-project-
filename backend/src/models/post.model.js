const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const POSTE_ID_FIELDS = ['id_poste', 'id_etudiant']
const REACTION_ID_FIELDS = ['id_reaction', 'id_auteur', 'id_poste']

const createPublication = (id_etudiant, data) =>
  prisma.poste.create({
    data: {
      ...normalizeBigIntFields(data, POSTE_ID_FIELDS),
      id_etudiant: toBigInt(id_etudiant),
    },
  })

const findPublicationsEtudiant = (id_etudiant) =>
  prisma.poste.findMany({
    where: { id_etudiant: toBigInt(id_etudiant) },
    include: {
      etudiant: { include: { utilisateur: true } },
      commentaires: { include: { auteur: true } },
      reactions: { include: { auteur: true } },
    },
    orderBy: { date_creation: 'desc' },
  })

const findPublicationById = (id_poste) =>
  prisma.poste.findUnique({
    where: { id_poste: toBigInt(id_poste) },
    include: {
      etudiant: { include: { utilisateur: true } },
      commentaires: { include: { auteur: true } },
      reactions: { include: { auteur: true } },
    },
  })

const updatePublication = (id_poste, data) =>
  prisma.poste.update({
    where: { id_poste: toBigInt(id_poste) },
    data: normalizeBigIntFields(data, POSTE_ID_FIELDS),
  })

const deletePublication = (id_poste) =>
  prisma.poste.delete({ where: { id_poste: toBigInt(id_poste) } })

const commenterPublication = (id_poste, id_auteur, contenu) =>
  prisma.commentaire.create({
    data: {
      id_poste: toBigInt(id_poste),
      id_auteur: toBigInt(id_auteur),
      contenu,
      date: new Date(),
    },
  })

const reagirPublication = (id_poste, id_auteur, type = 'JAIME') =>
  prisma.reaction.upsert({
    where: {
      id_auteur_id_poste: {
        id_auteur: toBigInt(id_auteur),
        id_poste: toBigInt(id_poste),
      },
    },
    update: { type },
    create: normalizeBigIntFields(
      {
        id_poste,
        id_auteur,
        type,
      },
      REACTION_ID_FIELDS,
    ),
  })

const supprimerReactionPublication = (id_poste, id_auteur) =>
  prisma.reaction.delete({
    where: {
      id_auteur_id_poste: {
        id_auteur: toBigInt(id_auteur),
        id_poste: toBigInt(id_poste),
      },
    },
  })

module.exports = {
  createPublication,
  findPublicationsEtudiant,
  findPublicationById,
  updatePublication,
  deletePublication,
  commenterPublication,
  reagirPublication,
  supprimerReactionPublication,
}
