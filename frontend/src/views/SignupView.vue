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
              <option value="Prof">Professeur</option>
              <option value="Professional">Professionel</option>
            </select>
            <span class="chevron">▾</span>
          </div>
          <button type="submit" class="btn" :disabled="loading">
            <span v-if="!loading">S'inscrire</span>
            <span v-else class="spin" />
          </button>
        </div>

        <!-- ← CHAMPS SELON LE RÔLE ICI -->
        <template v-if="form.role === 'student'">
          <input v-model="form.apogee" type="text" placeholder="APOGEE" />
          <input v-model="form.field"      type="text" placeholder="Filière" />
          <input v-model="form.year"       type="text" placeholder="Année d'étude" />
        </template>

        <template v-if="form.role === 'Prof'">
          <input v-model="form.departement" type="text" placeholder="Département" />
          <input v-model="form.codeAdmin"      type="text" placeholder="Code administration" />
          <input v-model="form.sec"     type="url"  placeholder="Secteur" />
        </template>

        <template v-if="form.role === 'Professional'">
          <input v-model="form.post"  type="text" placeholder="Post" />
          <input v-model="form.company" type="text" placeholder="Entreprise" />
          <input v-model="form.specialty"   type="url"  placeholder="Specialité" />
        </template>

        <p v-if="error" class="err">{{ error }}</p>
      </form>

      <p class="or"><strong>Ou inscrivez-vous via</strong></p>

      <div class="socials">
        <button class="s-btn gh" aria-label="GitHub">
          <svg width="29" height="27" viewBox="0 0 29 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M14.4999 0C6.49287 0 0 6.1968 0 13.8418C0 19.9577 4.15466 25.1459 9.9159 26.9764C10.6403 27.1048 10.9064 26.6762 10.9064 26.3106C10.9064 25.9805 10.8929 24.8901 10.8867 23.7335C6.8528 24.5708 6.0016 22.1004 6.0016 22.1004C5.34201 20.5005 4.39165 20.075 4.39165 20.075C3.07583 19.2159 4.49081 19.2338 4.49081 19.2338C5.94661 19.3312 6.71353 20.6602 6.71353 20.6602C8.00677 22.7759 10.1056 22.1643 10.933 21.8109C11.0632 20.9162 11.4389 20.3054 11.8536 19.9597C8.63299 19.6102 5.24717 18.4231 5.24717 13.1193C5.24717 11.6081 5.81383 10.3733 6.74138 9.40374C6.59059 9.05533 6.09428 7.6475 6.88161 5.7409C6.88161 5.7409 8.09898 5.36888 10.8699 7.15973C12.0267 6.85281 13.2674 6.69855 14.4999 6.69328C15.7317 6.69855 16.973 6.85236 18.1321 7.15927C20.8996 5.36842 22.1155 5.74044 22.1155 5.74044C22.9048 7.64681 22.4084 9.05487 22.2579 9.40328C23.1876 10.3729 23.7502 11.6076 23.7502 13.1188C23.7502 18.4352 20.3581 19.6056 17.1293 19.9485C17.6497 20.3781 18.1131 21.2206 18.1131 22.5118C18.1131 24.3639 18.0963 25.8544 18.0963 26.3103C18.0963 26.6787 18.3575 27.1103 19.0923 26.9744C24.8501 25.142 29 19.9554 29 13.8418C28.9998 6.19726 22.5076 0 14.4999 0Z" fill="white"/>
          </svg>
        </button>
        <button class="s-btn gg" aria-label="Google">
          <svg width="26" height="28" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13.2678 11.6032H25.7927C25.9309 12.3909 26 13.1433 26 13.8604C26 16.4115 25.476 18.6892 24.4279 20.6936C23.3798 22.698 21.8855 24.2645 19.9448 25.3931C18.0042 26.5217 15.7785 27.086 13.2678 27.086C11.4596 27.086 9.73776 26.7304 8.10233 26.0191C6.46689 25.3079 5.05604 24.3468 3.86977 23.1359C2.6835 21.9251 1.74197 20.485 1.04518 18.8156C0.348394 17.1462 0 15.3887 0 13.543C0 11.6973 0.348394 9.93976 1.04518 8.2704C1.74197 6.60103 2.6835 5.16091 3.86977 3.95004C5.05604 2.73916 6.46689 1.77811 8.10233 1.06686C9.73776 0.355621 11.4596 0 13.2678 0C16.7229 0 19.6886 1.18149 22.1648 3.54446L18.5542 7.08891C17.1375 5.68994 15.3754 4.99045 13.2678 4.99045C11.7821 4.99045 10.4086 5.37252 9.14751 6.13667C7.88638 6.90081 6.88726 7.93829 6.15017 9.24909C5.41307 10.5599 5.04452 11.9912 5.04452 13.543C5.04452 15.0948 5.41307 16.5261 6.15017 17.8369C6.88726 19.1477 7.88638 20.1852 9.14751 20.9493C10.4086 21.7135 11.7821 22.0955 13.2678 22.0955C14.2698 22.0955 15.1911 21.9545 16.0319 21.6723C16.8726 21.3902 17.5637 21.0375 18.105 20.6143C18.6463 20.1911 19.1185 19.7091 19.5216 19.1683C19.9247 18.6275 20.2213 18.1161 20.4113 17.6341C20.6013 17.1521 20.7309 16.6936 20.8 16.2586H13.2678V11.6032Z" fill="white"/>
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
  role: '',
  // student
  apogee: '', field: '', year: '',
  // prof
  departement: '', codeAdmin: '', sec: '',
  // professional
  specialty: '', post: '', company: ''
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
  margin-bottom: 40px;
  letter-spacing: 0px;
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
input::placeholder { color: var(--text-gray); }
select.ph          { color: var(--text-gray); }
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
  font-family: var(--font-head);
  padding: 12px 22px;
  border-radius: 50px 50px 0px 50px;
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
.s-btn.gh { background: var(--blue-w); color: white; }
.s-btn.gg { background: var(--blue-w); }

.switch { text-align: center; font-size: .79rem; color: var(--text-muted); }
.switch a { color: var(--purple); font-weight: 600; }
.switch a:hover { text-decoration: underline; }
</style>