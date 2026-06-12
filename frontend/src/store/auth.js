import { defineStore } from 'pinia'
import { resolveBackendAsset } from '../utils/backendAsset'

function pickAvatar(user) {
  return (
    resolveBackendAsset(user.avatar) ||
    resolveBackendAsset(user.photo_profil) ||
    resolveBackendAsset(user.profil?.photo_profil) ||
    ''
  )
}

function normalizeUser(user) {
  if (!user) return null
  const name = user.name || [user.prenom, user.nom].filter(Boolean).join(' ').trim()
  return {
    ...user,
    id: user.id ?? user.id_utilisateur ?? null,
    name: name || null,
    avatar: pickAvatar(user)
  }
}

function isUsableToken(token) {
  return (
    typeof token === 'string' &&
    token.trim() &&
    token !== 'undefined' &&
    token !== 'null'
  )
}

function normalizeRole(role) {
  const value = String(role || '').trim()
  if (!value) return null

  const upperValue = value.toUpperCase()
  const roleMap = {
    ADMIN: 'admin',
    ADMINISTRATEUR: 'admin',
    STUDENT: 'student',
    ETUDIANT: 'student',
    TEACHER: 'teacher',
    PROF: 'teacher',
    PROFESSEUR: 'teacher',
    PROFESSIONAL: 'professional',
    PROFESSIONNEL: 'professional'
  }

  return roleMap[upperValue] || value.toLowerCase()
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user:  null,   // { id, id_utilisateur, email, name }
    token: null,   // JWT string
    role:  null    // 'student' | 'teacher' | 'admin'
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin:         (state) => state.role === 'admin',
    isTeacher:       (state) => state.role === 'teacher',
    isStudent:       (state) => state.role === 'student'
  },

  actions: {
    login(user, token, role) {
      if (!isUsableToken(token)) {
        throw new Error("Le backend n'a pas renvoye de token de session")
      }

      const normalizedUser = normalizeUser(user)
      const normalizedRole = normalizeRole(role || normalizedUser?.role)

      this.user  = normalizedUser
      this.token = token
      this.role  = normalizedRole
      localStorage.setItem('token', token)
      localStorage.setItem('role', normalizedRole || '')
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...normalizedUser,
          role: normalizedRole
        })
      )
    },

    logout() {
      this.user  = null
      this.token = null
      this.role  = null
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('user')
    },

    restoreSession() {
      const token = localStorage.getItem('token')
      const role  = normalizeRole(localStorage.getItem('role'))
      const storedUser = localStorage.getItem('user')

      if (!isUsableToken(token)) {
        localStorage.removeItem('token')
        return
      }

      if (token && role) {
        this.token = token
        this.role  = role
        localStorage.setItem('role', role)

        if (storedUser) {
          try {
            this.user = {
              ...normalizeUser(JSON.parse(storedUser)),
              role
            }
          } catch {
            this.user = null
          }
        }
      }
    },

    async validateSession() {
      if (!isUsableToken(this.token || localStorage.getItem('token'))) {
        this.logout()
        return false
      }

      try {
        const { default: api } = await import('../services/api.js')
        const { data } = await api.get('/auth/me')
        const user = normalizeUser(data?.data)
        const role = normalizeRole(user?.role || data?.data?.role || this.role)

        this.user = {
          ...user,
          role
        }
        this.role = role
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('role', role || '')
        return true
      } catch {
        this.logout()
        return false
      }
    }
  }
})
