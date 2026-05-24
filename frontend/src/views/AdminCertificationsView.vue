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
            <span class="pag-info">Affichage {{ pagStart }} à {{ pagEnd }} sur {{ filteredItems.length }} certifications</span>
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
import { ref, computed } from 'vue'
import { Search, Check, X, Eye, ExternalLink, FileText, Image as ImageIcon } from 'lucide-vue-next'
import AdminNavbar  from '../components/admin/AdminNavbar.vue'
import AdminSidebar from '../components/admin/AdminSidebar.vue'
import AdminSubbar  from '../components/admin/AdminSubbar.vue'

const sidebarOpen = ref(true)
const search      = ref('')
const page        = ref(1)
const perPage     = 5

const statusLabel = { pending: 'En attente', validated: 'Validé', refused: 'Refusé' }

/* ═══ DONNÉES — exactement ce que l'étudiant a saisi ═══ */
const items = ref([
  {
    id: 1,
    studentName: 'Amine Bensaid', studentEmail: 'amine.b@univ-casa.ma', studentSchool: 'Université Hassan II',
    title: 'AWS Cloud Practitioner', type: 'Amazon AWS', date: '12 Oct 2023',
    dateStart: '01 Jul 2023', dateEnd: '10 Oct 2023', duration: '3 mois', location: 'En ligne',
    status: 'pending', avatarColor: '#c7d2fe',
    description: "J'ai préparé et obtenu la certification AWS Cloud Practitioner en 3 mois d'auto-formation. J'ai suivi les cours officiels AWS Skill Builder, complétés par des labs pratiques sur AWS Academy. J'ai passé l'examen CLF-C02 le 10 octobre 2023 avec un score de 847/1000 (seuil de passage : 700).",
    skills: ['AWS EC2', 'AWS S3', 'AWS Lambda', 'Cloud Security', 'Pricing & Billing'],
    photos: [
      { name: 'badge_aws.png',        color: '#f59e0b' },
      { name: 'score_exam.png',       color: '#d97706' },
    ],
    links: [
      { label: 'Badge Credly vérifié', url: 'https://www.credly.com/badges/amine-aws-cp' },
      { label: 'Profil AWS Certification', url: 'https://aws.amazon.com/verification/amine' },
    ],
    document: { name: 'certificat_aws_cloud_practitioner.pdf', type: 'Certificat officiel Amazon PDF' },
  },
  {
    id: 2,
    studentName: 'Sarah Mansouri', studentEmail: 's.mansouri@est-agadir.ac.ma', studentSchool: 'EST Agadir',
    title: 'Google UX Design Certificate', type: 'Google', date: '14 Oct 2023',
    dateStart: '01 Avr 2023', dateEnd: '12 Oct 2023', duration: '6 mois', location: 'En ligne (Coursera)',
    status: 'pending', avatarColor: '#d1fae5',
    description: "Certification professionnelle Google en UX Design obtenue via Coursera. Le programme couvre les 7 cours du parcours : fondements UX, wireframing, prototypage Figma, recherche utilisateur, tests d'utilisabilité, design accessible et portfolio. J'ai réalisé 3 projets pratiques dont une application de gestion de jardins.",
    skills: ['Figma', 'Adobe XD', 'Recherche UX', 'Wireframing', 'Prototypage', 'Tests utilisateurs'],
    photos: [
      { name: 'projet_jardins_figma.png', color: '#10b981' },
      { name: 'prototype_hifi.png',        color: '#059669' },
      { name: 'rapport_tests_ux.png',      color: '#047857' },
    ],
    links: [
      { label: 'Certificat Coursera',  url: 'https://coursera.org/verify/sarah-google-ux' },
      { label: 'Portfolio Behance',    url: 'https://behance.net/sarah-mansouri-ux' },
      { label: 'Projet Figma public',  url: 'https://figma.com/community/sarah-jardin' },
    ],
    document: { name: 'google_ux_certificate_sarah.pdf', type: 'Certificat Google / Coursera PDF' },
  },
  {
    id: 3,
    studentName: 'Youssef Ame', studentEmail: 'youssef.amrani@emi.ac.ma', studentSchool: 'EMI Rabat',
    title: 'Cisco CCNA 200-301', type: 'Cisco', date: '16 Oct 2023',
    dateStart: '01 Jun 2023', dateEnd: '15 Oct 2023', duration: '4,5 mois', location: 'Centre Pearson VUE, Rabat',
    status: 'validated', avatarColor: '#fde68a',
    description: "Certification réseau Cisco CCNA 200-301 obtenue après 4 mois de préparation intensive. J'ai utilisé le cours officiel Cisco NetAcad, le simulateur Packet Tracer pour les labs et des examens blancs sur Boson. Score final : 892/1000. La certification couvre IPv4/IPv6, OSPF, VLANs, ACL, NAT, sécurité réseau et automatisation.",
    skills: ['IPv4 / IPv6', 'OSPF', 'VLANs & trunking', 'ACL & NAT', 'Cisco IOS', 'Packet Tracer'],
    photos: [
      { name: 'score_ccna_892.png',   color: '#6366f1' },
      { name: 'lab_packet_tracer.png', color: '#4f46e5' },
    ],
    links: [
      { label: 'Badge Cisco Credly', url: 'https://www.credly.com/badges/youssef-ccna' },
      { label: 'Verification Cisco', url: 'https://cp.certmetrics.com/cisco/en/public/verify/credential/youssef' },
    ],
    document: { name: 'cisco_ccna_certificate_youssef.pdf', type: 'Certificat officiel Cisco PDF' },
  },
  {
    id: 4,
    studentName: 'Sofia Kenzi', studentEmail: 'sofia.kenzi@aui.ma', studentSchool: 'Al Akhawayn University',
    title: 'TensorFlow Developer Certificate', type: 'Google / TensorFlow', date: '18 Oct 2023',
    dateStart: '15 Jul 2023', dateEnd: '17 Oct 2023', duration: '3 mois', location: 'En ligne (exam à distance)',
    status: 'pending', avatarColor: '#fbcfe8',
    description: "Certification Google TensorFlow Developer obtenue après 3 mois de préparation. L'examen de 5 heures teste la maîtrise pratique de TensorFlow 2.x : régression, classification, CNN, NLP (text classification, LSTM), séries temporelles. Score : 88%. J'ai complété le spécialisation DeepLearning.AI sur Coursera en parallèle.",
    skills: ['TensorFlow 2.x', 'Keras', 'CNN', 'LSTM / NLP', 'Time Series', 'Transfer Learning'],
    photos: [
      { name: 'badge_tf_developer.png', color: '#ec4899' },
      { name: 'notebook_cnn.png',        color: '#db2777' },
    ],
    links: [
      { label: 'Certificat TF Developer', url: 'https://www.credential.net/sofia-tf-developer' },
      { label: 'Notebooks GitHub',         url: 'https://github.com/sofia/tf-certification-prep' },
      { label: 'Spécialisation DeepAI',    url: 'https://coursera.org/verify/sofia-deeplearning' },
    ],
    document: { name: 'tensorflow_developer_certificate_sofia.pdf', type: 'Certificat officiel Google PDF' },
  },
  {
    id: 5,
    studentName: 'Karim Tazi', studentEmail: 'k.tazi@encg-fes.ma', studentSchool: 'ENCG Fès',
    title: 'PMP – Project Management Professional', type: 'PMI', date: '20 Oct 2023',
    dateStart: '01 Jan 2023', dateEnd: '19 Oct 2023', duration: '9 mois', location: 'Centre Prometric, Fès',
    status: 'refused', avatarColor: '#e2e8f0',
    description: "J'ai préparé la certification PMP du PMI après avoir accumulé 36 mois d'expérience en gestion de projet. La préparation a duré 9 mois : cours en ligne PMI, étude du PMBOK 7ème édition, 3000 questions de révision. Score à l'examen : 68% (seuil requis : 70%). Je compte repasser dans 3 mois.",
    skills: ['Gestion de projet', 'PMBOK', 'Agile / Scrum', 'Gestion des risques', 'MS Project'],
    photos: [
      { name: 'score_pmp_68.png',  color: '#94a3b8' },
      { name: 'etude_pmbok.jpg',   color: '#64748b' },
    ],
    links: [
      { label: 'PMI ID de candidature', url: 'https://pmi.org/certifications/verify/karim-tazi-pmp' },
    ],
    document: { name: 'attestation_examen_pmp_karim.pdf', type: 'Relevé de notes PMI PDF' },
  },
  {
    id: 6,
    studentName: 'Nadia El Fassi', studentEmail: 'n.elfassi@univ-casa.ma', studentSchool: 'Université Hassan II',
    title: 'Meta Front-End Developer', type: 'Meta', date: '22 Oct 2023',
    dateStart: '01 Mar 2023', dateEnd: '21 Oct 2023', duration: '7 mois', location: 'En ligne (Coursera)',
    status: 'pending', avatarColor: '#bfdbfe',
    description: "Certification professionnelle Meta en développement front-end complétée en 7 mois via Coursera. Le programme couvre HTML/CSS avancé, JavaScript ES6+, React (hooks, context, routing), REST APIs, accessibilité WCAG, tests Jest et un projet Capstone complet. Mon projet final est un clone de réseau social avec authentification JWT.",
    skills: ['React 18', 'JavaScript ES6+', 'CSS Grid / Flexbox', 'Jest', 'REST API', 'WCAG Accessibility'],
    photos: [
      { name: 'projet_capstone.png',   color: '#3b82f6' },
      { name: 'composants_react.png',  color: '#2563eb' },
      { name: 'score_tests_jest.png',  color: '#1d4ed8' },
    ],
    links: [
      { label: 'Certificat Meta / Coursera', url: 'https://coursera.org/verify/nadia-meta-frontend' },
      { label: 'Projet Capstone GitHub',      url: 'https://github.com/nadia/meta-capstone' },
      { label: 'Site Capstone en ligne',      url: 'https://nadia-capstone.netlify.app' },
    ],
    document: { name: 'meta_frontend_certificate_nadia.pdf', type: 'Certificat officiel Meta / Coursera PDF' },
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
const confirmValidate = () => { modal.value.item.status = 'validated'; closeModal() }
const confirmRefuse   = () => { modal.value.item.status = 'refused';   closeModal() }
const initials = (name) => (name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
</script>

<style scoped>
/* ══ Layout ══════════════════════════════════ */
.dashboard-layout { min-height: 100vh; background: #f5f7fb; }
.main-content { position: fixed; top: 106px; left: 0; right: 0; bottom: 0; overflow-y: auto; transition: left 0.25s ease; }
.main-content.sidebar-open { left: 185px; }
.page-content { padding: 28px 30px; display: flex; flex-direction: column; gap: 20px; min-height: 100%; }

.page-title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px; letter-spacing: -0.4px; }
.page-desc  { font-size: 13px; color: #64748b; margin: 0; }

/* ══ Stats ═══════════════════════════════════ */
.stats-row { display: flex; gap: 12px; flex-wrap: wrap; }
.stat-pill { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 24px; background: #fff; border: 1px solid #e8eaf0; }
.stat-num { font-size: 18px; font-weight: 800; color: #0f172a; }
.stat-lbl { font-size: 13px; color: #64748b; font-weight: 500; }
.stat-pill.pending   .stat-num { color: #ea580c; }
.stat-pill.validated .stat-num { color: #16a34a; }
.stat-pill.refused   .stat-num { color: #dc2626; }

/* ══ Table card ══════════════════════════════ */
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

/* ══ Pagination ══════════════════════════════ */
.pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 22px; border-top: 1px solid #f1f5f9; flex-wrap: wrap; gap: 10px; }
.pag-info { font-size: 12.5px; color: #94a3b8; }
.pag-controls { display: flex; align-items: center; gap: 4px; }
.pag-btn { padding: 6px 12px; border: 1px solid #e2e8f0; border-radius: 7px; background: transparent; font-size: 12.5px; color: #475569; cursor: pointer; transition: background 0.12s; }
.pag-btn:hover:not(:disabled) { background: #f8fafc; }
.pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pag-btn.num { min-width: 32px; text-align: center; }
.pag-btn.num.active { background: #6366f1; border-color: #6366f1; color: white; font-weight: 600; }

/* ══ MODAL ═══════════════════════════════════ */
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

/* ══ Footer ══════════════════════════════════ */
.page-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; font-size: 12px; color: #94a3b8; border-top: 1px solid #e8eaf0; margin-top: auto; }
.footer-links { display: flex; gap: 16px; }
.footer-links a { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
.footer-links a:hover { color: #475569; }
.empty-row { text-align: center; padding: 40px; color: #94a3b8; font-size: 13px; }
</style>