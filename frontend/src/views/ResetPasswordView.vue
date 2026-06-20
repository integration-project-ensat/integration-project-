<template>
  <div class="page">
    <div class="header">
      <div class="logo">
        <img src="@/assets/PheraCoreLogoPurple.svg" alt="PheraCore" height="32" />
        <span>heraCore</span>
      </div>
    </div>

    <div class="card">
      <img src="@/assets/PheraCoreLogoPurple.svg" alt="PheraCore" class="card-logo" width="48" height="48" />

      <h1>Reinitialiser votre passe</h1>
      <p class="subtitle">Choisissez un nouveau mot de passe pour votre compte</p>

      <form @submit.prevent="submit">
        <input v-model="form.email" type="email" placeholder="Adresse e-mail" />
        <input v-model="form.password" type="password" placeholder="Mot de passe" />
        <input v-model="form.confirmPassword" type="password" placeholder="Comfirmer le mot de passe" />

        <p v-if="error" class="err">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>

        <button type="submit" class="btn" :disabled="loading">
          <span v-if="!loading">Envoyer</span>
          <span v-else class="spin" />
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from '@/services/auth.service.js'

type ApiError = {
  response?: {
    data?: {
      errors?: Array<{ message?: string }>
      message?: string
    }
  }
}

const getApiErrorMessage = (e: unknown, fallback: string) => {
  const data = (e as ApiError).response?.data
  return data?.errors?.[0]?.message || data?.message || fallback
}

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const success = ref('')

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

onMounted(() => {
  const email = route.query.email
  if (typeof email === 'string' && email) {
    form.email = email
  }
})

async function submit() {
  error.value = ''
  success.value = ''

  if (!form.email || !form.password || !form.confirmPassword) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'Le mot de passe ne correspond pas.'
    return
  }

  loading.value = true
  try {
    success.value = 'Mot de passe réinitialisé !'
    await authService.resetPassword({
      token: '',
      newPassword: form.password,
      confirmPassword: form.confirmPassword
    })
    window.setTimeout(() => {
      router.push('/login')
    }, 50)
  } catch (e) {
    error.value = getApiErrorMessage(e, 'Une erreur est survenue.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  width: 100vw;
  background: #f0f0f5;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0px;
  font-family: var(--font-head);
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--purple);
}

.logo img {
  height: 50px;
}

.card {
  background: var(--white);
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 400px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, .08);
}

.card-logo {
  margin-bottom: 4px;
}

h1 {
  font-family: var(--font-head);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-dark);
  text-align: center;
}

.subtitle {
  font-size: .85rem;
  color: var(--text-gray);
  text-align: center;
  line-height: 1.6;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input {
  width: 100%;
  border: 2px solid var(--input-bg);
  border-radius: var(--radius-pill);
  padding: 13px 20px;
  font-size: .87rem;
  color: var(--text-dark);
  font-family: var(--font-body);
  transition: var(--ease);
}

input::placeholder {
  color: var(--text-gray);
}

input:focus {
  border-color: var(--purple);
  outline: none;
}

.err {
  font-size: .78rem;
  color: var(--error);
  padding-left: 6px;
}

.success {
  font-size: .78rem;
  color: #22c55e;
  padding-left: 6px;
}

.btn {
  width: 100%;
  background: var(--purple);
  color: var(--white);
  font-family: var(--font-head);
  font-size: .93rem;
  font-weight: 600;
  padding: 14px;
  border-radius: 50px 50px 0px 50px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--ease);
  margin-top: 4px;
}

.btn:hover:not(:disabled) {
  background: var(--purple-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(91, 63, 212, .32);
}

.btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.spin {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, .3);
  border-top-color: var(--white);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
