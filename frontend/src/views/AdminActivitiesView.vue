<template>
  <div class="dashboard-layout">
    <AdminNavbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <AdminSidebar :open="sidebarOpen" />
    <AdminSubbar title="Gérer les activités" v-model:searchQuery="search" :sidebarOpen="sidebarOpen" />
 
    <main class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="page-content">
 
        <div class="page-header">
          <h1 class="page-title">Activités des Étudiants</h1>
          <p class="page-desc">Validez ou refusez les activités soumises par les étudiants de la plateforme.</p>
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
              <h2 class="table-title">Activités en attente de validation</h2>
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
                <th>ÉTUDIANT</th><th>ACTIVITÉ</th><th>TYPE</th>
                <th>DATE</th><th>STATUT</th><th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="filteredItems.length === 0">
                <td colspan="6" class="empty-row">Aucune activité trouvée.</td>
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
            <span class="pag-info">Affichage {{ pagStart }} à {{ pagEnd }} sur {{ filteredItems.length }} activités</span>
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
 
    <!-- ══════════════ DETAIL MODAL ══════════════ -->
    <Transition name="modal">
      <div v-if="modal.open" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
 
          <!-- ── En-tête étudiant ── -->
          <div class="modal-head">
            <div class="mh-left">
              <div class="modal-avatar" :style="{ background: modal.item?.avatarColor }">
                {{ initials(modal.item?.studentName || '') }}
              </div>
              <div>
                <h3 class="mh-name">{{ modal.item?.studentName }}</h3>
                <p class="mh-meta">{{ modal.item?.studentEmail }} · {{ modal.item?.studentSchool }}</p>
              </div>
            </div>
            <div class="mh-right">
              <span class="status-badge" :class="modal.item?.status">{{ statusLabel[modal.item?.status] }}</span>
              <button class="modal-close" @click="closeModal"><X :size="16" /></button>
            </div>
          </div>
 
          <!-- ── Scrollable body ── -->
          <div class="modal-body">
 
            <!-- Section : Informations générales -->
            <section class="msection">
              <h4 class="msection-title">
                <span class="msection-dot blue"></span> Informations générales
              </h4>
              <div class="minfo-grid">
                <div class="minfo-item">
                  <span class="minfo-lbl">Titre de l'activité</span>
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
                  <!-- Simule une image avec couleur + icône -->
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
                placeholder="Expliquez la raison du refus. Ce message sera envoyé à l'étudiant."
                class="reason-input"></textarea>
            </section>
 
          </div>
 
          <!-- ── Footer actions ── -->
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModal">Fermer</button>
            <div class="mf-right">
              <button v-if="modal.action !== 'view'" class="btn-refuse-sm" @click="modal.action = 'refuse'" :disabled="loadingAction">
                <X :size="13" /> Refuser
              </button>
              <button v-if="modal.action !== 'view'" class="btn-validate-sm" @click="confirmValidate" :disabled="loadingAction">
                <Check :size="13" /> Valider
              </button>
              <button v-if="modal.action === 'refuse' && modal.reason" class="btn-refuse-confirm" @click="confirmRefuse" :disabled="loadingAction">
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
 
const statusLabel = {
  // valeurs UI historiques
  pending: 'En attente',
  validated: 'Validé',
  refused: 'Refusé'
}

/* ═══ DONNÉES (chargées depuis le backend) ═══ */
const items = ref([])
const loading = ref(false)
const loadingAction = ref(false)

