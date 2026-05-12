<template>
  <div class="page">
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

    <div class="card">
       <img src="@/assets/PheraCoreLogoPurple.svg" alt="PheraCore" class="card-logo" width="48" height="48" />

      <h1>Reinitialiser votre passe</h1>
      <p class="subtitle">Reinitislaisez votre mot de passe si vous l'avez oublie</p>

      <form @submit.prevent="submit">
        <input v-model="form.email"           type="email"    placeholder="Adresse e-mail" />
        <input v-model="form.password"        type="password" placeholder="Mot de passe" />
        <input v-model="form.confirmPassword" type="password" placeholder="Comfirmer le mot de passe" />

        <p v-if="error"   class="err">{{ error }}</p>
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
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router  = useRouter()
const error   = ref('')
const success = ref('')
const loading = ref(false)

const form = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

async function submit() {
  error.value = ''
  success.value = ''
  if (!form.email || !form.password || !form.confirmPassword) {
    error.value = 'Veuillez remplir tous les champs'; return
  }
  if (form.password !== form.confirmPassword) {
    error.value = 'Le mot de passe ne correspond pas.'; return
  }
  loading.value = true
  try {
    // await authService.resetPassword(form)
    success.value = 'Mot de passe réinitialisé !'
    setTimeout(() => router.push('/login'), 2000)
  } catch {
    error.value = 'Une erreur est survenue.'
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

.logo img{
    height: 50px;
}

.theme-btn {
  background: transparent;
  color: #999;
  font-size: 1.1rem;
}

.card {
  background: white;
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
input::placeholder { color: var(--text-gray); }
input:focus { border-color: var(--purple); outline: none; }

.err     { font-size: .78rem; color: var(--error); padding-left: 6px; }
.success { font-size: .78rem; color: #22c55e;      padding-left: 6px; }

.btn {
  width: 100%;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-size: .93rem;
  font-weight: 600;
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
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>