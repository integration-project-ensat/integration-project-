<template>
  <div class="dashboard-layout">
    <AdminNavbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <AdminSidebar :open="sidebarOpen" />
    <AdminSubbar title="Gérer les certifications" v-model:searchQuery="search" :sidebarOpen="sidebarOpen" />

    <main class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="page-content">

        <div class="page-header">
          <h1 class="page-title">Certifications des Étudiants</h1>
          <p class="page-desc">Validez ou refusez les certifications soumises par les étudiants de la plateforme.</p>
        </div>

        <div class="stats-row">
          <div class="stat-pill" v-for="s in stats" :key="s.label" :class="s.type">
            <span class="stat-num">{{ s.value }}</span>
            <span class="stat-lbl">{{ s.label }}</span>
          </div>
        </div>

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
                <th>ÉTUDIANT</th><th>CERTIFICATION</th><th>ORGANISME</th>
                <th>DATE</th><th>STATUT</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredItems.length === 0">
                <td colspan="6" class="empty-row">Aucune certification trouvée.</td>
              </tr>
              <tr v-for="item in paginatedItems" :key="item.id" class="data-row">
                <td>
                  <div class="student-cell">
                    <div class="s-avatar" :style="{ background: item.avatarColor }">{{ initials(item.studentName) }}</div>
                    <div><p class="s-name">{{ item.studentName }}</p><p class="s-email">{{ item.studentEmail }}</p></div>
                  </div>
                </td>
                <td class="item-title">{{ item.title }}</td>
                <td><span class="type-tag">{{ item.type }}</span></td>
                <td class="date-cell">{{ item.date }}</td>
                <td><span class="status-badge" :class="item.status">{{ statusLabel[item.status] }}</span></td>
                <td>
                  <div class="action-btns">
                    <button class="btn-validate" @click="openDetail(item, 'validate')"><Check :size="13" /> Valider</button>
                    <button class="btn-refuse"   @click="openDetail(item, 'refuse')"><X :size="13" /> Refuser</button>
                    <button class="btn-eye"      @click="openDetail(item, 'view')" title="Voir le dossier"><Eye :size="14" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="pagination">
            <span class="pag-info">Affichage {{ pagStart }} Ã  {{ pagEnd }} sur {{ filteredItems.length }} certifications</span>
            <div class="pag-controls">
              <button class="pag-btn" :disabled="page === 1" @click="page--">Précédent</button>
              <button v-for="p in totalPages" :key="p" class="pag-btn num" :class="{ active: page === p }" @click="page = p">{{ p }}</button>
              <button class="pag-btn" :disabled="page === totalPages" @click="page++">Suivant</button>
            </div>
          </div>
        </div>

        <footer class="page-footer">
          <span>© 2024 StudentPort Admin. Tous droits réservés.</span>
          <div class="footer-links"><a href="#">Support</a><a href="#">Confidentialité</a></div>
        </footer>
      </div>
    </main>

    <!-- â•â•â•â•â•â•â•â•â•â•â•â•â•â• DETAIL MODAL â•â•â•â•â•â•â•â•â•â•â•â•â•â• -->
    <Transition name="modal">
      <div v-if="modal.open" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">

          <!-- â”€â”€ En-tête étudiant â”€â”€ -->
          <div class="modal-head">
            <div class="mh-left">
              <div class="modal-avatar" :style="{ background: modal.item?.avatarColor }">
                {{ initials(modal.item?.studentName || '') }}
              </div>
              <div>
                <h3 class="mh-name">{{ modal.item?.studentName }}</h3>
                <p class="mh-meta">{{ modal.item?.studentEmail }} Â· {{ modal.item?.studentSchool }}</p>
              </div>
            </div>
            <div class="mh-right">
              <span class="status-badge" :class="modal.item?.status">{{ statusLabel[modal.item?.status] }}</span>
              <button class="modal-close" @click="closeModal"><X :size="16" /></button>
            </div>
          </div>

          <!-- â”€â”€ Scrollable body â”€â”€ -->
          <div class="modal-body">

            <!-- Section : Informations générales -->
            <section class="msection">
              <h4 class="msection-title">
                <span class="msection-dot blue"></span> Informations générales
              </h4>
              <div class="minfo-grid">
                <div class="minfo-item">
                  <span class="minfo-lbl">Titre de la certification</span>
                  <span class="minfo-val bold">{{ modal.item?.title }}</span>
                </div>
                <div class="minfo-item">
                  <span class="minfo-lbl">Type</span>
                  <span class="type-tag">{{ modal.item?.type }}</span>
                </div>
                <div class="minfo-item">
                  <span class="minfo-lbl">Durée</span>
                  <span class="minfo-val">{{ modal.item?.duration }}</span>
                </div>
                <div class="minfo-item">
                  <span class="minfo-lbl">Lieu</span>
                  <span class="minfo-val">{{ modal.item?.location }}</span>
                </div>
                <div class="minfo-item">
                  <span class="minfo-lbl">Date de début</span>
                  <span class="minfo-val">{{ modal.item?.dateStart }}</span>
                </div>
                <div class="minfo-item">
                  <span class="minfo-lbl">Date de fin</span>
                  <span class="minfo-val">{{ modal.item?.dateEnd }}</span>
                </div>
              </div>
            </section>

            <!-- Section : Description rédigée par l'étudiant -->
            <section class="msection">
              <h4 class="msection-title">
                <span class="msection-dot purple"></span> Description (saisie par l'étudiant)
              </h4>
              <p class="mdesc">{{ modal.item?.description }}</p>
            </section>

            <!-- Section : Compétences acquises -->
            <section class="msection" v-if="modal.item?.skills?.length">
              <h4 class="msection-title">
                <span class="msection-dot green"></span> Compétences acquises
              </h4>
              <div class="skill-tags">
                <span v-for="s in modal.item.skills" :key="s" class="skill-tag">{{ s }}</span>
              </div>
            </section>

            <!-- Section : Photos / preuves -->
            <section class="msection" v-if="modal.item?.photos?.length">
              <h4 class="msection-title">
                <span class="msection-dot orange"></span> Photos / Preuves jointes
              </h4>
              <div class="photo-grid">
                <div v-for="(ph, i) in modal.item.photos" :key="i" class="photo-card">
                  <!-- Simule une image avec couleur + icÃ´ne -->
                  <div class="photo-thumb" :style="{ background: ph.color }">
                    <ImageIcon :size="28" color="rgba(255,255,255,0.7)" />
                  </div>
                  <p class="photo-name">{{ ph.name }}</p>
                </div>
              </div>
            </section>

            <!-- Section : Liens -->
            <section class="msection" v-if="modal.item?.links?.length">
              <h4 class="msection-title">
                <span class="msection-dot cyan"></span> Liens soumis
              </h4>
              <div class="links-list">
                <a v-for="lk in modal.item.links" :key="lk.url"
                   :href="lk.url" target="_blank" class="link-row">
                  <div class="link-icon"><ExternalLink :size="13" /></div>
                  <div class="link-info">
                    <span class="link-label">{{ lk.label }}</span>
                    <span class="link-url">{{ lk.url }}</span>
                  </div>
                  <ExternalLink :size="12" class="link-arrow" />
                </a>
              </div>
            </section>

            <!-- Section : Certificat / document officiel -->
            <section class="msection" v-if="modal.item?.document">
              <h4 class="msection-title">
                <span class="msection-dot red"></span> Document officiel
              </h4>
              <div class="doc-row">
                <div class="doc-icon"><FileText :size="20" /></div>
                <div class="doc-info">
                  <span class="doc-name">{{ modal.item.document.name }}</span>
                  <span class="doc-type">{{ modal.item.document.type }}</span>
                </div>
                <button class="doc-view-btn">Voir</button>
              </div>
            </section>

            <!-- Section : Motif de refus (si action = refuse) -->
            <section class="msection" v-if="modal.action === 'refuse'">
              <h4 class="msection-title">
                <span class="msection-dot red"></span> Motif de refus
              </h4>
              <textarea v-model="modal.reason"
                placeholder="Expliquez la raison du refus. Ce message sera envoyé Ã  l'étudiant."
                class="reason-input"></textarea>
            </section>

          </div>

          <!-- â”€â”€ Footer actions â”€â”€ -->
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">Fermer</button>
            <div class="mf-right">
              <button v-if="modal.action !== 'view'" class="btn-refuse-sm" @click="modal.action = 'refuse'">
                <X :size="13" /> Refuser
              </button>
              <button v-if="modal.action !== 'view'" class="btn-validate-sm" @click="confirmValidate">
                <Check :size="13" /> Valider
              </button>
              <button v-if="modal.action === 'refuse' && modal.reason" class="btn-refuse-confirm" @click="confirmRefuse">
                <X :size="13" /> Confirmer le refus
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Check, X, Eye, ExternalLink, FileText, Image as ImageIcon } from 'lucide-vue-next'
import AdminNavbar  from '../components/admin/AdminNavbar.vue'
import AdminSidebar from '../components/admin/AdminSidebar.vue'
import AdminSubbar  from '../components/admin/AdminSubbar.vue'
import api from '@/services/api.js'


