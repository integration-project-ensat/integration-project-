<template>
  <div class="dashboard-layout">
    <AdminNavbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <AdminSidebar :open="sidebarOpen" />
    <AdminSubbar
      title="Gérer les profils"
      v-model:searchQuery="search"
      :sidebarOpen="sidebarOpen"
    />
 
    <main class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="page-content">
 
        <!-- Page header -->
        <div class="page-header">
          <div class="header-left">
            <p class="breadcrumb">Gérer les profils</p>
            <h1 class="page-title">Gestion des Étudiants</h1>
            <p class="page-desc">
              Consultez, filtrez et gérez les comptes étudiants de votre plateforme.
              Assurez-vous de la vérification des profils pour garantir la qualité du réseau.
            </p>
          </div>
        </div>
 
        <!-- Filters bar -->
        <div class="filters-card">
          <!-- Recherche texte -->
          <div class="filter-group">
            <label class="filter-label" for="filter-search">RECHERCHE</label>
            <div class="input-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input id="filter-search" v-model="filters.search" type="text" placeholder="Nom, email ou école..." />
            </div>
          </div>
 
          <!-- Ville -->
          <div class="filter-group">
            <label class="filter-label" for="filter-city">VILLE</label>
            <div class="select-wrapper">
              <select id="filter-city" v-model="filters.city">
                <option value="">Toutes les villes</option>
                <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
              </select>
              <svg class="select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
 
          <!-- Établissement -->
          <div class="filter-group">
            <label class="filter-label" for="filter-school">ÉTABLISSEMENT</label>
            <div class="select-wrapper">
              <select id="filter-school" v-model="filters.school">
                <option value="">Toutes les écoles</option>
                <option v-for="s in schools" :key="s" :value="s">{{ s }}</option>
              </select>
              <svg class="select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
 
          <!-- Score slider -->
          <div class="filter-group score-group">
            <label class="filter-label" for="filter-score">
              SCORE MIN:
              <span class="score-val">{{ filters.minScore }}+</span>
              <button class="star-btn" @click="filters.minScore = 0" title="Réinitialiser">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            </label>
            <input
              id="filter-score"
              v-model.number="filters.minScore"
              type="range" min="0" max="100" step="5"
              class="score-slider"
            />
          </div>
        </div>
 
        <!-- Table section -->
        <div class="table-card">
          <div class="table-header">
            <div class="table-title-block">
              <h2 class="table-title">Liste des Étudiants</h2>
              <span class="count-badge">{{ filteredProfiles.length }} profils trouvés</span>
            </div>
            <div class="table-actions">
              <button class="btn-outline" @click="exportCSV">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exporter CSV
              </button>
              <button class="btn-primary" @click="bulkVerify">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 11 12 14 22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                Vérification groupée
              </button>
            </div>
          </div>
 
          <!-- Table -->
          <table class="profiles-table">
            <thead>
              <tr>
                <th><input type="checkbox" v-model="allSelected" @change="toggleAll" /></th>
                <th>Étudiant</th>
                <th>Établissement</th>
                <th>Localisation</th>
                <th>Score Portfolio</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedProfiles.length === 0">
                <td colspan="7" class="empty-row">Aucun profil trouvé.</td>
              </tr>
              <tr
                v-for="p in paginatedProfiles"
                :key="p.id"
                class="profile-row"
                :class="{ selected: selected.includes(p.id) }"
              >
                <td>
                  <input type="checkbox" :value="p.id" v-model="selected" />
                </td>
 
                <!-- Étudiant -->
                <td>
                  <div class="student-cell">
                    <div class="student-avatar" :style="{ background: p.avatarColor }">
                      <img v-if="p.photo" :src="p.photo" :alt="p.name" />
                      <span v-else>{{ initials(p.name) }}</span>
                    </div>
                    <div>
                      <p class="student-name">{{ p.name }}</p>
                      <p class="student-email">{{ p.email }}</p>
                    </div>
                  </div>
                </td>
 
                <!-- Établissement -->
                <td>
                  <div class="school-cell">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                    {{ p.school }}
                  </div>
                </td>
 
                <!-- Localisation -->
                <td>
                  <div class="location-cell">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {{ p.city }}
                  </div>
                </td>
 
                <!-- Score -->
                <td>
                  <div class="score-cell">
                    <div class="score-bar-bg">
                      <div class="score-bar-fill"
                        :style="{ width: p.score + '%', background: scoreColor(p.score) }">
                      </div>
                    </div>
                    <span class="score-text" :style="{ color: scoreColor(p.score) }">
                      {{ p.score }}%
                    </span>
                  </div>
                </td>
 
                <!-- Statut -->
                <td>
                  <span class="status-badge" :class="p.status">
                    <svg v-if="p.status === 'verified'" width="12" height="12" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <svg v-else-if="p.status === 'pending'" width="12" height="12" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <svg v-else width="12" height="12" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {{ statusLabel[p.status] }}
                  </span>
                </td>
 
                <!-- Actions -->
                <td>
                  <div class="row-actions">
                    <button class="link-btn" @click="viewPortfolio(p)">Portfolio</button>
                    <button class="chevron-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2.5"
                        stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                    <button class="more-btn" @click.stop="toggleMenu(p.id)" ref="moreRef">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2.5"
                        stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>
                      </svg>
                      <!-- Dropdown menu -->
                      <div v-if="openMenu === p.id" class="row-menu" @click.stop>
                        <button class="menu-item" @click="verifyProfile(p)">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                          Vérifier
                        </button>
                        <button class="menu-item" @click="editProfile(p)">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Modifier
                        </button>
                        <button class="menu-item danger" @click="deleteProfile(p)">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          Supprimer
                        </button>
                      </div>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
 
          <!-- Pagination -->
          <div class="pagination">
            <span class="pagination-info">
              Affichage de {{ paginationStart }} à {{ paginationEnd }} sur {{ filteredProfiles.length }} profils
            </span>
            <div class="pagination-controls">
              <button class="page-btn" :disabled="page === 1" @click="page--">Précédent</button>
              <button
                v-for="p in totalPages" :key="p"
                class="page-btn num"
                :class="{ active: page === p }"
                @click="page = p"
              >{{ p }}</button>
              <button class="page-btn" :disabled="page === totalPages" @click="page++">Suivant</button>
            </div>
          </div>
        </div>
 
        <!-- Footer -->
        <footer class="page-footer">
          <span>© 2024 StudentPort Admin. Tous droits réservés.</span>
          <div class="footer-links">
            <a href="#">Support</a>
            <a href="#">Confidentialité</a>
          </div>
        </footer>
 
      </div>
    </main>
  </div>
