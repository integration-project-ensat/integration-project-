<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.js'
import TopBar from '../components/TopBar.vue'
import SideBar from '../components/exploreStudent/Sidebar.vue'
import { profileService } from '../services/profile.service'

const router = useRouter()
const auth = useAuthStore()
const sidebarOpen = ref(false)
type ProfileRole = 'student' | 'teacher' | 'professional'
const profileRole = ref<ProfileRole>('student')

// ── Sections edit toggles ──
const editingInfo    = ref(false)
const editingAbout   = ref(false)
const editingSkills  = ref(false)
const editingContact = ref(false)

// ── Success / error feedback ──
const toast = ref<{ msg: string; type: 'success' | 'error' } | null>(null)
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 2800)
}

// ──────────────────────────────────────────────
// Données profil
// ──────────────────────────────────────────────
const profile = reactive({
  id:        null as number | null,
  name:      'Nom Prénom',
  title:     'Développeur Full Stack',
  school:    'ENSA Tanger',
  location:  '',
  score:     0,
  recos:     '500+',
  bio:       'Étudiant motivé, passionné par le développement web et les projets collaboratifs.',
  email:     'exemple@univ.etu.ac.ma',
  phone:     '+212 6 00 00 00 00',
  website:   'https://portfolio.example.com',
  linkedin:  'https://linkedin.com/in/exemple',
  github:    'https://github.com/exemple',
  avatar:    null as string | null,
  banner:    null as string | null,
  bannerColor: '#1a3c5e',
})

function applyBackendProfile(data: any) {
  profileRole.value = normalizeProfileRole(data?.raw?.role)
  profile.id = Number(data?.id ?? 0) || null
  profile.name = data?.name || profile.name
  profile.title = data?.title || profile.title
  profile.school = data?.school || profile.school
  profile.location = data?.location || profile.location
  profile.score = Number(data?.score ?? 0)
  profile.recos = data?.recos || profile.recos
  profile.bio = data?.bio || ''
  profile.email = data?.email || ''
  profile.phone = data?.phone || ''
  profile.website = data?.website || ''
  profile.linkedin = data?.linkedin || ''
  profile.github = data?.github || ''
  profile.avatar = data?.avatar || null
  profile.banner = data?.banner || null
}

function syncCurrentUserAssets(avatar: string | null, banner: string | null) {
  if (auth.user) {
    const currentUser = auth.user as Record<string, any>
    auth.user = {
      ...currentUser,
      avatar: avatar || currentUser.avatar || '',
      banner: banner || currentUser.banner || ''
    }
  }

  const storedUser = localStorage.getItem('user')
  if (!storedUser) return

  try {
    const parsed = JSON.parse(storedUser)
    localStorage.setItem(
      'user',
      JSON.stringify({
        ...parsed,
        avatar: avatar || parsed.avatar || '',
        banner: banner || parsed.banner || ''
      })
    )
  } catch {
    // Ignore malformed session payloads and keep the current in-memory state.
  }
}

function normalizeProfileRole(roleRaw: unknown): ProfileRole {
  const role = String(roleRaw || '').trim().toUpperCase()
  if (role === 'PROFESSEUR' || role === 'TEACHER') return 'teacher'
  if (role === 'PROFESSIONNEL' || role === 'PROFESSIONAL') return 'professional'
  return 'student'
}

async function loadProfile() {
  try {
    applyBackendProfile(await profileService.getCurrentUser())
  } catch (error) {
    console.warn('Chargement du profil impossible', error)
    showToast('Impossible de charger le profil', 'error')
  }
}

async function persistProfile(payload: Record<string, unknown>) {
  await profileService.updateProfile(profile.id, payload)
  applyBackendProfile(await profileService.getCurrentUser())
}

function buildContactPayload() {
  const payload: Record<string, string> = {}
  if (contactForm.phone.trim()) payload.telephone = contactForm.phone.trim()
  if (contactForm.email.trim()) payload.email_professionnel = contactForm.email.trim()
  if (contactForm.linkedin.trim()) payload.linkedin_url = contactForm.linkedin.trim()
  return payload
}

// Skills
const techSkills = ref(['Vue.js', 'TypeScript', 'Node.js', 'Docker', 'PostgreSQL'])
const softSkills = ref(['Travail en équipe', 'Communication', 'Autonomie'])
const newTechSkill = ref('')
const newSoftSkill = ref('')

// Experiences
interface Experience { id: number; poste: string; entreprise: string; debut: string; fin: string; description: string }
const experiences = ref<Experience[]>([
  { id: 1, poste: 'Développeur Full Stack', entreprise: 'OCP Group', debut: '2025-07', fin: '2025-09', description: 'Développement d\'une application interne de gestion RH.' }
])

// Formations
interface Formation { id: number; diplome: string; etablissement: string; annee: string }
const formations = ref<Formation[]>([
  { id: 1, diplome: 'Ingénierie Informatique et Réseaux', etablissement: 'ENSA Tanger', annee: '2023 – 2026' }
])

// Certifications
interface Certification { id: number; titre: string; organisme: string; date: string }
const certifications = ref<Certification[]>([
  { id: 1, titre: 'AWS Cloud Practitioner', organisme: 'Amazon Web Services', date: 'Jan 2025' }
])

// Langues
interface Langue { id: number; nom: string; niveau: string }
const langues = ref<Langue[]>([
  { id: 1, nom: 'Arabe', niveau: 'Natif' },
  { id: 2, nom: 'Français', niveau: 'Courant' },
  { id: 3, nom: 'Anglais', niveau: 'Professionnel' }
])

// Recommendations
interface Recommendation { id: number; author: string; role: 'teacher' | 'professional'; message: string; date: string }
const recommendations = ref<Recommendation[]>([
  { id: 1, author: 'Mme Professeur Nom', role: 'teacher', message: 'Étudiant sérieux, autonome et très impliqué dans ses projets.', date: '23 Mai 2026' },
  { id: 2, author: 'Mr Professionnel Nom', role: 'professional', message: 'Très bonne capacité d\'analyse et excellent esprit de collaboration.', date: '20 Mai 2026' }
])