const sidebarOpen = ref(true)
const search      = ref('')
const page        = ref(1)
const perPage     = 5
const statusLabel = { pending: 'En attente', validated: 'Validé', refused: 'Refusé' }

/* â•â•â• DONNÃ‰ES â€” chargÃ©es depuis le backend â•â•â• */
const items = ref([])

const responseList = (response) => {
  const payload = response?.data ?? response
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  return []
}

const mapAttestationForUI = (a) => {
  // Backend: attestationController renvoie un objet attestation.
  // On normalise vers les champs que la vue utilise.
  const statut = a?.element?.statut ?? a?.statut ?? a?.status

  const status =
    typeof statut === 'string'
      ? statut === 'EN_ATTENTE'
        ? 'pending'
        : statut === 'VALIDE'
          ? 'validated'
          : statut === 'REFUSE'
            ? 'refused'
            : statut === 'CORRECTION_DEMANDEE'
              ? 'pending'
              : 'pending'
      : 'pending'

  return {
    ...a,
    id: a?.id_attestation ?? a?.id,
    studentName: a?.etudiant?.utilisateur
      ? `${a.etudiant.utilisateur.prenom} ${a.etudiant.utilisateur.nom}`
      : (a?.studentName ?? 'Étudiant non lie'),
    studentEmail: a?.etudiant?.utilisateur?.email ?? a?.studentEmail ?? '',
    studentSchool: a?.etudiant?.etablissement ?? a?.studentSchool ?? '',
    title: a?.titre ?? a?.title ?? '',
    type: a?.type ?? a?.organisme ?? a?.type ?? '',
    date: a?.date ?? a?.createdAt ?? a?.dateSoumission ?? '',
    dateStart: a?.date_debut ?? a?.dateStart,
    dateEnd: a?.date_fin ?? a?.dateEnd,
    duration: a?.duree ?? a?.duration,
    location: a?.lieu ?? a?.location,
    status,
    avatarColor: '#c7d2fe',
    description: a?.description ?? '',
    skills: a?.skills ?? [],
    photos: a?.photos ?? a?.preuves ?? [],
    links: a?.links ?? [],
    document: a?.document ?? null,
    validateurId: a?.validateurId ?? a?.element?.validateur_id ?? a?.element?.validateur?.id_utilisateur,
    motif_refus: a?.motif_refus ?? a?.element?.motif_refus ?? a?.motifRefus,
  }
}

