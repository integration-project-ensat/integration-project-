<template>
  <div class="page">
    <TopBar @toggleSidebar="sidebarOpen = !sidebarOpen" />

    <div class="body-area">
      <SideBar :role="userRole" :user="currentUser" :isOpen="sidebarOpen" />

      <main class="content" :class="{ shifted: sidebarOpen }">

        <!-- Header -->
        <section class="page-head">
          <div>
            <h1>Mes Projets</h1>
            <p>Tous vos projets personnels, académiques et de formation.</p>
          </div>
        </section>

        <!-- Filters bar -->
        <section class="filters-bar">
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="filter-btn"
            :class="{ active: activeCategory === cat.value }"
            @click="activeCategory = cat.value"
          >
            <span class="cat-dot" :style="{ background: cat.color }"></span>
            {{ cat.label }}
            <span class="cat-count">{{ countByCategory(cat.value) }}</span>
          </button>

          <div class="search-box">
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
  </svg>
  <input v-model="searchQuery" type="text" placeholder="Rechercher un projet..." />
</div>
        </section>

        <!-- Projects grid -->
        <section class="projects-grid" v-if="filteredProjects.length > 0">
          <article
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
            :id="`project-${project.id}`"
            :class="{ 'is-highlighted': highlightedProjectId === project.id }"
          >
            <!-- Card top color bar -->
            <div class="card-bar" :style="{ background: categoryColor(project.category) }"></div>

            <div class="card-body">
              <!-- Category + date -->
              <div class="card-meta-top">
                <span class="category-badge" :style="badgeStyle(project.category)">
                  {{ categoryLabel(project.category) }}
                </span>
                <span class="card-date">{{ formatDate(project.completedAt) }}</span>
              </div>

              <!-- Title + description -->
              <h2 class="project-title">{{ project.name }}</h2>
              <p class="project-desc">{{ project.description }}</p>

              <!-- Technologies -->
              <div class="tech-list">
                <span v-for="tech in project.technologies" :key="tech" class="tech-tag">
                  {{ tech }}
                </span>
              </div>

              <!-- Divider -->
              <div class="card-divider"></div>

              <!-- Supervisor & team -->
              <div class="card-meta-bottom">
                <div v-if="project.supervisor" class="meta-row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span>{{ project.supervisor }}</span>
                </div>
                <div v-if="project.teamMembers && project.teamMembers.length > 0" class="meta-row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <div class="team-avatars">
                    <span
                      v-for="member in project.teamMembers.slice(0, 3)"
                      :key="member"
                      class="team-avatar"
                      :title="member"
                    >{{ getInitials(member) }}</span>
                    <span v-if="project.teamMembers.length > 3" class="team-avatar more">
                      +{{ project.teamMembers.length - 3 }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="card-actions">
                <button class="btn-edit" @click="openModal(project)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Modifier
                </button>
                <button class="btn-delete" @click="deleteProject(project.id)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          </article>
        </section>

        <!-- Empty state -->
        <div v-else class="empty-state">
          <div class="empty-icon">🗂️</div>
          <p>Aucun projet trouvé.</p>
        </div>

      </main>
    </div>

    <!-- ── Modal ajout / modification ─────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">

          <div class="modal-header">
            <h2>Modifier le projet</h2>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <div class="form-grid">

              <!-- Nom -->
              <div class="form-field full">
                <label>Nom du projet <span class="required">*</span></label>
                <input v-model="form.name" type="text" placeholder="Ex: PheraCore Platform" />
              </div>

              <!-- Description -->
              <div class="form-field full">
                <label>Description</label>
                <textarea v-model="form.description" rows="3" placeholder="Décrivez brièvement votre projet..."></textarea>
              </div>

              <!-- Catégorie -->
              <div class="form-field">
                <label>Catégorie <span class="required">*</span></label>
                <select v-model="form.category">
                  <option value="">-- Choisir --</option>
                  <option value="personal">Personnel</option>
                  <option value="academic">Académique</option>
                  <option value="training">Formation</option>
                </select>
              </div>

              <!-- Date -->
              <div class="form-field">
                <label>Date d'achèvement <span class="required">*</span></label>
                <input v-model="form.completedAt" type="date" />
              </div>

              <!-- Technologies -->
              <div class="form-field full">
                <label>Technologies utilisées</label>
                <div class="tag-input-wrapper">
                  <span v-for="(tech, i) in form.technologies" :key="i" class="tech-tag editable">
                    {{ tech }}
                    <button @click="removeTech(i)">×</button>
                  </span>
                  <input
                    v-model="techInput"
                    type="text"
                    placeholder="Ajouter une techno... (Entrée)"
                    @keydown.enter.prevent="addTech"
                    @keydown.comma.prevent="addTech"
                  />
                </div>
              </div>

              <!-- Superviseur -->
              <div class="form-field full">
                <label>Superviseur / Encadrant</label>
                <input v-model="form.supervisor" type="text" placeholder="Ex: Dr. Karim Benali" />
              </div>

              <!-- Membres -->
              <div class="form-field full">
                <label>Membres de l'équipe</label>
                <div class="tag-input-wrapper">
                  <span v-for="(member, i) in form.teamMembers" :key="i" class="member-tag editable">
                    {{ member }}
                    <button @click="removeMember(i)">×</button>
                  </span>
                  <input
                    v-model="memberInput"
                    type="text"
                    placeholder="Ajouter un membre... (Entrée)"
                    @keydown.enter.prevent="addMember"
                    @keydown.comma.prevent="addMember"
                  />
                </div>
              </div>

              <!-- Lien GitHub -->
              <div class="form-field full">
                <label>Lien GitHub / URL du projet</label>
                <input v-model="form.url" type="url" placeholder="https://github.com/..." />
              </div>

            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-save" @click="saveProject" :disabled="!form.name || !form.category || !form.completedAt">
              Enregistrer les modifications
            </button>
            <button class="btn-secondary" @click="closeModal">Annuler</button>
          </div>

        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import TopBar from '../components/TopBar.vue'
import SideBar from '../components/exploreStudent/Sidebar.vue'
import { projetService } from '../services/projet.service'

const sidebarOpen = ref(true)
const route = useRoute()
const userRole = 'student'
const currentUser = { name: 'Nom Prenom', email: 'Exemple.exemple@univ.etu.ac.ma', avatar: '' }

interface Project {
  id: number
  name: string
  description: string
  category: 'personal' | 'academic' | 'training'
  technologies: string[]
  supervisor: string
  teamMembers: string[]
  completedAt: string
  url: string
}

const categories = [
  { value: 'all', label: 'Tous', color: '#6b7280' },
  { value: 'personal', label: 'Personnel', color: '#5b4fcf' },
  { value: 'academic', label: 'Academique', color: '#0f9e74' },
  { value: 'training', label: 'Formation', color: '#d85a30' },
]

function categoryColor(cat: string) {
  return categories.find(c => c.value === cat)?.color ?? '#6b7280'
}

function categoryLabel(cat: string) {
  return categories.find(c => c.value === cat)?.label ?? cat
}

function badgeStyle(cat: string) {
  const color = categoryColor(cat)
  return { background: color + '18', color }
}

function fromBackendType(type: string | null | undefined): Project['category'] {
  switch (String(type || '').toUpperCase()) {
    case 'PERSONNEL':
      return 'personal'
    case 'HACKATHON':
    case 'STAGE':
      return 'training'
    default:
      return 'academic'
  }
}

function toBackendType(category: Project['category']) {
  switch (category) {
    case 'personal':
      return 'PERSONNEL'
    case 'training':
      return 'HACKATHON'
    default:
      return 'INTEGRATION'
  }
}

function mapProject(item: any): Project {
  return {
    id: Number(item?.id_projet),
    name: item?.titre || 'Projet sans titre',
    description: item?.description || '',
    category: fromBackendType(item?.type),
    technologies: Array.isArray(item?.technologies)
      ? item.technologies.map((entry: any) => entry?.technologie?.nom).filter(Boolean)
      : [],
    supervisor: [item?.professeur?.utilisateur?.prenom, item?.professeur?.utilisateur?.nom].filter(Boolean).join(' '),
    teamMembers: [],
    completedAt: '',
    url: item?.lien_github || '',
  }
}

const projects = ref([] as Project[])
const activeCategory = ref('all')
const searchQuery = ref('')
const highlightedProjectId = ref<number | null>(null)
const showModal = ref(false)
const editingId = ref<number | null>(null)
const techInput = ref('')
const memberInput = ref('')

const form = reactive<Omit<Project, 'id'>>({
  name: '', description: '', category: 'personal',
  technologies: [], supervisor: '', teamMembers: [],
  completedAt: '', url: '',
})

async function loadProjects() {
  try {
    const { data } = await projetService.getMesProjets()
    const raw = Array.isArray(data?.data) ? data.data : []
    projects.value = raw.map(mapProject)
    await scrollToHighlightedProject()
  } catch (error) {
    console.warn('Chargement des projets impossible', error)
    projects.value = []
  }
}

const syncHighlightedProject = () => {
  const rawHighlight = route.query.highlight ?? route.query.id
  const value = Array.isArray(rawHighlight) ? rawHighlight[0] : rawHighlight
  const parsed = Number(String(value || ''))
  highlightedProjectId.value = Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

async function scrollToHighlightedProject() {
  await nextTick()
  const id = highlightedProjectId.value
  if (!id) return
  document.getElementById(`project-${id}`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  })
}

const filteredProjects = computed(() => {
  return projects.value.filter(p => {
    const matchCat = activeCategory.value === 'all' || p.category === activeCategory.value
    const needle = searchQuery.value.toLowerCase()
    const matchSearch = p.name.toLowerCase().includes(needle)
      || p.description.toLowerCase().includes(needle)
      || p.technologies.some(t => t.toLowerCase().includes(needle))
    return matchCat && matchSearch
  })
})

function countByCategory(cat: string) {
  if (cat === 'all') return projects.value.length
  return projects.value.filter(p => p.category === cat).length
}

function openModal(project: Project) {
  editingId.value = project.id
  Object.assign(form, {
    name: project.name,
    description: project.description,
    category: project.category,
    technologies: [...project.technologies],
    supervisor: project.supervisor,
    teamMembers: [...project.teamMembers],
    completedAt: project.completedAt,
    url: project.url,
  })
  techInput.value = ''
  memberInput.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function saveProject() {
  if (!form.name) return

  const payload = {
    titre: form.name,
    description: form.description,
    type: toBackendType(form.category),
    role: form.supervisor || undefined,
    lien_github: form.url || undefined,
    technologies: form.technologies,
  }

  try {
    if (editingId.value === null) return
    await projetService.updateProjet(editingId.value, payload)
    closeModal()
    await loadProjects()
  } catch (error) {
    console.warn('Enregistrement du projet impossible', error)
  }
}

async function deleteProject(id: number) {
  try {
    await projetService.deleteProjet(id)
    await loadProjects()
  } catch (error) {
    console.warn('Suppression du projet impossible', error)
  }
}

function addTech() {
  const val = techInput.value.trim().replace(/,$/, '')
  if (val && !form.technologies.includes(val)) form.technologies.push(val)
  techInput.value = ''
}

function removeTech(i: number) {
  form.technologies.splice(i, 1)
}

function addMember() {
  const val = memberInput.value.trim().replace(/,$/, '')
  if (val && !form.teamMembers.includes(val)) form.teamMembers.push(val)
  memberInput.value = ''
}

function removeMember(i: number) {
  form.teamMembers.splice(i, 1)
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

onMounted(() => {
  syncHighlightedProject()
  loadProjects()
})

watch(
  () => route.query.highlight,
  async () => {
    syncHighlightedProject()
    await scrollToHighlightedProject()
  },
)
</script>

<style scoped>
/* ── Layout ───────────────────────────────────────────────────────────────── */
.page {
  min-height: 100vh;
  background: var(--bg-soft-purple);
  padding-top: 60px;
}

.body-area {
  position: relative;
  min-height: calc(100vh - 60px);
  background: var(--bg-soft-purple);
  overflow-x: hidden;
}

.content {
  width: 100%;
  min-width: 0;
  padding: 24px 26px;
  min-height: calc(100vh - 60px);
  background: var(--bg-soft-purple);
  transition: padding-left 0.3s ease;
}

.content.shifted { padding-left: 246px; }

.content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8px;
  right: 8px;
  bottom: 24px;
  background: var(--white);
  border-radius: 8px;
  z-index: 0;
  box-shadow:
    0 4px 20px rgba(17, 24, 39, 0.04),
    0 0 0 1px rgba(17, 24, 39, 0.01);
}

.content.shifted::before {
  left: 230px;
}

/* Tous les enfants directs passent au-dessus du ::before */
.content > * {
  position: relative;
  z-index: 1;
}

/* ── Header ───────────────────────────────────────────────────────────────── */
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-head h1 {
  font-family: var(--font-head);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 6px;
}

.page-head p { font-size: .9rem; color: var(--text-dark); }

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--purple);
  color: var(--white);
  border: none;
  padding: 0 20px;
  height: 42px;
  border-radius: 999px;
  font-family: var(--font-head);
  font-size: .88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background .2s;
}

