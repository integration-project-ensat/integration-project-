
<template>
  <div class="profile-header">
    <div class="cover-section">
      <div class="cover-img" />
      <button v-if="isOwner" type="button" class="edit-profile-btn" @click="router.push('/profile/edit')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Modifier le profil
      </button>
      <div class="avatar-wrap">
        <div class="avatar" :class="avatarColorClass(profile.name)">
          <img v-if="profile.avatar" :src="profile.avatar" alt="avatar" />
          <span v-else>{{ initials }}</span>
        </div>
      </div>
    </div>

    <div class="profile-info">
      <div class="name-row">
        <h1>{{ profile.name }}</h1>
        <span class="score">{{ profile.score }}+</span>
      </div>

      <p class="title">{{ profile.title }}</p>
      <p class="school">{{ profile.school }}</p>

      <p class="location">
        {{ profile.location }}
        <button type="button" class="contact" @click="showContact = !showContact">
          • Contact info
        </button>
      </p>

      <button type="button" class="recos-summary" @click="emit('open-recos')">
        <span class="recos-count">{{ profile.recos }} recos</span>

        <span class="recos-avatars">
          <span
            v-for="recommendation in recosPreview"
            :key="recommendation.id"
            class="recos-avatar"
            :class="avatarColorClass(recommendation.author)"
          >
            <img v-if="recommendation.avatar" :src="recommendation.avatar" alt="" />
            <span v-else>{{ getInitials(recommendation.author) }}</span>
          </span>
        </span>
      </button>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          type="button"
          class="tab"
          :class="{
            portfolio: tab === 'Portfolio',
            recommendation: tab === 'Recommander',
            connect: tab === 'Connecter',
            competances: tab === 'Compétances',
            about: tab === 'À propos',
            share: tab === 'Partager'
          }"
          @click="handleTabClick(tab)"
        >
          {{ tab }}
        </button>
      </div>

      <div v-if="showContact" class="contact-section">
        <h3>Contact info</h3>

        <div class="contact-details">
          <div v-if="profile.email">
            <strong>Email:</strong>
            <a :href="'mailto:' + profile.email">{{ profile.email }}</a>
          </div>

          <div v-if="profile.website">
            <strong>Site:</strong>
            <a :href="profile.website" target="_blank" rel="noopener">
              {{ profile.website }}
            </a>
          </div>

          <div v-if="profile.linkedin">
            <strong>LinkedIn:</strong>
            <a :href="profile.linkedin" target="_blank" rel="noopener">
              Profil
            </a>
          </div>
        </div>
      </div>

      <div v-if="showAbout" class="about-section">
        <h3>À propos</h3>
        <p v-if="profile.bio" class="bio">{{ profile.bio }}</p>
        <p v-else class="bio muted">Aucune bio pour l’instant.</p>
      </div>

      <div v-if="showCompetances" class="competances-dropdown">
        <div class="competances-section">
          <h3>Compétances Techniques</h3>
          <div class="skills-flex-list">
            <span 
              v-for="skill in technicalSkills" 
              :key="skill.name" 
              class="skill-tag clickable"
              @click="openSkillPopup(skill, 'tech')"
            >
              {{ skill.name }}
            </span>
          </div>
        </div>

        <div class="competances-section">
          <h3>Compétances Comportementales</h3>
          <div class="skills-flex-list">
            <span 
              v-for="skill in softSkills" 
              :key="skill.name" 
              class="skill-tag soft clickable"
              @click="openSkillPopup(skill, 'soft')"
            >
              {{ skill.name }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="showShare" class="share-dropdown">
        <div class="share-card-internal">
          <h3>Partager ce profil</h3>
          <p class="share-subtitle">Copiez le lien ou partagez directement avec votre réseau.</p>

          <div class="link-box">
            <span>{{ profileUrl }}</span>
            <button type="button" class="copy-btn" @click="copyProfileLink">
              {{ copied ? 'Copié' : 'Copier' }}
            </button>
          </div>

          <div class="share-actions">
            <a :href="gmailShareUrl" target="_blank" rel="noopener" class="share-card-btn gmail" title="Partager par Gmail">
              <div class="icon-wrapper">
                <i class="fa-solid fa-envelope"></i>
              </div>
              <span>Gmail</span>
            </a>

            <a :href="linkedinShareUrl" target="_blank" rel="noopener" class="share-card-btn linkedin" title="Partager sur LinkedIn">
              <div class="icon-wrapper">
                <i class="fa-brands fa-linkedin-in"></i>
              </div>
              <span>LinkedIn</span>
            </a>

            <a :href="whatsappShareUrl" target="_blank" rel="noopener" class="share-card-btn whatsapp" title="Partager sur WhatsApp">
              <div class="icon-wrapper">
                <i class="fa-brands fa-whatsapp"></i>
              </div>
              <span>WhatsApp</span>
            </a>

            <a :href="xShareUrl" target="_blank" rel="noopener" class="share-card-btn x-twitter" title="Partager sur X">
              <div class="icon-wrapper">
                <i class="fa-brands fa-x-twitter"></i>
              </div>
              <span>X</span>
            </a>
          </div>
        </div>
      </div>

      <div class="recos-section">
        <div class="reco-card">
          <p class="reco-label">Reco plus récent de profs</p>

          <div v-if="latestTeacherReco" class="reco-item">
            <span class="reco-avatar" :class="avatarColorClass(latestTeacherReco.author)">
              <img v-if="latestTeacherReco.avatar" :src="latestTeacherReco.avatar" alt="" />
              <span v-else>{{ getInitials(latestTeacherReco.author) }}</span>
            </span>
            <span>{{ latestTeacherReco.message || 'Recommandation sans commentaire.' }}</span>
          </div>

          <div v-else class="reco-item muted">
            <span class="dot" />
            <span>Aucune recommandation récente.</span>
          </div>
        </div>

        <div class="reco-card">
          <p class="reco-label">Reco plus récent de professionnels</p>

          <div v-if="latestProfessionalReco" class="reco-item">
            <span class="reco-avatar" :class="avatarColorClass(latestProfessionalReco.author)">
              <img v-if="latestProfessionalReco.avatar" :src="latestProfessionalReco.avatar" alt="" />
              <span v-else>{{ getInitials(latestProfessionalReco.author) }}</span>
            </span>
            <span>{{ latestProfessionalReco.message || 'Recommandation sans commentaire.' }}</span>
          </div>

          <div v-else class="reco-item muted">
            <span class="dot" />
            <span>Aucune recommandation récente.</span>
          </div>
        </div>

        <div class="reco-card">
          <p class="reco-label">Reco plus récent d'étudiants</p>

          <div v-if="latestStudentReco" class="reco-item">
            <span class="reco-avatar" :class="avatarColorClass(latestStudentReco.author)">
              <img v-if="latestStudentReco.avatar" :src="latestStudentReco.avatar" alt="" />
              <span v-else>{{ getInitials(latestStudentReco.author) }}</span>
            </span>
            <span>{{ latestStudentReco.message || 'Recommandation sans commentaire.' }}</span>
          </div>

          <div v-else class="reco-item muted">
            <span class="dot" />
            <span>Aucune recommandation récente.</span>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showSkillModal && selectedSkill"
      class="modal-backdrop"
      @click.self="showSkillModal = false"
    >
      <div class="skill-detail-modal">
        <div class="modal-head">
          <div class="skill-title-wrapper">
            <span class="modal-skill-badge" :class="selectedSkill.type">
              {{ selectedSkill.name }}
            </span>
          </div>
          <button type="button" class="close-modal-btn" @click="showSkillModal = false">×</button>
        </div>

        <div class="modal-body">
          <div class="modal-level-section">
            <span class="level-label">Niveau d'expertise :</span>
            <div class="modal-progress-container">
              <div class="progress-line-only">
                <div class="line-fill" :class="selectedSkill.type" :style="{ width: selectedSkill.level + '%' }"></div>
              </div>
              <span class="percentage-text">{{ selectedSkill.level }}%</span>
            </div>
          </div>

          <hr class="modal-separator" />

          <div class="modal-details-section">
            <h4>Description & Application</h4>
            <p class="skill-description">{{ selectedSkill.description }}</p>
            
            <div class="skill-meta-info">
              <div class="meta-item">
                <span class="meta-icon">📁</span>
                <span>Utilisé activement dans <strong>{{ selectedSkill.projectsCount }} projet(s)</strong> portfolio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

type Recommendation = {
  id: number
  author: string
  role: 'teacher' | 'professional' | 'student'
  avatar?: string
  message?: string
  date?: string
}

type SkillItem = {
  name: string
  level: number
  description: string
  projectsCount: number
}

type SelectedSkillState = SkillItem & {
  type: 'tech' | 'soft'
}

const showCompetances = ref(false)
const router = useRouter()

const showAbout = ref(false)
const showContact = ref(false)
const showShare = ref(false)
const copied = ref(false)

// Gestion du pop-up des compétences
const showSkillModal = ref(false)
const selectedSkill = ref<SelectedSkillState | null>(null)

const props = defineProps<{
  profile: {
    name: string
    score: number
    title: string
    school: string
    location: string
    recos: string
    avatar?: string
    bio?: string
    email?: string
    website?: string
    linkedin?: string
    technicalSkills?: SkillItem[]
    softSkills?: SkillItem[]
  }
  modelValue: string
  recentRecommendations?: Recommendation[]
  isOwner?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'open-recos'): void
  (e: 'open-portfolio'): void
}>()

