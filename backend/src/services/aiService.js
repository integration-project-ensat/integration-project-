const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

async function requestCareerRecommendation(profilePayload) {
  const response = await fetch(`${AI_SERVICE_URL}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profilePayload)
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message = errorBody.detail || `AI service error: ${response.status}`
    throw new Error(message)
  }

  return response.json()
}

module.exports = {
  requestCareerRecommendation
}