const loadCertifications = async () => {
  try {
    const resp = await api.get('/attestations')
    const list = responseList(resp)
    items.value = Array.isArray(list) ? list.map(mapAttestationForUI) : []
  } catch (e) {
    items.value = []
  }
}

onMounted(loadCertifications)

/* â”€â”€ Stats, filter, pagination â”€â”€ */
const stats        = computed(() => [
  { label: 'Total',      value: items.value.length,                                       type: 'total' },
  { label: 'En attente', value: items.value.filter(i => i.status === 'pending').length,   type: 'pending' },
  { label: 'Valides',   value: items.value.filter(i => i.status === 'validated').length, type: 'validated' },
  { label: 'Refusées',   value: items.value.filter(i => i.status === 'refused').length,   type: 'refused' },
])
const pendingItems   = computed(() => items.value.filter(i => i.status === 'pending'))
const filteredItems  = computed(() => { const q = search.value.toLowerCase(); return items.value.filter(i => !q || i.studentName.toLowerCase().includes(q) || i.title.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)) })
const totalPages     = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / perPage)))
const paginatedItems = computed(() => filteredItems.value.slice((page.value - 1) * perPage, page.value * perPage))
const pagStart = computed(() => Math.min((page.value - 1) * perPage + 1, filteredItems.value.length))
const pagEnd   = computed(() => Math.min(page.value * perPage, filteredItems.value.length))

