import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user:  null,   // { id, email, name }
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
      this.user  = user
      this.token = token
      this.role  = role
      localStorage.setItem('token', token)
      localStorage.setItem('role',  role)
    },

    logout() {
      this.user  = null
      this.token = null
      this.role  = null
      localStorage.removeItem('token')
      localStorage.removeItem('role')
    },

    restoreSession() {
      const token = localStorage.getItem('token')
      const role  = localStorage.getItem('role')
      if (token && role) {
        this.token = token
        this.role  = role
      }
    }
  }
})
