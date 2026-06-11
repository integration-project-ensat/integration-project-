<template>
  <div class="page">
    <div class="header">
      <div class="logo">
        <img src="@/assets/PheraCoreLogoPurple.svg" alt="PheraCore" height="36" />
        <span>heraCore</span>
      </div>
      <button class="theme-btn">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M7.01074 1.42676C3.87305 1.67578 1.40625 4.30078 1.40625 7.5C1.40625 10.8662 4.13379 13.5938 7.5 13.5938C8.47559 13.5938 9.39551 13.3652 10.2129 12.958C7.18359 12.2725 4.92188 9.56543 4.92188 6.32812C4.92188 4.40039 5.72461 2.66309 7.01074 1.42676ZM0 7.5C0 3.35742 3.35742 0 7.5 0C8.06836 0 8.625 0.0644531 9.16113 0.18457C9.45117 0.249023 9.66797 0.492187 9.70313 0.785156C9.73828 1.07812 9.58594 1.36523 9.31934 1.5C7.54395 2.38477 6.32813 4.21582 6.32813 6.32812C6.32813 9.30469 8.74219 11.7188 11.7188 11.7188C11.8652 11.7188 12.0088 11.7129 12.1523 11.7012C12.4482 11.6777 12.7266 11.8418 12.8496 12.1143C12.9727 12.3867 12.9082 12.7031 12.6943 12.9082C11.3467 14.2031 9.51563 15 7.5 15C3.35742 15 0 11.6426 0 7.5Z" fill="#111827"/>
        </svg>
      </button>
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

const router   = useRouter()
const route    = useRoute()
const email    = route.query.email as string || ''
const error    = ref('')
const success  = ref('')
const loading  = ref(false)
const countdown = ref(60)

const code   = reactive(['', '', '', '', '', ''])
const inputs = ref<HTMLInputElement[]>([])

// countdown timer
let timer: ReturnType<typeof setInterval>
onMounted(() => {
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

async function submit() {
  error.value = ''
  const fullCode = code.join('')
  if (fullCode.length < 6) { error.value = 'Entrez le code complet'; return }

  loading.value = true
  try {
    await authService.verifyCode(email, fullCode)
    success.value = 'Code vérifié !'
    setTimeout(() => {
      router.push('/dashboard')
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