// Publications
interface Publication {
  id: number; text: string; images: string[]
  date: string; timestamp: number
}
const publications = ref<Publication[]>([
  {
    id: 1,
    text: 'Projet académique : application de gestion de bibliothèque en collaboration avec Nom Prénom. Stack : Vue 3, Node.js, PostgreSQL.',
    images: [],
    date: '5 Juin 2026',
    timestamp: Date.now() - 86400000
  }
])
const pubSortAsc = ref(false)
const sortedPublications = computed(() =>
  [...publications.value].sort((a, b) =>
    pubSortAsc.value ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
  )
)

// Publication form
const showPubModal   = ref(false)
const editingPubId   = ref<number | null>(null)
const pubForm = reactive({ text: '', images: [] as string[] })

function openNewPub() {
  editingPubId.value = null
  pubForm.text = ''
  pubForm.images = []
  showPubModal.value = true
}

function openEditPub(pub: Publication) {
  editingPubId.value = pub.id
  pubForm.text = pub.text
  pubForm.images = [...pub.images]
  showPubModal.value = true
}

function deletePub(id: number) {
  if (!confirm('Supprimer cette publication ?')) return
  publications.value = publications.value.filter(p => p.id !== id)
  showToast('Publication supprimée')
}

function onPubImageChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = ev => { if (ev.target?.result) pubForm.images.push(ev.target.result as string) }
    reader.readAsDataURL(file)
  })
  ;(e.target as HTMLInputElement).value = ''
}

function removePubImage(i: number) { pubForm.images.splice(i, 1) }

function savePub() {
  if (!pubForm.text.trim()) return
  const now = Date.now()
  const dateStr = new Date(now).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  if (editingPubId.value !== null) {
    const idx = publications.value.findIndex(p => p.id === editingPubId.value)
    if (idx !== -1 && publications.value[idx]) {
  const current = publications.value[idx]!

  publications.value[idx] = {
    id: current.id,
    date: current.date,
    timestamp: current.timestamp,
    text: pubForm.text.trim(),
    images: [...pubForm.images]
  }
}
    showToast('Publication modifiée')
  } else {
    publications.value.unshift({ id: now, text: pubForm.text.trim(), images: [...pubForm.images], date: dateStr, timestamp: now })
    showToast('Publication ajoutée')
  }
  showPubModal.value = false
}

// ──────────────────────────────────────────────
// Edit forms (copies temporaires)
// ──────────────────────────────────────────────
const infoForm = reactive({ name: '', title: '', school: '', location: '', score: 0 })
const aboutForm = reactive({ bio: '' })
const contactForm = reactive({ email: '', phone: '', website: '', linkedin: '', github: '' })
const skillsForm = reactive({ tech: [] as string[], soft: [] as string[], newTech: '', newSoft: '' })

// Sections modales (experience, formation, certification, langue)
type ModalSection = 'experience' | 'formation' | 'certification' | 'langue' | null
const activeModal = ref<ModalSection>(null)
const editingEntryId = ref<number | null>(null)

const expForm    = reactive({ poste: '', entreprise: '', debut: '', fin: '', description: '' })
const formForm   = reactive({ diplome: '', etablissement: '', annee: '' })
const certForm   = reactive({ titre: '', organisme: '', date: '' })
const langueForm = reactive({ nom: '', niveau: 'Intermédiaire' })

// ──────────────────────────────────────────────
// Avatar / Banner upload
// --------------------------------------------------
async function deleteAvatarPhoto() {
  try {
    await profileService.deleteAvatar()
    profile.avatar = null
    await loadProfile()
    syncCurrentUserAssets(profile.avatar, profile.banner)
    showToast('Photo supprimée', 'success')
  } catch (error) {
    console.warn("Erreur lors de la suppression de la photo", error)
    showToast("Erreur lors de la suppression de la photo", 'error')
  }
}

async function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  showToast('Upload de la photo...', 'success')
  try {
    const photoUrl = await profileService.uploadAvatar(profile.id, file)
    if (!photoUrl) throw new Error("L'URL retournée est vide")
    profile.avatar = photoUrl
    await loadProfile()
    syncCurrentUserAssets(profile.avatar, profile.banner)
    showToast('Photo enregistrée', 'success')
  } catch (error) {
    console.warn("Erreur lors de l'upload de la photo", error)
    showToast("Erreur lors de l'upload de la photo", 'error')
  }
}

async function onBannerChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  showToast('Upload de la bannière...', 'success')
  try {
    const photoUrl = await profileService.uploadBanner(profile.id, file)
    if (!photoUrl) throw new Error("L'URL retournée est vide")
    profile.banner = photoUrl
    await loadProfile()
    syncCurrentUserAssets(profile.avatar, profile.banner)
    showToast('Bannière enregistrée', 'success')
  } catch (error) {
    console.warn("Erreur lors de l'upload de la bannière", error)
    showToast("Erreur lors de l'upload de la bannière", 'error')
  }
}
const bannerStyle = computed(() =>
  profile.banner
    ? { backgroundImage: `url(${profile.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, ${profile.bannerColor} 0%, #2e6da4 100%)` }
)
const showScore = computed(() => profileRole.value === 'student')

const initials = computed(() =>
  profile.name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
)

onMounted(loadProfile)

// ──────────────────────────────────────────────
// Section save helpers
// ──────────────────────────────────────────────
function openEditInfo() {
  Object.assign(infoForm, { name: profile.name, title: profile.title, school: profile.school, location: profile.location, score: profile.score })
  editingInfo.value = true
}
async function saveInfo() {
  try {
    Object.assign(profile, infoForm)
    await persistProfile({
      name: infoForm.name,
      title: infoForm.title,
      adresse: infoForm.location,
      etablissement: infoForm.school,
    })
    editingInfo.value = false
    showToast('Informations enregistrées')
  } catch (error) {
    console.warn('Sauvegarde informations impossible', error)
    showToast('Erreur lors de la sauvegarde', 'error')
  }
}