/* â”€â”€ Modal â”€â”€ */
const modal = ref({ open: false, item: null, action: 'view', reason: '' })
const openDetail      = (item, action) => { modal.value = { open: true, item, action, reason: '' } }
const closeModal      = () => { modal.value.open = false }
const loadingAction = ref(false)

const confirmValidate = async () => {
  if (!modal.value.item) return
  const id = modal.value.item.id
  if (!id) return

  loadingAction.value = true
  try {
    await api.patch(`/attestations/${id}/statut`, { statut: 'VALIDE' })
    await loadCertifications()
    // notify dashboard to refresh counts
    try { window.dispatchEvent(new Event('admin-dashboard-refresh')) } catch (e) {}
    closeModal()
  } finally {
    loadingAction.value = false
  }
}

const confirmRefuse = async () => {
  if (!modal.value.item) return
  const id = modal.value.item.id
  if (!id) return

  loadingAction.value = true
  try {
    await api.patch(`/attestations/${id}/statut`, {
      statut: 'REFUSE',
      motif_refus: modal.value.reason,
    })
    await loadCertifications()
    // notify dashboard to refresh counts
    try { window.dispatchEvent(new Event('admin-dashboard-refresh')) } catch (e) {}
    closeModal()
  } finally {
    loadingAction.value = false
  }
}
const initials = (name) => (name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
</script>

<style scoped>
/* â•â• Layout â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
.dashboard-layout { min-height: 100vh; background: #f5f7fb; }
.main-content { position: fixed; top: 106px; left: 0; right: 0; bottom: 0; overflow-y: auto; transition: left 0.25s ease; }
.main-content.sidebar-open { left: 185px; }
.page-content {
   padding: 28px 8px 30px 43px; 
  background: #dfe2ea;
   display: flex; flex-direction: column; gap: 20px; min-height: 100%; }

.page-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px; letter-spacing: -0.4px; }
.page-desc  { font-size: 13px; color: #64748b; margin: 0; }

/* â•â• Stats â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
.stats-row { display: flex; gap: 12px; flex-wrap: wrap; }
.stat-pill { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 24px; background: #fff; border: 1px solid #e8eaf0; }
.stat-num { font-size: 18px; font-weight: 800; color: #0f172a; }
.stat-lbl { font-size: 13px; color: #64748b; font-weight: 500; }
.stat-pill.pending   .stat-num { color: #ea580c; }
.stat-pill.validated .stat-num { color: #16a34a; }
.stat-pill.refused   .stat-num { color: #dc2626; }

/* â•â• Table card â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
.table-card { background: #fff; border: 1px solid #e8eaf0; border-radius: 16px; overflow: hidden; }
.table-top  { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px 14px; gap: 12px; flex-wrap: wrap; }
.table-title-block { display: flex; align-items: center; gap: 10px; }
.table-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
.count-badge { font-size: 11.5px; font-weight: 600; padding: 2px 10px; border-radius: 20px; }
.count-badge.pending { background: #fff7ed; color: #ea580c; }
.search-inline { display: flex; align-items: center; gap: 7px; border: 1px solid #e2e8f0; border-radius: 9px; padding: 6px 12px; background: #f8fafc; width: 220px; transition: border-color 0.15s; }
.search-inline:focus-within { border-color: #6366f1; background: #fff; }
.search-inline input { background: transparent; border: none; outline: none; font-size: 13px; color: #334155; width: 100%; }
.search-inline input::placeholder { color: #94a3b8; }
.search-inline svg { color: #94a3b8; flex-shrink: 0; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table thead tr { background: #fafbff; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
.data-table th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
.data-row { border-bottom: 1px solid #f8fafc; transition: background 0.12s; }
.data-row:last-child { border-bottom: none; }
.data-row:hover { background: #fafbff; }
.data-table td { padding: 13px 16px; vertical-align: middle; }

.student-cell { display: flex; align-items: center; gap: 10px; }
.s-avatar { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #334155; flex-shrink: 0; }
.s-name  { font-size: 13.5px; font-weight: 600; color: #1e293b; margin: 0 0 2px; }
.s-email { font-size: 11.5px; color: #94a3b8; margin: 0; }
.item-title { font-size: 13px; font-weight: 500; color: #334155; max-width: 180px; }
.date-cell  { font-size: 12.5px; color: #94a3b8; white-space: nowrap; }

.type-tag { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #ede9fe; color: #6366f1; white-space: nowrap; }

.status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600; white-space: nowrap; }
.status-badge.pending   { background: #fff7ed; color: #ea580c; }
.status-badge.validated { background: #ecfdf5; color: #16a34a; }
.status-badge.refused   { background: #fef2f2; color: #dc2626; }

.action-btns { display: flex; align-items: center; gap: 5px; }
.btn-validate { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 7px; border: none; background: #ecfdf5; color: #16a34a; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-validate:hover { background: #bbf7d0; }
.btn-refuse   { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 7px; border: none; background: #fef2f2; color: #dc2626; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-refuse:hover { background: #fecaca; }
.btn-eye { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 7px; border: 1px solid #e2e8f0; background: transparent; color: #94a3b8; cursor: pointer; transition: background 0.15s, color 0.15s; }
.btn-eye:hover { background: #ede9fe; color: #6366f1; }

/* â•â• Pagination â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
.pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; border-top: 1px solid #f1f5f9; flex-wrap: wrap; gap: 10px; }
.pag-info { font-size: 12.5px; color: #94a3b8; }
.pag-controls { display: flex; align-items: center; gap: 4px; }
.pag-btn { padding: 6px 12px; border: 1px solid #e2e8f0; border-radius: 7px; background: transparent; font-size: 12.5px; color: #475569; cursor: pointer; transition: background 0.12s; }
.pag-btn:hover:not(:disabled) { background: #f8fafc; }
.pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pag-btn.num { min-width: 32px; text-align: center; }
.pag-btn.num.active { background: #6366f1; border-color: #6366f1; color: white; font-weight: 600; }

/* â•â• MODAL â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 500; padding: 20px;
}
.modal-box {
  background: #fff;
  border-radius: 20px;
  width: 100%; max-width: 620px;
  max-height: 88vh;
  display: flex; flex-direction: column;
  box-shadow: 0 32px 80px rgba(0,0,0,0.22);
  overflow: hidden;
}

.modal-enter-active, .modal-leave-active { transition: opacity .2s, transform .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

/* Modal head */
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 22px 18px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}
.mh-left { display: flex; align-items: center; gap: 12px; }
.modal-avatar { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #334155; flex-shrink: 0; }
.mh-name { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 3px; }
.mh-meta { font-size: 12px; color: #94a3b8; margin: 0; }
.mh-right { display: flex; align-items: center; gap: 10px; }
.modal-close { background: none; border: none; cursor: pointer; color: #94a3b8; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 7px; transition: background 0.15s; }
.modal-close:hover { background: #f1f5f9; color: #475569; }

/* Modal scrollable body */
.modal-body {
  overflow-y: auto;
  padding: 20px 22px;
  display: flex; flex-direction: column; gap: 22px;
  flex: 1;
}

/* Sections */
.msection { display: flex; flex-direction: column; gap: 12px; }

.msection-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 700; color: #475569;
  text-transform: uppercase; letter-spacing: 0.07em;
  margin: 0;
}
.msection-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.msection-dot.blue   { background: #6366f1; }
.msection-dot.purple { background: #8b5cf6; }
.msection-dot.green  { background: #16a34a; }
.msection-dot.orange { background: #f59e0b; }
.msection-dot.cyan   { background: #06b6d4; }
.msection-dot.red    { background: #ef4444; }

/* Info grid */
.minfo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; }
.minfo-item { display: flex; flex-direction: column; gap: 3px; }
.minfo-lbl  { font-size: 10.5px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }
.minfo-val  { font-size: 13.5px; color: #1e293b; font-weight: 400; }
.minfo-val.bold { font-weight: 600; }

/* Description */
.mdesc { font-size: 13.5px; color: #334155; line-height: 1.7; margin: 0; background: #fafbff; border: 1px solid #e8eaf0; border-radius: 10px; padding: 14px 16px; }

/* Skills */
.skill-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tag  { display: inline-block; padding: 4px 11px; border-radius: 20px; font-size: 12px; font-weight: 500; background: #ede9fe; color: #6366f1; }

/* Photos */
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.photo-card { display: flex; flex-direction: column; gap: 5px; }
.photo-thumb {
  height: 80px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  opacity: 0.85;
}
.photo-name { font-size: 11px; color: #64748b; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Links */
.links-list { display: flex; flex-direction: column; gap: 6px; }
.link-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 10px;
  border: 1px solid #e2e8f0; background: #fafbff;
  text-decoration: none; transition: background 0.15s, border-color 0.15s;
  cursor: pointer;
}
.link-row:hover { background: #ede9fe; border-color: #c4b5fd; }
.link-icon { width: 28px; height: 28px; background: #ede9fe; border-radius: 7px; display: flex; align-items: center; justify-content: center; color: #6366f1; flex-shrink: 0; }
.link-info { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.link-label { font-size: 13px; font-weight: 600; color: #1e293b; }
.link-url   { font-size: 11px; color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.link-arrow { color: #94a3b8; flex-shrink: 0; }

/* Document */
.doc-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fafbff; }
.doc-icon { width: 36px; height: 36px; background: #fee2e2; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #ef4444; flex-shrink: 0; }
.doc-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.doc-name { font-size: 13px; font-weight: 600; color: #1e293b; }
.doc-type { font-size: 11px; color: #94a3b8; }
.doc-view-btn { padding: 6px 14px; border-radius: 7px; border: 1px solid #e2e8f0; background: #fff; font-size: 12.5px; color: #475569; cursor: pointer; font-weight: 500; transition: background 0.15s; }
.doc-view-btn:hover { background: #f1f5f9; }

/* Reason textarea */
.reason-input { border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #334155; resize: vertical; min-height: 90px; outline: none; transition: border-color 0.15s; font-family: inherit; width: 100%; box-sizing: border-box; }
.reason-input:focus { border-color: #ef4444; }
.reason-input::placeholder { color: #94a3b8; }

/* Modal footer */
.modal-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 22px;
  border-top: 1px solid #f1f5f9;
  flex-shrink: 0;
  gap: 8px;
}
.mf-right { display: flex; gap: 8px; }

.btn-cancel { padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 9px; background: transparent; font-size: 13px; color: #475569; cursor: pointer; transition: background 0.15s; }
.btn-cancel:hover { background: #f8fafc; }

.btn-validate-sm { display: inline-flex; align-items: center; gap: 5px; padding: 8px 16px; border-radius: 9px; border: none; background: #16a34a; color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-validate-sm:hover { background: #15803d; }
.btn-refuse-sm   { display: inline-flex; align-items: center; gap: 5px; padding: 8px 16px; border-radius: 9px; border: 1px solid #e2e8f0; background: transparent; color: #dc2626; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-refuse-sm:hover { background: #fef2f2; }
.btn-refuse-confirm { display: inline-flex; align-items: center; gap: 5px; padding: 8px 16px; border-radius: 9px; border: none; background: #dc2626; color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-refuse-confirm:hover { background: #b91c1c; }

/* â•â• Footer â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
.page-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; font-size: 12px; color: #94a3b8; border-top: 1px solid #e8eaf0; margin-top: auto; }
.footer-links { display: flex; gap: 16px; }
.footer-links a { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
.footer-links a:hover { color: #475569; }
.empty-row { text-align: center; padding: 40px; color: #94a3b8; font-size: 13px; }
</style>



