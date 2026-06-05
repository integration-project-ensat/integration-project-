<template>
  <AuthLayout>
    <div class="form-wrap">
      <h1>S'inscrire</h1>

      <form @submit.prevent="submit">
        <div class="row">
          <input v-model="form.lastName" type="text" placeholder="Nom" />
          <input v-model="form.firstName" type="text" placeholder="Prenom" />
        </div>

        <input v-model="form.email" type="email" placeholder="Saisir votre e-mail" />
        <input v-model="form.password" type="password" placeholder="Saisir une mot de passe" />
        <input v-model="form.confirmPassword" type="password" placeholder="Comfirmer le mot de passe" />

        <div class="row row-last">
          <div class="dropdown" :class="{ open: roleOpen }">
            <button type="button" class="dropdown-btn" @click="roleOpen = !roleOpen">
              <span :class="{ placeholder: !selectedRoleLabel }">
                {{ selectedRoleLabel || 'Determiner le role' }}
              </span>
              <span class="chevron"><svg width="10" height="13" viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_280_523)">
<path d="M4.00096 8.81754C4.29109 9.11332 4.76685 9.1179 5.06263 8.82777L8.84859 5.11408C9.14437 4.82395 9.14896 4.34819 8.85882 4.05241C8.56869 3.75663 8.09293 3.75205 7.79715 4.04218L4.54596 7.23131L1.3568 3.98246C1.06667 3.68668 0.590913 3.68209 0.295135 3.97222C-0.000643947 4.26236 -0.00522906 4.73812 0.284903 5.03389L3.99859 8.81986L4.00096 8.81754Z" fill="#7F7F7F"/>
</g>
<defs>
<clipPath id="clip0_280_523">
<rect width="9" height="12" fill="white" transform="translate(0.115644) rotate(0.552169)"/>
</clipPath>
</defs>
</svg></span>
            </button>

            <ul v-if="roleOpen" class="dropdown-menu">
              <li
                v-for="role in roles"
                :key="role.value"
                class="dropdown-item"
                @click="selectRole(role.value)"
              >
                {{ role.label }}
              </li>
            </ul>
          </div>

          <button type="submit" class="btn" :disabled="loading">
            <span v-if="!loading">S'inscrire</span>
            <span v-else class="spin" />
          </button>
        </div>

        <template v-if="form.role === 'student'">
          <input v-model="form.apogee" type="text" placeholder="APOGEE" />
          <input v-model="form.field" type="text" placeholder="Filière" />
          <input v-model="form.year" type="text" placeholder="Année d'étude" />
        </template>

        <template v-if="form.role === 'Prof'">
          <input v-model="form.departement" type="text" placeholder="Département" />
          <input v-model="form.codeAdmin" type="text" placeholder="Code administration" />
          <input v-model="form.sec" type="url" placeholder="Specialité" />
        </template>

        <template v-if="form.role === 'Professional'">
          <input v-model="form.post" type="text" placeholder="Post" />
          <input v-model="form.company" type="text" placeholder="Entreprise" />
          <input v-model="form.specialty" type="url" placeholder="Secteur" />
        </template>

        <p v-if="error" class="err">{{ error }}</p>
      </form>

      <p class="or"><strong>Ou inscrivez-vous via</strong></p>

      <div class="socials">
        <button type="button" class="s-btn gh" aria-label="GitHub"><svg width="29" height="27" viewBox="0 0 29 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.4999 0C6.49287 0 0 6.1968 0 13.8418C0 19.9577 4.15466 25.1459 9.9159 26.9764C10.6403 27.1048 10.9064 26.6762 10.9064 26.3106C10.9064 25.9805 10.8929 24.8901 10.8867 23.7335C6.8528 24.5708 6.0016 22.1004 6.0016 22.1004C5.34201 20.5005 4.39165 20.075 4.39165 20.075C3.07583 19.2159 4.49081 19.2338 4.49081 19.2338C5.94661 19.3312 6.71353 20.6602 6.71353 20.6602C8.00677 22.7759 10.1056 22.1643 10.933 21.8109C11.0632 20.9162 11.4389 20.3054 11.8536 19.9597C8.63299 19.6102 5.24717 18.4231 5.24717 13.1193C5.24717 11.6081 5.81383 10.3733 6.74138 9.40374C6.59059 9.05533 6.09428 7.6475 6.88161 5.7409C6.88161 5.7409 8.09898 5.36888 10.8699 7.15973C12.0267 6.85281 13.2674 6.69855 14.4999 6.69328C15.7317 6.69855 16.973 6.85236 18.1321 7.15927C20.8996 5.36842 22.1155 5.74044 22.1155 5.74044C22.9048 7.64681 22.4084 9.05487 22.2579 9.40328C23.1876 10.3729 23.7502 11.6076 23.7502 13.1188C23.7502 18.4352 20.3581 19.6056 17.1293 19.9485C17.6497 20.3781 18.1131 21.2206 18.1131 22.5118C18.1131 24.3639 18.0963 25.8544 18.0963 26.3103C18.0963 26.6787 18.3575 27.1103 19.0923 26.9744C24.8501 25.142 29 19.9554 29 13.8418C28.9998 6.19726 22.5076 0 14.4999 0Z" fill="white"/>
          </svg>
        </button>
        <button
          class="s-btn gg"
          aria-label="Google"
          type="button"
          @click="startGoogleLogin"
        >
          <svg width="26" height="28" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.2678 11.6032H25.7927C25.9309 12.3909 26 13.1433 26 13.8604C26 16.4115 25.476 18.6892 24.4279 20.6936C23.3798 22.698 21.8855 24.2645 19.9448 25.3931C18.0042 26.5217 15.7785 27.086 13.2678 27.086C11.4596 27.086 9.73776 26.7304 8.10233 26.0191C6.46689 25.3079 5.05604 24.3468 3.86977 23.1359C2.6835 21.9251 1.74197 20.485 1.04518 18.8156C0.348394 17.1462 0 15.3887 0 13.543C0 11.6973 0.348394 9.93976 1.04518 8.2704C1.74197 6.60103 2.6835 5.16091 3.86977 3.95004C5.05604 2.73916 6.46689 1.77811 8.10233 1.06686C9.73776 0.355621 11.4596 0 13.2678 0C16.7229 0 19.6886 1.18149 22.1648 3.54446L18.5542 7.08891C17.1375 5.68994 15.3754 4.99045 13.2678 4.99045C11.7821 4.99045 10.4086 5.37252 9.14751 6.13667C7.88638 6.90081 6.88726 7.93829 6.15017 9.24909C5.41307 10.5599 5.04452 11.9912 5.04452 13.543C5.04452 15.0948 5.41307 16.5261 6.15017 17.8369C6.88726 19.1477 7.88638 20.1852 9.14751 20.9493C10.4086 21.7135 11.7821 22.0955 13.2678 22.0955C14.2698 22.0955 15.1911 21.9545 16.0319 21.6723C16.8726 21.3902 17.5637 21.0375 18.105 20.6143C18.6463 20.1911 19.1185 19.7091 19.5216 19.1683C19.9247 18.6275 20.2213 18.1161 20.4113 17.6341C20.6013 17.1521 20.7309 16.6936 20.8 16.2586H13.2678V11.6032Z" fill="white"/>
          </svg></button>
      </div>

      <p class="switch">
        Vous ne vous etes pas inscrit auparavant?
        <RouterLink to="/login">_se connecter</RouterLink>
      </p>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import authService from '../services/auth.service.js'