function openEditAbout() { aboutForm.bio = profile.bio; editingAbout.value = true }
async function saveAbout() {
  try {
    profile.bio = aboutForm.bio
    await persistProfile({ bio: aboutForm.bio })
    editingAbout.value = false
    showToast('Bio enregistrée')
  } catch (error) {
    console.warn('Sauvegarde bio impossible', error)
    showToast('Erreur lors de la sauvegarde', 'error')
  }
}

function openEditContact() {
  Object.assign(contactForm, { email: profile.email, phone: profile.phone, website: profile.website, linkedin: profile.linkedin, github: profile.github })
  editingContact.value = true
}
async function saveContact() {
  try {
    Object.assign(profile, contactForm)
    await persistProfile(buildContactPayload())
    editingContact.value = false
    showToast('Contact enregistré')
  } catch (error) {
    console.warn('Sauvegarde contact impossible', error)
    showToast('Erreur lors de la sauvegarde', 'error')
  }
}

function openEditSkills() {
  skillsForm.tech = [...techSkills.value]
  skillsForm.soft = [...softSkills.value]
  skillsForm.newTech = ''
  skillsForm.newSoft = ''
  editingSkills.value = true
}
function addTech() {
  const v = skillsForm.newTech.trim()
  if (v && !skillsForm.tech.includes(v)) { skillsForm.tech.push(v) }
  skillsForm.newTech = ''
}
function removeTech(i: number) { skillsForm.tech.splice(i, 1) }
function addSoft() {
  const v = skillsForm.newSoft.trim()
  if (v && !skillsForm.soft.includes(v)) { skillsForm.soft.push(v) }
  skillsForm.newSoft = ''
}
function removeSoft(i: number) { skillsForm.soft.splice(i, 1) }
function saveSkills() { techSkills.value = [...skillsForm.tech]; softSkills.value = [...skillsForm.soft]; editingSkills.value = false; showToast('Compétences enregistrées') }

// ──────────────────────────────────────────────
// Generic entry modals (exp, formation, cert, langue)
// ──────────────────────────────────────────────
function openAddEntry(section: ModalSection) {
  editingEntryId.value = null
  activeModal.value = section
  if (section === 'experience')   Object.assign(expForm, { poste: '', entreprise: '', debut: '', fin: '', description: '' })
  if (section === 'formation')    Object.assign(formForm, { diplome: '', etablissement: '', annee: '' })
  if (section === 'certification') Object.assign(certForm, { titre: '', organisme: '', date: '' })
  if (section === 'langue')       Object.assign(langueForm, { nom: '', niveau: 'Intermédiaire' })
}

function openEditEntry(section: ModalSection, id: number) {
  editingEntryId.value = id
  activeModal.value = section
  if (section === 'experience') {
    const e = experiences.value.find(x => x.id === id)!
    Object.assign(expForm, e)
  }
  if (section === 'formation') {
    const f = formations.value.find(x => x.id === id)!
    Object.assign(formForm, f)
  }
  if (section === 'certification') {
    const c = certifications.value.find(x => x.id === id)!
    Object.assign(certForm, c)
  }
  if (section === 'langue') {
    const l = langues.value.find(x => x.id === id)!
    Object.assign(langueForm, l)
  }
}

function upsertEntry<T extends { id: number }>(list: { value: T[] }, editId: number | null, form: Omit<T, 'id'>) {
  const now = Date.now()
  if (editId) {
    const idx = list.value.findIndex(x => x.id === editId)
    if (idx !== -1) { list.value[idx] = { id: editId, ...form } as T }
  } else {
    list.value.unshift({ id: now, ...form } as T)
  }
}

function saveEntry() {
  if (activeModal.value === 'experience') {
    upsertEntry(experiences, editingEntryId.value, expForm)
    showToast('Expérience enregistrée')
  } else if (activeModal.value === 'formation') {
    upsertEntry(formations, editingEntryId.value, formForm)
    showToast('Formation enregistrée')
  } else if (activeModal.value === 'certification') {
    upsertEntry(certifications, editingEntryId.value, certForm)
    showToast('Certification enregistrée')
  } else if (activeModal.value === 'langue') {
    upsertEntry(langues, editingEntryId.value, langueForm)
    showToast('Langue enregistrée')
  }
  activeModal.value = null
}

function deleteEntry(section: ModalSection, id: number) {
  if (!confirm('Supprimer cette entrée ?')) return
  if (section === 'experience')    experiences.value    = experiences.value.filter(x => x.id !== id)
  if (section === 'formation')     formations.value     = formations.value.filter(x => x.id !== id)
  if (section === 'certification') certifications.value = certifications.value.filter(x => x.id !== id)
  if (section === 'langue')        langues.value        = langues.value.filter(x => x.id !== id)
  showToast('Supprimé')
}

function getInitials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

const niveaux = ['Débutant', 'Intermédiaire', 'Avancé', 'Courant', 'Natif', 'Professionnel']
</script>

