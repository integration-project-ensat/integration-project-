const { prisma, toBigInt } = require('../models/prisma')

const fullName = (user) => [user?.prenom, user?.nom].filter(Boolean).join(' ').trim()

const toInitials = (value) =>
  (value || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const csvSeparators = [',', ';', '\t']

const pickSeparator = (line = '') =>
  csvSeparators.reduce(
    (best, separator) => {
      const count = line.split(separator).length
      return count > best.count ? { separator, count } : best
    },
    { separator: ',', count: 0 },
  ).separator

const normalizeHeader = (value = '') =>
  value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const parseCsvRows = (buffer) => {
  const raw = buffer.toString('utf8').replace(/^\uFEFF/, '')
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) return []

  const separator = pickSeparator(lines[0])
  const headers = lines[0].split(separator).map(normalizeHeader)
  const apogeeIndex = headers.findIndex((header) =>
    ['numero_apogee', 'apogee', 'numero_etudiant', 'numero'].includes(header),
  )

  if (apogeeIndex === -1) {
    const error = new Error('Le fichier CSV doit contenir une colonne apogee, numero_apogee ou numero_etudiant')
    error.status = 400
    throw error
  }

  return lines.slice(1).map((line) => {
    const values = line.split(separator).map((value) => value.trim().replace(/^"|"$/g, ''))
    return values[apogeeIndex]
  }).filter(Boolean)
}

const mapAttachedStudent = (item) => {
  const studentUser = item.etudiant?.utilisateur
  const score = Number(item.etudiant?.score_credibilite?.score_total ?? 0)
  const recommendations = item.etudiant?._count?.recommandations_recues ?? 0

  return {
    id: item.etudiant?.id_utilisateur?.toString(),
    initials: toInitials(fullName(studentUser)),
    name: fullName(studentUser) || 'Étudiant inconnu',
    avatar: studentUser?.profil?.photo_profil || null,
    email: studentUser?.email || '',
    apogee: item.etudiant?.numero_etudiant || '',
    school: item.etudiant?.annee_universitaire || '—',
    field: item.etudiant?.filiere || '—',
    city: studentUser?.profil?.adresse || '—',
    score,
    recommendations,
    badges: (item.etudiant?.badges || []).map((badgeItem) => badgeItem.badge?.nom).filter(Boolean),
    source: item.source || 'MANUEL',
    attachedAt: item.date_ajout,
    profilePath: `/profile/student/${item.etudiant?.id_utilisateur}?from=prof`,
    portfolioPath: `/portfolio/${item.etudiant?.id_utilisateur}?from=prof`,
  }
}

const attachedInclude = {
  etudiant: {
    include: {
      utilisateur: {
        include: {
          profil: {
            select: {
              adresse: true,
              photo_profil: true,
            },
          },
        },
      },
      score_credibilite: {
        select: {
          score_total: true,
        },
      },
      badges: {
        include: {
          badge: {
            select: {
              nom: true,
            },
          },
        },
        take: 5,
      },
      _count: {
        select: {
          recommandations_recues: true,
        },
      },
    },
  },
}

const ensureStudentExists = async ({ studentId, numeroEtudiant }) => {
  let student = null

  if (studentId) {
    student = await prisma.etudiant.findUnique({
      where: { id_utilisateur: toBigInt(studentId) },
      include: {
        utilisateur: true,
      },
    })
  } else if (numeroEtudiant) {
    student = await prisma.etudiant.findUnique({
      where: { numero_etudiant: numeroEtudiant },
      include: {
        utilisateur: true,
      },
    })
  }

  if (!student || !student.utilisateur || student.utilisateur.role !== 'ETUDIANT') {
    const error = new Error('Étudiant introuvable')
    error.status = 404
    throw error
  }

  return student
}

const profStudentService = {
  async list(idProfesseur) {
    const items = await prisma.professeurEtudiant.findMany({
      where: { id_professeur: toBigInt(idProfesseur) },
      include: attachedInclude,
      orderBy: { date_ajout: 'desc' },
    })

    return items.map(mapAttachedStudent)
  },

  async isAttached(idProfesseur, idEtudiant) {
    const existing = await prisma.professeurEtudiant.findUnique({
      where: {
        id_professeur_id_etudiant: {
          id_professeur: toBigInt(idProfesseur),
          id_etudiant: toBigInt(idEtudiant),
        },
      },
    })

    return Boolean(existing)
  },

  async attach(idProfesseur, payload = {}, source = 'MANUEL') {
    const student = await ensureStudentExists(payload)
    const professorId = toBigInt(idProfesseur)

    const existing = await prisma.professeurEtudiant.findUnique({
      where: {
        id_professeur_id_etudiant: {
          id_professeur: professorId,
          id_etudiant: student.id_utilisateur,
        },
      },
    })

    if (existing) {
      const attached = await prisma.professeurEtudiant.findUnique({
        where: {
          id_professeur_id_etudiant: {
            id_professeur: professorId,
            id_etudiant: student.id_utilisateur,
          },
        },
        include: attachedInclude,
      })

      return {
        created: false,
        student: mapAttachedStudent(attached),
      }
    }

    const created = await prisma.professeurEtudiant.create({
      data: {
        id_professeur: professorId,
        id_etudiant: student.id_utilisateur,
        source,
      },
      include: attachedInclude,
    })

    return {
      created: true,
      student: mapAttachedStudent(created),
    }
  },

  async detach(idProfesseur, idEtudiant) {
    await prisma.professeurEtudiant.deleteMany({
      where: {
        id_professeur: toBigInt(idProfesseur),
        id_etudiant: toBigInt(idEtudiant),
      },
    })
  },

  async importCsv(idProfesseur, fileBuffer) {
    const numeros = [...new Set(parseCsvRows(fileBuffer).map((value) => value.trim()).filter(Boolean))]

    if (!numeros.length) {
      const error = new Error('Aucun numéro APOGEE trouvé dans le fichier CSV')
      error.status = 400
      throw error
    }

    const students = await prisma.etudiant.findMany({
      where: {
        numero_etudiant: { in: numeros },
      },
      select: {
        id_utilisateur: true,
        numero_etudiant: true,
      },
    })

    const byNumero = new Map(students.map((student) => [student.numero_etudiant, student]))
    const professorId = toBigInt(idProfesseur)
    const summary = {
      totalRows: numeros.length,
      added: [],
      alreadyLinked: [],
      missing: [],
    }

    for (const numero of numeros) {
      const student = byNumero.get(numero)

      if (!student) {
        summary.missing.push(numero)
        continue
      }

      const result = await this.attach(professorId, { studentId: student.id_utilisateur }, 'CSV')

      if (result.created) {
        summary.added.push(result.student)
      } else {
        summary.alreadyLinked.push(numero)
      }
    }

    return summary
  },
}

module.exports = profStudentService
