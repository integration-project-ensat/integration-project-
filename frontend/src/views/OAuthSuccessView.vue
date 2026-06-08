<template>
  <div class="loading-wrap">
    <p>Connexion Google en cours...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api.js'
import authService from '../services/auth.service.js'
import { useAuthStore } from '@/store/auth.js'

const router = useRouter()
const auth = useAuthStore()

function redirectByRole(role: string) {
  if (role === 'admin') return '/admin'
  if (role === 'teacher') return '/prof/dashboard'
  if (role === 'professional') return '/pro/dashboard'
  return '/student/dashboard'
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  if (!token) {
    router.push('/login')
    return
  }

  try {
    localStorage.setItem('token', token)
    const { data } = await api.get('/auth/me')
    const session = authService.persistSession(data?.data, token)
    auth.login(session.user, session.token, session.role)
    router.push(redirectByRole(session.role))
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    router.push('/login')
  }
})
</script>

<style scoped>
.loading-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
</style>