</template>
 
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import AdminNavbar  from '../components/admin/AdminNavbar.vue'
import AdminSidebar from '../components/admin/AdminSidebar.vue'
import AdminSubbar  from '../components/admin/AdminSubbar.vue'
 
/* ── Layout state ──────────────────────── */
const search      = ref('')
const sidebarOpen = ref(true)
 
/* ── Filters ───────────────────────────── */
const filters = ref({
  search:   '',
  city:     '',
  school:   '',
  minScore: 60,
})
 
const cities  = ['Casablanca', 'Agadir', 'Rabat', 'Ifrane', 'Fès', 'Marrakech']
const schools = ['Université Hassan II', 'EST Agadir', 'EMI Rabat', 'Al Akhawayn University', 'ENCG Fès']
 
/* ── Data ──────────────────────────────── */
const profiles = ref([
  { id: 1, name: 'Amine Bensaid',   email: 'amine.b@univ-casa.ma',     school: 'Université Hassan II',    city: 'Casablanca', score: 92, status: 'verified',    avatarColor: '#c7d2fe', photo: '' },
  { id: 2, name: 'Sarah Mansouri',  email: 's.mansouri@est-agadir.ac.ma', school: 'EST Agadir',           city: 'Agadir',     score: 85, status: 'verified',    avatarColor: '#d1fae5', photo: '' },
  { id: 3, name: 'Youssef Ame',     email: 'youssef.amrani@emi.ac.ma',  school: 'EMI Rabat',              city: 'Rabat',      score: 78, status: 'pending',     avatarColor: '#fde68a', photo: '' },
  { id: 4, name: 'Sofia Kenzi',     email: 'sofia.kenzi@aui.ma',        school: 'Al Akhawayn University', city: 'Ifrane',     score: 95, status: 'verified',    avatarColor: '#fbcfe8', photo: '' },
  { id: 5, name: 'Karim Tazi',      email: 'k.tazi@encg-fes.ma',        school: 'ENCG Fès',               city: 'Fès',        score: 64, status: 'unverified',  avatarColor: '#e2e8f0', photo: '' },
  { id: 6, name: 'Nadia El Fassi',  email: 'n.elfassi@univ-casa.ma',    school: 'Université Hassan II',   city: 'Casablanca', score: 88, status: 'verified',    avatarColor: '#bfdbfe', photo: '' },
  { id: 7, name: 'Omar Benali',     email: 'o.benali@emi.ac.ma',        school: 'EMI Rabat',              city: 'Rabat',      score: 71, status: 'pending',     avatarColor: '#fecaca', photo: '' },
  { id: 8, name: 'Laila Chraibi',   email: 'l.chraibi@aui.ma',          school: 'Al Akhawayn University', city: 'Ifrane',     score: 90, status: 'verified',    avatarColor: '#a7f3d0', photo: '' },
])
 
