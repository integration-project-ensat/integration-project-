<template>
  <AuthLayout>
    <div class="form-wrap">
      <h1>Compléter votre profil</h1>

      <form @submit.prevent="submit">
        <div class="select-wrap">
          <select v-model="form.role">
            <option value="">Choisir un rôle</option>
            <option value="ETUDIANT">Étudiant</option>
            <option value="PROFESSEUR">Professeur</option>
            <option value="PROFESSIONNEL">Professionnel</option>
          </select>
        </div>

        <template v-if="form.role === 'ETUDIANT'">
          <input v-model="form.numero_etudiant" placeholder="APOGEE" />
          <input v-model="form.filiere" placeholder="Filière" />
          <input v-model="form.annee_universitaire" placeholder="Année universitaire" />
        </template>

        <template v-if="form.role === 'PROFESSEUR'">
          <input v-model="form.departement" placeholder="Département" />
          <input v-model="form.code_administratif" placeholder="Code administratif" />
          <input v-model="form.specialite" placeholder="Spécialité" />
        </template>

        <template v-if="form.role === 'PROFESSIONNEL'">
          <input v-model="form.entreprise" placeholder="Entreprise" />
          <input v-model="form.poste" placeholder="Poste" />
          <input v-model="form.secteur" placeholder="Secteur" />
        </template>

        <p v-if="error" class="err">{{ error }}</p>

        <button type="submit" class="btn" :disabled="loading">
          <span v-if="!loading">Terminer</span>
          <span v-else>Chargement...</span>
        </button>
      </form>
    </div>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
import api from '../services/api.js'
import authService from '../services/auth.service.js'
import { useAuthStore } from '@/store/auth.js'

const router = useRouter()
const auth = useAuthStore()

const error = ref('')
const loading = ref(false)

const params = new URLSearchParams(window.location.search)
const token = params.get('token')
const provider = params.get('provider') === 'github' ? 'github' : 'google'

const form = reactive({
  role: '',
  numero_etudiant: '',
  filiere: '',
  annee_universitaire: '',
  departement: '',
  code_administratif: '',
  specialite: '',
  entreprise: '',
  poste: '',
  secteur: ''
})

async function submit() {
  error.value = ''

  if (!token) {
    error.value = 'Token invalide'
    return
  }

  loading.value = true

  try {
    const { data } = await api.post(`/auth/${provider}/complete-profile`, {
      token,
      ...form
    })

    const session = authService.persistSession(data?.data?.user, data?.data?.token)
    auth.login(session.user, session.token, session.role)

    if (session.role === 'admin') router.push('/admin')
    else if (session.role === 'teacher') router.push('/explore-prof')
    else if (session.role === 'professional') router.push('/explore-pro')
    else router.push('/student/explore')
  } catch (e: any) {
    error.value =
      e.response?.data?.message || 'Erreur lors de finalisation'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-wrap {
  width: 100%;
  max-width: 380px;
  margin: auto;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input, select {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #ddd;
}

.btn {
  padding: 14px;
  border-radius: 12px;
}

.err {
  color: red;
}
</style>
