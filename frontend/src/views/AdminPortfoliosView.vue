<template>
  <div class="dashboard-layout">
    <AdminNavbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <AdminSidebar :open="sidebarOpen" />
    <AdminSubbar
      title="Gérer les portfolios"
      v-model:searchQuery="search"
      :sidebarOpen="sidebarOpen"
    />
 
    <main class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="page-content">
 
        <!-- Page header -->
        <div class="page-header">
          <p class="breadcrumb">Gérer les portfolios</p>
        </div>
 
        <!-- KPI cards -->
        <div class="kpi-row">
          <div class="kpi-card" v-for="kpi in kpis" :key="kpi.label">
            <div class="kpi-left">
              <p class="kpi-label">{{ kpi.label }}</p>
              <p class="kpi-value">{{ kpi.value.toLocaleString('fr-FR') }}</p>
            </div>
            <div class="kpi-icon" :style="{ color: kpi.color }">
              <component :is="kpi.icon" :size="20" />
            </div>
          </div>
        </div>
 
        <!-- Filters bar -->
        <div class="filters-bar">
          <div class="search-input">
            <Search :size="14" class="si" />
            <input v-model="filters.search" type="text" placeholder="Chercher un portfolio ou un étudiant..." />
          </div>
 
          <div class="select-wrapper">
            <select v-model="filters.category">
              <option value="">Toutes catégories</option>
              <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
            </select>
            <ChevronDown :size="13" class="sa" />
          </div>
 
          <div class="view-toggle">
            <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
              <LayoutGrid :size="16" />
            </button>
            <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
              <List :size="16" />
            </button>
          </div>
        </div>
 
        <!-- Grid view -->
        <div v-if="viewMode === 'grid'" class="portfolio-grid">
          <div
            v-for="p in filteredPortfolios"
            :key="p.id"
            class="portfolio-card"
          >
            <!-- Thumbnail -->
            <div class="card-thumb" :style="{ background: p.thumbColor }">
              <span class="status-chip" :class="p.status">
                <component :is="statusIcon(p.status)" :size="11" />
                {{ statusLabel[p.status] }}
              </span>
              <!-- Decorative shapes -->
              <div class="thumb-deco" :style="{ background: p.decoColor }"></div>
              <div class="thumb-deco2" :style="{ background: p.decoColor2 }"></div>
            </div>
 
            <!-- Card body -->
            <div class="card-body">
              <div class="card-title-row">
                <h3 class="card-title">{{ p.title }}</h3>
                <div class="card-menu-wrapper">
                  <button class="more-btn" @click.stop="toggleMenu(p.id)">
                    <MoreVertical :size="15" />
                  </button>
                  <div v-if="openMenu === p.id" class="card-menu" @click.stop>
                    <button class="menu-item" @click="verifyPortfolio(p)">
                      <CheckCircle :size="13" /> Vérifier
                    </button>
                    <button class="menu-item" @click="rejectPortfolio(p)">
                      <XCircle :size="13" /> Rejeter
                    </button>
                    <button class="menu-item danger" @click="deletePortfolio(p)">
                      <Trash2 :size="13" /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
              <p class="card-category">{{ p.category }}</p>
              <div class="card-author">
                <div class="mini-avatar" :style="{ background: p.authorColor }">
                  {{ initials(p.author) }}
                </div>
                <div>
                  <p class="author-name">{{ p.author }}</p>
                  <p class="author-date">Publié le {{ p.date }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
 
        <!-- List view -->
        <div v-else class="portfolio-list">
          <table class="list-table">
            <thead>
              <tr>
                <th>Portfolio</th>
                <th>Catégorie</th>
                <th>Auteur</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in filteredPortfolios" :key="p.id" class="list-row">
                <td class="list-title">{{ p.title }}</td>
                <td class="list-cat">{{ p.category }}</td>
                <td>
                  <div class="list-author">
                    <div class="mini-avatar" :style="{ background: p.authorColor }">{{ initials(p.author) }}</div>
                    {{ p.author }}
                  </div>
                </td>
                <td class="list-date">{{ p.date }}</td>
                <td>
                  <span class="status-chip inline" :class="p.status">
                    <component :is="statusIcon(p.status)" :size="11" />
                    {{ statusLabel[p.status] }}
                  </span>
                </td>
                <td>
                  <div class="list-actions">
                    <button class="action-icon" @click="verifyPortfolio(p)" title="Vérifier"><CheckCircle :size="15" /></button>
                    <button class="action-icon danger" @click="deletePortfolio(p)" title="Supprimer"><Trash2 :size="15" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
 
        <!-- Empty state -->
        <div v-if="filteredPortfolios.length === 0" class="empty-state">
          <div class="empty-icon"><LayoutGrid :size="28" /></div>
          <h3>Plus de portfolios disponibles</h3>
          <p>
            Vous avez parcouru tous les portfolios récents. De nouvelles soumissions seront
            visibles dès qu'elles seront publiées par les étudiants.
          </p>
          <button class="btn-refresh" @click="refresh">Rafraîchir la liste</button>
        </div>
 
        <!-- End of list hint (when there are results) -->
        <div v-if="filteredPortfolios.length > 0 && filteredPortfolios.length === portfolios.length"
          class="end-hint">
          <div class="empty-icon sm"><LayoutGrid :size="22" /></div>
          <h3>Plus de portfolios disponibles</h3>
          <p>
            Vous avez parcouru tous les portfolios récents. De nouvelles soumissions seront
            visibles dès qu'elles seront publiées par les étudiants.
          </p>
          <button class="btn-refresh" @click="refresh">Rafraîchir la liste</button>
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
import {
  Search, ChevronDown, LayoutGrid, List,
  MoreVertical, CheckCircle, XCircle, Trash2,
  ExternalLink, AlertCircle, Clock,
} from 'lucide-vue-next'
import AdminNavbar  from '../components/admin/AdminNavbar.vue'
import AdminSidebar from '../components/admin/AdminSidebar.vue'
import AdminSubbar  from '../components/admin/AdminSubbar.vue'
 
/* ── Layout ─────────────────────────── */
const search      = ref('')
const sidebarOpen = ref(true)
const viewMode    = ref('grid')
 
/* ── Filters ─────────────────────────── */
const filters = ref({ search: '', category: '' })
const categories = ['UI/UX Design', 'Fullstack Dev', 'Marketing', 'Product Design', 'Data Science', 'Mobile Dev']
 
/* ── KPIs ────────────────────────────── */
const kpis = [
  { label: 'Total Portfolios', value: 1284, color: '#6366f1', icon: ExternalLink },
  { label: 'Vérifiés',         value: 956,  color: '#16a34a', icon: CheckCircle },
  { label: 'En attente',       value: 48,   color: '#f59e0b', icon: Clock },
  { label: 'Signalé',          value: 12,   color: '#ef4444', icon: AlertCircle },
]
 
/* ── Status helpers ──────────────────── */
const statusLabel = { verified: 'Vérifié', pending: 'En attente', revision: 'En révision' }
 
const statusIcon = (s) => {
  if (s === 'verified') return CheckCircle
  if (s === 'pending')  return Clock
  return AlertCircle
}
 
/* ── Portfolios data ─────────────────── */
const portfolios = ref([
  { id: 1, title: 'Design UI/UX – Application Mobile',    category: 'UI/UX Design',    author: 'Lucas Bernard',  date: '12 Oct 2023', status: 'verified', thumbColor: '#e0e7ff', decoColor: '#6366f1', decoColor2: '#a5b4fc', authorColor: '#c7d2fe' },
  { id: 2, title: 'Développement Web – Portfolio 3D',     category: 'Fullstack Dev',   author: 'Sophie Martin',  date: '15 Oct 2023', status: 'pending',  thumbColor: '#fef3c7', decoColor: '#f59e0b', decoColor2: '#fcd34d', authorColor: '#fde68a' },
  { id: 3, title: 'Campagne Marketing Digital',           category: 'Marketing',       author: 'Thomas Durand',  date: '10 Oct 2023', status: 'revision', thumbColor: '#dbeafe', decoColor: '#3b82f6', decoColor2: '#93c5fd', authorColor: '#bfdbfe' },
  { id: 4, title: 'Système Design pour FinTech',          category: 'Product Design',  author: 'Emma Petit',     date: '18 Oct 2023', status: 'verified', thumbColor: '#d1fae5', decoColor: '#10b981', decoColor2: '#6ee7b7', authorColor: '#a7f3d0' },
  { id: 5, title: 'Analyse de Données – Dashboard',       category: 'Data Science',    author: 'Marc Lefebvre',  date: '20 Oct 2023', status: 'verified', thumbColor: '#fce7f3', decoColor: '#ec4899', decoColor2: '#f9a8d4', authorColor: '#fbcfe8' },
  { id: 6, title: 'Application de Gestion Immobilière',   category: 'Mobile Dev',      author: 'Chloé Morel',    date: '22 Oct 2023', status: 'pending',  thumbColor: '#ede9fe', decoColor: '#8b5cf6', decoColor2: '#c4b5fd', authorColor: '#ddd6fe' },
])
 
/* ── Filtering ───────────────────────── */
const filteredPortfolios = computed(() => {
  const q = filters.value.search.toLowerCase()
  return portfolios.value.filter(p => {
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.author.toLowerCase().includes(q)
    const matchCat    = !filters.value.category || p.category === filters.value.category
    return matchSearch && matchCat
  })
})
 
/* ── Menu ────────────────────────────── */
const openMenu = ref(null)
const toggleMenu = (id) => { openMenu.value = openMenu.value === id ? null : id }
const closeMenu  = ()    => { openMenu.value = null }
 
onMounted(()       => document.addEventListener('click', closeMenu))
onBeforeUnmount(() => document.removeEventListener('click', closeMenu))
 
/* ── Actions ─────────────────────────── */
const initials = (name) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
 
const verifyPortfolio = (p) => { p.status = 'verified'; openMenu.value = null }
const rejectPortfolio = (p) => { p.status = 'revision'; openMenu.value = null }
const deletePortfolio = (p) => {
  portfolios.value = portfolios.value.filter(x => x.id !== p.id)
  openMenu.value = null
}
const refresh = () => { filters.value = { search: '', category: '' } }
</script>
 
<style scoped>
/* ══ Layout ══════════════════════════════════════ */
.dashboard-layout { min-height: 100vh; background: #f5f7fb; }
 
.main-content {
  position: fixed;
  top: 106px; left: 0; right: 0; bottom: 0;
  overflow-y: auto;
  transition: left 0.25s ease;
}
.main-content.sidebar-open { left: 185px; }
 
.page-content {
  padding: 26px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100%;
}
 
/* ══ Breadcrumb ══════════════════════════════════ */
.breadcrumb {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}
 
/* ══ KPI row ══════════════════════════════════════ */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
 
.kpi-card {
  background: #fff;
  border: 1px solid #e8eaf0;
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: box-shadow 0.2s;
}
.kpi-card:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.07); }
 
