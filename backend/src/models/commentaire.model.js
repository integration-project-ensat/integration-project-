const { normalizeBigIntFields, prisma, toBigInt } = require('./prisma')

const COMMENTAIRE_ID_FIELDS = ['id_commentaire', 'id_auteur', 'id_portfolio', 'id_poste']

const createCommentaire = (data) =>
  prisma.commentaire.create({
    data: normalizeBigIntFields(data, COMMENTAIRE_ID_FIELDS),
  })

const findCommentairesPortfolio = (id_portfolio) =>
  prisma.commentaire.findMany({
    where: { id_portfolio: toBigInt(id_portfolio) },
    include: { auteur: { select: { nom: true, prenom: true } } },
    orderBy: { date: 'desc' },
  })

const findCommentairesProjet = findCommentairesPortfolio

const findCommentairesPublication = (id_poste) =>
  prisma.commentaire.findMany({
    where: { id_poste: toBigInt(id_poste) },
    include: { auteur: { select: { nom: true, prenom: true } } },
    orderBy: { date: 'desc' },
  })

const deleteCommentaire = (id_commentaire) =>
  prisma.commentaire.delete({ where: { id_commentaire: toBigInt(id_commentaire) } })

module.exports = {
  createCommentaire,
  findCommentairesPortfolio,
  findCommentairesProjet,
  findCommentairesPublication,
  deleteCommentaire,
}
