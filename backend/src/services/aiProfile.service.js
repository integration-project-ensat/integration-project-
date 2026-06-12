const jwt = require('jsonwebtoken')
const prisma = require('../../prisma/client')
const { getAuthTokenFromRequest } = require('../utils/authCookie')

function unique(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))]
}

function extractGithubLanguages(langages) {
  if (!langages) return []
  if (Array.isArray(langages)) return langages
  if (typeof langages === 'object') return Object.keys(langages)
  if (typeof langages === 'string') return langages.split(/[,\s]+/)
  return []
}

function getUserIdFromToken(req) {
  const token = getAuthTokenFromRequest(req)
  if (!token || !process.env.JWT_SECRET) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
    return decoded.userId ? BigInt(decoded.userId) : null
  } catch {
    return null
  }
}

async function findStudentForAnalysis(req, requestedStudentId) {
  const tokenUserId = getUserIdFromToken(req)
  const studentId = requestedStudentId || tokenUserId

  if (studentId) {
    const student = await getStudentProfileData(studentId)
    if (student) return student
  }

  const firstStudent = await prisma.etudiant.findFirst({
    select: { id_utilisateur: true },
    orderBy: { id_utilisateur: 'asc' }
  })

  if (!firstStudent) return null
  return getStudentProfileData(firstStudent.id_utilisateur)

}

async function getStudentProfileData(studentId) {
  return prisma.etudiant.findUnique({
    where: { id_utilisateur: BigInt(studentId) },
    include: {
      utilisateur: {
        include: {
          profil: true
        }
      },
      competences: {
        include: {
          competence: true
        }
      },
      diplomes: true,
      projets: {
        include: {
          technologies: {
            include: {
              technologie: true
            }
          }
        }
      },
      stages: true,
      activites: true,
      attestations: {
        include: {
          element: true
        }
      },
      badges: {
        include: {
          badge: true
        }
      },
      github_integration: {
        include: {
          depots: true
        }
      },
      score_credibilite: true,
      lettres_recommandation: true,
      recommandations_recues: true,
      portfolio: true
    }
  })
}

function buildAiPayloadFromStudent(targetCareer, student) {
  const skills = unique([
    ...student.competences.map((item) => item.competence?.nom),
    student.filiere,
    student.annee_universitaire,
    student.portfolio?.objectif_pro,
    student.score_credibilite?.niveau
  ])

  const projects = unique([
    ...student.projets.flatMap((project) => [
      project.titre,
      project.description,
      project.type,
      project.role,
      project.resultats
    ]),

    ...student.activites.flatMap((activity) => [
      activity.nom,
      activity.type,
      activity.description
    ]),
    ...student.diplomes.flatMap((diploma) => [
      diploma.titre_diplome,
      diploma.domaine,
      diploma.etablissement
    ]),

    ...(student.github_integration?.depots?.map((repo) => repo.nom_depot) ?? [])
  ])

  const technologies = unique([
    ...student.projets.flatMap((project) =>
      project.technologies.map((item) => item.technologie?.nom)
    ),
    ...student.stages.flatMap((stage) => [
      stage.technologies,
      stage.poste,
      stage.missions
    ]),
    ...student.attestations.flatMap((attestation) => [
      attestation.type,
      attestation.organisme,
      attestation.titre
    ]),
    ...(student.github_integration?.depots?.flatMap((repo) => extractGithubLanguages(repo.langages)) ?? [])
  ])

  const badges = unique(student.badges.map((item) => item.badge?.nom))

  const stages = unique(
    [
      ...student.stages.flatMap((stage) => [
        stage.entreprise,
        stage.poste,
        stage.missions,
        stage.technologies,
        stage.statut
      ]),
      ...student.recommandations_recues.flatMap((recommendation) => [
        recommendation.role_auteur,
        recommendation.message
      ])
    ]
  )

  return {
    targetCareer,
    skills,
    projects,
    technologies,
    badges,
    stages,
    student: {
      id: student.id_utilisateur.toString(),
      name: `${student.utilisateur?.prenom ?? ''} ${student.utilisateur?.nom ?? ''}`.trim(),
      email: student.utilisateur?.email,
      filiere: student.filiere,
      anneeUniversitaire: student.annee_universitaire,
      objectifPro: student.portfolio?.objectif_pro ?? null,
      score: student.score_credibilite?.score_total?.toString() ?? null,
      source: 'base de données'
    }
  }
}

async function buildStudentAiProfile(req, targetCareer, requestedStudentId) {
  const student = await findStudentForAnalysis(req, requestedStudentId)
  if (!student) return null
  return buildAiPayloadFromStudent(targetCareer, student)
}

module.exports = {
  buildStudentAiProfile
}