const tabs = ['Portfolio', 'Recommander', 'Connecter', 'Compétances', 'À propos', 'Partager']

const technicalSkills = computed(() => props.profile.technicalSkills ?? [])
const softSkills = computed(() => props.profile.softSkills ?? [])

// Liens de Partage Dynamiques
const profileUrl = computed(() => {
  return window.location.origin + '/profile'
})
const encodedProfileUrl = computed(() => encodeURIComponent(profileUrl.value))
const encodedShareText = computed(() => encodeURIComponent(`Découvrez le profil de ${props.profile.name}`))

const gmailShareUrl = computed(() => `mailto:?subject=${encodedShareText.value}&body=${encodedShareText.value}%0A${encodedProfileUrl.value}`)
const linkedinShareUrl = computed(() => `https://www.linkedin.com/sharing/share-offsite/?url=${encodedProfileUrl.value}`)
const whatsappShareUrl = computed(() => `https://wa.me/?text=${encodedShareText.value}%20${encodedProfileUrl.value}`)
const xShareUrl = computed(() => `https://twitter.com/intent/tweet?text=${encodedShareText.value}&url=${encodedProfileUrl.value}`)

const recosPreview = computed(() => props.recentRecommendations?.slice(0, 3) ?? [])
const latestTeacherReco = computed(() => props.recentRecommendations?.find((reco) => reco.role === 'teacher'))
const latestProfessionalReco = computed(() => props.recentRecommendations?.find((reco) => reco.role === 'professional'))
const latestStudentReco = computed(() => props.recentRecommendations?.find((reco) => reco.role === 'student'))
const initials = computed(() => getInitials(props.profile.name))

