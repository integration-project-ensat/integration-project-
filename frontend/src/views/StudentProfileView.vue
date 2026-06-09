<template>
  <div class="page">
    <TopBar @toggleSidebar="sidebarOpen = !sidebarOpen" />

    <div class="body-area">
      <SideBar
        :role="userRole"
        :user="currentUser"
        :isOpen="sidebarOpen"
      />

      <main class="content" :class="{ shifted: sidebarOpen }">
        <StudentProfileHeader
          :profile="profile"
          :recent-recommendations="recommendations"
          v-model="activeTab"
          :is-owner="true"
          @open-recos="showRecosModal = true"
          @avatar-changed="profile.avatar = $event"
          @banner-changed="profile.banner = $event"
        />

        <!-- Modifier bio -->
        <section v-if="activeTab === 'Modifier bio'" class="bio-edit-tab">
          <div class="bio-edit-card">
            <h3>Modifier votre biographie</h3>
            <textarea v-model="bioForm" class="bio-textarea" placeholder="Décrivez-vous en quelques mots..." />
            <div class="bio-actions">
              <button type="button" class="send-btn" @click="saveBio">Enregistrer</button>
              <button type="button" class="cancel-btn" @click="cancelBio">Annuler</button>
            </div>
          </div>
        </section>

        <!-- Posts (toujours visibles) -->
        <section class="posts-section">
          <div v-for="post in posts" :key="post.id" class="post-wrapper">
            <div class="post-owner-bar">
              <button type="button" class="btn-post-action edit" @click="openEditPost(post)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Modifier
              </button>
              <button type="button" class="btn-post-action delete" @click="deletePost(post.id)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
                Supprimer
              </button>
            </div>
            <PostCard :post="post" @comment="handleComment(post.id)" @share="handleShare(post.id)" />
          </div>
          <div v-if="posts.length === 0" class="empty-posts">
            Aucun post pour l'instant.
          </div>
        </section>
      </main>
    </div>

    <!-- Modal modification post -->
    <div v-if="showEditModal" class="modal-backdrop" @click.self="showEditModal = false">
      <div class="post-edit-modal">
        <div class="modal-head">
          <h3>Modifier le post</h3>
          <button type="button" @click="showEditModal = false">×</button>
        </div>
        <div class="post-edit-body">
          <label class="field-label">Description</label>
          <textarea v-model="editForm.description" class="edit-textarea" placeholder="Description du post..." />

          <label class="field-label">Photo</label>
          <div class="photo-manager">
            <div v-if="editForm.imagePreview" class="current-photo-wrap">
              <img :src="editForm.imagePreview" class="current-photo-img" alt="photo du post" />
              <button type="button" class="remove-photo-btn" @click="editForm.imagePreview = null">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Supprimer la photo
              </button>
            </div>
            <label v-else class="add-photo-label" for="edit-post-img">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Ajouter une photo
              <input id="edit-post-img" type="file" accept="image/*" class="sr-only" @change="onEditImageChange" />
            </label>
          </div>
        </div>
        <div class="post-edit-footer">
          <button type="button" class="send-btn" @click="saveEditPost">Enregistrer</button>
          <button type="button" class="cancel-btn" @click="showEditModal = false">Annuler</button>
        </div>
      </div>
    </div>

    <div
      v-if="showRecosModal"
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
import { computed, reactive, ref } from 'vue'
import TopBar from '../components/TopBar.vue'
import SideBar from '../components/exploreStudent/Sidebar.vue'
import StudentProfileHeader from '../components/StudentProfileHeader.vue'
import PostCard from '../components/PostCard.vue'

type Recommendation = {
  id: number
  author: string
  role: 'teacher' | 'professional'
  avatar?: string
  message?: string
  date: string
}

const sidebarOpen = ref(false)
const userRole = ref<'student' | 'teacher' | 'professional'>('teacher')
const activeTab = ref('Portfolio')
const showRecosModal = ref(false)
const recommendationMessage = ref('')

const currentUser = {
  name: 'Nom Professeur',
  email: 'professeur@univ.ac.ma',
  avatar: ''
}

const profile = reactive({
  name: 'Nom Prenom',
  score: 90,
  title: 'Ex Developpeur Operations & Support',
  school: 'Ex Dassault Université de Bretagne Occidentale',
  location: 'Ex Tanger, Tanger-Tetouan-Hussima, Maroc',
  recos: '500+',
  avatar: '',
  banner: '',
  bio: 'Étudiant motivé, intéressé par le développement web, les projets académiques et la collaboration avec des enseignants et professionnels.',
  email: 'exemple.exemple@univ.etu.ac.ma',
  website: 'https://portfolio.example.com',
  linkedin: 'https://linkedin.com/in/example'
})

const recommendations = ref<Recommendation[]>([
  {
    id: 1,
    author: 'Mme Professeur Nom',
    role: 'teacher',
    avatar: '',
    message: 'Étudiant sérieux, autonome et très impliqué dans ses projets.',
    date: '23 Mai 2026'
  },
  {
    id: 2,
    author: 'Mr Professionnel Nom',
    role: 'professional',
    avatar: '',
    message: 'Très bonne capacité d’analyse et excellent esprit de collaboration.',
    date: '20 Mai 2026'
  },
  {
    id: 3,
    author: 'Mme Professeur Exemple',
    role: 'teacher',
    avatar: '',
    message: '',
    date: '18 Mai 2026'
  }
])

