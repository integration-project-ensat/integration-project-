import { defineStore } from 'pinia'

function normalizeUser(user) {
  if (!user) return null
  const name = user.name || [user.prenom, user.nom].filter(Boolean).join(' ').trim()
  return {
    ...user,
    id: user.id ?? user.id_utilisateur ?? null,
    name: name || null
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
      this.user  = normalizedUser
      this.token = token
      this.role  = role
      localStorage.setItem('token', token)
      localStorage.setItem('role',  role)
      localStorage.setItem('user',  JSON.stringify(normalizedUser))
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
      const role  = localStorage.getItem('role')
      const storedUser = localStorage.getItem('user')

      if (!isUsableToken(token)) {
        localStorage.removeItem('token')
        return
      }

      if (token && role) {
        this.token = token
        this.role  = role

        if (storedUser) {
          try {
            this.user = normalizeUser(JSON.parse(storedUser))
          } catch {
            this.user = null
          }
        }
      }
    }
  }
})