<template>
  <div class="page">
    <TopBar @toggleSidebar="sidebarOpen = !sidebarOpen" />

    <!-- Toast notification -->
    <Transition name="toast">
      <div v-if="toast" class="toast" :class="toast.type">{{ toast.msg }}</div>
    </Transition>

    <div class="body-area">
      <SideBar :isOpen="sidebarOpen" />

      <main class="content" :class="{ shifted: sidebarOpen }">

        <!-- ══ BANNIÈRE + AVATAR ══════════════════════════════ -->
        <div class="profile-card banner-card">

          <div class="banner" :style="bannerStyle">
            <div class="banner-controls">
              <label class="banner-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Changer la bannière
                <input type="file" accept="image/*" @change="onBannerChange" />
              </label>
              <input type="color" v-model="profile.bannerColor" class="color-pick" title="Couleur de bannière" />
              <button v-if="profile.banner" class="banner-btn danger" @click="profile.banner = null">Supprimer</button>
            </div>
          </div>

          <div class="cover-row">
            <div class="avatar-wrap">
              <div class="avatar" :style="{ background: profile.bannerColor }">
                <img v-if="profile.avatar" :src="profile.avatar" alt="avatar" />
                <span v-else>{{ initials }}</span>
              </div>
              <label class="avatar-cam" title="Changer la photo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                <input type="file" accept="image/*" @change="onAvatarChange" />
              </label>
            </div>

            <div class="cover-actions">
              <button v-if="profile.avatar" class="btn-sm danger" @click="deleteAvatarPhoto">Supprimer la photo</button>
              <button class="btn-sm outline" @click="router.push('/profile')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Voir le profil
              </button>
            </div>
          </div>
        </div>

        <!-- ══ INFORMATIONS PERSONNELLES ════════════════════ -->
        <div class="section-card">
          <div class="section-head">
            <h2>Informations personnelles</h2>
            <button class="btn-edit" @click="openEditInfo" v-if="!editingInfo">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier
            </button>
          </div>

          <div v-if="!editingInfo" class="info-display">
            <div class="info-name-row">
              <h1>{{ profile.name }}</h1>
              <span v-if="showScore" class="score-badge">{{ profile.score }}+</span>
            </div>
            <p class="info-title">{{ profile.title }}</p>
            <p class="info-meta">{{ profile.school }}</p>
            <p class="info-meta">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ profile.location }}
            </p>
          </div>

          <div v-else class="edit-form">
            <div class="form-grid">
              <div class="fg">
                <label>Nom complet</label>
                <input v-model="infoForm.name" placeholder="Nom Prénom" />
              </div>
              <div class="fg">
                <label>Titre professionnel</label>
                <input v-model="infoForm.title" placeholder="Ex: Développeur Full Stack" />
              </div>
              <div class="fg">
                <label>École / Établissement</label>
                <input v-model="infoForm.school" placeholder="Ex: ENSA Tanger" />
              </div>
              <div class="fg">
                <label>Localisation</label>
                <input v-model="infoForm.location" placeholder="Ex: Tanger, Maroc" />
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-cancel" @click="editingInfo = false">Annuler</button>
              <button class="btn-save" @click="saveInfo">Enregistrer</button>
            </div>
          </div>
        </div>

        <!-- ══ À PROPOS ═════════════════════════════════════ -->
        <div class="section-card">
          <div class="section-head">
            <h2>À propos</h2>
            <button class="btn-edit" @click="openEditAbout" v-if="!editingAbout">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier
            </button>
          </div>
          <p v-if="!editingAbout" class="bio-text">{{ profile.bio || 'Aucune bio pour l\'instant.' }}</p>
          <div v-else class="edit-form">
            <textarea v-model="aboutForm.bio" rows="4" placeholder="Parlez de vous, vos passions, vos objectifs..." />
            <div class="form-actions">
              <button class="btn-cancel" @click="editingAbout = false">Annuler</button>
              <button class="btn-save" @click="saveAbout">Enregistrer</button>
            </div>
          </div>
        </div>

        <!-- ══ CONTACT ET LIENS ══════════════════════════════ -->
        <div class="section-card">
          <div class="section-head">
            <h2>Contact et liens</h2>
            <button class="btn-edit" @click="openEditContact" v-if="!editingContact">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier
            </button>
          </div>
          <div v-if="!editingContact" class="contact-list">
            <span v-if="profile.email"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>{{ profile.email }}</span>
            <span v-if="profile.phone"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>{{ profile.phone }}</span>
            <a v-if="profile.website" :href="profile.website" target="_blank" rel="noopener"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>{{ profile.website }}</a>
            <a v-if="profile.linkedin" :href="profile.linkedin" target="_blank" rel="noopener" class="link-linkedin">LinkedIn</a>
            <a v-if="profile.github"   :href="profile.github"   target="_blank" rel="noopener" class="link-github">GitHub</a>
          </div>
          <div v-else class="edit-form">
            <div class="form-grid">
              <div class="fg"><label>Email</label><input v-model="contactForm.email" type="email" placeholder="exemple@univ.etu.ac.ma" /></div>
              <div class="fg"><label>Téléphone</label><input v-model="contactForm.phone" placeholder="+212 6 00 00 00 00" /></div>
              <div class="fg"><label>Site web</label><input v-model="contactForm.website" placeholder="https://portfolio.example.com" /></div>
              <div class="fg"><label>LinkedIn</label><input v-model="contactForm.linkedin" placeholder="https://linkedin.com/in/..." /></div>
              <div class="fg"><label>GitHub</label><input v-model="contactForm.github" placeholder="https://github.com/..." /></div>
            </div>
            <div class="form-actions">
              <button class="btn-cancel" @click="editingContact = false">Annuler</button>
              <button class="btn-save" @click="saveContact">Enregistrer</button>
            </div>
          </div>
        </div>

        <!-- ══ COMPÉTENCES ═══════════════════════════════════ -->
        <div class="section-card">
          <div class="section-head">
            <h2>Compétences</h2>
            <button class="btn-edit" @click="openEditSkills" v-if="!editingSkills">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier
            </button>
          </div>

          <div v-if="!editingSkills">
            <p class="skills-label">Techniques</p>
            <div class="chips-row">
              <span v-for="s in techSkills" :key="s" class="chip tech">{{ s }}</span>
            </div>
            <p class="skills-label" style="margin-top:12px">Comportementales</p>
            <div class="chips-row">
              <span v-for="s in softSkills" :key="s" class="chip soft">{{ s }}</span>
            </div>
          </div>

          <div v-else class="edit-form">
            <p class="skills-label">Compétences techniques</p>
            <div class="chips-row">
              <span v-for="(s, i) in skillsForm.tech" :key="s" class="chip tech editable">
                {{ s }}<button type="button" @click="removeTech(i)">✕</button>
              </span>
            </div>
            <div class="skill-add-row">
              <input v-model="skillsForm.newTech" placeholder="Ajouter une compétence..." @keydown.enter.prevent="addTech" />
              <button type="button" class="btn-add-skill" @click="addTech">Ajouter</button>
            </div>

            <p class="skills-label" style="margin-top:14px">Compétences comportementales</p>
            <div class="chips-row">
              <span v-for="(s, i) in skillsForm.soft" :key="s" class="chip soft editable">
                {{ s }}<button type="button" @click="removeSoft(i)">✕</button>
              </span>
            </div>
            <div class="skill-add-row">
              <input v-model="skillsForm.newSoft" placeholder="Ajouter une compétence..." @keydown.enter.prevent="addSoft" />
              <button type="button" class="btn-add-skill" @click="addSoft">Ajouter</button>
            </div>

            <div class="form-actions">
              <button class="btn-cancel" @click="editingSkills = false">Annuler</button>
              <button class="btn-save" @click="saveSkills">Enregistrer</button>
            </div>
          </div>
        </div>

        <!-- ══ EXPÉRIENCES ═══════════════════════════════════ -->
        <div class="section-card">
          <div class="section-head">
            <h2>Expériences professionnelles</h2>
            <button class="btn-add" @click="openAddEntry('experience')">+ Ajouter</button>
          </div>
          <div class="entries-list">
            <div v-for="e in experiences" :key="e.id" class="entry-card">
              <div class="entry-dot" />
              <div class="entry-body">
                <div class="entry-head">
                  <div>
                    <strong>{{ e.poste }}</strong>
                    <span>{{ e.entreprise }}</span>
                  </div>
                  <div class="entry-actions">
                    <button type="button" @click="openEditEntry('experience', e.id)">✏️</button>
                    <button type="button" @click="deleteEntry('experience', e.id)">🗑️</button>
                  </div>
                </div>
                <span class="entry-date">{{ e.debut }} – {{ e.fin || 'En cours' }}</span>
                <p>{{ e.description }}</p>
              </div>
            </div>
            <p v-if="!experiences.length" class="empty-msg">Aucune expérience ajoutée.</p>
          </div>
        </div>

        <!-- ══ FORMATIONS ════════════════════════════════════ -->
        <div class="section-card">
          <div class="section-head">
            <h2>Formations</h2>
            <button class="btn-add" @click="openAddEntry('formation')">+ Ajouter</button>
          </div>
          <div class="entries-list">
            <div v-for="f in formations" :key="f.id" class="entry-card">
              <div class="entry-dot" />
              <div class="entry-body">
                <div class="entry-head">
                  <div>
                    <strong>{{ f.diplome }}</strong>
                    <span>{{ f.etablissement }}</span>
                  </div>
                  <div class="entry-actions">
                    <button type="button" @click="openEditEntry('formation', f.id)">✏️</button>
                    <button type="button" @click="deleteEntry('formation', f.id)">🗑️</button>
                  </div>
                </div>
                <span class="entry-date">{{ f.annee }}</span>
              </div>
            </div>
            <p v-if="!formations.length" class="empty-msg">Aucune formation ajoutée.</p>
          </div>
        </div>

        <!-- ══ CERTIFICATIONS ════════════════════════════════ -->
        <div class="section-card">
          <div class="section-head">
            <h2>Certifications</h2>
            <button class="btn-add" @click="openAddEntry('certification')">+ Ajouter</button>
          </div>
          <div class="entries-list">
            <div v-for="c in certifications" :key="c.id" class="entry-card">
              <div class="entry-dot cert" />
              <div class="entry-body">
                <div class="entry-head">
                  <div>
                    <strong>{{ c.titre }}</strong>
                    <span>{{ c.organisme }}</span>
                  </div>
                  <div class="entry-actions">
                    <button type="button" @click="openEditEntry('certification', c.id)">✏️</button>
                    <button type="button" @click="deleteEntry('certification', c.id)">🗑️</button>
                  </div>
                </div>
                <span class="entry-date">{{ c.date }}</span>
              </div>
            </div>
            <p v-if="!certifications.length" class="empty-msg">Aucune certification ajoutée.</p>
          </div>
        </div>

        <!-- ══ LANGUES ════════════════════════════════════════ -->
        <div class="section-card">
          <div class="section-head">
            <h2>Langues</h2>
            <button class="btn-add" @click="openAddEntry('langue')">+ Ajouter</button>
          </div>
          <div class="lang-grid">
            <div v-for="l in langues" :key="l.id" class="lang-card">
              <div class="lang-info">
                <strong>{{ l.nom }}</strong>
                <span>{{ l.niveau }}</span>
              </div>
              <div class="entry-actions">
                <button type="button" @click="openEditEntry('langue', l.id)">✏️</button>
                <button type="button" @click="deleteEntry('langue', l.id)">🗑️</button>
              </div>
            </div>
            <p v-if="!langues.length" class="empty-msg">Aucune langue ajoutée.</p>
          </div>
        </div>

        <!-- ══ PUBLICATIONS ═══════════════════════════════════ -->
        <div class="section-card">
          <div class="section-head">
            <h2>Publications</h2>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="btn-sort" @click="pubSortAsc = !pubSortAsc" :title="pubSortAsc ? 'Plus récentes d\'abord' : 'Plus anciennes d\'abord'">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/></svg>
                {{ pubSortAsc ? 'Plus anciennes' : 'Plus récentes' }}
              </button>
              <button class="btn-add" @click="openNewPub">+ Nouvelle publication</button>
            </div>
          </div>

          <div class="pub-list">
            <div v-for="pub in sortedPublications" :key="pub.id" class="pub-card">
              <div class="pub-head">
                <div class="pub-meta">
                  <div class="mini-avatar">{{ initials }}</div>
                  <div>
                    <strong>{{ profile.name }}</strong>
                    <span>{{ pub.date }}</span>
                  </div>
                </div>
                <div class="entry-actions">
                  <button type="button" @click="openEditPub(pub)">✏️</button>
                  <button type="button" @click="deletePub(pub.id)">🗑️</button>
                </div>
              </div>
              <p class="pub-text">{{ pub.text }}</p>
              <div v-if="pub.images.length" class="pub-images">
                <img v-for="(img, i) in pub.images" :key="i" :src="img" :alt="`Image ${i+1}`" class="pub-img" />
              </div>
            </div>
            <p v-if="!publications.length" class="empty-msg">Aucune publication. Créez votre première publication.</p>
          </div>
        </div>

        <!-- ══ RECOMMANDATIONS ════════════════════════════════ -->
        <div v-if="false" class="section-card">
          <div class="section-head">
            <h2>Recommandations</h2>
          </div>
          <div class="entries-list" style="gap:12px">
            <div v-for="r in recommendations" :key="r.id" class="reco-card">
              <div class="mini-avatar">{{ getInitials(r.author) }}</div>
              <div class="reco-body">
                <div class="reco-head-row">
                  <div>
                    <strong>{{ r.author }}</strong>
                    <span>{{ r.role === 'teacher' ? 'Professeur' : 'Professionnel' }}</span>
                  </div>
                  <span class="reco-date">{{ r.date }}</span>
                </div>
                <p>{{ r.message || 'Recommandation sans commentaire.' }}</p>
              </div>
            </div>
            <p v-if="!recommendations.length" class="empty-msg">Aucune recommandation reçue.</p>
          </div>
        </div>

      </main>
    </div>

    <!-- ══ MODAL ENTRÉES (exp, formation, cert, langue) ══════ -->
    <Teleport to="body">
      <div v-if="activeModal" class="modal-backdrop" @click.self="activeModal = null">
        <div class="entry-modal">
          <div class="modal-head">
            <h3>
              {{ editingEntryId ? 'Modifier' : 'Ajouter' }}
              {{ activeModal === 'experience' ? 'une expérience' : activeModal === 'formation' ? 'une formation' : activeModal === 'certification' ? 'une certification' : 'une langue' }}
            </h3>
            <button @click="activeModal = null">✕</button>
          </div>
          <div class="modal-body">
            <!-- Experience -->
            <template v-if="activeModal === 'experience'">
              <div class="form-grid">
                <div class="fg"><label>Poste *</label><input v-model="expForm.poste" placeholder="Ex: Développeur Full Stack" /></div>
                <div class="fg"><label>Entreprise *</label><input v-model="expForm.entreprise" placeholder="Ex: OCP Group" /></div>
                <div class="fg"><label>Date de début</label><input type="month" v-model="expForm.debut" /></div>
                <div class="fg"><label>Date de fin</label><input type="month" v-model="expForm.fin" placeholder="Laisser vide si en cours" /></div>
              </div>
              <div class="fg full"><label>Description</label><textarea v-model="expForm.description" rows="3" placeholder="Décrivez vos missions et réalisations..." /></div>
            </template>
            <!-- Formation -->
            <template v-if="activeModal === 'formation'">
              <div class="form-grid">
                <div class="fg"><label>Diplôme *</label><input v-model="formForm.diplome" placeholder="Ex: Ingénierie Informatique" /></div>
                <div class="fg"><label>Établissement *</label><input v-model="formForm.etablissement" placeholder="Ex: ENSA Tanger" /></div>
                <div class="fg full"><label>Période</label><input v-model="formForm.annee" placeholder="Ex: 2023 – 2026" /></div>
              </div>
            </template>
            <!-- Certification -->
            <template v-if="activeModal === 'certification'">
              <div class="form-grid">
                <div class="fg"><label>Titre *</label><input v-model="certForm.titre" placeholder="Ex: AWS Cloud Practitioner" /></div>
                <div class="fg"><label>Organisme *</label><input v-model="certForm.organisme" placeholder="Ex: Amazon Web Services" /></div>
                <div class="fg full"><label>Date</label><input v-model="certForm.date" placeholder="Ex: Jan 2025" /></div>
              </div>
            </template>
            <!-- Langue -->
            <template v-if="activeModal === 'langue'">
              <div class="form-grid">
                <div class="fg"><label>Langue *</label><input v-model="langueForm.nom" placeholder="Ex: Français, Anglais..." /></div>
                <div class="fg">
                  <label>Niveau</label>
                  <select v-model="langueForm.niveau">
                    <option v-for="n in niveaux" :key="n" :value="n">{{ n }}</option>
                  </select>
                </div>
              </div>
            </template>
          </div>
          <div class="modal-foot">
            <button class="btn-cancel" @click="activeModal = null">Annuler</button>
            <button class="btn-save" @click="saveEntry">Enregistrer</button>
          </div>
        </div>
      </div>

      <!-- ══ MODAL PUBLICATION ═══════════════════════════════ -->
      <div v-if="showPubModal" class="modal-backdrop" @click.self="showPubModal = false">
        <div class="entry-modal pub-modal">
          <div class="modal-head">
            <h3>{{ editingPubId ? 'Modifier la publication' : 'Nouvelle publication' }}</h3>
            <button @click="showPubModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="fg full">
              <label>Texte *</label>
              <textarea v-model="pubForm.text" rows="5" placeholder="Quoi de neuf ? Partagez un projet, une expérience, une actualité..." />
            </div>
            <div class="fg full">
              <label>Images</label>
              <div class="pub-images-edit">
                <div v-for="(img, i) in pubForm.images" :key="i" class="pub-img-thumb">
                  <img :src="img" alt="" />
                  <button type="button" class="remove-img-btn" @click="removePubImage(i)">✕</button>
                </div>
                <label class="add-img-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Ajouter
                  <input type="file" accept="image/*" multiple @change="onPubImageChange" />
                </label>
              </div>
            </div>
          </div>
          <div class="modal-foot">
            <button class="btn-cancel" @click="showPubModal = false">Annuler</button>
            <button class="btn-save" :disabled="!pubForm.text.trim()" @click="savePub">
              {{ editingPubId ? 'Enregistrer' : 'Publier' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: var(--bg-soft-purple); }

.body-area {
  position: relative;
  min-height: calc(100vh - 60px);
  overflow-x: hidden;
}

.content {
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px;
  transition: padding-left 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content.shifted { padding-left: 246px; }

/* ── Toast ── */
.toast {
  position: fixed;
  top: 74px; right: 20px;
  z-index: 2000;
  padding: 12px 20px;
  border-radius: var(--radius-pill);
  font-size: 0.88rem;
  font-weight: 700;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  font-family: var(--font-head);
}
.toast.success { background: #2e7d32; color: var(--white); }
.toast.error   { background: var(--error); color: var(--white); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-12px); }

