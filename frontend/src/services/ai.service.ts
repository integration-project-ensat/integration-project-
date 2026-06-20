import api from './api'

export async function analyzePortfolio(
  portfolioData: any
) {
  const { data } = await api.post(
    '/ai/analyze',
    portfolioData
  )

  return data
}

export async function generateProfessionalSummary(
  profileData: any
) {
  const { data } = await api.post(
    '/ai/generate-summary',
    profileData
  )

  return data
}

export async function generateReadme(
  projectData: any
) {
  const { data } = await api.post(
    '/ai/generate-readme',
    projectData
  )

  return data
}

export async function improveProjectDescription(
  description: string
) {
  const { data } = await api.post(
    '/ai/improve-project',
    { description }
  )

  return data
}