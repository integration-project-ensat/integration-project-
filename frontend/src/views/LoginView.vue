<template>
  <AuthLayout>
    <div class="form-wrap">
      <h1>Bienvenue</h1>

      <form @submit.prevent="submit">
        <input v-model="email"    type="email"    placeholder="Adresse e-mail" />
        <div class="pass-block">
          <input v-model="password" type="password" placeholder="Mot de passe" />
          <RouterLink to="/forgot" class="forgot">Oubliez-vous le mot de passe?</RouterLink>
        </div>

        <p v-if="error" class="err">{{ error }}</p>

        <button type="submit" class="btn" :disabled="loading">
          <span v-if="!loading">Se connecter</span>
          <span v-else class="spin" />
        </button>
      </form>

      <p class="or"><strong>Ou inscrivez-vous via</strong></p>

      <div class="socials">
        <!-- GitHub -->
        <button class="s-btn gh" aria-label="GitHub">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
        </button>
        <!-- Google -->
        <button class="s-btn gg" aria-label="Google">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </button>
      </div>

      <p class="switch">
        Vous ne vous etes pas reinscrit auparavant?
        <RouterLink to="/signup">_s'inscrire</RouterLink>
      </p>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import authService from '../services/auth.service'

const router   = useRouter()
const email    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

async function submit() {
  error.value = ''
  if (!email.value || !password.value) { error.value = 'Champs requis'; return }
  loading.value = true
  try {
    await authService.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-wrap {
  width: 100%;
  max-width: 340px;
  margin: 0 auto;
}

h1 {
  font-family: var(--font-head);
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 32px;
  text-align: center;
}

form { display: flex; flex-direction: column; gap: 14px; }

input {
  width: 100%;
  background: var(--input-bg);
  border: 2px solid transparent;
  border-radius: var(--radius-pill);
  padding: 13px 20px;
  font-size: .87rem;
  color: var(--text-dark);
  transition: var(--ease);
}
input::placeholder { color: #aab2bf; }
input:focus { border-color: var(--purple); }

.pass-block { display: flex; flex-direction: column; gap: 5px; }

.forgot {
  font-size: .76rem;
  color: var(--error);
  padding-left: 6px;
}

.err {
  font-size: .8rem;
  color: var(--error);
  text-align: center;
}

.btn {
  width: 100%;
  background: var(--purple);
  color: white;
  font-size: .93rem;
  font-weight: 600;
  padding: 14px;
  border-radius: var(--radius-pill);
  transition: var(--ease);
  min-height: 48px;
  display: flex; align-items: center; justify-content: center;
}
.btn:hover:not(:disabled) {
  background: var(--purple-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(91,63,212,.32);
}
.btn:disabled { opacity: .6; cursor: not-allowed; }

/* spinner */
.spin {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.or {
  text-align: center;
  font-size: .82rem;
  color: var(--text-dark);
  margin: 22px 0 14px;
}

.socials { display: flex; justify-content: center; gap: 14px; margin-bottom: 22px; }

.s-btn {
  width: 46px; height: 46px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: var(--ease);
}
.s-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,.12); }
.s-btn.gh { background: #00bcd4; color: white; }
.s-btn.gg { background: #f5f5f5; }

.switch { text-align: center; font-size: .79rem; color: var(--text-muted); }
.switch a { color: var(--purple); font-weight: 600; }
.switch a:hover { text-decoration: underline; }
</style>