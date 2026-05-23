<template>
  <div class="dashboard-layout">
    <AdminNavbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <AdminSidebar :open="sidebarOpen" />
    <AdminSubbar title="Gérer les certifications" v-model:searchQuery="search" :sidebarOpen="sidebarOpen" />
 
    <main class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="page-content">
 
        <!-- Header -->
        <div class="page-header">
          <h1 class="page-title">Certifications des Étudiants</h1>
          <p class="page-desc">Validez ou refusez les certifications soumises par les étudiants de la plateforme.</p>
        </div>
 
        <!-- Stats row -->
        <div class="stats-row">
          <div class="stat-pill" v-for="s in stats" :key="s.label" :class="s.type">
            <span class="stat-num">{{ s.value }}</span>
            <span class="stat-lbl">{{ s.label }}</span>
          </div>
        </div>
 
        <!-- Table card -->
        <div class="table-card">
          <div class="table-top">
            <div class="table-title-block">
              <h2 class="table-title">Certifications en attente de validation</h2>
              <span class="count-badge pending">{{ pendingItems.length }} en attente</span>
            </div>
            <div class="search-inline">
              <Search :size="13" />
              <input v-model="search" type="text" placeholder="Rechercher..." />
            </div>
          </div>
 
          <table class="data-table">
            <thead>
              <tr>
                <th>ÉTUDIANT</th>
                <th>CERTIFICATION</th>
                <th>ORGANISME</th>
                <th>DATE</th>
                <th>STATUT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredItems.length === 0">
                <td colspan="6" class="empty-row">Aucune certification trouvée.</td>
              </tr>
              <tr v-for="item in paginatedItems" :key="item.id" class="data-row">
 
                <!-- Étudiant -->
                <td>
                  <div class="student-cell">
                    <div class="avatar" :style="{ background: item.avatarColor }">{{ initials(item.studentName) }}</div>
                    <div>
                      <p class="s-name">{{ item.studentName }}</p>
                      <p class="s-email">{{ item.studentEmail }}</p>
                    </div>
                  </div>
                </td>
 
                <td class="activity-name">{{ item.title }}</td>
                <td><span class="type-tag">{{ item.type }}</span></td>
                <td class="date-cell">{{ item.date }}</td>
 
                <!-- Statut -->
                <td>
                  <span class="status-badge" :class="item.status">
                    {{ statusLabel[item.status] }}
                  </span>
                </td>
 
                <!-- Actions -->
                <td>
                  <div class="action-btns">
                    <button class="btn-validate" @click="openDetail(item, 'validate')">
                      <Check :size="13" /> Valider
                    </button>
                    <button class="btn-refuse" @click="openDetail(item, 'refuse')">
                      <X :size="13" /> Refuser
                    </button>
                    <button class="btn-info" @click="openDetail(item, 'view')" title="Détails">
                      <Eye :size="14" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
 
          <!-- Pagination -->
          <div class="pagination">
            <span class="pag-info">Affichage {{ pagStart }} à {{ pagEnd }} sur {{ filteredItems.length }} certifications</span>
            <div class="pag-controls">
              <button class="pag-btn" :disabled="page === 1" @click="page--">Précédent</button>
              <button v-for="p in totalPages" :key="p" class="pag-btn num" :class="{ active: page === p }" @click="page = p">{{ p }}</button>
              <button class="pag-btn" :disabled="page === totalPages" @click="page++">Suivant</button>
            </div>
          </div>
        </div>
 
        <!-- Footer -->
        <footer class="page-footer">
          <span>© 2024 StudentPort Admin. Tous droits réservés.</span>
          <div class="footer-links"><a href="#">Support</a><a href="#">Confidentialité</a></div>
        </footer>
      </div>
    </main>
 
    <!-- ── Detail Modal ── -->
    <Transition name="modal">
      <div v-if="modal.open" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
 
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-avatar" :style="{ background: modal.item?.avatarColor }">
              {{ initials(modal.item?.studentName || '') }}
            </div>
            <div>
              <h3 class="modal-name">{{ modal.item?.studentName }}</h3>
              <p class="modal-email">{{ modal.item?.studentEmail }}</p>
            </div>
            <button class="modal-close" @click="closeModal"><X :size="18" /></button>
          </div>
 
          <hr class="modal-sep" />
 
          <!-- Info grid -->
          <div class="info-grid">
            <div class="info-item">
              <span class="info-lbl">Certification</span>
              <span class="info-val">{{ modal.item?.title }}</span>
            </div>
            <div class="info-item">
              <span class="info-lbl">Organisme</span>
              <span class="info-val"><span class="type-tag">{{ modal.item?.type }}</span></span>
            </div>
            <div class="info-item">
              <span class="info-lbl">Date de soumission</span>
              <span class="info-val">{{ modal.item?.date }}</span>
            </div>
            <div class="info-item">
              <span class="info-lbl">Statut actuel</span>
              <span class="info-val">
                <span class="status-badge" :class="modal.item?.status">{{ statusLabel[modal.item?.status] }}</span>
              </span>
            </div>
            <div class="info-item full">
              <span class="info-lbl">Description</span>
              <span class="info-val desc">{{ modal.item?.description }}</span>
            </div>
            <div class="info-item" v-if="modal.item?.duration">
              <span class="info-lbl">Durée</span>
              <span class="info-val">{{ modal.item?.duration }}</span>
            </div>
            <div class="info-item" v-if="modal.item?.location">
              <span class="info-lbl">Lieu</span>
              <span class="info-val">{{ modal.item?.location }}</span>
            </div>
          </div>
 
          <!-- Reason (for refuse) -->
          <div v-if="modal.action === 'refuse'" class="reason-block">
            <label class="info-lbl">Motif de refus</label>
            <textarea v-model="modal.reason" placeholder="Expliquez la raison du refus..." class="reason-input"></textarea>
          </div>
 
          <!-- Modal actions -->
          <div class="modal-actions">
            <button class="btn-cancel" @click="closeModal">Annuler</button>
            <button v-if="modal.action === 'validate'" class="btn-validate large" @click="confirmValidate">
              <Check :size="14" /> Confirmer la validation
            </button>
            <button v-if="modal.action === 'refuse'" class="btn-refuse large" @click="confirmRefuse">
              <X :size="14" /> Confirmer le refus
            </button>
          </div>
        </div>
      </div>
    </Transition>
 
  </div>
