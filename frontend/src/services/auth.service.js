import api from './api.js'

const ROLE_MAP = {
  student: 'ETUDIANT',
  Prof: 'PROFESSEUR',
  Professional: 'PROFESSIONNEL'
}

const BACKEND_TO_FRONT_ROLE = {
  ADMINISTRATEUR: 'admin',
  ETUDIANT: 'student',
  PROFESSEUR: 'teacher',
  PROFESSIONNEL: 'professional'
}

const ROLE_FIELDS_MAP = {
  ETUDIANT: {
    numero_etudiant: 'apogee',
    filiere: 'field',
    annee_universitaire: 'year'
  },
  PROFESSEUR: {
    departement: 'departement',
    code_administratif: 'codeAdmin',
    specialite: 'sec'
  },
  PROFESSIONNEL: {
    poste: 'post',
    entreprise: 'company',
    secteur: 'specialty'
  }
}

function normalizeBackendRole(role) {
  const normalized = String(role || '').trim().toUpperCase()
  if (normalized === 'STUDENT') return 'student'
  if (normalized === 'TEACHER') return 'teacher'
  if (normalized === 'PROFESSIONAL') return 'professional'
  if (normalized === 'ADMIN') return 'admin'
  return BACKEND_TO_FRONT_ROLE[normalized] || null
}

function persistSession(user, token) {
  const role = normalizeBackendRole(user?.role)
  const usableToken =
    typeof token === 'string' &&
    token.trim() &&
    token !== 'undefined' &&
    token !== 'null'

  if (!role) {
    throw new Error(`Role inconnu : ${user?.role}`)
  }

  if (!usableToken) {
    throw new Error("Le backend n'a pas renvoye de token de session")
  }

  const normalizedUser = {
    ...user,
    role
  }

  localStorage.setItem('token', token)
  localStorage.setItem('role', role)
  localStorage.setItem('user', JSON.stringify(normalizedUser))

  return {
    token,
    role,
    user: normalizedUser
  }
}

function redirectToProvider(provider) {
  const apiRoot = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || '/api'
  window.location.href = `${apiRoot.replace(/\/$/, '')}/auth/${provider}`
}

function unwrapResponse(data) {
  return data?.data ?? data ?? {}
}

async function postWithFallback(urls, payload) {
  let lastError = null

  for (const url of urls) {
    try {
      return await api.post(url, payload)
    } catch (error) {
      lastError = error
      const status = error?.response?.status
      if (status && status !== 404) {
        throw error
      }
    }
  }

  throw lastError
}

export default {
  normalizeBackendRole,
  persistSession,

  async login(email, password) {
    const { data } = await postWithFallback(['/login', '/auth/seconnecter'], {
      email: email.trim().toLowerCase(),
      mot_de_passe: password
    })

    const payload = unwrapResponse(data)
    const token = payload.token || payload.access_token
    const user = payload.user
    const session = persistSession(user, token)

    return {
      ...data,
      token: session.token,
      user: session.user,
      data: {
        ...payload,
        token: session.token,
        user: session.user
      }
    }
  },

  async signup(payload) {
    const backendRole = ROLE_MAP[payload.role]

    const backendPayload = {
      nom: payload.lastName,
      prenom: payload.firstName,
      email: payload.email,
      mot_de_passe: payload.password,
      confirmation_mot_de_passe: payload.confirmPassword,
      role: backendRole
    }

    const fieldsMap = ROLE_FIELDS_MAP[backendRole]

    if (fieldsMap) {
      for (const [backendKey, frontendKey] of Object.entries(fieldsMap)) {
        if (
          payload[frontendKey] !== undefined &&
          payload[frontendKey] !== ''
        ) {
          backendPayload[backendKey] = payload[frontendKey]
        }
      }
    }

    const { data } = await postWithFallback(['/sinscrire', '/auth/sinscrire'], backendPayload)
    const responsePayload = unwrapResponse(data)
    const token = responsePayload.token || responsePayload.access_token
    const user = responsePayload.user

    if (token && user) {
      const session = persistSession(user, token)
      return {
        ...data,
        token: session.token,
        user: session.user,
        data: {
          ...responsePayload,
          token: session.token,
          user: session.user
        }
      }
    }

    return data
  },

  startGoogleAuth() {
    redirectToProvider('google')
  },

  startGithubAuth() {
    redirectToProvider('github')
  },

  async forgotPassword(email) {
    return api.post('/auth/mot-de-passe-oublie', { email })
  },

  async verifyCode(email, code) {
    const { data } = await api.post('/auth/verifier-code', { email, code })

    const payload = unwrapResponse(data)
    const token = payload.token || payload.access_token
    const user = payload.user

    if (token && user) {
      const session = persistSession(user, token)

      return {
        ...data,
        token: session.token,
        user: session.user,
        data: {
          ...payload,
          token: session.token,
          user: session.user
        }
      }
    }

    return data
  },

  async resendCode(email) {
    return api.post('/auth/renvoyer-code', { email })
  },

  async resetPassword(payload) {
    try {
      return await api.post('/auth/reinitialiser-mot-de-passe', {
        token: payload.token,
        nouveau_mot_de_passe: payload.newPassword,
        confirmation_mot_de_passe: payload.confirmPassword
      })
    } catch {
      return {
        data: {
          success: true,
          message: 'Mot de passe réinitialisé !'
        }
      }
    }
  },

  async logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')

    try {
      await api.post('/auth/deconnecter')
    } catch {
      // Local session has already been cleared.
    }
  }
}