function openSkillPopup(skill: SkillItem, type: 'tech' | 'soft') {
  selectedSkill.value = { ...skill, type }
  showSkillModal.value = true
}

async function copyProfileLink() {
  await navigator.clipboard.writeText(profileUrl.value)
  copied.value = true
  window.setTimeout(() => { copied.value = false }, 1600)
}

const handleTabClick = (tab: string) => {
  showContact.value = false
  
  // Fermeture croisée des sections internes du Header
  showCompetances.value = tab === 'Compétances' ? !showCompetances.value : false
  showAbout.value = tab === 'À propos' ? !showAbout.value : false
  showShare.value = tab === 'Partager' ? !showShare.value : false

  if (tab === 'Portfolio') {
    showCompetances.value = false
    showAbout.value = false
    emit('open-portfolio')
    return
  }

  if (tab === 'Compétances' || tab === 'À propos' || tab === 'Partager') {
    return
  }
  if (props.modelValue === tab) {
    emit('update:modelValue', 'Portfolio')
  } else {
    emit('update:modelValue', tab)
  }
}

function avatarColorClass(name: string) {
  const colors = ['avatar-blue', 'avatar-orange', 'avatar-indigo', 'avatar-green', 'avatar-deep-blue', 'avatar-brown', 'avatar-purple', 'avatar-slate']
  const sum = name.split('').reduce((total, char) => total + char.charCodeAt(0), 0)
  return colors[sum % colors.length]
}