function startGoogleLogin() {
  window.location.href = '/api/auth/google'
}

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

const router  = useRouter()
const error   = ref('')
const loading = ref(false)
const roleOpen = ref(false)

const roles = [
  { label: 'Étudiant', value: 'student' },
  { label: 'Professeur', value: 'Prof' },
  { label: 'Professionel', value: 'Professional' }
]

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
  apogee: '',
  field: '',
  year: '',
  departement: '',
  codeAdmin: '',
  sec: '',
  specialty: '',
  post: '',
  company: ''
})

const selectedRoleLabel = computed(() => {
  return roles.find((role) => role.value === form.role)?.label || ''
})

function selectRole(value: string) {
  form.role = value
  roleOpen.value = false
}

async function submit() {
  error.value = ''

  const { firstName, lastName, email, password, confirmPassword, role } = form

  if (!firstName || !lastName || !email || !password || !role) {
    error.value = 'Veuillez remplir tous les champs'
    return
  }

  if (password !== confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  loading.value = true

  try {
    await authService.signup({ ...form })
    console.log('email avant push:', form.email) // ← ajoute ici
    router.push({ path: '/verify-code', query: { email: form.email } })
 } catch(e) {
    error.value = getApiErrorMessage(e, 'Une erreur est survenue.')
  } finally {
    loading.value = false  // ← ajouter ceci
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
  margin-bottom: 40px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  display: flex;
  gap: 12px;
}

input {
  width: 100%;
  background: var(--input-bg);
  border: 2px solid transparent;
  border-radius: var(--radius-pill);
  padding: 12px 20px;
  font-size: .85rem;
  color: var(--text-dark);
  font-family: var(--font-body);
  transition: var(--ease);
}

input::placeholder {
  color: var(--text-gray);
}

input:focus {
  border-color: var(--purple);
}

.row-last {
  align-items: center;
}

.dropdown {
  position: relative;
  flex: 1;
}

.dropdown-btn {
  width: 100%;
  min-height: 44px;
  background: var(--input-bg);
  border: 2px solid transparent;
  border-radius: var(--radius-pill);
  padding: 12px 38px 12px 20px;
  color: var(--text-dark);
  font-family: var(--font-body);
  font-size: .85rem;
  text-align: left;
  transition: var(--ease);
}

.dropdown.open .dropdown-btn {
  border-color: var(--purple);
}

.placeholder {
  color: var(--text-gray);
}

.chevron {
  position: absolute;
  right: 18px;
  top: 50%;
  color: #7f7f7f;
  pointer-events: none;
  transform: translateY(-50%);
  transition: transform .2s ease;
}

.dropdown.open .chevron {
  transform: translateY(-50%) rotate(180deg);
}

.chevron svg {
  display: block;
}

.dropdown-menu {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  z-index: 20;
  list-style: none;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 18px 35px rgba(17, 24, 39, .14);
}

.dropdown-item {
  padding: 11px 14px;
  border-radius: 10px;
  color: var(--text-gray);
  font-family: var(--font-body);
  font-size: .85rem;
  cursor: pointer;
  transition: var(--ease);
}

.dropdown-item:hover {
  background: var(--input-bg);
  color: var(--text-dark);
}

.btn {
  background: var(--purple);
  color: white;
  font-size: .9rem;
  font-weight: 600;
  font-family: var(--font-head);
  padding: 12px 22px;
  border-radius: 100px 180px 0 100px;
  white-space: nowrap;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--ease);
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
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, .3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.err {
  font-size: .8rem;
  color: var(--error);
  text-align: center;
}

.or {
  text-align: center;
  font-size: .82rem;
  color: var(--text-dark);
  margin: 18px 0 14px;
}

.socials {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-bottom: 20px;
}

.s-btn {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--blue-w);
  color: white;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}


.switch a:hover { text-decoration: underline; }


.switch {
  text-align: center;
  font-size: .79rem;
  color: var(--text-muted);
}

.switch a {
  color: var(--purple);
  font-weight: 600;
}
</style>
