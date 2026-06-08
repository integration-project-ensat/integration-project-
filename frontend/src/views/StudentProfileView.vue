<template>
  <div class="page">
    <TopBar @toggleSidebar="sidebarOpen = !sidebarOpen" />

    <div class="body-area">
      <SidebarStudent
        v-if="userRole === 'student'"
        :isOpen="sidebarOpen"
        :force-navigation="true"
      />
      <SidebarProf
        v-else-if="userRole === 'teacher'"
        :isOpen="sidebarOpen"
        :force-navigation="true"
      />
      <SidebarPro
        v-else
        :isOpen="sidebarOpen"
        :force-navigation="true"
      />

      <main class="content" :class="{ shifted: sidebarOpen }">
        <div v-if="profileLoading" class="page-state">
          Chargement du profil...
        </div>

        <div v-else-if="profileError" class="page-state page-state--error">
          {{ profileError }}
        </div>

        <template v-else>
        <StudentProfileHeader
          :profile="profile"
          :recent-recommendations="recommendations"
          v-model="activeTab"
          @open-recos="showRecosModal = true"
          @open-portfolio="openPortfolio"
        />

        <section v-if="userRole === 'teacher'" class="teacher-actions">
          <div class="teacher-actions__content">
            <div>
              <h3>Ajouter cet étudiant</h3>
              <p>Attachez ce profil à votre liste d'étudiants suivis.</p>
            </div>

            <button
              type="button"
              class="attach-btn"
              :disabled="attachingStudent || studentAttached"
              @click="attachCurrentStudent"
            >
              {{
                attachingStudent
                  ? 'Ajout...'
                  : studentAttached
                    ? 'Déjà ajouté'
                    : 'Ajouter à mes étudiants'
              }}
            </button>
          </div>

          <p v-if="attachMessage" class="teacher-actions__message">{{ attachMessage }}</p>
        </section>

        <div v-if="activeTab === 'Portfolio'">
          <PostCard
            v-for="(post, i) in posts"
            :key="post.id || i"
            :post="post"
            @comment="handleComment(i)"
            @like="handleLike(post, $event)"
            @share="handleRepost(post, $event)"
            @submit-comment="handleSubmitComment(post, $event)"
          />
        </div>

        <section v-if="activeTab === 'Recommander'" class="recommend-tab">
          <div v-if="userRole === 'teacher'" class="recommend-box">
            <h3>Recommander cet étudiant</h3>
            <p>
              Vous pouvez envoyer une recommandation avec ou sans commentaire.
            </p>

            <textarea
              v-model="recommendationMessage"
              placeholder="Écrire un commentaire de recommandation..."
            />

            <button type="button" class="send-btn" @click="sendRecommendation">
              Envoyer la recommandation
            </button>
          </div>

          <div class="recommendations-list">
            <article
              v-for="recommendation in recommendations"
              :key="recommendation.id"
              class="recommendation-card"
            >
              <div class="mini-avatar">
                <img
                  v-if="recommendation.avatar"
                  :src="recommendation.avatar"
                  alt=""
                />
                <span v-else>{{ getInitials(recommendation.author) }}</span>
              </div>

              <div class="recommendation-content">
                <div class="recommendation-head">
                  <div>
                    <h4>{{ recommendation.author }}</h4>
                    <p>
                      {{ recommendation.role === 'teacher' ? 'Professeur' : 'Professionnel' }}
                    </p>
                  </div>

                  <span>{{ recommendation.date }}</span>
                </div>

                <p class="recommendation-message">
                  {{ recommendation.message || 'Recommandation sans commentaire.' }}
                </p>
              </div>
            </article>
          </div>
        </section>

        <section v-if="activeTab === 'Connecter'" class="connect-tab">
  <div class="connect-card">
    <div>
      <h3>Demande de connexion</h3>
      <p>
        Envoyez une demande de connexion à {{ profile.name }} pour rester en contact.
      </p>
    </div>

    <button
      type="button"
      class="connect-btn"
      :disabled="connectionSent"
      @click="sendConnectionRequest"
    >
      {{ connectionSent ? 'Demande envoyée' : 'Se connecter' }}
    </button>
  </div>