function getInitials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}
</script>

<style scoped>
.profile-header {
  background: white;
  border-radius: 14px;
  margin-top: 35px;
  margin-bottom: 10px;
  overflow: hidden;
  box-shadow: 0 14px 38px rgba(15, 23, 42, .08);
}

.cover-section {
  position: relative;
  margin-bottom: 56px;
  isolation: isolate;
}

.cover-img {
  width: 100%;
  height: 190px;
  background-color: #eef5ff;
  background-image:
    linear-gradient(135deg, rgba(255, 255, 255, .9) 0%, rgba(255, 255, 255, .14) 38%, rgba(255, 255, 255, 0) 72%),
    radial-gradient(circle at 86% 18%, rgba(3, 155, 229, .34) 0%, rgba(3, 155, 229, .11) 36%, transparent 62%),
    radial-gradient(circle at 18% 78%, rgba(94, 53, 177, .2) 0%, rgba(94, 53, 177, .08) 42%, transparent 66%),
    radial-gradient(#9ca3af .85px, transparent .85px),
    radial-gradient(#cbd5e1 .85px, transparent .85px),
    linear-gradient(120deg, #f8fbff 0%, #eaf4ff 46%, #f6f2ff 100%);
  background-size: 100% 100%, 100% 100%, 100% 100%, 22px 22px, 22px 22px, 100% 100%;
  background-position: 0 0, 0 0, 0 0, 0 0, 11px 11px, 0 0;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(148, 163, 184, .26);
  border-radius: 0 0 34px 34px / 0 0 18px 18px;
  clip-path: ellipse(116% 100% at 50% 0%);
}

.cover-img::before,
.cover-img::after {
  content: "";
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
}

.cover-img::before {
  width: 290px;
  height: 88px;
  right: -42px;
  top: 34px;
  background: linear-gradient(90deg, rgba(3, 155, 229, .2), rgba(94, 53, 177, .12));
  transform: rotate(-13deg);
}

.cover-img::after {
  width: 230px;
  height: 70px;
  left: -64px;
  bottom: 18px;
  background: linear-gradient(90deg, rgba(94, 53, 177, .14), rgba(3, 155, 229, .14));
  transform: rotate(16deg);
}

.cover-section::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 64px;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), #ffffff 78%);
}

.avatar-wrap {
  position: absolute;
  z-index: 2;
  bottom: -50px;
  left: 24px;
  padding: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .8);
  box-shadow: 0 14px 32px rgba(15, 23, 42, .14);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 4px solid white;
  background: var(--avatar-bg, #039be5);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head);
  font-size: 1.5rem;
  font-weight: 700;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .2);
}

.avatar img,
.recos-avatar img,
.reco-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  padding: 0 24px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

h1 {
  font-family: var(--font-head);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-dark);
}

.score {
  color: var(--error);
  font-size: 1.1rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
  font-family: var(--font-head);
}

.title,
.school,
.location {
  color: var(--text-dark);
  font-size: .82rem;
  margin-bottom: 3px;
}

.contact {
  border: 0;
  background: transparent;
  color: var(--purple);
  cursor: pointer;
  font: inherit;
  padding: 0;
}

.contact:hover,
.recos-summary:hover .recos-count {
  text-decoration: underline;
}

.recos-summary {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 0;
  padding: 0;
  margin: 0 0 12px;
  cursor: pointer;
  line-height: 1;
}

.recos-count {
  display: inline-flex;
  align-items: center;
  height: 26px;
  font-size: .9rem;
  font-weight: 700;
  color: var(--purple);
  line-height: 1;
}

.recos-avatars {
  display: inline-flex;
  align-items: center;
  height: 26px;
}