/* ── Cards ── */
.profile-card,
.section-card {
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.07);
  overflow: hidden;
}

/* ── Banner ── */
.banner {
  position: relative;
  height: 150px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 12px;
}

.banner-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.banner-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: rgba(255,255,255,0.9);
  color: var(--text-dark);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-head);
  border: none;
}
.banner-btn.danger { color: var(--error); }
.banner-btn input  { display: none; }

.color-pick {
  width: 30px; height: 30px;
  border: 2px solid var(--white);
  border-radius: 50%;
  cursor: pointer;
  padding: 0;
  background: none;
}

.cover-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 24px 20px;
  margin-top: -40px;
  position: relative;
}

.avatar-wrap { position: relative; flex-shrink: 0; }

.avatar {
  width: 88px; height: 88px;
  border-radius: 50%;
  border: 4px solid var(--white);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 700; color: var(--white);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }

.avatar-cam {
  position: absolute;
  bottom: 2px; right: 2px;
  width: 28px; height: 28px;
  background: var(--purple);
  border-radius: 50%;
  border: 2px solid var(--white);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--white);
}
.avatar-cam input { display: none; }

.cover-actions { display: flex; gap: 8px; align-items: center; padding-top: 44px; }

/* ── Section cards ── */
.section-card { padding: 22px 24px; }
.section-card:last-of-type { display: none; }

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-head h2 {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-dark);
  font-family: var(--font-head);
  margin: 0;
}