</template>
 
<script setup>
import { ref, computed } from 'vue'
import { Search, Check, X, Eye } from 'lucide-vue-next'
import AdminNavbar  from '../components/admin/AdminNavbar.vue'
import AdminSidebar from '../components/admin/AdminSidebar.vue'
import AdminSubbar  from '../components/admin/AdminSubbar.vue'
 
/* ── Layout ───────────────────────────────── */
const sidebarOpen = ref(true)
const search      = ref('')
const page        = ref(1)
const perPage     = 5
 
/* ── Status ───────────────────────────────── */
const statusLabel = { pending: 'En attente', validated: 'Validé', refused: 'Refusé' }
 
/* ── Data ─────────────────────────────────── */
const items = ref([
  { id: 1,  studentName: 'Amine Bensaid',  studentEmail: 'amine.b@univ-casa.ma',      title: 'Hackathon UM6P 2023',            type: 'Compétition',  date: '12 Oct 2023', status: 'pending',   avatarColor: '#c7d2fe', duration: '48h',    location: 'Ben Guerir',  description: 'Participation au hackathon organisé par UM6P sur le thème de la santé numérique. Projet de télémédecine IA.' },
  { id: 2,  studentName: 'Sarah Mansouri', studentEmail: 's.mansouri@est-agadir.ac.ma', title: 'Atelier Design Thinking',       type: 'Formation',    date: '15 Oct 2023', status: 'pending',   avatarColor: '#d1fae5', duration: '2 jours', location: 'Agadir',      description: 'Participation à un atelier de Design Thinking organisé par l\'EST Agadir en partenariat avec une startup locale.' },
  { id: 3,  studentName: 'Youssef Ame',    studentEmail: 'youssef.amrani@emi.ac.ma',   title: 'Conférence DevFest Maroc',       type: 'Conférence',   date: '18 Oct 2023', status: 'pending',   avatarColor: '#fde68a', duration: '1 jour',  location: 'Rabat',       description: 'Participation à la conférence annuelle des développeurs au Maroc. Présentation d\'un projet open source.' },
  { id: 4,  studentName: 'Sofia Kenzi',    studentEmail: 'sofia.kenzi@aui.ma',         title: 'Stage chez OCP Solutions',      type: 'Stage',        date: '20 Oct 2023', status: 'validated', avatarColor: '#fbcfe8', duration: '2 mois',  location: 'Casablanca',  description: 'Stage de fin d\'études dans le département IT d\'OCP Solutions. Travaux sur l\'optimisation des bases de données.' },
  { id: 5,  studentName: 'Karim Tazi',     studentEmail: 'k.tazi@encg-fes.ma',         title: 'Bénévolat Croissant Rouge',      type: 'Bénévolat',    date: '22 Oct 2023', status: 'refused',   avatarColor: '#e2e8f0', duration: '1 semaine', location: 'Fès',       description: 'Participation à une campagne de sensibilisation aux premiers secours organisée par le Croissant Rouge Marocain.' },
  { id: 6,  studentName: 'Nadia El Fassi', studentEmail: 'n.elfassi@univ-casa.ma',     title: 'Projet de recherche IA',        type: 'Recherche',    date: '24 Oct 2023', status: 'pending',   avatarColor: '#bfdbfe', duration: '3 mois',  location: 'Casablanca',  description: 'Participation à un projet de recherche sur l\'apprentissage automatique appliqué à la reconnaissance d\'images médicales.' },
  { id: 7,  studentName: 'Omar Benali',    studentEmail: 'o.benali@emi.ac.ma',         title: 'Concours RobotX Maroc',         type: 'Compétition',  date: '25 Oct 2023', status: 'pending',   avatarColor: '#fecaca', duration: '3 jours', location: 'Rabat',       description: 'Participation au concours national de robotique avec une équipe de 4 ingénieurs. Conception d\'un robot autonome.' },
])
 