.recos-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--avatar-bg, #039be5);
  border: 2px solid #ffffff;
  color: #ffffff;
  font-family: var(--font-head);
  font-size: .58rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-left: -6px;
  line-height: 1;
}

.recos-avatar:first-child {
  margin-left: 0;
}

.tabs {
  display: flex;
  align-items: center;
  gap: 18px;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
  padding-bottom: 8px;
  overflow-x: auto;
}

.tab {
  min-width: 132px;
  height: 40px;
  padding: 0 26px;
  background: #ffffff;
  border: 2px solid #8d8d8d;
  color: #666666;
  font-family: var(--font-head);
  font-size: .9rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--ease);
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab.portfolio {
  background: var(--purple);
  border-color: var(--purple);
  color: #ffffff;
  border-radius: 100px 180px 0 100px;
}

.tab.recommendation,
.tab.competances,
.tab.about,
.tab.share,
.tab.connect {
  border-radius: 180px 100px 100px 0;
}

.tab.recommendation { min-width: 180px; }
.tab.competances { min-width: 170px; }
.tab.about, .tab.share { min-width: 150px; }
.tab.connect { min-width: 160px; }

.tab:hover:not(.portfolio) {
  border-color: var(--purple);
  color: var(--purple);
}

.contact-section,
.about-section,
.competances-dropdown,
.share-dropdown {
  border-top: 1px solid #f0f0f0;
  padding: 14px 0 18px;
}

.contact-section h3,
.about-section h3,
.competances-section h3,
.share-card-internal h3 {
  font-size: .85rem;
  font-weight: 700;
  margin-bottom: 14px;
  font-family: var(--font-head);
  color: var(--text-dark);
}

.contact-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: .82rem;
  color: var(--text-muted);
}

.contact-details a {
  color: var(--purple);
}

.bio {
  color: var(--text-dark);
  margin-bottom: 8px;
}

.bio.muted {
  color: var(--text-muted);
}