// Backend renvoie :
// - id_activite
// - statut (DECLAREE | ATTESTEE_INSTITUTION)
// - etudiant.utilisateur.{nom,prenom,email}
// - validateur.utilisateur.{nom,prenom}
const mapActivityForUI = (a) => {
  const id = a.id_activite ?? a.id
  const etu = a.etudiant?.utilisateur

  const statut = a.statut ?? a.status

  const status =
    typeof statut === 'string'
      ? statut === 'DECLAREE'
        ? 'pending'
        : statut === 'ATTESTEE_INSTITUTION'
          ? 'validated'
          : statut === 'REFUSEE'
            ? 'refused'
            : 'pending'
      : 'pending'

  return {
    ...a,
    id,
    studentName: (a.studentName ?? [etu?.prenom, etu?.nom].filter(Boolean).join(' ')) || a.etudiant?.nom_etudiant || '',
    studentEmail: (a.studentEmail ?? etu?.email) || '',
    studentSchool: (a.studentSchool ?? a.etudiant?.etablissement) || '',
    title: a.title ?? a.nom,
    type: a.type,
    date: a.date ?? a.periode,
    duration: a.duration,
    location: a.location,
    dateStart: a.dateStart,
    dateEnd: a.dateEnd,
    description: a.description,
    status,
    avatarColor: a.avatarColor ?? '#c7d2fe'
  }
}

