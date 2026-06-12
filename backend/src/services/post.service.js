const { prisma, toBigInt } = require('../models/prisma')

const includePost = {
  auteur: {
    select: {
      id_utilisateur: true,
      nom: true,
      prenom: true,
      role: true,
      profil: {
        select: {
          photo_profil: true,
          adresse: true,
          bio: true,
        },
      },
      etudiant: {
        select: {
          filiere: true,
          badges: { include: { badge: true } },
          competences: {
            include: {
              competence: {
                select: { nom: true },
              },
            },
          },
          score_credibilite: {
            select: { score_total: true },
          },
          recommandations_recues: {
            where: { statut: 'VALIDE' },
            select: { id_recommandation: true },
          },
        },
      },
    },
  },
  collaborateurs: {
    include: {
      utilisateur: {
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          role: true,
        },
      },
    },
  },
  commentaires: {
    where: { statut: 'VALIDE' },
    include: {
      auteur: {
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          profil: {
            select: {
              photo_profil: true,
            },
          },
        },
      },
    },
    orderBy: { date: 'desc' },
  },
  reactions: {
    include: { auteur: { select: { id_utilisateur: true, nom: true, prenom: true } } },
  },
  reposts: {
    include: {
      auteur: { select: { id_utilisateur: true, nom: true, prenom: true } },
    },
    orderBy: { date: 'desc' },
  },
  _count: { select: { reposts: true } },
}

const parseCollaborateurs = (value) => {
  if (!value) return []
  const list = Array.isArray(value) ? value : JSON.parse(value)
  return [...new Set(list.map((id) => BigInt(id)))]
}

const formatImageUrl = (file) => {
  if (!file) return undefined
  return `/uploads/posts/${file.filename}`
}

const assertCanModify = (post, utilisateur) => {
  if (utilisateur.role === 'ADMINISTRATEUR') return
  if (post.id_auteur !== BigInt(utilisateur.id_utilisateur)) {
    throw { statusCode: 403, message: 'Acces refuse' }
  }
}

const enrichWithReactionCounts = async (post) => {
  if (!post) return post
  const counts = await prisma.reaction.groupBy({
    by: ['type'],
    where: { id_poste: post.id_poste },
    _count: { type: true },
  })

    return {
    ...post,
    compteurs_reactions: counts.reduce((acc, item) => {
      acc[item.type] = item._count.type
      return acc
    }, {}),
    compteur_reposts: post._count?.reposts || 0,
  }
}