/* ── Stats ────────────────────────────────── */
const stats = computed(() => [
  { label: 'Total',      value: items.value.length,                                            type: 'total' },
  { label: 'En attente', value: items.value.filter(i => i.status === 'pending').length,        type: 'pending' },
  { label: 'Validées',   value: items.value.filter(i => i.status === 'validated').length,      type: 'validated' },
  { label: 'Refusées',   value: items.value.filter(i => i.status === 'refused').length,        type: 'refused' },
])
 
const pendingItems = computed(() => items.value.filter(i => i.status === 'pending'))
 
/* ── Filter + pagination ──────────────────── */
const filteredItems = computed(() => {
  const q = search.value.toLowerCase()
  return items.value.filter(i =>
    !q || i.studentName.toLowerCase().includes(q) || i.title.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)
  )
})
 
const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / perPage)))
const paginatedItems = computed(() => filteredItems.value.slice((page.value - 1) * perPage, page.value * perPage))
const pagStart = computed(() => Math.min((page.value - 1) * perPage + 1, filteredItems.value.length))
const pagEnd   = computed(() => Math.min(page.value * perPage, filteredItems.value.length))
 
/* ── Modal ────────────────────────────────── */
const modal = ref({ open: false, item: null, action: 'view', reason: '' })
 
const openDetail = (item, action) => {
  modal.value = { open: true, item, action, reason: '' }
}
const closeModal = () => { modal.value.open = false }
 
const confirmValidate = () => {
  modal.value.item.status = 'validated'
  closeModal()
}
const confirmRefuse = () => {
  modal.value.item.status = 'refused'
  closeModal()
}
 
