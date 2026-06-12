function getAiServiceUrls() {
  const configuredUrl = process.env.AI_SERVICE_URL?.trim()
  const productionDefault = 'http://ai-service:8000'
  const localDefault = 'http://localhost:8000'

  const candidates = [
    configuredUrl,
    process.env.NODE_ENV === 'production' ? productionDefault : localDefault,
    process.env.NODE_ENV === 'production' ? localDefault : productionDefault
  ]

  return [...new Set(candidates.filter(Boolean))]
}

async function requestCareerRecommendation(profilePayload) {
  const urls = getAiServiceUrls()
  let lastError = null

  for (const baseUrl of urls) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch(`${baseUrl}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
        signal: controller.signal
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        const message = errorBody.detail || `Erreur du service IA : ${response.status}`
        throw new Error(message)
      }

      return response.json()
    } catch (error) {
      lastError = error
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError || new Error("Le service IA est indisponible")
}

module.exports = {
  requestCareerRecommendation
}
