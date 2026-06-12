const { prisma } = require('../models/prisma')

const fullName = (user) => `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim()

const initials = (name) => name
  .split(' ')
  .filter(Boolean)
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()

const timeAgo = (date) => {
  if (!date) return ''

  const diffMs = Date.now() - new Date(date).getTime()
  const minutes = Math.max(0, Math.floor(diffMs / 60000))

  if (minutes < 1) return "A l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours} h`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hier'
  return `Il y a ${days} j`
}

const splitPostContent = (content = '') => {
  const [firstLine, ...rest] = String(content).split(/\r?\n/)
  const title = firstLine?.trim() || 'Publication'
  const description = rest.join('\n').trim() || title

  return { title, description }
}

const getConnectionStatus = (connectionsByUser, currentUserId, targetUserId) => {
  if (!targetUserId || BigInt(currentUserId) === BigInt(targetUserId)) return 'SELF'
  return connectionsByUser.get(String(targetUserId)) ?? 'NONE'
}

const mapComment = (comment) => {
  const authorName = fullName(comment.auteur)

  return {
    id: comment.id_commentaire.toString(),
    authorId: comment.id_auteur.toString(),
    authorName,
    initials: initials(authorName),
    text: comment.contenu,
    time: timeAgo(comment.date),
    likeCount: 0,
    replies: [],
  }
}

const mapPost = (post, currentUserId, connectionsByUser) => {
  const author = post.auteur
  const authorName = fullName(author)
  const student = author?.etudiant
  const { title, description } = splitPostContent(post.contenu)
  const badges = student?.badges?.map((item) => item.badge?.nom).filter(Boolean) ?? []
  const technologies = post.collaborateurs?.map((item) => fullName(item.utilisateur)).filter(Boolean) ?? []
  const likeCount = post.reactions?.length ?? 0
  const repostCount = post._count?.reposts ?? 0
  const recommendationCount = student?.recommandations_recues?.length ?? 0
  const score = Number(student?.score_credibilite?.score_total ?? 0)

  return {
    id: post.id_poste.toString(),
    studentId: author?.id_utilisateur?.toString() ?? '',
    studentName: authorName || 'Utilisateur',
    initials: initials(authorName),
    school: student?.filiere || author?.role || 'Profil',
    time: timeAgo(post.date_creation),
    projectTitle: title,
    description,
    badges,
    technologies,
    github: student?.github_integration?.github_username
      ? `github.com/${student.github_integration.github_username}`
      : undefined,
    demo: post.image_url || undefined,
    repostedBy: undefined,
    repostCount,
    recommendationCount,
    likeCount,
    score,
    comments: (post.commentaires ?? []).map(mapComment),
    isPopular: likeCount + repostCount + recommendationCount >= 10,
    likedByMe: post.reactions?.some((reaction) => BigInt(reaction.id_auteur) === BigInt(currentUserId)) ?? false,
    repostedByMe: post.reposts?.some((repost) => BigInt(repost.id_auteur) === BigInt(currentUserId)) ?? false,
    connectionStatus: getConnectionStatus(connectionsByUser, currentUserId, author?.id_utilisateur),
    imageUrl: post.image_url || null,
  }
}

const feedService = {
  async getFeed(currentUserId, filters = {}) {
    const limit = Math.min(50, Math.max(1, Number(filters.limit) || 20))
    const page = Math.max(1, Number(filters.page) || 1)
    const skip = (page - 1) * limit
    const search = String(filters.search ?? '').trim()

    const where = {
      visibilite: { in: ['PUBLIC', 'ENSEIGNANTS'] },
      ...(search && {
        OR: [
          { contenu: { contains: search, mode: 'insensitive' } },
          { auteur: { nom: { contains: search, mode: 'insensitive' } } },
          { auteur: { prenom: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    }

    const [total, posts, connexions] = await Promise.all([
      prisma.poste.count({ where }),
      prisma.poste.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date_creation: 'desc' },
        include: {
          auteur: {
            select: {
              id_utilisateur: true,
              nom: true,
              prenom: true,
              role: true,
              etudiant: {
                select: {
                  filiere: true,
                  score_credibilite: { select: { score_total: true } },
                  github_integration: { select: { github_username: true } },
                  badges: {
                    select: { badge: { select: { nom: true } } },
                    take: 3,
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
              utilisateur: { select: { id_utilisateur: true, nom: true, prenom: true, role: true } },
            },
          },
          commentaires: {
            where: { statut: 'VALIDE' },
            include: {
              auteur: { select: { id_utilisateur: true, nom: true, prenom: true } },
            },
            orderBy: { date: 'asc' },
          },
          reactions: {
            select: { id_auteur: true, type: true },
          },
          reposts: {
            select: { id_auteur: true },
          },
          _count: { select: { reposts: true } },
        },
      }),
      prisma.connexion.findMany({
        where: {
          OR: [
            { demandeur_id: BigInt(currentUserId) },
            { destinataire_id: BigInt(currentUserId) },
          ],
        },
        select: {
          demandeur_id: true,
          destinataire_id: true,
          statut: true,
        },
      }),
    ])

    const connectionsByUser = new Map()
    connexions.forEach((connexion) => {
      const otherId = BigInt(connexion.demandeur_id) === BigInt(currentUserId)
        ? connexion.destinataire_id
        : connexion.demandeur_id
      connectionsByUser.set(otherId.toString(), connexion.statut)
    })

    return {
      data: posts.map((post) => mapPost(post, currentUserId, connectionsByUser)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  },
}

module.exports = feedService