/* ── Status helpers ────────────────────── */
const statusLabel = { verified: 'Vérifié', pending: 'En attente', unverified: 'Non vérifié' }
 
const scoreColor = (score) => {
  if (score >= 85) return '#16a34a'
  if (score >= 70) return '#f59e0b'
  return '#ef4444'
}
 
/* ── Filtering ─────────────────────────── */
const filteredProfiles = computed(() => {
  const q = filters.value.search.toLowerCase()
  return profiles.value.filter(p => {
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.school.toLowerCase().includes(q)
    const matchCity   = !filters.value.city   || p.city   === filters.value.city
    const matchSchool = !filters.value.school || p.school === filters.value.school
    const matchScore  = p.score >= filters.value.minScore
    return matchSearch && matchCity && matchSchool && matchScore
  })
})
 
/* ── Pagination ────────────────────────── */
const page     = ref(1)
const perPage  = 5
 
const totalPages = computed(() => Math.max(1, Math.ceil(filteredProfiles.value.length / perPage)))
 
const paginatedProfiles = computed(() => {
  const start = (page.value - 1) * perPage
  return filteredProfiles.value.slice(start, start + perPage)
})
 
const paginationStart = computed(() => Math.min((page.value - 1) * perPage + 1, filteredProfiles.value.length))
const paginationEnd   = computed(() => Math.min(page.value * perPage, filteredProfiles.value.length))
 
/* ── Selection ─────────────────────────── */
const selected    = ref([])
const allSelected = ref(false)
 
const toggleAll = () => {
  selected.value = allSelected.value ? paginatedProfiles.value.map(p => p.id) : []
}
 
/* ── Row menu ──────────────────────────── */
const openMenu = ref(null)
 
const toggleMenu = (id) => {
  openMenu.value = openMenu.value === id ? null : id
}
 
const closeMenu = () => { openMenu.value = null }
 
onMounted(()       => document.addEventListener('click', closeMenu))
onBeforeUnmount(() => document.removeEventListener('click', closeMenu))
 
/* ── Actions ───────────────────────────── */
const initials = (name) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
 
const verifyProfile = (p) => { p.status = 'verified'; openMenu.value = null }
const editProfile   = (p) => { console.log('edit', p); openMenu.value = null }
const deleteProfile = (p) => {
  profiles.value = profiles.value.filter(x => x.id !== p.id)
  openMenu.value = null
}
const viewPortfolio = (p) => { console.log('portfolio', p) }
 
const bulkVerify = () => {
  profiles.value.forEach(p => {
    if (selected.value.includes(p.id)) p.status = 'verified'
  })
  selected.value = []
}
 
const exportCSV = () => {
  const rows = [
    ['Nom', 'Email', 'Établissement', 'Ville', 'Score', 'Statut'],
    ...filteredProfiles.value.map(p => [p.name, p.email, p.school, p.city, p.score, statusLabel[p.status]])
  ]
  const csv  = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'etudiants.csv' })
  a.click()
  URL.revokeObjectURL(url)
}
</script>
 
<style scoped>
/* ══ Layout ═══════════════════════════════════════════ */
.dashboard-layout { min-height: 100vh; background: #f5f7fb; }
 
.main-content {
  position: fixed;
  top: 106px; left: 0; right: 0; bottom: 0;
  overflow-y: auto;
  transition: left 0.25s ease;
}
.main-content.sidebar-open { left: 185px; }
 
.page-content {
  padding: 28px 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100%;
}
 
/* ══ Page header ══════════════════════════════════════ */
.page-header { display: flex; align-items: flex-start; justify-content: space-between; }
 
.breadcrumb {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  margin: 0 0 6px;
  letter-spacing: 0.02em;
}
 
.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px;
  letter-spacing: -0.5px;
}
 
.page-desc {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  max-width: 520px;
  line-height: 1.6;
}
 
/* ══ Filters card ═════════════════════════════════════ */
.filters-card {
  background: #fff;
  border: 1px solid #e8eaf0;
  border-radius: 14px;
  padding: 20px 22px;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}
 
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
  flex: 1;
  min-width: 160px;
}
 
.score-group { max-width: 200px; }
 
.filter-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 5px;
}
 
.score-val {
  font-size: 11px;
  color: #6366f1;
  font-weight: 700;
}
 
.star-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  opacity: 0.7;
  transition: opacity 0.15s;
}
.star-btn:hover { opacity: 1; }
 