/* ── Helpers ──────────────────────────────── */
const initials = (name) => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
</script>
 
<style scoped>
/* ══ Layout ══════════════════════════════ */
.dashboard-layout { min-height: 100vh; background: #f5f7fb; }
.main-content {
  position: fixed; top: 106px; left: 0; right: 0; bottom: 0;
  overflow-y: auto; transition: left 0.25s ease;
}
.main-content.sidebar-open { left: 185px; }
.page-content { padding: 28px 30px; display: flex; flex-direction: column; gap: 20px; min-height: 100%; }
 
/* ══ Header ══════════════════════════════ */
.page-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px; letter-spacing: -0.4px; }
.page-desc  { font-size: 13px; color: #64748b; margin: 0; }
 
/* ══ Stats row ═══════════════════════════ */
.stats-row { display: flex; gap: 12px; flex-wrap: wrap; }
 
.stat-pill {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 18px; border-radius: 24px;
  background: #fff; border: 1px solid #e8eaf0;
  font-size: 13px;
}
.stat-num { font-size: 18px; font-weight: 800; color: #0f172a; }
.stat-lbl { color: #64748b; font-weight: 500; }
.stat-pill.pending   .stat-num { color: #ea580c; }
.stat-pill.validated .stat-num { color: #16a34a; }
.stat-pill.refused   .stat-num { color: #dc2626; }
 
/* ══ Table card ══════════════════════════ */
.table-card { background: #fff; border: 1px solid #e8eaf0; border-radius: 16px; overflow: hidden; }
 
.table-top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 22px 14px; gap: 12px; flex-wrap: wrap;
}
 
.table-title-block { display: flex; align-items: center; gap: 10px; }
.table-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
 
.count-badge {
  font-size: 11.5px; font-weight: 600; padding: 2px 10px; border-radius: 20px;
}
.count-badge.pending { background: #fff7ed; color: #ea580c; }
 
.search-inline {
  display: flex; align-items: center; gap: 7px;
  border: 1px solid #e2e8f0; border-radius: 9px;
  padding: 6px 12px; background: #f8fafc; width: 220px;
  transition: border-color 0.15s;
}
.search-inline:focus-within { border-color: #6366f1; background: #fff; }
.search-inline input { background: transparent; border: none; outline: none; font-size: 13px; color: #334155; width: 100%; }
.search-inline input::placeholder { color: #94a3b8; }
.search-inline svg { color: #94a3b8; flex-shrink: 0; }
 
/* Table */
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead tr { background: #fafbff; border-bottom: 1px solid #f1f5f9; border-top: 1px solid #f1f5f9; }
.data-table th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
.data-row { border-bottom: 1px solid #f8fafc; transition: background 0.12s; }
.data-row:last-child { border-bottom: none; }
.data-row:hover { background: #fafbff; }
.data-table td { padding: 14px 16px; vertical-align: middle; }
 
/* Student cell */
.student-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #334155; flex-shrink: 0; }
.s-name  { font-size: 13.5px; font-weight: 600; color: #1e293b; margin: 0 0 2px; }
.s-email { font-size: 11.5px; color: #94a3b8; margin: 0; }
 
.activity-name { font-size: 13px; font-weight: 500; color: #334155; max-width: 200px; }
.date-cell { font-size: 12.5px; color: #94a3b8; white-space: nowrap; }
 
/* Type tag */
.type-tag { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #ede9fe; color: #6366f1; white-space: nowrap; }
 
/* Status badge */
.status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600; white-space: nowrap; }
.status-badge.pending   { background: #fff7ed; color: #ea580c; }
.status-badge.validated { background: #ecfdf5; color: #16a34a; }
.status-badge.refused   { background: #fef2f2; color: #dc2626; }
 
/* Action buttons */
.action-btns { display: flex; align-items: center; gap: 5px; }
 
.btn-validate {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px; border: none;
  background: #ecfdf5; color: #16a34a; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: background 0.15s;
}
.btn-validate:hover { background: #bbf7d0; }
.btn-validate.large { padding: 9px 18px; font-size: 13px; background: #16a34a; color: white; }
.btn-validate.large:hover { background: #15803d; }
 
.btn-refuse {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px; border: none;
  background: #fef2f2; color: #dc2626; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: background 0.15s;
}
.btn-refuse:hover { background: #fecaca; }
.btn-refuse.large { padding: 9px 18px; font-size: 13px; background: #dc2626; color: white; }
.btn-refuse.large:hover { background: #b91c1c; }
 
.btn-info {
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  border-radius: 8px; border: 1px solid #e2e8f0; background: transparent;
  color: #94a3b8; cursor: pointer; transition: background 0.15s, color 0.15s;
}
.btn-info:hover { background: #f1f5f9; color: #6366f1; }
 
/* ══ Pagination ═════════════════════════ */
.pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; border-top: 1px solid #f1f5f9; flex-wrap: wrap; gap: 10px; }
.pag-info { font-size: 12.5px; color: #94a3b8; }
.pag-controls { display: flex; align-items: center; gap: 4px; }
.pag-btn { padding: 6px 12px; border: 1px solid #e2e8f0; border-radius: 7px; background: transparent; font-size: 12.5px; color: #475569; cursor: pointer; transition: background 0.12s; }
.pag-btn:hover:not(:disabled) { background: #f8fafc; }
.pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pag-btn.num { min-width: 32px; text-align: center; }
.pag-btn.num.active { background: #6366f1; border-color: #6366f1; color: white; font-weight: 600; }
 
/* ══ Modal ══════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 500; padding: 20px;
}
.modal-box {
  background: #fff; border-radius: 18px;
  padding: 28px; width: 100%; max-width: 520px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.18);
}
 
.modal-enter-active, .modal-leave-active { transition: opacity .2s, transform .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }
 
.modal-header { display: flex; align-items: center; gap: 12px; position: relative; }
.modal-avatar { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #334155; flex-shrink: 0; }
.modal-name  { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 3px; }
.modal-email { font-size: 12.5px; color: #94a3b8; margin: 0; }
.modal-close { position: absolute; right: 0; top: 0; background: none; border: none; cursor: pointer; color: #94a3b8; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: background 0.15s, color 0.15s; }
.modal-close:hover { background: #f1f5f9; color: #475569; }
 
.modal-sep { border: none; border-top: 1px solid #f1f5f9; margin: 18px 0; }
 
/* Info grid */
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px; }
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-item.full { grid-column: 1 / -1; }
.info-lbl { font-size: 10.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }
.info-val { font-size: 13.5px; font-weight: 500; color: #1e293b; }
.info-val.desc { font-size: 13px; color: #475569; line-height: 1.6; }
 
/* Reason textarea */
.reason-block { margin-top: 16px; display: flex; flex-direction: column; gap: 6px; }
.reason-input { border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #334155; resize: vertical; min-height: 80px; outline: none; transition: border-color 0.15s; font-family: inherit; }
.reason-input:focus { border-color: #6366f1; }
.reason-input::placeholder { color: #94a3b8; }
 
/* Modal actions */
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 22px; }
.btn-cancel { padding: 9px 18px; border: 1px solid #e2e8f0; border-radius: 9px; background: transparent; font-size: 13px; color: #475569; cursor: pointer; transition: background 0.15s; }
.btn-cancel:hover { background: #f8fafc; }
 
/* ══ Footer ═════════════════════════════ */
.page-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; font-size: 12px; color: #94a3b8; border-top: 1px solid #e8eaf0; margin-top: auto; }
.footer-links { display: flex; gap: 16px; }
.footer-links a { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
.footer-links a:hover { color: #475569; }
 
/* ══ Empty ══════════════════════════════ */
.empty-row { text-align: center; padding: 40px; color: #94a3b8; font-size: 13px; }
</style>