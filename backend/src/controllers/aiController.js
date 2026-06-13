const { requestCareerRecommendation } = require('../services/aiService')
const { buildStudentAiProfile } = require('../services/aiProfile.service')

const allowedCareers = [
  'Web Developer',
  'DevOps',
  'Cybersecurity',
  'Data Science',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Cloud Engineer',
  'AI Engineer',
  'Mobile Developer',
  'UI/UX Designer'
]

function ensureArray(value) {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function validatePayload(payload) {
  if (!payload.targetCareer || !String(payload.targetCareer).trim()) {
    return `Le métier cible est requis. Exemples : ${allowedCareers.join(', ')}`
  }
  return null
}

function hasProfileData(payload) {
  return [
    payload.skills,
    payload.projects,
    payload.technologies,
    payload.badges,
    payload.stages
  ].some((items) => items.length > 0)
}

async function getCareerRecommendation(req, res) {
  const requestedPayload = {
    targetCareer: req.body.targetCareer,
    skills: ensureArray(req.body.skills),
    projects: ensureArray(req.body.projects),
    technologies: ensureArray(req.body.technologies),
    badges: ensureArray(req.body.badges),
    stages: ensureArray(req.body.stages)
  }

  const validationError = validatePayload(requestedPayload)
  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    })
  }

  try {
    let payload = null

    payload = await buildStudentAiProfile(
      req,
      requestedPayload.targetCareer,
      req.body.studentId
    )

    if (!payload && hasProfileData(requestedPayload)) {
      payload = {
        ...requestedPayload,
        student: {
          ...(req.body.student || {}),
          source: req.body.student?.source || 'exemple'
        }
      }
    }

    if (!payload) {
      return res.status(404).json({
        success: false,
        message: "Aucun profil étudiant trouvé dans la base de données pour l'analyse IA"
      })
    }

    const recommendation = await requestCareerRecommendation(payload)
    return res.status(200).json({
      success: true,
      profileSource: payload,
      data: recommendation
    })
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: "Le service IA est indisponible ou n'a pas pu analyser le profil",
      details: error.message
    })
  }
}

module.exports = {
  getCareerRecommendation
}