</section>

        <section v-if="activeTab === 'Partager'" class="share-tab">
  <div class="share-card">
    <div>
      <h3>Partager ce profil</h3>
      <p>Copiez le lien ou partagez directement avec votre réseau.</p>
    </div>

    <div class="link-box">
      <span>{{ profileUrl }}</span>
      <button type="button" @click="copyProfileLink">
        {{ copied ? 'Copié' : 'Copier' }}
      </button>
    </div>

    <div class="share-actions">
      <a :href="gmailShareUrl" target="_blank" rel="noopener" class="share-btn gmail">
        Gmail
      </a>

      <a :href="linkedinShareUrl" target="_blank" rel="noopener" class="share-btn linkedin">
        LinkedIn
      </a>

      <a :href="whatsappShareUrl" target="_blank" rel="noopener" class="share-btn whatsapp">
        WhatsApp
      </a>

      <a :href="xShareUrl" target="_blank" rel="noopener" class="share-btn x">
        X
      </a>
    </div>
  </div>
</section>
        </template>
      </main>
    </div>

    <div
      v-if="showRecosModal && !profileLoading && !profileError"
      class="modal-backdrop"
      @click.self="showRecosModal = false"
    >
      <div class="recos-modal">
        <div class="modal-head">
          <h3>Personnes qui ont recommandé {{ profile.name }}</h3>
          <button type="button" @click="showRecosModal = false">×</button>
        </div>

        <div class="recommenders-list">
          <div
            v-for="recommendation in recommendations"
            :key="recommendation.id"
            class="recommender"
          >
            <div class="mini-avatar">
              <img
                v-if="recommendation.avatar"
                :src="recommendation.avatar"
                alt=""
              />
              <span v-else>{{ getInitials(recommendation.author) }}</span>
            </div>

            <div>
              <strong>{{ recommendation.author }}</strong>
              <p>
                {{ recommendation.role === 'teacher' ? 'Professeur' : 'Professionnel' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import TopBar from '../components/TopBar.vue'
import SidebarStudent from '../components/exploreStudent/Sidebar.vue'
import SidebarProf from '../components/exploreProf/SidebarProf.vue'
import SidebarPro from '../components/explorePro/SidebarPro.vue'
import StudentProfileHeader from '../components/StudentProfileHeader.vue'
import PostCard from '../components/PostCard.vue'
import { commentaireService } from '../services/commentaire.service'
import { connexionService } from '../services/connexion.service'
import { postService } from '../services/post.service'
import profApi from '../services/profApi'
import { profileService } from '../services/profile.service'
import { recommendationService } from '../services/recommendation.service'

type Recommendation = {
  id: number
  author: string
  role: 'teacher' | 'professional' | 'student'
  avatar?: string
  message?: string
  date: string
}

type ProfilePost = {
  id?: number
  author: string
  subtitle: string
  description: string
  avatar?: string
  images?: string[]
  media?: Array<string | { url: string; type?: 'image' | 'video' | 'pdf' | 'file'; name?: string }>
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const sidebarOpen = ref(false)
const profileLoading = ref(true)
const profileError = ref('')
const normalizedAuthRole = computed<'student' | 'teacher' | 'professional' | null>(() => {
  const role = String(auth.role || '').trim().toUpperCase()
  if (role === 'TEACHER' || role === 'PROFESSEUR') return 'teacher'
  if (role === 'PROFESSIONAL' || role === 'PROFESSIONNEL') return 'professional'
  if (role === 'STUDENT' || role === 'ETUDIANT') return 'student'
  return null
})
const roleFromRoute = computed<'student' | 'teacher' | 'professional' | null>(() => {
  const from = typeof route.query.from === 'string' ? route.query.from : ''
  if (from === 'prof') return 'teacher'
  if (from === 'pro') return 'professional'
  if (from === 'student') return 'student'
  return null
})
const userRole = computed<'student' | 'teacher' | 'professional'>(() => roleFromRoute.value ?? normalizedAuthRole.value ?? 'student')
const allowedTabs = new Set(['Portfolio', 'Recommander', 'Connecter', 'Compétances', 'À propos', 'Partager'])
const getRouteTab = () => {
  const tab = typeof route.query.tab === 'string' ? route.query.tab : 'Portfolio'
  return allowedTabs.has(tab) ? tab : 'Portfolio'
}
const activeTab = ref(getRouteTab())
const showRecosModal = ref(false)
const recommendationMessage = ref('')
const attachingStudent = ref(false)
const studentAttached = ref(false)
const attachMessage = ref('')

const currentUser = computed(() => {
  const rawUser = localStorage.getItem('user')

  if (!rawUser) {
    return {
      name: userRole.value === 'teacher' ? 'Nom Professeur' : userRole.value === 'professional' ? 'Nom Professionnel' : 'Nom Prenom',
      email: userRole.value === 'teacher' ? 'professeur@univ.ac.ma' : userRole.value === 'professional' ? 'professionnel@entreprise.ma' : 'exemple@univ.etu.ac.ma',
      avatar: ''
    }
  }

  try {
    const parsed = JSON.parse(rawUser)
    return {
      name: [parsed?.prenom, parsed?.nom].filter(Boolean).join(' ') || parsed?.name || 'Nom Prenom',
      email: parsed?.email || 'exemple@univ.etu.ac.ma',
      avatar: parsed?.avatar || ''
    }
  } catch {
    return {
      name: 'Nom Prenom',
      email: 'exemple@univ.etu.ac.ma',
      avatar: ''
    }
  }
})

const profile = ref({
  id: 0,
  name: '',
  score: 0,
  title: '',
  school: '',
  location: '',
  recos: '0',
  avatar: '',
  bio: '',
  email: '',
  website: '',
  linkedin: '',
  technicalSkills: [] as Array<{ name: string; level: number; description: string; projectsCount: number }>,
  softSkills: [] as Array<{ name: string; level: number; description: string; projectsCount: number }>
})

const recommendations = ref<Recommendation[]>([])

const connectionSent = ref(false)

async function sendConnectionRequest() {
  try {
    await connexionService.createConnexion({
      id_destinataire: profileId.value,
      message: `Demande de connexion vers ${profile.value.name}`
    })
    connectionSent.value = true
  } catch (error) {
    console.error('Erreur demande de connexion', error)
  }
}

const posts = ref<ProfilePost[]>([])

const copied = ref(false)

const profileUrl = computed(() => `${window.location.origin}${route.path}`)

const profileStudentId = computed<number | undefined>(() => {
   const id = Number(route.params.id)
  return !isNaN(id) && id > 0 ? id : undefined })

const profileId = computed(() => profileStudentId.value || profile.value.id)

const encodedProfileUrl = computed(() => encodeURIComponent(profileUrl.value))
const encodedShareText = computed(() => encodeURIComponent(`Découvrez le profil de ${profile.value.name}`))

const gmailShareUrl = computed(() => {
  return `mailto:?subject=${encodedShareText.value}&body=${encodedShareText.value}%0A${encodedProfileUrl.value}`
})

const linkedinShareUrl = computed(() => {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedProfileUrl.value}`
})

const whatsappShareUrl = computed(() => {
  return `https://wa.me/?text=${encodedShareText.value}%20${encodedProfileUrl.value}`
})

const xShareUrl = computed(() => {
  return `https://twitter.com/intent/tweet?text=${encodedShareText.value}&url=${encodedProfileUrl.value}`
})

function openPortfolio() {
  const targetId = profileId.value
  if (!targetId) return

  const from =
    userRole.value === 'teacher'
      ? 'prof'
      : userRole.value === 'professional'
        ? 'pro'
        : 'student'

  router.push(`/portfolio/${targetId}?from=${from}`)
}

async function loadPosts() {
  try {
    const { data } = await postService.getPosts(
      profileId.value ? { id_auteur: profileId.value } : {}
    )
    const backendPosts = data.data || []
    posts.value = backendPosts.map(mapBackendPost)
  } catch (error) {
    console.warn('Chargement des posts impossible', error)
    posts.value = []
  }
}

async function loadProfile() {
  profileLoading.value = true
  profileError.value = ''
  try {
    const backendProfile = await profileService.getProfile(profileStudentId.value)
    const rawStudent = backendProfile?.raw?.etudiant || {}
    const rawCompetences = Array.isArray(rawStudent?.competences) ? rawStudent.competences : []
    const technicalSkills = rawCompetences
      .filter((item: any) => String(item?.competence?.categorie || '').toUpperCase() !== 'COMPORTEMENTALE')
      .map((item: any) => ({
        name: item?.competence?.nom || 'Compétence',
        level: Number(item?.niveau_maitrise ?? 75),
        description: 'Compétence issue du profil étudiant.',
        projectsCount: 0
      }))
    const softSkills = rawCompetences
      .filter((item: any) => String(item?.competence?.categorie || '').toUpperCase() === 'COMPORTEMENTALE')
      .map((item: any) => ({
        name: item?.competence?.nom || 'Compétence',
        level: Number(item?.niveau_maitrise ?? 75),
        description: 'Compétence comportementale issue du profil étudiant.',
        projectsCount: 0
      }))

    profile.value = {
      ...profile.value,
      id: backendProfile.id,
      name: backendProfile.name,
      score: backendProfile.score,
      title: backendProfile.title,
      school: backendProfile.school,
      location: backendProfile.location,
      recos: backendProfile.recos,
      avatar: backendProfile.avatar,
      bio: backendProfile.bio,
      email: backendProfile.email,
      website: backendProfile.website,
      linkedin: backendProfile.linkedin,
      technicalSkills,
      softSkills
    }

    posts.value = Array.isArray(backendProfile.posts) ? backendProfile.posts : posts.value
    recommendations.value = Array.isArray(backendProfile.recommendations) ? backendProfile.recommendations : recommendations.value
  } catch (error) {
    console.warn('Chargement du profil complet impossible', error)
    profileError.value = "Impossible de charger ce profil pour le moment."
    posts.value = []
    recommendations.value = []
  } finally {
    profileLoading.value = false
  }
}

async function loadRecommendations() {
  try {
    const { data } = await recommendationService.getRecommendations({
      id_etudiant_cible: profileId.value,
      statut: 'VALIDE'
    })
    const backendRecommendations = data.data || []
    recommendations.value = backendRecommendations.map(mapBackendRecommendation)
  } catch (error) {
    console.warn('Chargement des recommandations impossible', error)
    recommendations.value = []
  }
}

async function loadAttachedStatus() {
  if (userRole.value !== 'teacher' || !profileId.value) return

  try {
    const { data } = await profApi.getAttachedStudentStatus(profileId.value)
    studentAttached.value = Boolean(data?.data?.attached)
  } catch (error) {
    console.warn('Chargement statut étudiant lié impossible', error)
  }
}

async function attachCurrentStudent() {
  if (!profileId.value || studentAttached.value) return

  attachingStudent.value = true
  attachMessage.value = ''

  try {
    const { data } = await profApi.attachStudent({
      id_etudiant: profileId.value,
    })
    studentAttached.value = true
    attachMessage.value = data?.created
      ? 'Étudiant ajouté à votre liste.'
      : 'Cet étudiant est déjà dans votre liste.'
  } catch (error: any) {
    attachMessage.value =
      error?.response?.data?.message || "Impossible d'ajouter cet étudiant."
  } finally {
    attachingStudent.value = false
  }
}

async function copyProfileLink() {
  await navigator.clipboard.writeText(profileUrl.value)
  copied.value = true

  window.setTimeout(() => {
    copied.value = false
  }, 1600)
}

async function sendRecommendation() {
  const message = recommendationMessage.value.trim()

  try {
    const { data } = await recommendationService.createRecommendation({
      id_etudiant_cible: profileId.value,
      message,
      role_auteur: 'PROFESSEUR'
    })

    recommendations.value.unshift(mapBackendRecommendation(data.data))
    recommendationMessage.value = ''
    return
  } catch (error) {
    console.error('Erreur envoi recommandation', error)
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function handleComment(index: number) {
  console.log('Comment on post', index)
}

async function handleSubmitComment(post: ProfilePost, contenu: string) {
  if (!post.id) return

  try {
    await commentaireService.createCommentaire({
      id_poste: post.id,
      contenu
    })
  } catch (error) {
    console.error('Erreur ajout commentaire', error)
  }
}

async function handleLike(post: ProfilePost, liked: boolean) {
  if (!post.id) return

  try {
    if (liked) {
      await postService.reactToPost(post.id, 'JAIME')
    } else {
      await postService.removeReaction(post.id)
    }
  } catch (error) {
    console.error('Erreur reaction post', error)
  }
}

function handleShare(index: number) {
  console.log('Share post', index)
}

async function handleRepost(post: ProfilePost, reposted: boolean) {
  if (!post.id) return

  try {
    if (reposted) {
      await postService.repost(post.id)
    } else {
      await postService.removeRepost(post.id)
    }
  } catch (error) {
    console.error('Erreur republication post', error)
  }
}

function mapBackendPost(post: any): ProfilePost {
  const auteur = post.auteur
  const collaborateurs = post.collaborateurs || []
  const collaboratorNames = collaborateurs
    .map((collaborateur: any) => fullName(collaborateur.utilisateur))
    .filter(Boolean)

  return {
    id: Number(post.id_poste),
    author: [fullName(auteur), ...collaboratorNames].filter(Boolean).join(' & ') || 'Auteur inconnu',
    subtitle: post.visibilite || 'Post portfolio',
    description: post.contenu,
    avatar: '',
    images: post.image_url ? [resolveBackendAsset(post.image_url)] : []
  }
}

function mapBackendRecommendation(recommendation: any): Recommendation {
  const auteur = recommendation.auteur || {}
  const role = recommendation.role_auteur === 'PROFESSIONNEL'
    ? 'professional'
    : recommendation.role_auteur === 'ETUDIANT'
      ? 'student'
      : 'teacher'

  return {
    id: Number(recommendation.id_recommandation),
    author: fullName(auteur) || 'Auteur inconnu',
    role,
    avatar: '',
    message: recommendation.message || '',
    date: "Aujourd'hui"
  }
}

function fullName(user: any) {
  return [user?.prenom, user?.nom].filter(Boolean).join(' ')
}

function resolveBackendAsset(path: string) {
  if (!path || /^https?:\/\//.test(path)) return path
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  const backendBase = apiBase.replace(/\/api\/?$/, '')
  return `${backendBase}${path}`
}

onMounted(async () => {
  await loadProfile()
  await loadPosts()
  await loadRecommendations()
  await loadAttachedStatus()
})

watch(
  () => route.query.tab,
  () => {
    activeTab.value = getRouteTab()
  }
)

watch(profileId, () => {
  loadAttachedStatus()
  connectionSent.value = false
  loadProfile()
  loadPosts()
  loadRecommendations()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f2f8;
}

.page-state {
  background: white;
  border-radius: 12px;
  padding: 22px;
  color: var(--text-dark);
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.page-state--error {
  color: #dc2626;
}

.body-area {
  position: relative;
  min-height: calc(100vh - 60px);
  background: #f0f2f8;
  overflow-x: hidden;
}

.content {
  width: 100%;
  min-width: 0;
  padding: 24px 10px;
  min-height: calc(100vh - 60px);
  background: #f0f2f8;
  transition: padding-left 0.3s ease;
}

.content.shifted {
  padding-left: 230px;
}

.teacher-actions {
  margin-top: 14px;
  background: white;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.teacher-actions__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.teacher-actions h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.teacher-actions p,
.teacher-actions__message {
  font-size: .85rem;
  color: var(--text-muted);
}

.attach-btn {
  min-height: 42px;
  padding: 0 22px;
  border-radius: 100px 100px 100px 100px;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-weight: 700;
  white-space: nowrap;
}

.attach-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
}

.recommend-tab {
  display: grid;
  gap: 16px;
  margin-top: 14px;
}

.recommend-box,
.recommendation-card,
.recos-modal {
  background: white;
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.recommend-box h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.recommend-box p {
  font-size: .85rem;
  color: var(--text-muted);
  margin-bottom: 14px;
}

.recommend-box textarea {
  width: 100%;
  min-height: 110px;
  resize: vertical;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  font-family: var(--font-body);
  font-size: .9rem;
  color: var(--text-dark);
  outline: none;
}

.recommend-box textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, .12);
}

.send-btn {
  margin-top: 12px;
  min-height: 42px;
  padding: 0 22px;
  border-radius: 100px 100px 100px 100px;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-weight: 700;
}

.recommendations-list {
  display: grid;
  gap: 12px;
}

.recommendation-card {
  display: flex;
  gap: 14px;
}

.recommendation-content {
  flex: 1;
  min-width: 0;
}

.recommendation-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.recommendation-head h4 {
  font-family: var(--font-head);
  font-size: .95rem;
  color: var(--text-dark);
}

.recommendation-head p,
.recommendation-head span {
  font-size: .78rem;
  color: var(--text-muted);
}

.recommendation-message {
  font-size: .9rem;
  line-height: 1.5;
  color: var(--text-dark);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(17, 24, 39, .45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.recos-modal {
  width: min(520px, 92vw);
  max-height: 80vh;
  overflow: auto;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.modal-head h3 {
  font-family: var(--font-head);
  font-size: 1rem;
}

.modal-head button {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f3f4f6;
  font-size: 1.4rem;
  color: var(--text-dark);
}

.recommenders-list {
  display: grid;
  gap: 12px;
}

.recommender {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recommender strong {
  font-family: var(--font-head);
  font-size: .9rem;
}

.recommender p {
  font-size: .78rem;
  color: var(--text-muted);
}

.connect-tab {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.connect-card {
  width: min(560px, 100%);
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.connect-card h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.connect-card p {
  font-size: .85rem;
  color: var(--text-muted);
}

.connect-btn {
  min-height: 42px;
  padding: 0 22px;
  border-radius: 100px 100px 100px 100px;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-weight: 700;
  white-space: nowrap;
}

.connect-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
}

.mini-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #eeecff;
  color: var(--purple);
  font-family: var(--font-head);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.mini-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-tab {
  text-align: center;
  padding: 60px 0;
  color: var(--text-muted);
  font-size: .9rem;
}

@media (max-width: 900px) {
  .content,
  .content.shifted {
    padding: 16px;
  }

  .recommendation-head {
    flex-direction: column;
  }
}

.share-tab {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.skills-tab,
.about-tab {
  margin-top: 18px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.info-card h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 10px;
}

.info-card p {
  color: var(--text-muted);
  line-height: 1.7;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-pill {
  padding: 10px 14px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-weight: 700;
}

.share-card {
  width: min(620px, 100%);
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
  display: grid;
  gap: 16px;
}

.share-card h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.share-card p {
  font-size: .85rem;
  color: var(--text-muted);
}

.link-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
}

.link-box span {
  flex: 1;
  min-width: 0;
  font-size: .85rem;
  color: var(--text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-box button {
  min-height: 36px;
  padding: 0 16px;
  border-radius: 50px 50px 0 50px;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-weight: 700;
}

.share-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.share-btn {
  min-height: 38px;
  padding: 0 16px;
  border-radius: 999px;
  color: white;
  font-family: var(--font-head);
  font-size: .82rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.share-btn.gmail {
  background: #ea4335;
}

.share-btn.linkedin {
  background: #0a66c2;
}

.share-btn.whatsapp {
  background: #25d366;
}

.share-btn.x {
  background: #111827;
}

</style>