/* ── Buttons ── */
.btn-edit {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  border: 1.5px solid var(--purple);
  background: var(--white); color: var(--purple);
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: var(--font-head);
  transition: var(--ease);
}
.btn-edit:hover { background: var(--purple); color: var(--white); }

.btn-add {
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: var(--purple); color: var(--white);
  border: none; font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: var(--font-head);
  transition: var(--ease);
}
.btn-add:hover { background: var(--navy-mid); }

.btn-sort {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--input-bg);
  background: var(--white); color: var(--text-gray);
  font-size: 0.75rem; font-weight: 700;
  cursor: pointer; font-family: var(--font-head);
}
.btn-sort:hover { background: var(--input-bg); }

.btn-sm {
  padding: 7px 14px;
  border-radius: var(--radius-pill);
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: var(--font-head);
  transition: var(--ease);
}
.btn-sm.outline { border: 1.5px solid var(--purple); background: var(--white); color: var(--purple); }
.btn-sm.outline:hover { background: var(--purple); color: var(--white); }
.btn-sm.danger  { border: none; background: none; color: var(--error); }
.btn-sm.danger:hover { background: var(--overlay-danger-08); }

/* ── Info display ── */
.info-display { display: flex; flex-direction: column; gap: 4px; }
.info-name-row { display: flex; align-items: center; gap: 10px; }
.info-name-row h1 { font-size: 1.35rem; font-weight: 800; color: var(--text-dark); font-family: var(--font-head); margin: 0; }
.score-badge { background: var(--error); color: var(--white); font-size: 0.75rem; font-weight: 800; padding: 3px 10px; border-radius: var(--radius-pill); white-space: nowrap; }
.info-title { font-size: 0.95rem; color: var(--text-gray); margin: 2px 0; }
.info-meta { display: inline-flex; align-items: center; gap: 5px; font-size: 0.85rem; color: var(--text-gray); margin: 0; }