.btn-add:hover { background: #4c3db5; }

/* ── Filters bar ──────────────────────────────────────────────────────────── */
.filters-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 16px;
  height: 38px;
  border-radius: 999px;
  background: var(--white);
  border: none; /* Remplacement de la bordure par une ombre douce */
  box-shadow: 0 2px 6px rgba(17, 24, 39, 0.04);
  font-size: .84rem;
  font-weight: 600;
  color: var(--text-neutral);
  cursor: pointer;
  transition: all .2s ease;
}

.filter-btn.active {
  color: var(--purple);
  background: #f0eeff;
  box-shadow: 0 2px 8px rgba(91, 79, 207, 0.2);
}

.cat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cat-count {
  background: var(--bg-soft-purple);
  color: var(--text-subtle);
  font-size: .75rem;
  padding: 1px 7px;
  border-radius: 999px;
}

.filter-btn.active .cat-count {
  background: #ddd6fe;
  color: var(--purple);
}

.search-box {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--white);
  border: none; /* Remplacement de la bordure par une ombre douce */
  box-shadow: 0 2px 6px rgba(17, 24, 39, 0.04);
  border-radius: 999px;
  padding: 0 16px;
  height: 38px;
  color: var(--text-subtle);
  transition: all .2s ease;
}

.search-box:focus-within { 
  box-shadow: 0 4px 12px rgba(91, 79, 207, 0.15); 
  color: var(--purple); 
}