const loadActivities = async () => {
  loading.value = true
  try {
    // Le contrôleur supporte le query param: statut
    const { data } = await api.get('/activites')
    const list = data?.data ?? data?.data?.data ?? []
    items.value = Array.isArray(list) ? list.map(mapActivityForUI) : []
  } catch (e) {
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadActivities)

/* fallback mock désactivé */
/* const items = ref([
  {
    id: 1,
    studentName: 'Amine Bensaid', studentEmail: 'amine.b@univ-casa.ma', studentSchool: 'Université Hassan II',
    title: 'Hackathon UM6P 2023', type: 'Compétition', date: '12 Oct 2023',
    dateStart: '10 Oct 2023', dateEnd: '12 Oct 2023', duration: '48h', location: 'Ben Guerir',
    status: 'pending', avatarColor: '#c7d2fe',
    description: 'J\'ai participé au hackathon organisé par UM6P sur le thème de la santé numérique. Mon équipe de 3 personnes a développé une application de télémédecine intégrant un modèle IA de détection d\'anomalies. Nous avons remporté le 2ème prix parmi 40 équipes participantes.',
    skills: ['Python', 'TensorFlow', 'React Native', 'Firebase', 'Travail en équipe'],
    photos: [
      { name: 'photo_equipe.jpg',    color: '#6366f1' },
      { name: 'presentation.jpg',    color: '#8b5cf6' },
      { name: 'certificat_2eme.jpg', color: '#a78bfa' },
    ],
    links: [
      { label: 'Projet GitHub',     url: 'https://github.com/amine/hackathon-um6p' },
      { label: 'Article LinkedIn',  url: 'https://linkedin.com/posts/amine-bensaid' },
    ],
    document: { name: 'attestation_participation_um6p.pdf', type: 'Attestation officielle PDF' },
  },
  {
    id: 2,
    studentName: 'Sarah Mansouri', studentEmail: 's.mansouri@est-agadir.ac.ma', studentSchool: 'EST Agadir',
    title: 'Atelier Design Thinking', type: 'Formation', date: '15 Oct 2023',
    dateStart: '14 Oct 2023', dateEnd: '15 Oct 2023', duration: '2 jours', location: 'Agadir',
    status: 'pending', avatarColor: '#d1fae5',
    description: 'Participation à un atelier de Design Thinking organisé par l\'EST Agadir en partenariat avec une startup locale. J\'ai appris les 5 étapes du DT : Empathiser, Définir, Idéer, Prototyper et Tester. Notre groupe a travaillé sur une solution pour améliorer l\'accès à l\'eau potable en zones rurales.',
    skills: ['Design Thinking', 'Prototypage', 'Empathie utilisateur', 'Pitch'],
    photos: [
      { name: 'atelier_jour1.jpg', color: '#10b981' },
      { name: 'prototype.jpg',     color: '#059669' },
    ],
    links: [
      { label: 'Programme de l\'atelier', url: 'https://est-agadir.ac.ma/ateliers/dt2023' },
    ],
    document: { name: 'certificat_design_thinking.pdf', type: 'Certificat de participation PDF' },
  },
  {
    id: 3,
    studentName: 'Youssef Ame', studentEmail: 'youssef.amrani@emi.ac.ma', studentSchool: 'EMI Rabat',
    title: 'Conférence DevFest Maroc', type: 'Conférence', date: '18 Oct 2023',
    dateStart: '18 Oct 2023', dateEnd: '18 Oct 2023', duration: '1 jour', location: 'Rabat',
    status: 'pending', avatarColor: '#fde68a',
    description: 'Participation à la conférence annuelle des développeurs au Maroc organisée par GDG Rabat. J\'ai assisté à 6 sessions techniques sur Flutter, Kubernetes et l\'IA générative. J\'ai également présenté un lightning talk de 5 minutes sur mon projet open source de générateur de CV.',
    skills: ['Flutter', 'Kubernetes', 'IA Générative', 'Open Source', 'Public Speaking'],
    photos: [
      { name: 'conference_salle.jpg',  color: '#f59e0b' },
      { name: 'mon_talk.jpg',          color: '#d97706' },
      { name: 'badge_speaker.jpg',     color: '#b45309' },
    ],
    links: [
      { label: 'DevFest Maroc 2023',   url: 'https://devfest.ma/2023' },
      { label: 'Mon projet open source', url: 'https://github.com/youssef/cv-gen' },
      { label: 'Slides de présentation', url: 'https://slides.com/youssef/lightning-talk' },
    ],
    document: null,
  },
  {
    id: 4,
    studentName: 'Sofia Kenzi', studentEmail: 'sofia.kenzi@aui.ma', studentSchool: 'Al Akhawayn University',
    title: 'Stage chez OCP Solutions', type: 'Stage', date: '20 Oct 2023',
    dateStart: '01 Sep 2023', dateEnd: '31 Oct 2023', duration: '2 mois', location: 'Casablanca',
    status: 'validated', avatarColor: '#fbcfe8',
    description: 'Stage de fin d\'études dans le département IT d\'OCP Solutions. J\'ai travaillé sur l\'optimisation des requêtes SQL sur une base de données de 50M de lignes. J\'ai réduit le temps de réponse moyen de 4.2s à 0.8s grâce à l\'indexation et la réécriture de 12 procédures stockées.',
    skills: ['SQL', 'PostgreSQL', 'Optimisation', 'Power BI', 'Git'],
    photos: [
      { name: 'bureau_ocp.jpg',        color: '#ec4899' },
      { name: 'dashboard_final.jpg',   color: '#db2777' },
    ],
    links: [
      { label: 'Rapport de stage (Drive)', url: 'https://drive.google.com/file/sofia-rapport' },
    ],
    document: { name: 'attestation_stage_ocp.pdf', type: 'Attestation de stage signée PDF' },
  },
  {
    id: 5,
    studentName: 'Karim Tazi', studentEmail: 'k.tazi@encg-fes.ma', studentSchool: 'ENCG Fès',
    title: 'Bénévolat Croissant Rouge', type: 'Bénévolat', date: '22 Oct 2023',
    dateStart: '16 Oct 2023', dateEnd: '22 Oct 2023', duration: '1 semaine', location: 'Fès',
    status: 'refused', avatarColor: '#e2e8f0',
    description: 'Participation à une campagne de sensibilisation aux premiers secours organisée par le Croissant Rouge Marocain dans la région de Fès. Nous avons formé plus de 200 personnes aux gestes de premiers secours.',
    skills: ['Premiers secours', 'Communication', 'Organisation'],
    photos: [
      { name: 'formation_secours.jpg', color: '#94a3b8' },
    ],
    links: [],
    document: { name: 'attestation_benevolat_crm.pdf', type: 'Attestation de bénévolat PDF' },
  },
  {
    id: 6,
    studentName: 'Nadia El Fassi', studentEmail: 'n.elfassi@univ-casa.ma', studentSchool: 'Université Hassan II',
    title: 'Projet de recherche IA', type: 'Recherche', date: '24 Oct 2023',
    dateStart: '01 Jul 2023', dateEnd: '30 Sep 2023', duration: '3 mois', location: 'Casablanca',
    status: 'pending', avatarColor: '#bfdbfe',
    description: 'Participation à un projet de recherche supervisé par le Prof. El Alami sur l\'apprentissage automatique appliqué à la reconnaissance d\'images médicales. J\'ai implémenté un modèle ResNet-50 fine-tuné sur un dataset de radiographies pulmonaires pour détecter les pneumonies avec 94.2% de précision.',
    skills: ['Python', 'PyTorch', 'Computer Vision', 'ResNet', 'Jupyter', 'LaTeX'],
    photos: [
      { name: 'resultats_modele.png',  color: '#3b82f6' },
      { name: 'poster_recherche.pdf',  color: '#2563eb' },
    ],
    links: [
      { label: 'Paper sur arXiv',     url: 'https://arxiv.org/abs/2023.12345' },
      { label: 'Code source',          url: 'https://github.com/nadia/medical-ai' },
      { label: 'Dataset utilisé',      url: 'https://kaggle.com/datasets/chest-xray' },
    ],
    document: { name: 'rapport_recherche_IA.pdf', type: 'Rapport de recherche PDF (42 pages)' },
  },
  {
    id: 7,
    studentName: 'Omar Benali', studentEmail: 'o.benali@emi.ac.ma', studentSchool: 'EMI Rabat',
    title: 'Concours RobotX Maroc', type: 'Compétition', date: '25 Oct 2023',
    dateStart: '23 Oct 2023', dateEnd: '25 Oct 2023', duration: '3 jours', location: 'Rabat',
    status: 'pending', avatarColor: '#fecaca',
    description: 'Participation au concours national de robotique avec une équipe de 4 ingénieurs. Nous avons conçu un robot autonome capable de naviguer dans un labyrinthe, de ramasser des objets et de les trier par couleur. Notre robot a réalisé le parcours en 47 secondes, nous classant 3ème sur 18 équipes.',
    skills: ['Arduino', 'C++', 'Capteurs ultrason', 'Servo-moteurs', 'CAO', 'Travail en équipe'],
    photos: [
      { name: 'robot_final.jpg',     color: '#ef4444' },
      { name: 'equipe_podium.jpg',   color: '#dc2626' },
      { name: 'circuit_test.jpg',    color: '#b91c1c' },
    ],
    links: [
      { label: 'Vidéo du robot en action', url: 'https://youtube.com/watch?v=robotx2023' },
      { label: 'Code Arduino GitHub',       url: 'https://github.com/omar/robotx' },
    ],
    document: { name: 'diplome_3eme_prix_robotx.pdf', type: 'Diplôme 3ème prix PDF' },
  },
])
 
/* ── Stats, filter, pagination ── */
const stats        = computed(() => [
  { label: 'Total',      value: items.value.length,                                       type: 'total' },
  { label: 'En attente', value: items.value.filter(i => i.status === 'pending').length,   type: 'pending' },
  { label: 'Validées',   value: items.value.filter(i => i.status === 'validated').length, type: 'validated' },
  { label: 'Refusées',   value: items.value.filter(i => i.status === 'refused').length,   type: 'refused' },
])
const pendingItems   = computed(() => items.value.filter(i => i.status === 'pending'))
const filteredItems  = computed(() => { const q = search.value.toLowerCase(); return items.value.filter(i => !q || i.studentName.toLowerCase().includes(q) || i.title.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)) })
const totalPages     = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / perPage)))
const paginatedItems = computed(() => filteredItems.value.slice((page.value - 1) * perPage, page.value * perPage))
const pagStart = computed(() => Math.min((page.value - 1) * perPage + 1, filteredItems.value.length))
const pagEnd   = computed(() => Math.min(page.value * perPage, filteredItems.value.length))
 
