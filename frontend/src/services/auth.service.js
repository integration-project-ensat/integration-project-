import api from './api.js'

const ROLE_MAP = {
  student: 'ETUDIANT',
  Prof: 'PROFESSEUR',
  Professional: 'PROFESSIONNEL'
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
    const { data } = await api.post('/auth/seconnecter', { email, mot_de_passe:password})
    localStorage.setItem('token', data.token)
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
    localStorage.setItem('token', data.token)
    return data
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
    // payload: { email, code, newPassword }
    return api.post('/auth/reinitialiser-mot-de-passe', {
      token:payload.token,
      nouveau_mot_de_passe:payload.newPassword,
      confirmation_mot_de_passe:payload.confirmPassword
    })
  },

  logout() {
    localStorage.removeItem('token')
  }
}