.search-box input {
  border: none;
  outline: none;
  font-size: .88rem;
  width: 200px;
  color: var(--text-dark);
  background: transparent;
}

/* ── Projects grid ────────────────────────────────────────────────────────── */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

.project-card {
  background: var(--white);
  border-radius: 12px;
  border: none; /* Suppression du cadre pâle */
  box-shadow: 0 4px 16px rgba(17, 24, 39, 0.05); /* Ombre douce moderne */
.project-card {
  background: white;
  border-radius: 12px;
  border: none; /* Suppression du cadre pâle */
  box-shadow: 0 4px 16px rgba(17, 24, 39, 0.05); /* Ombre douce moderne */
>>>>>>> a062242619048820d9654a2daf97487c3f101f72
  overflow: hidden;
  transition: box-shadow .25s ease, transform .25s ease;
  display: flex;
  flex-direction: column;
}

.project-card.is-highlighted {
  box-shadow: 0 10px 30px rgba(91, 79, 207, 0.2);
  outline: 2px solid rgba(91, 79, 207, 0.35);
}

.project-card:hover {
  /* Ombre plus profonde et colorée au survol pour donner du relief */
  box-shadow: 0 10px 30px rgba(91, 79, 207, 0.14);
  transform: translateY(-3px);
}

.card-bar { height: 4px; width: 100%; flex-shrink: 0; }

.card-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; flex: 1; }