const postService = {
  async findAll(utilisateur, filters = {}) {
    const where = {}
    if (filters.id_auteur) where.id_auteur = BigInt(filters.id_auteur)
    if (filters.visibilite) where.visibilite = filters.visibilite

    if (utilisateur?.role !== 'ADMINISTRATEUR') {
      const visibilityConditions = [
        { visibilite: 'PUBLIC' },
        { id_auteur: BigInt(utilisateur.id_utilisateur) },
      ]

      if (utilisateur?.role === 'PROFESSEUR') {
        visibilityConditions.push({ visibilite: 'ENSEIGNANTS' })
      }

      where.AND = [
        {
          OR: visibilityConditions,
        },
      ]
    }

    const posts = await prisma.poste.findMany({
      where,
      include: includePost,
      orderBy: { date_creation: 'desc' },
    })

    return Promise.all(posts.map(enrichWithReactionCounts))
  },

  async findById(id, utilisateur) {
    const post = await prisma.poste.findUnique({
      where: { id_poste: BigInt(id) },
      include: includePost,
    })
    if (!post) return null

    if (utilisateur?.role !== 'ADMINISTRATEUR') {
      const isOwner = post.id_auteur === BigInt(utilisateur.id_utilisateur)
      const canSeeTeacherOnly =
        post.visibilite === 'ENSEIGNANTS' && utilisateur?.role === 'PROFESSEUR'
      const canSeePublic = post.visibilite === 'PUBLIC'

      if (!isOwner && !canSeeTeacherOnly && !canSeePublic) {
        return null
      }
    }

    return enrichWithReactionCounts(post)
  },

  async addComment(id, auteurId, contenu) {
    const post = await prisma.poste.findUnique({ where: { id_poste: BigInt(id) } })
    if (!post) return null

    return prisma.commentaire.create({
      data: {
        id_poste: BigInt(id),
        id_auteur: BigInt(auteurId),
        contenu,
        statut: 'VALIDE',
        date: new Date(),
      },
      include: {
        auteur: {
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            profil: {
              select: {
                photo_profil: true,
              },
            },
          },
        },
      },
    })
  },

  async create(data, file, auteurId) {
    const collaborateurs = parseCollaborateurs(data.collaborateurs).filter((id) => id !== BigInt(auteurId))
    const imageUrl = formatImageUrl(file)

    const post = await prisma.poste.create({
      data: {
        id_auteur: BigInt(auteurId),
        contenu: data.contenu,
        visibilite: data.visibilite || 'PUBLIC',
        ...(imageUrl && { image_url: imageUrl }),
        collaborateurs: {
          create: collaborateurs.map((id) => ({ id_utilisateur: id })),
        },
      },
      include: includePost,
    })

    return enrichWithReactionCounts(post)
  },

  async update(id, data, file, utilisateur) {
    const post = await prisma.poste.findUnique({ where: { id_poste: BigInt(id) } })
    if (!post) return null
    assertCanModify(post, utilisateur)

    const imageUrl = formatImageUrl(file)
    const shouldSyncCollaborateurs = data.collaborateurs !== undefined
    const collaborateurs = shouldSyncCollaborateurs
      ? parseCollaborateurs(data.collaborateurs).filter((collaborateurId) => collaborateurId !== post.id_auteur)
      : []

    const updated = await prisma.$transaction(async (tx) => {
      if (shouldSyncCollaborateurs) {
        await tx.posteCollaborateur.deleteMany({ where: { id_poste: post.id_poste } })
        if (collaborateurs.length) {
          await tx.posteCollaborateur.createMany({
            data: collaborateurs.map((collaborateurId) => ({
              id_poste: post.id_poste,
              id_utilisateur: collaborateurId,
            })),
            skipDuplicates: true,
          })
        }
      }

      return tx.poste.update({
        where: { id_poste: post.id_poste },
        data: {
          ...(data.contenu !== undefined && { contenu: data.contenu }),
          ...(data.visibilite && { visibilite: data.visibilite }),
          ...(imageUrl && { image_url: imageUrl }),
        },
        include: includePost,
      })
    })

    return enrichWithReactionCounts(updated)
  },

  async delete(id, utilisateur) {
    const post = await prisma.poste.findUnique({ where: { id_poste: BigInt(id) } })
    if (!post) return null
    assertCanModify(post, utilisateur)

    return prisma.poste.delete({ where: { id_poste: post.id_poste } })
  },

  async reagir(id, auteurId, type = 'JAIME') {
    const post = await prisma.poste.findUnique({ where: { id_poste: BigInt(id) } })
    if (!post) return null

    await prisma.reaction.upsert({
      where: {
        id_auteur_id_poste: {
          id_auteur: BigInt(auteurId),
          id_poste: BigInt(id),
        },
      },
      update: { type },
      create: {
        id_auteur: BigInt(auteurId),
        id_poste: BigInt(id),
        type,
      },
    })

    return this.findById(id, { id_utilisateur: auteurId, role: null })
  },

  async supprimerReaction(id, auteurId) {
    const post = await prisma.poste.findUnique({ where: { id_poste: BigInt(id) } })
    if (!post) return null

    await prisma.reaction.deleteMany({
      where: {
        id_auteur: BigInt(auteurId),
        id_poste: BigInt(id),
      },
    })

    return this.findById(id, { id_utilisateur: auteurId, role: null })
  },

  async repost(id, auteurId) {
    const post = await prisma.poste.findUnique({ where: { id_poste: BigInt(id) } })
    if (!post) return null

    await prisma.repost.upsert({
      where: {
        id_auteur_id_poste: {
          id_auteur: BigInt(auteurId),
          id_poste: BigInt(id),
        },
      },
      update: {},
      create: {
        id_auteur: BigInt(auteurId),
        id_poste: BigInt(id),
      },
    })

    return this.findById(id, { id_utilisateur: auteurId, role: null })
  },

  async supprimerRepost(id, auteurId) {
    const post = await prisma.poste.findUnique({ where: { id_poste: BigInt(id) } })
    if (!post) return null

    await prisma.repost.deleteMany({
      where: {
        id_auteur: BigInt(auteurId),
        id_poste: BigInt(id),
      },
    })

    return this.findById(id, { id_utilisateur: auteurId, role: null })
  },
}

module.exports = postService
