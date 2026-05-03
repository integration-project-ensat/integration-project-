<template>
  <AuthLayout>
    <div class="form-wrap">
      <h1>S'inscrire</h1>

      <form @submit.prevent="submit">
        <!-- ligne Nom / Prénom -->
        <div class="row">
          <input v-model="form.lastName"  type="text" placeholder="Nom" />
          <input v-model="form.firstName" type="text" placeholder="Prenom" />
        </div>

        <input v-model="form.email"           type="email"    placeholder="Saisir votre e-mail" />
        <input v-model="form.password"        type="password" placeholder="Saisir une mot de passe" />
        <input v-model="form.confirmPassword" type="password" placeholder="Comfirmer le mot de passe" />

        <!-- ligne rôle + bouton -->
        <div class="row row-last">
          <div class="select-wrap">
            <select v-model="form.role" :class="{ ph: !form.role }">
              <option value="" disabled>Determiner le role</option>
              <option value="student">Étudiant</option>
              <option value="company">Entreprise</option>
              <option value="mentor">Mentor</option>
            </select>
            <span class="chevron">▾</span>
          </div>
          <button type="submit" class="btn" :disabled="loading">
            <span v-if="!loading">S'inscrire</span>
            <span v-else class="spin" />
          </button>
        </div>

        <p v-if="error" class="err">{{ error }}</p>
      </form>

      <p class="or"><strong>Ou inscrivez-vous via</strong></p>

      <div class="socials">
        <button class="s-btn gh" aria-label="GitHub">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
        </button>
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
        Vous ne vous etes pas inscrit auparavant?
        <RouterLink to="/login">_se connecter</RouterLink>
      </p>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import authService from '../services/auth.service.js'

const router  = useRouter()
const error   = ref('')
const loading = ref(false)

const form = reactive({
  firstName: '', lastName: '',
  email: '', password: '', confirmPassword: '',
  role: ''
})

async function submit() {
  error.value = ''
  const { firstName, lastName, email, password, confirmPassword, role } = form
  if (!firstName || !lastName || !email || !password || !role) {
    error.value = 'Veuillez remplir tous les champs'; return
  }
  if (password !== confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'; return
  }
  loading.value = true
  try {
    await authService.signup({ firstName, lastName, email, password, role })
    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.response?.data?.message || "Erreur lors de l'inscription"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-wrap {
  width: 100%;
  max-width: 370px;
  margin: 0 auto;
}

h1 {
  font-family: var(--font-head);
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 26px;
}

form { display: flex; flex-direction: column; gap: 12px; }

.row { display: flex; gap: 12px; }

input, select {
  width: 100%;
  background: var(--input-bg);
  border: 2px solid transparent;
  border-radius: var(--radius-pill);
  padding: 12px 20px;
  font-size: .85rem;
  color: var(--text-dark);
  font-family: var(--font-body);
  transition: var(--ease);
  appearance: none;
}
input::placeholder { color: #aab2bf; }
select.ph          { color: #aab2bf; }
input:focus, select:focus { border-color: var(--purple); }

/* ligne rôle + bouton */
.row-last { align-items: center; gap: 12px; }

.select-wrap {
  flex: 1;
  position: relative;
}
.select-wrap select { padding-right: 36px; }
.chevron {
  position: absolute;
  right: 16px; top: 50%;
  transform: translateY(-50%);
  color: #aab2bf;
  pointer-events: none;
  font-size: .8rem;
}

.btn {
  background: var(--purple);
  color: white;
  font-size: .9rem;
  font-weight: 600;
  padding: 12px 22px;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  min-height: 44px;
  display: flex; align-items: center; justify-content: center;
  transition: var(--ease);
}
.btn:hover:not(:disabled) {
  background: var(--purple-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(91,63,212,.32);
}
.btn:disabled { opacity: .6; cursor: not-allowed; }

.spin {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.err { font-size: .8rem; color: var(--error); text-align: center; }

.or {
  text-align: center;
  font-size: .82rem;
  color: var(--text-dark);
  margin: 18px 0 14px;
}

.socials { display: flex; justify-content: center; gap: 14px; margin-bottom: 20px; }

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