/* ── Modal ── */
const modal = ref({ open: false, item: null, action: 'view', reason: '' })
const openDetail      = (item, action) => { modal.value = { open: true, item, action, reason: '' } }
const closeModal      = () => { modal.value.open = false }
const confirmValidate = async () => {
  if (!modal.value.item) return
  const id = modal.value.item.id
  if (!id) return

  loadingAction.value = true
  try {
    await api.patch(`/activites/${id}/valider`, { statut: 'ATTESTEE_INSTITUTION' })
    await loadActivities()
    // notify dashboard to refresh counts
    try { window.dispatchEvent(new Event('admin-dashboard-refresh')) } catch (e) {}
    closeModal()
  } catch (e) {
    // garde silencieux
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
    await api.patch(`/activites/${id}/valider`, { statut: 'REFUSEE' })
    await loadActivities()
    // notify dashboard to refresh counts
    try { window.dispatchEvent(new Event('admin-dashboard-refresh')) } catch (e) {}
    closeModal()
  } catch (e) {
    // garde silencieux
  } finally {
    loadingAction.value = false
  }
}

const initials = (name) => (name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
</script>
 
<style scoped>
/* ══ Layout ══════════════════════════════════ */
.dashboard-layout { min-height: 100vh; background: #f5f7fb; }
.main-content { 
  position: fixed; top: 106px; left: 0; right: 0
  ; bottom: 0; overflow-y: auto; 
  transition: left 0.25s ease; }
.main-content.sidebar-open { left: 185px; }
.page-content { 
  padding: 28px 8px 30px 43px; 
  background: #dfe2ea;
  display: flex;
   flex-direction: column; gap: 20px; 
   min-height: 100%; 
  }
 
.page-title { font-size: 28px; font-weight: 800
  ; color: var(--text-strong); margin: 0 0 6px; 
  letter-spacing: -0.4px; }
.page-desc  { font-size: 13px; color: var(--text-slate); margin: 0; }
 
/* ══ Stats ═══════════════════════════════════ */
.stats-row { display: flex; gap: 12px; flex-wrap: wrap; }
.stat-pill { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 24px; background: var(--white); border: 1px solid var(--border-admin); }
.stat-num { font-size: 18px; font-weight: 800; color: var(--text-strong); }
.stat-lbl { font-size: 13px; color: var(--text-slate); font-weight: 500; }
.stat-pill.pending   .stat-num { color: var(--warning-strong); }
.stat-pill.validated .stat-num { color: var(--success); }
.stat-pill.refused   .stat-num { color: var(--danger); }
 
/* ══ Table card ══════════════════════════════ */
.table-card { background: var(--white); border: 1px solid var(--border-admin); border-radius: 16px; overflow: hidden; }
.table-top  { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px 14px; gap: 12px; flex-wrap: wrap; }
.table-title-block { display: flex; align-items: center; gap: 10px; }
.table-title { font-size: 15px; font-weight: 700; color: var(--text-strong); margin: 0; }
.count-badge { font-size: 11.5px; font-weight: 600; padding: 2px 10px; border-radius: 20px; }
.count-badge.pending { background: var(--warning-bg); color: var(--warning-strong); }
.search-inline { display: flex; align-items: center; gap: 7px; border: 1px solid var(--border-light); border-radius: 9px; padding: 6px 12px; background: var(--surface-subtle); width: 220px; transition: border-color 0.15s; }
.search-inline:focus-within { border-color: var(--indigo); background: var(--white); }
.search-inline input { background: transparent; border: none; outline: none; font-size: 13px; color: var(--text-body); width: 100%; }
.search-inline input::placeholder { color: var(--text-light); }
.search-inline svg { color: var(--text-light); flex-shrink: 0; }
 
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead tr { background: var(--surface-admin); border-top: 1px solid var(--surface-muted); border-bottom: 1px solid var(--surface-muted); }
.data-table th { text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 700; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
.data-row { border-bottom: 1px solid var(--surface-subtle); transition: background 0.12s; }
.data-row:last-child { border-bottom: none; }
.data-row:hover { background: var(--surface-admin); }
.data-table td { padding: 13px 16px; vertical-align: middle; }
 
.student-cell { display: flex; align-items: center; gap: 10px; }
.s-avatar { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--text-body); flex-shrink: 0; }
.s-name  { font-size: 13.5px; font-weight: 600; color: var(--text-heading); margin: 0 0 2px; }
.s-email { font-size: 11.5px; color: var(--text-light); margin: 0; }
.item-title { font-size: 13px; font-weight: 500; color: var(--text-body); max-width: 180px; }
.date-cell  { font-size: 12.5px; color: var(--text-light); white-space: nowrap; }
 
.type-tag { display: inline-block; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; background: var(--indigo-soft); color: var(--indigo); white-space: nowrap; }
 
.status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600; white-space: nowrap; }
.status-badge.pending   { background: var(--warning-bg); color: var(--warning-strong); }
.status-badge.validated { background: var(--success-bg); color: var(--success); }
.status-badge.refused   { background: var(--danger-bg); color: var(--danger); }
 
.action-btns { display: flex; align-items: center; gap: 5px; }
.btn-validate { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 7px; border: none; background: var(--success-bg); color: var(--success); font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-validate:hover { background: #bbf7d0; }
.btn-refuse   { display: inline-flex; align-items: center; gap: 5px; padding: 6px 11px; border-radius: 7px; border: none; background: var(--danger-bg); color: var(--danger); font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-refuse:hover { background: #fecaca; }
.btn-eye { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 7px; border: 1px solid var(--border-light); background: transparent; color: var(--text-light); cursor: pointer; transition: background 0.15s, color 0.15s; }
.btn-eye:hover { background: var(--indigo-soft); color: var(--indigo); }
 
/* ══ Pagination ══════════════════════════════ */
.pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; border-top: 1px solid var(--surface-muted); flex-wrap: wrap; gap: 10px; }
.pag-info { font-size: 12.5px; color: var(--text-light); }
.pag-controls { display: flex; align-items: center; gap: 4px; }
.pag-btn { padding: 6px 12px; border: 1px solid var(--border-light); border-radius: 7px; background: transparent; font-size: 12.5px; color: var(--text-muted); cursor: pointer; transition: background 0.12s; }
.pag-btn:hover:not(:disabled) { background: var(--surface-subtle); }
.pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pag-btn.num { min-width: 32px; text-align: center; }
.pag-btn.num.active { background: var(--indigo); border-color: var(--indigo); color: var(--white); font-weight: 600; }
 
/* ══ MODAL ═══════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 500; padding: 20px;
}
.modal-box {
  background: var(--white);
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
  border-bottom: 1px solid var(--surface-muted);
  flex-shrink: 0;
}
.mh-left { display: flex; align-items: center; gap: 12px; }
.modal-avatar { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: var(--text-body); flex-shrink: 0; }
.mh-name { font-size: 15px; font-weight: 700; color: var(--text-strong); margin: 0 0 3px; }
.mh-meta { font-size: 12px; color: var(--text-light); margin: 0; }
.mh-right { display: flex; align-items: center; gap: 10px; }
.modal-close { background: none; border: none; cursor: pointer; color: var(--text-light); width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 7px; transition: background 0.15s; }
.modal-close:hover { background: var(--surface-muted); color: var(--text-muted); }
 
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
  font-size: 12px; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.07em;
  margin: 0;
}
.msection-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.msection-dot.blue   { background: var(--indigo); }
.msection-dot.purple { background: #8b5cf6; }
.msection-dot.green  { background: var(--success); }
.msection-dot.orange { background: var(--warning); }
.msection-dot.cyan   { background: var(--blue-w); }
.msection-dot.red    { background: var(--danger-light); }
 
/* Info grid */
.minfo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; }
.minfo-item { display: flex; flex-direction: column; gap: 3px; }
.minfo-lbl  { font-size: 10.5px; font-weight: 700; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.06em; }
.minfo-val  { font-size: 13.5px; color: var(--text-heading); font-weight: 400; }
.minfo-val.bold { font-weight: 600; }
 
/* Description */
.mdesc { font-size: 13.5px; color: var(--text-body); line-height: 1.7; margin: 0; background: var(--surface-admin); border: 1px solid var(--border-admin); border-radius: 10px; padding: 14px 16px; }
 
/* Skills */
.skill-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.skill-tag  { display: inline-block; padding: 4px 11px; border-radius: 20px; font-size: 12px; font-weight: 500; background: var(--indigo-soft); color: var(--indigo); }
 
/* Photos */
.photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.photo-card { display: flex; flex-direction: column; gap: 5px; }
.photo-thumb {
  height: 80px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  opacity: 0.85;
}
.photo-name { font-size: 11px; color: var(--text-slate); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
 
/* Links */
.links-list { display: flex; flex-direction: column; gap: 6px; }
.link-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: 10px;
  border: 1px solid var(--border-light); background: var(--surface-admin);
  text-decoration: none; transition: background 0.15s, border-color 0.15s;
  cursor: pointer;
}
.link-row:hover { background: var(--indigo-soft); border-color: #c4b5fd; }
.link-icon { width: 28px; height: 28px; background: var(--indigo-soft); border-radius: 7px; display: flex; align-items: center; justify-content: center; color: var(--indigo); flex-shrink: 0; }
.link-info { display: flex; flex-direction: column; gap: 1px; flex: 1; min-width: 0; }
.link-label { font-size: 13px; font-weight: 600; color: var(--text-heading); }
.link-url   { font-size: 11px; color: var(--text-light); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.link-arrow { color: var(--text-light); flex-shrink: 0; }
 
/* Document */
.doc-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid var(--border-light); border-radius: 10px; background: var(--surface-admin); }
.doc-icon { width: 36px; height: 36px; background: var(--surface-danger-soft); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--danger-light); flex-shrink: 0; }
.doc-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.doc-name { font-size: 13px; font-weight: 600; color: var(--text-heading); }
.doc-type { font-size: 11px; color: var(--text-light); }
.doc-view-btn { padding: 6px 14px; border-radius: 7px; border: 1px solid var(--border-light); background: var(--white); font-size: 12.5px; color: var(--text-muted); cursor: pointer; font-weight: 500; transition: background 0.15s; }
.doc-view-btn:hover { background: var(--surface-muted); }
 
/* Reason textarea */
.reason-input { border: 1px solid var(--border-light); border-radius: 10px; padding: 12px 14px; font-size: 13px; color: var(--text-body); resize: vertical; min-height: 90px; outline: none; transition: border-color 0.15s; font-family: inherit; width: 100%; box-sizing: border-box; }
.reason-input:focus { border-color: var(--danger-light); }
.reason-input::placeholder { color: var(--text-light); }
 
/* Modal footer */
.modal-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 22px;
  border-top: 1px solid var(--surface-muted);
  flex-shrink: 0;
  gap: 8px;
}
.mf-right { display: flex; gap: 8px; }
 
.btn-cancel { padding: 8px 16px; border: 1px solid var(--border-light); border-radius: 9px; background: transparent; font-size: 13px; color: var(--text-muted); cursor: pointer; transition: background 0.15s; }
.btn-cancel:hover { background: var(--surface-subtle); }
 
.btn-validate-sm { display: inline-flex; align-items: center; gap: 5px; padding: 8px 16px; border-radius: 9px; border: none; background: var(--success); color: var(--white); font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-validate-sm:hover { background: #15803d; }
.btn-refuse-sm   { display: inline-flex; align-items: center; gap: 5px; padding: 8px 16px; border-radius: 9px; border: 1px solid var(--border-light); background: transparent; color: var(--danger); font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-refuse-sm:hover { background: var(--danger-bg); }
.btn-refuse-confirm { display: inline-flex; align-items: center; gap: 5px; padding: 8px 16px; border-radius: 9px; border: none; background: var(--danger); color: var(--white); font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-refuse-confirm:hover { background: #b91c1c; }
 
/* ══ Footer ══════════════════════════════════ */
.page-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; font-size: 12px; color: var(--text-light); border-top: 1px solid var(--border-admin); margin-top: auto; }
.footer-links { display: flex; gap: 16px; }
.footer-links a { color: var(--text-light); text-decoration: none; transition: color 0.15s; }
.footer-links a:hover { color: var(--text-muted); }
.empty-row { text-align: center; padding: 40px; color: var(--text-light); font-size: 13px; }
</style>
