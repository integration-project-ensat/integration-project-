<template>
  <div class="page">
    <div class="header">
      <div class="logo">
        <img src="@/assets/PheraCoreLogoPurple.svg" alt="PheraCore" height="36" />
        <span>heraCore</span>
      </div>
    </div>

    <div class="card">
      <img src="@/assets/PheraCoreLogoPurple.svg" alt="PheraCore" class="card-logo" width="52" height="52" />

      <h1>Vérifier votre e-mail</h1>
      <p class="subtitle">
        Un code à 6 chiffres a été envoyé à <strong>{{ email }}</strong>. Entrez-le ci-dessous.
      </p>

      <form @submit.prevent="submit">
        <!-- 6 cases de code -->
        <div class="code-inputs">
          <input
            v-for="(_, i) in 6"
            :key="i"
            :ref="el => inputs[i] = el as HTMLInputElement" 
            v-model="code[i]"
            type="text"
            maxlength="1"
            class="code-box"
            @input="onInput(i)"
            @keydown.backspace="onBackspace(i)"
            @paste="onPaste"
          />
        </div>

        <p v-if="error"   class="err">{{ error }}</p>
        <p v-if="success" class="suc">{{ success }}</p>

        <button type="submit" class="btn" :disabled="loading || code.join('').length < 6">
          <span v-if="!loading">Vérifier</span>
          <span v-else class="spin" />
        </button>
      </form>

      <p class="resend">
        Vous n'avez pas reçu le code ?
        <button class="resend-btn" @click="resend" :disabled="countdown > 0">
          {{ countdown > 0 ? `Renvoyer dans ${countdown}s` : 'Renvoyer' }}
        </button>
      </p>

      <RouterLink to="/login" class="back">< Retour à la connexion</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import authService from '@/services/auth.service.js'
import { useAuthStore } from '@/store/auth.js'

type ApiError = {
  response?: {
    data?: {
      errors?: Array<{ message?: string }>
      message?: string
    }
  }
}

type PendingSignup = {
  email: string
  password: string
  role: string
}

const getApiErrorMessage = (e: unknown, fallback: string) => {
  const data = (e as ApiError).response?.data
  return data?.errors?.[0]?.message || data?.message || fallback
}

const router   = useRouter()
const route    = useRoute()
const auth     = (() => {
  const activePinia = getActivePinia()
  if (activePinia) return useAuthStore()

  const pinia = createPinia()
  setActivePinia(pinia)
  return useAuthStore(pinia)
})()
const email    = route.query.email as string || ''
const error    = ref('')
const success  = ref('')
const loading  = ref(false)
const countdown = ref(60)

const code   = reactive(['', '', '', '', '', ''])
const inputs = ref<HTMLInputElement[]>([])

function clearLocalSession() {
  auth.logout()
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
}

// countdown timer
let timer: ReturnType<typeof setInterval>
onMounted(() => {
  clearLocalSession()
  inputs.value[0]?.focus()
  startCountdown()
})
onUnmounted(() => clearInterval(timer))

function startCountdown() {
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}

function onInput(i: number) {
  // passe au champ suivant automatiquement
  if (code[i] && i < 5) {
    inputs.value[i + 1]?.focus()
  }
}

function onBackspace(i: number) {
  if (!code[i] && i > 0) {
    code[i - 1] = ''
    inputs.value[i - 1]?.focus()
  }
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6)
  if (!text) return
  text.split('').forEach((char, i) => { code[i] = char })
  inputs.value[Math.min(text.length, 5)]?.focus()
}

function redirectByRole(role: string | null | undefined) {
  router.push('/dashboard')
}

function getPendingSignup(): PendingSignup | null {
  const raw = sessionStorage.getItem('pendingSignup')
  if (!raw) return null

  try {
    return JSON.parse(raw) as PendingSignup
  } catch {
    sessionStorage.removeItem('pendingSignup')
    return null
  }
}

async function submit() {
  error.value = ''
  const fullCode = code.join('')
  if (fullCode.length < 6) { error.value = 'Entrez le code complet'; return }

  loading.value = true
  try {
    const response = await authService.verifyCode(email, fullCode)
    success.value = 'Code vérifié !'
    setTimeout(async () => {
      const token = response?.data?.token
      const user = response?.data?.user
      const role = user?.role || localStorage.getItem('role')

      if (token && user && role) {
        auth.login(user, token, role)
        sessionStorage.removeItem('pendingSignup')
        redirectByRole(auth.role)
        return
      }

      const pendingSignup = getPendingSignup()
      const shouldAutoLogin =
        pendingSignup &&
        pendingSignup.email === email.trim().toLowerCase() &&
        (
          pendingSignup.role === 'student' ||
          pendingSignup.role === 'Prof' ||
          pendingSignup.role === 'Professional'
        )

      if (shouldAutoLogin) {
        const loginData = await authService.login(pendingSignup.email, pendingSignup.password)
        const loginUser = loginData?.data?.user
        const loginRole = loginUser?.role || localStorage.getItem('role')

        auth.login(loginUser, loginData?.data?.token, loginRole)
        sessionStorage.removeItem('pendingSignup')
        redirectByRole(auth.role)
        return
      }

      sessionStorage.removeItem('pendingSignup')
      router.push({ path: '/reset-password', query: { email } })
    }, 1000)
  } catch(e) {
    error.value = getApiErrorMessage(e, 'Code incorrect ou expiré.')
  } finally {
    loading.value = false
  }
}                          // ← ferme submit()

async function resend() {
  await authService.resendCode(email)
  startCountdown()
  success.value = 'Code renvoyé !'
  setTimeout(() => success.value = '', 3000)
}                          // ← ferme resend()
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

.logo img{
    height: 50px;
}

.card {
  background: var(--white);
  border-radius: 16px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  box-shadow: 0 8px 32px rgba(0,0,0,.08);
}

.card-logo { margin-bottom: 4px; }

h1 {
  font-family: var(--font-head);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-dark);
  text-align: center;
}

.subtitle {
  font-size: .85rem;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.6;
  max-width: 300px;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* 6 cases de code */
.code-inputs {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.code-box {
  width: 48px;
  height: 56px;
  text-align: center;
  font-family: var(--font-head);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-dark);
  background: var(--input-bg);
  border: 2px solid transparent;
  border-radius: 10px;
  transition: var(--ease);
}

.code-box:focus {
  border-color: var(--purple);
  background: var(--white);
  outline: none;
}

.err { font-size: .8rem; color: var(--error); }
.suc { font-size: .8rem; color: #22c55e; }

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
  display: flex; align-items: center; justify-content: center;
  transition: var(--ease);
}
.btn:hover:not(:disabled) {
  background: var(--purple-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(91,63,212,.32);
}
.btn:disabled { opacity: .5; cursor: not-allowed; }

.spin {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: var(--white);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.resend {
  font-size: .82rem;
  color: var(--text-muted);
  text-align: center;
}

.resend-btn {
  background: transparent;
  color: var(--purple);
  font-weight: 600;
  font-size: .82rem;
  cursor: pointer;
  border: none;
  font-family: var(--font-body);
}
.resend-btn:disabled {
  color: var(--text-muted);
  cursor: not-allowed;
}

.back {
  font-size: .82rem;
  color: var(--text-muted);
}
.back:hover { color: var(--purple); }
</style>
