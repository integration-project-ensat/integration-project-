<template>
  <div class="page">
    <TopBar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <div class="body-area">
      <SideBar :role="userRole" :user="currentUser" :isOpen="sidebarOpen" />

      <main class="content" :class="{ shifted: sidebarOpen }">

        <StudentProfileHeader :profile="profile" v-model="activeTab" />

        <div v-if="activeTab === 'Portfolio'">
          <PostCard
            v-for="(post, i) in posts"
            :key="i"
            :post="post"
            @comment="handleComment(i)"
            @share="handleShare(i)"
          />
        </div>

        <div v-if="activeTab === 'Recommendation'" class="empty-tab">
          <p>Aucune recommendation pour l'instant.</p>
        </div>

        <div v-if="activeTab === 'Partager'" class="empty-tab">
          <p>Partager votre profil.</p>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopBar               from '../components/TopBar.vue'
import SideBar              from '../components/SideBar.vue'
import StudentProfileHeader from '../components/StudentProfileHeader.vue'
import PostCard             from '../components/PostCard.vue'

const sidebarOpen = ref(false)
const userRole    = ref<'student' | 'teacher' | 'professional'>('student')
const activeTab   = ref('Portfolio')

const currentUser = {
  name:   'Nom Prenom',
  email:  'Exemple.exemple@univ.etu.ac.ma',
  avatar: ''
}

const profile = {
  name:     'Nom Prenom',
  score:    90,
  title:    'Ex Developpeur Operations & Support',
  school:   'Ex Dassault Université de Bretagne Occidentale',
  location: 'Ex Tanger, Tanger-Tetouan-Hussima, Maroc',
  recos:    '500+',
  avatar:   ''
}

const posts = [
  {
    author:      'Nom Prenom & Nom Prenom',
    subtitle:    'Ex Collaboration pour un projet académique',
    description: 'Ex de description d\'un projet académique ou une stage application de gestion de biblio d\'une application web permettant de gérer les livres, les emprunts et les utilisateurs en sous supervision de Mme @k3blghzal et Mr @fianfiani en collaboration ... pour faire quelque chose.',
    avatar:      '',
    images:      []
  }
]

function handleComment(index: number) { console.log('Comment on post', index) }
function handleShare(index: number)   { console.log('Share post', index) }
</script>

<style scoped>
.page { display: flex; flex-direction: column; min-height: 100vh; background: #f0f2f8; }
.body-area { display: flex; flex: 1; }

.content {
  margin-left: 0;
  flex: 1;
  padding: 24px;
  min-height: calc(100vh - 80px);
  transition: margin-left 0.3s ease;
}
.content.shifted { margin-left: 220px; }

.empty-tab { text-align: center; padding: 60px 0; color: var(--text-muted); font-size: .9rem; }
</style>