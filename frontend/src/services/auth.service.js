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

export default {
  async login(email, password) {
    const { data } = await api.post('/auth/seconnecter', { email: email.trim().toLowerCase(), mot_de_passe: password })

    const token = data.data?.token
    const user  = data.data?.user
    const role  = BACKEND_TO_FRONT_ROLE[user?.role]

    if (!role) {
      throw new Error(`Rôle inconnu : ${user?.role}`)
    }

    if (user) {
      user.role = role
    }

    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    return data
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
        if (payload[frontendKey] !== undefined && payload[frontendKey] !== '') {
          backendPayload[backendKey] = payload[frontendKey]
        }
      }
    }

    const { data } = await api.post('/auth/sinscrire', backendPayload)
    const role = BACKEND_TO_FRONT_ROLE[data.data?.user?.role]

    if (!role) {
      throw new Error(`Rôle inconnu : ${data.data?.user?.role}`)
    }

    localStorage.setItem('token', data.data?.token)
    localStorage.setItem('role', role)
    return data
  },
  startGoogleAuth() {
    const apiRoot = import.meta.env.VITE_API_BASE_URL || '/api'
    window.location.href = `${apiRoot.replace(/\/$/, '')}/auth/google`
  },
  async forgotPassword(email) {
    return api.post('/auth/mot-de-passe-oublie', { email })
  },

  async verifyCode(email, code) {
    return api.post('/auth/verifier-code', { email, code })
  },

  async resendCode(email) {
    return api.post('/auth/renvoyer-code', { email })
  },

  async resetPassword(payload) {
    return api.post('/auth/reinitialiser-mot-de-passe', {
      token: payload.token,
      nouveau_mot_de_passe: payload.newPassword,
      confirmation_mot_de_passe: payload.confirmPassword
    })
  },

  async logout() {
    try {
      await api.post('/auth/deconnecter')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('user')
    }
  }
}