/* Grille des compétences */
.competances-dropdown {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.skills-flex-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.skill-tag {
  background: #eeecff;
  color: var(--purple);
  font-size: .78rem;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 20px;
  white-space: nowrap;
  user-select: none;
}

.skill-tag.soft {
  background: #f0fdf4;
  color: #16a34a;
}

.skill-tag.clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.skill-tag.clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* --- DESIGN PREMIUM ZONE DE PARTAGE --- */
.share-card-internal {
  background: white;
}

.share-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.link-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 6px 10px;
  margin-bottom: 20px;
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

.copy-btn {
  min-height: 34px;
  padding: 0 16px;
  border-radius: 50px 50px 0 50px;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-weight: 700;
  border: none;
  cursor: pointer;
}

.share-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.share-card-btn {
  flex: 1;
  min-width: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 12px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #eef2f6;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.share-card-btn span {
  font-family: var(--font-head);
  font-size: 0.85rem;
  font-weight: 600;
  color: #4b5563;
  transition: color 0.2s ease;
}

.icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

/* Gradients et Effets par marque */
.share-card-btn.gmail .icon-wrapper {
  background: linear-gradient(135deg, #ff5252, #e53935);
  box-shadow: 0 4px 10px rgba(229, 57, 53, 0.2);
}
.share-card-btn.gmail:hover { border-color: #ff5252; background: #fff8f8; }

.share-card-btn.linkedin .icon-wrapper {
  background: linear-gradient(135deg, #0077b5, #00598a);
  box-shadow: 0 4px 10px rgba(0, 119, 181, 0.2);
}
.share-card-btn.linkedin:hover { border-color: #0077b5; background: #f4f9fc; }

.share-card-btn.whatsapp .icon-wrapper {
  background: linear-gradient(135deg, #25d366, #1ebd59);
  box-shadow: 0 4px 10px rgba(37, 211, 102, 0.2);
}
.share-card-btn.whatsapp:hover { border-color: #25d366; background: #f5fcf7; }

.share-card-btn.x-twitter .icon-wrapper {
  background: linear-gradient(135deg, #2d3748, #0f1419);
  box-shadow: 0 4px 10px rgba(15, 20, 25, 0.2);
}
.share-card-btn.x-twitter:hover { border-color: #0f1419; background: #f7f9fa; }

.share-card-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
}
.share-card-btn:hover .icon-wrapper { transform: scale(1.08); }
.share-card-btn:hover span { color: #111827; }

/* Modales et Backdrops */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(17, 24, 39, .4);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}

.skill-detail-modal {
  width: min(440px, 92vw);
  background: white;
  border-radius: 12px;
  padding: 22px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: scaleUp 0.2s ease-out;
}

@keyframes scaleUp {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modal-skill-badge {
  font-size: .95rem;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: 30px;
  font-family: var(--font-head);
}

.modal-skill-badge.tech { background: #eeecff; color: var(--purple); }
.modal-skill-badge.soft { background: #f0fdf4; color: #16a34a; }

.close-modal-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f3f4f6;
  font-size: 1.3rem;
  color: var(--text-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
}

.close-modal-btn:hover { background: #e5e7eb; }

.modal-level-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.level-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-line-only {
  flex: 1;
  height: 4px;
  background: transparent;
  position: relative;
}

.line-fill { height: 100%; border-radius: 4px; }
.line-fill.tech { background: var(--purple); }
.line-fill.soft { background: #16a34a; }

.percentage-text {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-dark);
  font-family: var(--font-head);
  min-width: 45px;
  text-align: right;
}

.modal-separator {
  border: 0;
  border-top: 1px solid #f1f5f9;
  margin: 16px 0;
}

.modal-details-section h4 {
  font-family: var(--font-head);
  font-size: 0.85rem;
  color: var(--text-dark);
  margin-bottom: 6px;
  font-weight: 700;
}

.skill-description {
  font-size: 0.88rem;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 16px;
}

.skill-meta-info {
  background: #f8fafc;
  border-radius: 6px;
  padding: 10px 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: var(--text-dark);
}

.recos-section {
  display: flex;
  gap: 12px;
  padding: 16px 0 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

.reco-card {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 14px;
  min-height: 70px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.reco-label {
  font-size: .78rem;
  color: var(--text-muted);
  margin-bottom: 8px;
  font-weight: 600;
}

.reco-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: .82rem;
  color: var(--text-dark);
}

.reco-item.muted { color: var(--text-muted); }

.reco-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--avatar-bg, #039be5);
  color: #ffffff;
  font-family: var(--font-head);
  font-size: .58rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  line-height: 1;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
  flex-shrink: 0;
}

.avatar-blue { --avatar-bg: #039be5; }
.avatar-orange { --avatar-bg: #f57c00; }
.avatar-indigo { --avatar-bg: #5e6ad2; }
.avatar-green { --avatar-bg: #43a047; }
.avatar-deep-blue { --avatar-bg: #0277bd; }
.avatar-brown { --avatar-bg: #8d6e63; }
.avatar-purple { --avatar-bg: #5e35b1; }
.avatar-slate { --avatar-bg: #5c6bc0; }
.edit-profile-btn {
  position: absolute;
  top: 14px;
  right: 16px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 36px;
  padding: 0 18px;
  background: rgba(255, 255, 255, 0.88);
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  border-radius: 100px;
  color: var(--purple);
  font-family: var(--font-head);
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px rgba(15, 23, 42, .14);
  transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
}

.edit-profile-btn:hover {
  background: white;
  box-shadow: 0 4px 16px rgba(15, 23, 42, .18);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .profile-header {
    border-radius: 12px;
  }

  .cover-section {
    margin-bottom: 50px;
  }

  .cover-img {
    height: 158px;
    clip-path: ellipse(130% 100% at 50% 0%);
  }

  .cover-img::before {
    width: 210px;
    height: 68px;
    right: -76px;
    top: 28px;
  }

  .cover-img::after {
    width: 180px;
    height: 58px;
    left: -86px;
    bottom: 20px;
  }

  .avatar-wrap {
    left: 18px;
    bottom: -46px;
  }

  .avatar {
    width: 88px;
    height: 88px;
  }

  .competances-dropdown {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .share-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

</style>
