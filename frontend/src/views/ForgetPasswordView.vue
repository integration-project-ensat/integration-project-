<template>
  <div class="page">
    <!-- header -->
    <div class="header">
      <div class="logo">
        <img src="@/assets/PheraCoreLogoPurple.svg" alt="PheraCore" height="32"/>
        <span>heraCore</span>
      </div>
      <button class="theme-btn">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.01074 1.42676C3.87305 1.67578 1.40625 4.30078 1.40625 7.5C1.40625 10.8662 4.13379 13.5938 7.5 13.5938C8.47559 13.5938 9.39551 13.3652 10.2129 12.958C7.18359 12.2725 4.92188 9.56543 4.92188 6.32812C4.92188 4.40039 5.72461 2.66309 7.01074 1.42676ZM0 7.5C0 3.35742 3.35742 0 7.5 0C8.06836 0 8.625 0.0644531 9.16113 0.18457C9.45117 0.249023 9.66797 0.492187 9.70313 0.785156C9.73828 1.07812 9.58594 1.36523 9.31934 1.5C7.54395 2.38477 6.32813 4.21582 6.32813 6.32812C6.32813 9.30469 8.74219 11.7188 11.7188 11.7188C11.8652 11.7188 12.0088 11.7129 12.1523 11.7012C12.4482 11.6777 12.7266 11.8418 12.8496 12.1143C12.9727 12.3867 12.9082 12.7031 12.6943 12.9082C11.3467 14.2031 9.51563 15 7.5 15C3.35742 15 0 11.6426 0 7.5Z" fill="#111827"/>
        </svg>
      </button>
    </div>

    <!-- carte -->
    <div class="card">
      <img src="@/assets/PheraCoreLogoPurple.svg" alt="PheraCore" class="card-logo" width="48" height="48" />

      <h1>Mot de passe oublie?</h1>
      <p class="subtitle">Saisissez votre adresse e-mail et nous vous enverrons un lien pour reinitialiser votre mot de passe</p>

      <form @submit.prevent="submit">
        <input v-model="email" type="email" placeholder="Entrer votre e-mail" />
        <p v-if="error" class="err">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>
        <button type="submit" class="btn" :disabled="loading">
          <span v-if="!loading">Envoyer</span>
          <span v-else class="spin" />
        </button>
      </form>

      <RouterLink to="/login" class="back">Retour a se connecter ></RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
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

const email   = ref('')
const error   = ref('')
const success = ref('')
const loading = ref(false)
const router = useRouter()

async function submit() {
  error.value = ''
  success.value = ''
  if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
    error.value = 'Nous ne trouvons pas votre e-mail.'
    return
  }
  loading.value = true
  try {
    await authService.forgotPassword(email.value)
    success.value = 'Lien envoyé ! Vérifiez votre boîte mail.'

    router.push({ path: '/reset-password', query: { email: email.value } })
 } catch(e) {
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
  background: #eef0f6;
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

.theme-btn {
  background: transparent;
  font-size: 1.1rem;
  color: #999;

}

/* carte */
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
  color: var(--text-gray);
  text-align: center;
  line-height: 1.6;
  max-width: 280px;
  padding-left: 15px;
  padding-right: 15px;
  margin-bottom: 15px;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
input::placeholder { color: var(--text-gray);}
input:focus { border-color: var(--purple); outline: none; }

.err     { font-size: .78rem; color: var(--error); padding-left: 6px;}
.success { font-size: .78rem; color: #22c55e; padding-left: 6px; }

.btn {
  width: 100%;
  background: var(--purple);
  color: var(--white);
  font-family: var(--font-head);
  font-size: .93rem;
  font-weight: 700;
  padding: 14px;
  border-radius: 50px 50px 0px 50px;
  min-height: 48px;
  display: flex; align-items: center; justify-content: center;
  transition: var(--ease);
  margin-top: 4px;
}

.btn:hover:not(:disabled) {
  background: var(--purple-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(91,63,212,.32);
}
.btn:disabled { opacity: .6; cursor: not-allowed; }

.spin {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: var(--white);
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.back {
  font-size: .82rem;
  color: var(--text-gray);
  margin-top: 4px;
}
.back:hover { color: var(--purple); }
</style>
