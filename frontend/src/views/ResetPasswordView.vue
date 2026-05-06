<template>
  <div class="page">
    <div class="header">
      <div class="logo">
         <img src="@/assets/PheraCoreLogoPurple.svg" alt="PheraCore" height="32"/>
        <span>heraCore</span>
      </div>
      <button class="theme-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
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
  background: var(--input-bg);
  border: 2px solid transparent;
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