/* Meta top */
.card-meta-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-badge {
  font-size: .75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 6px;
  letter-spacing: .02em;
}

.card-date { font-size: .78rem; color: var(--text-subtle); }

/* Title */
.project-title {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  line-height: 1.4;
  margin: 0;
}

.project-desc {
  font-size: .85rem;
  color: var(--text-neutral);
  line-height: 1.6;
  flex: 1;
}

/* Tech tags */
.tech-list { display: flex; flex-wrap: wrap; gap: 6px; }

.tech-tag {
  background: var(--bg-soft-purple);
  color: var(--text-charcoal);
  font-size: .75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
}

.card-divider { height: 1px; background: var(--surface-neutral); margin: 4px 0; }

/* Meta bottom */
.card-meta-bottom { display: flex; flex-direction: column; gap: 8px; }

.meta-row {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: .82rem;
  color: var(--text-neutral);
}

.meta-row svg { flex-shrink: 0; color: var(--text-subtle); }

/* Team avatars */
.team-avatars { display: flex; gap: 4px; }

.team-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--indigo-soft);
  color: var(--purple);
  font-size: .65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--white);
  margin-left: -4px;
  cursor: default;
}

.team-avatar:first-child { margin-left: 0; }
.team-avatar.more { background: var(--surface-neutral); color: var(--text-neutral); }

