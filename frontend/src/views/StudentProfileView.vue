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
          @open-recos="showRecosModal = true"
        />

        <div v-if="activeTab === 'Portfolio'">
          <PostCard
            v-for="(post, i) in posts"
            :key="i"
            :post="post"
            @comment="handleComment(i)"
            @share="handleShare(i)"
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
      </main>
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
import { computed, ref } from 'vue'
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

const profile = {
  name: 'Nom Prenom',
  score: 90,
  title: 'Ex Developpeur Operations & Support',
  school: 'Ex Dassault Université de Bretagne Occidentale',
  location: 'Ex Tanger, Tanger-Tetouan-Hussima, Maroc',
  recos: '500+',
  avatar: '',
  bio: 'Étudiant motivé, intéressé par le développement web, les projets académiques et la collaboration avec des enseignants et professionnels.',
  email: 'exemple.exemple@univ.etu.ac.ma',
  website: 'https://portfolio.example.com',
  linkedin: 'https://linkedin.com/in/example'
}

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

const posts = [
  {
    author: 'Nom Prenom & Nom Prenom',
    subtitle: 'Ex Collaboration pour un projet académique',
    description: 'Ex de description d\'un projet académique ou une stage application de gestion de biblio d\'une application web permettant de gérer les livres, les emprunts et les utilisateurs en sous supervision de Mme @k3blghzal et Mr @fianfiani en collaboration ... pour faire quelque chose.',
    avatar: '',
    images: []
  }
]

const copied = ref(false)

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

function handleComment(index: number) {
  console.log('Comment on post', index)
}

function handleShare(index: number) {
  console.log('Share post', index)
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

</style>