.kpi-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 5px;
}
 
.kpi-value {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.5px;
}
 
.kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  flex-shrink: 0;
}
 
/* ══ Filters bar ═════════════════════════════════ */
.filters-bar {
  background: #fff;
  border: 1px solid #e8eaf0;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
 
.search-input {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  padding: 7px 12px;
  background: #f8fafc;
  flex: 1;
  transition: border-color 0.15s;
}
.search-input:focus-within { border-color: #6366f1; background: #fff; }
.search-input .si { color: #94a3b8; flex-shrink: 0; }
.search-input input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: #334155;
  width: 100%;
}
.search-input input::placeholder { color: #94a3b8; }
 
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.select-wrapper select {
  appearance: none;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  padding: 7px 32px 7px 12px;
  background: #f8fafc;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
  min-width: 160px;
}
.select-wrapper select:focus { border-color: #6366f1; background: #fff; }
.select-wrapper .sa {
  position: absolute;
  right: 10px;
  color: #94a3b8;
  pointer-events: none;
}
 
.view-toggle {
  display: flex;
  gap: 2px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  padding: 3px;
  background: #f8fafc;
}
.view-toggle button {
  width: 32px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 7px;
  color: #94a3b8;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.view-toggle button.active {
  background: #fff;
  color: #6366f1;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}
 
/* ══ Portfolio grid ══════════════════════════════ */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
 
@media (max-width: 1000px) { .portfolio-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px)  { .portfolio-grid { grid-template-columns: 1fr; } }
 
.portfolio-card {
  background: #fff;
  border: 1px solid #e8eaf0;
  border-radius: 14px;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
}
.portfolio-card:hover {
  box-shadow: 0 8px 28px rgba(99,102,241,0.1);
  transform: translateY(-2px);
}
 
/* Thumbnail */
.card-thumb {
  height: 150px;
  position: relative;
  overflow: hidden;
}
 
.thumb-deco {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  bottom: -40px;
  right: -30px;
  opacity: 0.35;
}
.thumb-deco2 {
  position: absolute;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  top: -20px;
  left: 20px;
  opacity: 0.25;
}
 
/* Status chip */
.status-chip {
  position: absolute;
  top: 10px;
  left: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.status-chip.verified  { background: #ecfdf5; color: #16a34a; }
.status-chip.pending   { background: #fff7ed; color: #ea580c; }
.status-chip.revision  { background: #eff6ff; color: #2563eb; }
 
.status-chip.inline {
  position: static;
}
 
/* Card body */
.card-body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
 
.card-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
 
.card-title {
  font-size: 13.5px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.4;
  flex: 1;
 
  /* Truncate at 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
 
.card-category {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
  font-weight: 500;
}
 
.card-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}
 
.mini-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #334155;
  flex-shrink: 0;
}
 
.author-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 1px;
}
.author-date {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
}
 
/* Card menu */
.card-menu-wrapper { position: relative; }
 
.more-btn {
  background: none;
  border: none;
  cursor: pointer;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: #94a3b8;
  transition: background 0.12s, color 0.12s;
  flex-shrink: 0;
}
.more-btn:hover { background: #f1f5f9; color: #475569; }
 
.card-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 6px;
  min-width: 148px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  z-index: 50;
}
 
.menu-item {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  background: none;
  border: none;
  padding: 7px 9px;
  border-radius: 7px;
  font-size: 12.5px;
  color: #475569;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}
.menu-item:hover { background: #f8fafc; color: #1e293b; }
.menu-item.danger { color: #ef4444; }
.menu-item.danger:hover { background: #fef2f2; }
 
/* ══ List view ═══════════════════════════════════ */
.portfolio-list {
  background: #fff;
  border: 1px solid #e8eaf0;
  border-radius: 14px;
  overflow: hidden;
}
 
.list-table {
  width: 100%;
  border-collapse: collapse;
}
.list-table thead tr {
  background: #fafbff;
  border-bottom: 1px solid #f1f5f9;
}
.list-table th {
  text-align: left;
  padding: 10px 16px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.list-row {
  border-bottom: 1px solid #f8fafc;
  transition: background 0.12s;
}
.list-row:last-child { border-bottom: none; }
.list-row:hover { background: #fafbff; }
.list-table td { padding: 13px 16px; vertical-align: middle; }
 
.list-title { font-size: 13.5px; font-weight: 600; color: #1e293b; }
.list-cat   { font-size: 12.5px; color: #94a3b8; }
.list-date  { font-size: 12.5px; color: #94a3b8; white-space: nowrap; }
 
.list-author {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #334155;
  font-weight: 500;
}
 
.list-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.action-icon {
  background: none;
  border: none;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  color: #94a3b8;
  transition: background 0.12s, color 0.12s;
}
.action-icon:hover { background: #f1f5f9; color: #16a34a; }
.action-icon.danger:hover { background: #fef2f2; color: #ef4444; }
 
/* ══ Empty / End state ═══════════════════════════ */
.empty-state, .end-hint {
  background: #fff;
  border: 1px dashed #e2e8f0;
  border-radius: 14px;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}
 
.empty-icon {
  width: 56px;
  height: 56px;
  background: #ede9fe;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6366f1;
}
.empty-icon.sm { width: 44px; height: 44px; border-radius: 12px; }
 
.empty-state h3, .end-hint h3 {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 4px 0 0;
}
 
.empty-state p, .end-hint p {
  font-size: 13px;
  color: #94a3b8;
  max-width: 400px;
  line-height: 1.6;
  margin: 0;
}
 
.btn-refresh {
  margin-top: 6px;
  padding: 8px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-refresh:hover { background: #f8fafc; }
 
/* ══ KPI grid responsive ════════════════════════ */
@media (max-width: 900px) {
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
}
 
/* ══ Footer ═════════════════════════════════════ */
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
.footer-links { display: flex; gap: 16px; }
.footer-links a { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
.footer-links a:hover { color: #475569; }
</style>
 