/* Input search */
.input-search {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  padding: 8px 12px;
  background: #f8fafc;
  color: #94a3b8;
  transition: border-color 0.15s;
}
.input-search:focus-within {
  border-color: #6366f1;
  background: #fff;
}
.input-search input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: #334155;
  width: 100%;
}
.input-search input::placeholder { color: #94a3b8; }
 
/* Select */
.select-wrapper {
  position: relative;
}
.select-wrapper select {
  width: 100%;
  appearance: none;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  padding: 8px 32px 8px 12px;
  background: #f8fafc;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}
.select-wrapper select:focus { border-color: #6366f1; background: #fff; }
 
.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}
 
/* Slider */
.score-slider {
  width: 100%;
  accent-color: #6366f1;
  cursor: pointer;
  height: 4px;
}
 
/* ══ Table card ═══════════════════════════════════════ */
.table-card {
  background: #fff;
  border: 1px solid #e8eaf0;
  border-radius: 14px;
  overflow: hidden;
}
 
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px 14px;
  gap: 12px;
  flex-wrap: wrap;
}
 
.table-title-block {
  display: flex;
  align-items: center;
  gap: 10px;
}
 
.table-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
 
.count-badge {
  font-size: 11.5px;
  font-weight: 600;
  color: #6366f1;
  background: #ede9fe;
  padding: 2px 9px;
  border-radius: 20px;
}
 
.table-actions {
  display: flex;
  gap: 8px;
}
 
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  background: transparent;
  font-size: 12.5px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-outline:hover { background: #f8fafc; }
 
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 9px;
  background: #6366f1;
  font-size: 12.5px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-primary:hover { background: #4f46e5; }
 
/* ══ Table ════════════════════════════════════════════ */
.profiles-table {
  width: 100%;
  border-collapse: collapse;
}
 
.profiles-table thead tr {
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbff;
}
 
.profiles-table th {
  text-align: left;
  padding: 10px 14px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}
 
.profile-row {
  border-bottom: 1px solid #f8fafc;
  transition: background 0.12s;
}
.profile-row:last-child { border-bottom: none; }
.profile-row:hover { background: #fafbff; }
.profile-row.selected { background: #f5f3ff; }
 
.profiles-table td {
  padding: 14px 14px;
  vertical-align: middle;
}
 
/* Student cell */
.student-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
 
.student-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  flex-shrink: 0;
  overflow: hidden;
}
.student-avatar img { width: 100%; height: 100%; object-fit: cover; }
 
.student-name {
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 2px;
}
.student-email {
  font-size: 11.5px;
  color: #94a3b8;
  margin: 0;
}
 
/* School / location cells */
.school-cell, .location-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #475569;
}
 
/* Score cell */
.score-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
 
.score-bar-bg {
  width: 52px;
  height: 5px;
  background: #f1f5f9;
  border-radius: 99px;
  overflow: hidden;
  flex-shrink: 0;
}
.score-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s ease;
}
 
.score-text {
  font-size: 13px;
  font-weight: 700;
  min-width: 32px;
}
 
/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.status-badge.verified    { background: #ecfdf5; color: #16a34a; }
.status-badge.pending     { background: #fff7ed; color: #ea580c; }
.status-badge.unverified  { background: #fef2f2; color: #dc2626; }
 
/* Row actions */
.row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
 
.link-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  transition: background 0.12s;
}
.link-btn:hover { background: #ede9fe; }
 
.chevron-btn, .more-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  transition: background 0.12s, color 0.12s;
  position: relative;
}
.chevron-btn:hover, .more-btn:hover {
  background: #f1f5f9;
  color: #475569;
}
 
/* Row dropdown menu */
.row-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 6px;
  min-width: 150px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  z-index: 50;
}
 
.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  background: none;
  border: none;
  padding: 8px 10px;
  border-radius: 7px;
  font-size: 12.5px;
  color: #475569;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}
.menu-item:hover { background: #f8fafc; color: #1e293b; }
.menu-item.danger { color: #ef4444; }
.menu-item.danger:hover { background: #fef2f2; color: #dc2626; }
 
.empty-row {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  font-size: 13px;
}
 
/* ══ Pagination ═══════════════════════════════════════ */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 22px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
  gap: 10px;
}
 
.pagination-info {
  font-size: 12.5px;
  color: #94a3b8;
}
 
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}
 
.page-btn {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  background: transparent;
  font-size: 12.5px;
  color: #475569;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}
.page-btn:hover:not(:disabled) { background: #f8fafc; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn.num { min-width: 32px; text-align: center; }
.page-btn.num.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
  font-weight: 600;
}
 
/* ══ Footer ═══════════════════════════════════════════ */
.page-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 12px;
  color: #94a3b8;
  border-top: 1px solid #e8eaf0;
  margin-top: auto;
}
 
.footer-links {
  display: flex;
  gap: 16px;
}
 
.footer-links a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.15s;
}
.footer-links a:hover { color: #475569; }
</style>