/* ── Bio ── */
.bio-text { font-size: 0.9rem; color: var(--text-dark); line-height: 1.65; margin: 0; }

/* ── Contact ── */
.contact-list { display: flex; flex-direction: column; gap: 8px; }
.contact-list span, .contact-list a {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 0.88rem; color: var(--text-dark);
  text-decoration: none;
}
.contact-list a:hover { color: var(--purple); }
.link-linkedin { color: #0a66c2 !important; font-weight: 700; }
.link-github   { color: #24292f !important; font-weight: 700; }

/* ── Skills ── */
.skills-label { font-size: 0.78rem; font-weight: 700; color: var(--text-gray); margin: 0 0 8px; font-family: var(--font-head); }

.chips-row { display: flex; flex-wrap: wrap; gap: 8px; }

.chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.8rem; font-weight: 700;
  font-family: var(--font-head);
}
.chip.tech { background: var(--overlay-purple-10); color: var(--purple); }
.chip.soft { background: rgba(6,182,212,0.1); color: #0891b2; }
.chip.editable button { background: none; border: none; cursor: pointer; font-size: 0.68rem; opacity: 0.6; padding: 0; }
.chip.editable button:hover { opacity: 1; color: var(--error); }

.skill-add-row { display: flex; gap: 8px; margin-top: 10px; }
.skill-add-row input {
  flex: 1; border: 1px solid var(--input-bg); border-radius: 10px;
  padding: 8px 12px; font-size: 0.85rem; color: var(--text-dark); outline: none;
  font-family: var(--font-body);
}
.skill-add-row input:focus { border-color: var(--purple); }
.btn-add-skill {
  padding: 8px 14px; border-radius: var(--radius-pill);
  background: var(--purple); color: var(--white); border: none;
  font-size: 0.8rem; font-weight: 700; cursor: pointer;
}

/* ── Entry cards ── */
.entries-list { display: flex; flex-direction: column; gap: 16px; }

.entry-card { display: flex; gap: 14px; }

.entry-dot {
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--purple); flex-shrink: 0; margin-top: 4px;
}
.entry-dot.cert { background: #2e7d32; }

.entry-body { flex: 1; min-width: 0; }

.entry-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 2px; }
.entry-head strong { display: block; font-size: 0.95rem; font-weight: 800; color: var(--text-dark); font-family: var(--font-head); }
.entry-head span { font-size: 0.82rem; color: var(--text-gray); }
.entry-date { font-size: 0.78rem; color: var(--text-gray); display: block; margin-bottom: 4px; }
.entry-body p { font-size: 0.85rem; color: var(--text-dark); line-height: 1.55; margin: 0; }

.entry-actions { display: flex; gap: 6px; flex-shrink: 0; }
.entry-actions button { background: none; border: none; cursor: pointer; font-size: 0.88rem; opacity: 0.55; transition: var(--ease); padding: 2px 4px; }
.entry-actions button:hover { opacity: 1; }

/* ── Langues ── */
.lang-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
.lang-card {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--input-bg); border-radius: 10px; padding: 10px 14px;
}
.lang-info { display: flex; flex-direction: column; }
.lang-info strong { font-size: 0.88rem; font-weight: 700; color: var(--text-dark); }
.lang-info span { font-size: 0.75rem; color: var(--text-gray); }