/* Card actions */
.card-actions { display: flex; gap: 8px; margin-top: 4px; }

.btn-edit, .btn-delete {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background .15s;
}

.btn-edit { background: #f0eeff; color: var(--purple); }
.btn-edit:hover { background: #ddd6fe; }

.btn-delete { background: var(--danger-bg); color: var(--danger); }
.btn-delete:hover { background: var(--surface-danger-soft); }

/* ── Empty state ──────────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(17, 24, 39, 0.05);
}

.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-state p { color: var(--text-subtle); margin-bottom: 1.5rem; }

/* ── Modal ────────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.3); /* Overlay légèrement plus doux */
  backdrop-filter: blur(4px); /* Léger flou d'arrière-plan très moderne */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

.modal-content {
  background: var(--white);
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.15);
}

/* Le reste du CSS du modal et du responsive reste inchangé */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.4rem 1.6rem;
  border-bottom: 1px solid var(--input-bg);
}

.modal-header h2 {
  font-family: var(--font-head);
  font-size: 1.1rem;
  color: var(--text-dark);
  margin: 0;
}

.btn-close {
  background: var(--surface-neutral);
  border: none;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-neutral);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover { background: var(--input-bg); }

.modal-body { padding: 1.5rem 1.6rem; overflow-y: auto; flex: 1; }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-field { display: flex; flex-direction: column; gap: 7px; }
.form-field.full { grid-column: 1 / -1; }

.form-field label {
  font-size: .82rem;
  font-weight: 700;
  color: var(--text-dark);
}

.required { color: var(--danger); }

.form-field input,
.form-field select,
.form-field textarea {
  border: 1.5px solid var(--input-bg);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: .88rem;
  color: var(--text-dark);
  font-family: var(--font-body);
  background: #fafafa;
  outline: none;
  transition: border-color .15s;
  resize: none;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: var(--purple);
  background: var(--white);
}

.tag-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border: 1.5px solid var(--input-bg);
  border-radius: 10px;
  padding: 8px 10px;
  background: #fafafa;
  min-height: 46px;
  align-items: center;
  transition: border-color .15s;
}

.tag-input-wrapper:focus-within {
  border-color: var(--purple);
  background: var(--white);
}

.tag-input-wrapper input {
  border: none;
  outline: none;
  background: transparent;
  font-size: .84rem;
  min-width: 160px;
  flex: 1;
  padding: 2px 4px;
}

.tech-tag.editable,
.member-tag.editable {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px 3px 10px;
  border-radius: 6px;
  font-size: .78rem;
  font-weight: 600;
}

.tech-tag.editable { background: var(--bg-soft-purple); color: var(--text-charcoal); }
.member-tag.editable { background: var(--indigo-soft); color: var(--purple); }

.tech-tag.editable button,
.member-tag.editable button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: .9rem;
  line-height: 1;
  color: inherit;
  opacity: .6;
  padding: 0;
}

.tech-tag.editable button:hover,
.member-tag.editable button:hover { opacity: 1; }

.modal-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 1.2rem 1.6rem;
  border-top: 1px solid var(--input-bg);
}

.btn-save {
  background: var(--purple);
  color: var(--white);
  border: none;
  padding: 0 24px;
  height: 42px;
  border-radius: 10px;
  font-family: var(--font-head);
  font-size: .88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background .15s;
}

.btn-save:hover:not(:disabled) { background: #4c3db5; }
.btn-save:disabled { opacity: .45; cursor: not-allowed; }

.btn-secondary {
  background: var(--surface-neutral);
  color: var(--text-charcoal);
  border: none;
  padding: 0 20px;
  height: 42px;
  border-radius: 10px;
  font-size: .88rem;
  cursor: pointer;
  transition: background .15s;
}

.btn-secondary:hover { background: var(--input-bg); }

@media (max-width: 900px) {
  .content, .content.shifted { padding: 16px; }
  .page-head { flex-direction: column; align-items: flex-start; gap: 12px; }
  .projects-grid { grid-template-columns: 1fr; }
  .form-grid { grid-template-columns: 1fr; }
  .search-box { margin-left: 0; width: 100%; }
  .search-box input { width: 100%; }
}
</style>