const connectionSent = ref(false)

function sendConnectionRequest() {
  connectionSent.value = true
  console.log('Demande de connexion envoyée à', profile.name)
}

const posts = ref([
  {
    id: 1,
    author: 'Nom Prenom & Nom Prenom',
    subtitle: 'Ex Collaboration pour un projet académique',
    description: 'Ex de description d\'un projet académique ou une stage application de gestion de biblio d\'une application web permettant de gérer les livres, les emprunts et les utilisateurs en sous supervision de Mme @k3blghzal et Mr @fianfiani en collaboration ... pour faire quelque chose.',
    avatar: '',
    images: [],
    imagePreview: null as string | null
  }
])

const copied = ref(false)
const showEditModal = ref(false)
const editingPostId = ref<number | null>(null)
const editForm = reactive({ description: '', imagePreview: null as string | null })
const bioForm = ref(profile.bio)

const profileUrl = computed(() => {
  return `${window.location.origin}/profile`
})

const encodedProfileUrl = computed(() => encodeURIComponent(profileUrl.value))
const encodedShareText = computed(() => encodeURIComponent(`Découvrez le profil de ${profile.name}`))

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

async function copyProfileLink() {
  await navigator.clipboard.writeText(profileUrl.value)
  copied.value = true

  window.setTimeout(() => {
    copied.value = false
  }, 1600)
}

function sendRecommendation() {
  recommendations.value.unshift({
    id: Date.now(),
    author: currentUser.name,
    role: 'teacher',
    avatar: currentUser.avatar,
    message: recommendationMessage.value.trim(),
    date: 'Aujourd’hui'
  })

  recommendationMessage.value = ''
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function handleComment(id: number) {
  console.log('Commentaire sur le post', id)
}

function handleShare(id: number) {
  console.log('Partager le post', id)
}

function openEditPost(post: any) {
  editingPostId.value = post.id
  editForm.description = post.description
  editForm.imagePreview = post.imagePreview ?? null
  showEditModal.value = true
}

function saveEditPost() {
  const idx = posts.value.findIndex(p => p.id === editingPostId.value)
  if (idx !== -1) {
    posts.value[idx].description = editForm.description
    posts.value[idx].imagePreview = editForm.imagePreview
  }
  showEditModal.value = false
}

function deletePost(id: number) {
  posts.value = posts.value.filter(p => p.id !== id)
}

function onEditImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { editForm.imagePreview = reader.result as string }
  reader.readAsDataURL(file)
}

function saveBio() {
  profile.bio = bioForm.value
  activeTab.value = ''
}

function cancelBio() {
  bioForm.value = profile.bio
  activeTab.value = ''
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f2f8;
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

/* --- Bio edit --- */
.bio-edit-tab { margin-top: 14px; }

.bio-edit-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.bio-edit-card h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 14px;
}

.bio-textarea {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  font-family: var(--font-body);
  font-size: .9rem;
  color: var(--text-dark);
  outline: none;
  box-sizing: border-box;
}

.bio-textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, .12);
}

.bio-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.cancel-btn {
  min-height: 42px;
  padding: 0 22px;
  border-radius: 100px;
  background: #f3f4f6;
  color: var(--text-dark);
  font-family: var(--font-head);
  font-weight: 700;
}

.cancel-btn:hover { background: #e5e7eb; }

/* --- Posts section --- */
.posts-section {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.post-wrapper { position: relative; }

.post-owner-bar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 6px;
}

.btn-post-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 32px;
  padding: 0 14px;
  border-radius: 100px;
  font-family: var(--font-head);
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-post-action.edit { background: #eeecff; color: var(--purple); }
.btn-post-action.edit:hover { background: #ddd9ff; }
.btn-post-action.delete { background: #fff0f0; color: #dc2626; }
.btn-post-action.delete:hover { background: #ffe0e0; }

.empty-posts {
  text-align: center;
  padding: 40px 0;
  color: var(--text-muted);
  font-size: .9rem;
}

/* --- Post edit modal --- */
.post-edit-modal {
  width: min(520px, 92vw);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .18);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.post-edit-body {
  padding: 0 20px 4px;
  overflow-y: auto;
  flex: 1;
}

.post-edit-footer {
  padding: 14px 20px 20px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #f0f0f0;
}

.field-label {
  display: block;
  font-family: var(--font-head);
  font-size: .82rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 14px 0 6px;
}

.edit-textarea {
  width: 100%;
  min-height: 100px;
  resize: vertical;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  font-family: var(--font-body);
  font-size: .9rem;
  color: var(--text-dark);
  outline: none;
  box-sizing: border-box;
}

.edit-textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, .12);
}

.current-photo-wrap { display: inline-block; }

.current-photo-img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  display: block;
}

.remove-photo-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  height: 32px;
  padding: 0 14px;
  border-radius: 100px;
  background: #fff0f0;
  color: #dc2626;
  font-family: var(--font-head);
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
}

.remove-photo-btn:hover { background: #ffe0e0; }

.add-photo-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  border: 1.5px dashed #d1d5db;
  border-radius: 8px;
  color: var(--text-muted);
  font-family: var(--font-head);
  font-size: .82rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.add-photo-label:hover {
  border-color: var(--purple);
  color: var(--purple);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

</style>