/* ── Publications ── */
.pub-list { display: flex; flex-direction: column; gap: 14px; }

.pub-card {
  border: 1px solid var(--input-bg);
  border-radius: 10px;
  padding: 16px;
  transition: var(--ease);
}
.pub-card:hover { box-shadow: 0 4px 14px var(--overlay-purple-10); border-color: var(--overlay-purple-20); }

.pub-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.pub-meta { display: flex; gap: 10px; align-items: center; }
.pub-meta strong { display: block; font-size: 0.88rem; font-weight: 800; color: var(--text-dark); font-family: var(--font-head); }
.pub-meta span { font-size: 0.75rem; color: var(--text-gray); }

.pub-text { font-size: 0.88rem; color: var(--text-dark); line-height: 1.6; margin: 0 0 10px; white-space: pre-wrap; }

.pub-images { display: flex; flex-wrap: wrap; gap: 8px; }
.pub-img { height: 100px; border-radius: 8px; object-fit: cover; cursor: pointer; }

/* ── Recommendations ── */
.reco-card { display: flex; gap: 14px; }
.reco-body { flex: 1; min-width: 0; }
.reco-head-row { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
.reco-head-row strong { display: block; font-size: 0.9rem; font-weight: 800; color: var(--text-dark); font-family: var(--font-head); }
.reco-head-row span { font-size: 0.78rem; color: var(--text-gray); }
.reco-date { font-size: 0.75rem; color: var(--text-gray); white-space: nowrap; }
.reco-body p { font-size: 0.85rem; line-height: 1.55; color: var(--text-dark); margin: 0; }

/* ── Edit form ── */
.edit-form { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.fg { display: flex; flex-direction: column; gap: 5px; }
.fg.full { grid-column: 1 / -1; }

.fg label { font-size: 0.75rem; font-weight: 700; color: var(--text-gray); font-family: var(--font-head); }

.fg input, .fg textarea, .fg select {
  border: 1px solid var(--input-bg);
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 0.85rem;
  color: var(--text-dark);
  background: var(--white);
  outline: none;
  resize: vertical;
  font-family: var(--font-body);
  transition: var(--ease);
}
.fg input:focus, .fg textarea:focus, .fg select:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px var(--overlay-purple-12);
}

.form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }

.btn-cancel {
  padding: 8px 18px; border-radius: var(--radius-pill);
  border: 1px solid var(--input-bg); background: var(--white);
  color: var(--text-gray); font-size: 0.85rem; cursor: pointer;
  font-family: var(--font-head); transition: var(--ease);
}
.btn-cancel:hover { background: var(--input-bg); }

.btn-save {
  padding: 8px 20px; border-radius: var(--radius-pill);
  border: none; background: var(--purple); color: var(--white);
  font-size: 0.85rem; font-weight: 700; cursor: pointer;
  font-family: var(--font-head); transition: var(--ease);
}
.btn-save:hover { background: var(--navy-mid); }
.btn-save:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Mini avatar ── */
.mini-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--overlay-purple-12); color: var(--purple);
  font-family: var(--font-head); font-weight: 800; font-size: 0.82rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden;
}
.mini-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* ── Empty ── */
.empty-msg { font-size: 0.85rem; color: var(--text-gray); text-align: center; padding: 18px 0; }

/* ── Entry modal ── */
.modal-backdrop {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(17,24,39,0.5);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}

.entry-modal {
  background: var(--white); border-radius: 16px;
  width: 100%; max-width: 560px; max-height: 88vh;
  display: flex; flex-direction: column;
  box-shadow: 0 24px 60px rgba(17,24,39,0.2);
}

.pub-modal { max-width: 620px; }

.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--input-bg);
  flex-shrink: 0;
}
.modal-head h3 { font-size: 1rem; font-weight: 800; color: var(--text-dark); font-family: var(--font-head); margin: 0; }
.modal-head button { background: none; border: none; font-size: 1rem; color: var(--text-gray); cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.modal-head button:hover { background: var(--input-bg); }

.modal-body {
  padding: 18px 22px;
  overflow-y: auto; flex: 1;
  display: flex; flex-direction: column; gap: 14px;
}

.modal-foot {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 22px 18px;
  border-top: 1px solid var(--input-bg);
  flex-shrink: 0;
}

/* ── Publication image edit ── */
.pub-images-edit {
  display: flex; flex-wrap: wrap; gap: 10px;
  border: 1.5px dashed var(--input-bg);
  border-radius: 10px; padding: 12px;
  min-height: 80px; align-items: center;
}

.pub-img-thumb { position: relative; }
.pub-img-thumb img { height: 80px; border-radius: 8px; object-fit: cover; }
.remove-img-btn {
  position: absolute; top: -6px; right: -6px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--error); color: var(--white);
  border: none; cursor: pointer; font-size: 0.65rem;
  display: flex; align-items: center; justify-content: center;
}

.add-img-label {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  width: 80px; height: 80px; border-radius: 8px;
  border: 1.5px dashed var(--text-gray);
  color: var(--text-gray); font-size: 0.72rem;
  cursor: pointer; justify-content: center;
}
.add-img-label input { display: none; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .content { max-width: 100%; }
  .content.shifted { padding-left: 16px; }
}

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .banner { height: 110px; }
  .cover-row { flex-direction: column; align-items: flex-start; gap: 12px; }
  .cover-actions { padding-top: 0; }
  .lang-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 400px) {
  .section-card { padding: 16px; }
  .lang-grid { grid-template-columns: 1fr; }
}
</style>
