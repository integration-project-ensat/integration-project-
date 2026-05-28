<template>
  <div class="dashboard-layout">
    <AdminNavbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <AdminSidebar :open="sidebarOpen" />
    <AdminSubbar title="Tableau de bord (Aperçu)" v-model:searchQuery="search" :sidebarOpen="sidebarOpen" />

    <main class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
      <section class="dashboard-content">
        <!-- KPI Cards -->
        <div class="stat-grid">
          <StatCard
            v-for="stat in stats"
            :key="stat.label"
            :label="stat.label"
            :value="stat.value"
            :trend="stat.trend"
            :icon="stat.icon"
          />
        </div>

        <!-- Charts row -->
        <div class="charts-row">
          <!-- Growth chart -->
          <div class="chart-card growth-card">
            <div class="chart-header">
              <div>
                <h3 class="section-title">Croissance de la plateforme</h3>
                <p class="section-sub">Évolution des inscriptions et des soumissions sur les 6 derniers mois</p>
              </div>
              <button class="btn-outline">Exporter</button>
            </div>

            <div class="chart-area">
              <svg viewBox="0 0 540 200" class="line-chart" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25" />
                    <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
                  </linearGradient>
                  <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.20" />
                    <stop offset="100%" stop-color="#06b6d4" stop-opacity="0" />
                  </linearGradient>
                </defs>

                <line v-for="y in [40, 80, 120, 160, 200]" :key="y" x1="0" :y1="y" x2="540" :y2="y" stroke="#f1f5f9" stroke-width="1" />

                <path :d="blueArea" fill="url(#gradBlue)" />
                <path :d="blueLine" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

                <path :d="cyanArea" fill="url(#gradCyan)" />
                <path :d="cyanLine" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>

              <div class="chart-x-labels">
                <span v-for="m in months" :key="m">{{ m }}</span>
              </div>
            </div>
          </div>

          <!-- Donut chart -->
          <div class="chart-card donut-card">
            <div>
              <h3 class="section-title">Répartition par secteur</h3>
              <p class="section-sub">Domaines d'études les plus représentés</p>
            </div>

            <div class="donut-wrapper">
              <svg viewBox="0 0 160 160" class="donut-svg">
                <circle cx="80" cy="80" r="60" fill="none" stroke="#f1f5f9" stroke-width="22" />
                <circle
                  v-for="seg in donutSegments"
                  :key="seg.label"
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  :stroke="seg.color"
                  stroke-width="22"
                  :stroke-dasharray="`${seg.dash} ${377 - seg.dash}`"
                  :stroke-dashoffset="seg.offset"
                  stroke-linecap="butt"
                  style="transform: rotate(-90deg); transform-origin: 80px 80px;"
                />
              </svg>
            </div>

            <ul class="donut-legend">
              <li v-for="seg in donutSegments" :key="seg.label" class="legend-item">
                <span class="legend-dot" :style="{ background: seg.color }"></span>
                <span class="legend-label">{{ seg.label }}</span>
                <span class="legend-value">{{ seg.count }}</span>
              </li>
            </ul>
          </div>
        </div>

        <ActivityTable :activities="plateformeActivities" />

        <!-- Historique des connexions -->
        <div class="conn-card">
          <div class="conn-head">
            <div>
              <h3 class="section-title">Historique des connexions</h3>
              <p class="section-sub">Traçabilité complète des activités d'authentification.</p>
            </div>
            <div class="conn-actions">
              <button class="btn-export-conn" @click="exportConnCSV">
                <Download :size="13" /> Export CSV
              </button>
              <button class="btn-refresh-conn" @click="refreshConn">
                <RefreshCw :size="13" /> Actualiser
              </button>
            </div>
          </div>

          <div class="conn-filters">
            <div class="conn-filter-group">
              <select v-model="connFilter.status" class="conn-select">
                <option value="">Tous les statuts</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="ERREUR">ERREUR</option>
                <option value="TERMINE">TERMINÉ</option>
              </select>
            </div>
            <div class="conn-search">
              <Search :size="13" />
              <input v-model="connFilter.search" type="text" placeholder="Rechercher IP, user-agent..." />
            </div>
            <span class="conn-count">
              <span class="suspect-dot" v-if="suspectCount > 0"></span>
              {{ suspectCount }} suspect{{ suspectCount > 1 ? 's' : '' }} détecté{{ suspectCount > 1 ? 's' : '' }}
            </span>
          </div>

          <div class="conn-table-wrap">
            <table class="conn-table">
              <thead>
                <tr>
                  <th>UTILISATEUR</th>
                  <th>ADRESSE IP</th>
                  <th>USER-AGENT</th>
                  <th>DATE & HEURE</th>
                  <th>STATUT</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="log in filteredLogs"
                  :key="log.id"
                  class="conn-row"
                  :class="{ suspect: log.suspect }"
                >
                  <td>
                    <div class="conn-user">
                      <div class="conn-avatar" :style="{ background: log.avatarColor }">{{ log.userInitials }}</div>
                      <div>
                        <p class="conn-username">{{ log.userName }}</p>
                        <p class="conn-role">{{ log.userRole }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="conn-ip" :class="{ 'ip-suspect': log.suspect }">
                      {{ log.ip }}
                      <span v-if="log.suspect" class="ip-flag" title="IP suspecte">⚑</span>
                    </span>
                  </td>
                  <td class="conn-agent">{{ log.agent }}</td>
                  <td class="conn-date">{{ log.datetime }}</td>
                  <td>
                    <span class="conn-badge" :class="log.status.toLowerCase()">{{ log.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Download, RefreshCw, Search } from 'lucide-vue-next'
import { Users, Briefcase, CheckCircle, Clock } from 'lucide-vue-next'

import adminApi from '@/services/adminApi.js'

import AdminNavbar from '../components/admin/AdminNavbar.vue'
import AdminSidebar from '../components/admin/AdminSidebar.vue'
import AdminSubbar from '../components/admin/AdminSubbar.vue'
import StatCard from '../components/admin/StatCard.vue'
import ActivityTable from '../components/admin/ActivityTable.vue'

const search = ref('')
const sidebarOpen = ref(true)

const months = ref(['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'])

const stats = ref([])

// SVG datasets normalized to 200px height
const blueRaw = ref([180, 162, 145, 110, 60, 10])
const cyanRaw = ref([190, 175, 158, 130, 90, 40])
const xs = [0, 108, 216, 324, 432, 540]

const toPath = (ys) => ys.map((y, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${y}`).join(' ')
const toArea = (ys) => toPath(ys) + ` L ${xs[xs.length - 1]} 200 L 0 200 Z`

const blueLine = computed(() => toPath(blueRaw.value))
const blueArea = computed(() => toArea(blueRaw.value))
const cyanLine = computed(() => toPath(cyanRaw.value))
const cyanArea = computed(() => toArea(cyanRaw.value))

const donutSegments = ref([
  { label: 'Design', count: 0, color: '#6366f1', dash: 0, offset: 0 },
  { label: 'Développement', count: 0, color: '#06b6d4', dash: 0, offset: 0 },
  { label: 'Marketing', count: 0, color: '#f59e0b', dash: 0, offset: 0 },
  { label: 'IA & Data', count: 0, color: '#8b5cf6', dash: 0, offset: 0 },
])

const plateformeActivities = ref([])

/* Connexions history */
const connFilter = ref({ status: '', search: '' })
const connLogs = ref([])

const filteredLogs = computed(() => {
  return connLogs.value.filter((l) => {
    const matchStatus = !connFilter.value.status || l.status === connFilter.value.status
    const q = connFilter.value.search.toLowerCase()
    const matchSearch =
      !q ||
      l.ip.includes(q) ||
      l.agent.toLowerCase().includes(q) ||
      l.userName.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })
})

const suspectCount = computed(() => connLogs.value.filter((l) => l.suspect).length)

const refreshConn = () => {
  // en attendant un endpoint dédié, on recharge dashboard
  loadDashboard().catch(() => {})
}

const exportConnCSV = () => {
  const rows = [['Utilisateur', 'IP', 'User-Agent', 'Date & Heure', 'Statut'], ...filteredLogs.value.map((l) => [l.userName, l.ip, l.agent, l.datetime, l.status])]
  const csv = rows.map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: 'connexions.csv' })
  a.click()
  URL.revokeObjectURL(url)
}

const mapDashboardToUI = (payload) => {
  const d = payload?.data
  if (!d) return

  if (d.stats) {
    stats.value = [
      { label: 'Profils Totaux', value: d.stats.totalProfils ?? 0, trend: 0, icon: Users },
      { label: 'Portfolios Soumis', value: d.stats.totalPortfolios ?? 0, trend: 0, icon: Briefcase },
      { label: 'Vérifiés', value: d.stats.totalVerifies ?? 0, trend: 0, icon: CheckCircle },
      { label: 'En Attente', value: d.stats.enAttente ?? 0, trend: 0, icon: Clock },
    ]
  }

  if (d.croissance) {
    const insRaw = (d.croissance.inscriptions || []).slice(0, 6).map((x) => Number(x.valeur ?? x.value ?? 0))
    const porRaw = (d.croissance.portfolios || []).slice(0, 6).map((x) => Number(x.valeur ?? x.value ?? 0))

    const max = Math.max(1, ...insRaw, ...porRaw)
    const norm = (arr) => {
      const out = new Array(6).fill(0)
      for (let i = 0; i < Math.min(6, arr.length); i++) out[i] = Math.round((arr[i] / max) * 180)
      return out
    }

    blueRaw.value = norm(insRaw)
    cyanRaw.value = norm(porRaw)

    const moisLabels = (d.croissance.inscriptions || []).slice(0, 6).map((x) => x.mois).filter(Boolean)
    if (moisLabels.length === 6) months.value = moisLabels
  }

  if (Array.isArray(d.repartitionFilieres)) {
    const palette = ['#6366f1', '#06b6d4', '#f59e0b', '#8b5cf6', '#f43f5e', '#14b8a6']
    const totalCount = d.repartitionFilieres.reduce((acc, x) => acc + Number(x.count ?? 0), 0) || 1

    const C = 376.99
    let cumulative = 0

    const mapped = d.repartitionFilieres.slice(0, 4).map((f, idx) => {
      const count = Number(f.count ?? 0)
      const dash = (count / totalCount) * C
      const offset = -cumulative
      cumulative += dash
      return {
        label: f.filiere ?? 'Autre',
        count,
        color: palette[idx % palette.length],
        dash,
        offset,
      }
    })

    donutSegments.value = mapped
  }

  if (Array.isArray(d.activiteRecente)) {
    // Backend: [{id, utilisateur:{nom_complet,email,photo}, action, date, statut}]
    connLogs.value = d.activiteRecente.map((log, idx) => {
      const u = log.utilisateur || {}
      const uiStatus = String(log.statut || '').toLowerCase() // 'complete' | 'annule'

      const status = uiStatus === 'complete' ? 'SUCCESS' : uiStatus === 'annule' ? 'ERREUR' : 'SUCCESS'

      return {
        id: log.id ?? idx,
        userName: u.nom_complet || u.email || 'Inconnu',
        userInitials: (u.nom_complet
          ? u.nom_complet.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('')
          : '??'
        ).toUpperCase(),
        userRole: log.action || 'Activité',
        avatarColor: '#c7d2fe',
        ip: '—',
        agent: '—',
        datetime: log.date ? String(log.date).replace('T', ' ').slice(0, 16) : '—',
        status,
        suspect: false,
      }
    })
  }

  if (Array.isArray(d.activitesPlateforme)) {
    plateformeActivities.value = d.activitesPlateforme.map((act) => {
      const u = act.utilisateur || {}
      return {
        id: act.id,
        name: u.nom_complet || u.email || 'Inconnu',
        email: u.email || '',
        action: act.action,
        date: act.date ? new Date(act.date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
        status: act.statut || 'completed',
        avatarColor: '#c7d2fe'
      }
    })
  }
}

const loadDashboard = async () => {
  const resp = await adminApi.getAdminDashboard()
  if (resp?.data?.success && resp.data.data) mapDashboardToUI(resp.data.data)
}

onMounted(() => {
  loadDashboard().catch(() => {})
})
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: #f5f7fb;
  font-family: 'Geist', 'DM Sans', 'Inter', sans-serif;
}

.main-content {
  position: fixed;
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: left 0.25s ease;
}

.main-content.sidebar-open {
  left: 185px;
}

.dashboard-content {
  padding: 60px 8px 30px 43px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  flex: 1;
  background: #dfe2ea;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.charts-row {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
}

.chart-card {
  background: #fff;
  border: 1px solid #e8eaf0;
  border-radius: 16px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 3px;
}
.section-sub {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.btn-outline {
  padding: 7px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: transparent;
  font-size: 12.5px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}
.btn-outline:hover {
  background: #f8fafc;
}

.chart-area {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.line-chart {
  width: 100%;
  height: 180px;
  display: block;
}

.chart-x-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
}
.chart-x-labels span {
  font-size: 11px;
  color: #94a3b8;
}

.donut-card {
  gap: 14px;
}

.donut-wrapper {
  display: flex;
  justify-content: center;
}

.donut-svg {
  width: 150px;
  height: 150px;
}

.donut-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-label {
  font-size: 12.5px;
  color: #475569;
  flex: 1;
}

.legend-value {
  font-size: 12.5px;
  font-weight: 600;
  color: #0f172a;
}

@media (max-width: 1100px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-row {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}

.conn-card {
  background: #fff;
  border: 1px solid #e8eaf0;
  border-radius: 16px;
  overflow: hidden;
}

.conn-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 22px 14px;
  gap: 12px;
  flex-wrap: wrap;
}

.conn-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-export-conn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: transparent;
  font-size: 12.5px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-export-conn:hover {
  background: #f8fafc;
}

.btn-refresh-conn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border: none;
  border-radius: 8px;
  background: #0d1b2a;
  color: white;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-refresh-conn:hover {
  background: #1e3a5f;
}

.conn-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 22px 14px;
  flex-wrap: wrap;
}

.conn-select {
  appearance: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 7px 12px;
  background: #f8fafc;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}
.conn-select:focus {
  border-color: #6366f1;
}

.conn-search {
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 12px;
  background: #f8fafc;
  flex: 1;
  max-width: 280px;
  transition: border-color 0.15s;
}
.conn-search:focus-within {
  border-color: #6366f1;
  background: #fff;
}
.conn-search svg {
  color: #94a3b8;
  flex-shrink: 0;
}
.conn-search input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: #334155;
  width: 100%;
}
.conn-search input::placeholder {
  color: #94a3b8;
}

.conn-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: #ef4444;
  margin-left: auto;
}
.suspect-dot {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.conn-table-wrap {
  overflow-x: auto;
}

.conn-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 680px;
}
.conn-table thead tr {
  background: #fafbff;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}
.conn-table th {
  text-align: left;
  padding: 10px 16px;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.conn-row {
  border-bottom: 1px solid #f8fafc;
  transition: background 0.12s;
}
.conn-row:last-child {
  border-bottom: none;
}
.conn-row:hover {
  background: #fafbff;
}
.conn-row.suspect {
  background: #fff5f5;
}
.conn-row.suspect:hover {
  background: #fee2e2;
}

.conn-table td {
  padding: 13px 16px;
  vertical-align: middle;
}

.conn-user {
  display: flex;
  align-items: center;
  gap: 9px;
}
.conn-avatar {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #334155;
  flex-shrink: 0;
}
.conn-username {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1px;
}
.conn-role {
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
}

.conn-ip {
  font-size: 13px;
  font-family: 'Courier New', monospace;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 5px;
}
.conn-ip.ip-suspect {
  color: #ef4444;
  font-weight: 600;
}
.ip-flag {
  font-size: 12px;
  color: #ef4444;
}

.conn-agent {
  font-size: 12.5px;
  color: #64748b;
}
.conn-date {
  font-size: 12.5px;
  color: #94a3b8;
  white-space: nowrap;
  font-family: 'Courier New', monospace;
}

.conn-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  white-space: nowrap;
}
.conn-badge.success {
  background: #ecfdf5;
  color: #16a34a;
}
.conn-badge.erreur {
  background: #fef2f2;
  color: #dc2626;
}
.conn-badge.termine {
  background: #eff6ff;
  color: #2563eb;
}
</style>

