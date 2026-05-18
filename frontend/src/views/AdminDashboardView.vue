<template>
  <div class="dashboard-layout">
 
    <AdminNavbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <AdminSidebar :open="sidebarOpen" />
    <AdminSubbar
      title="Tableau de bord (Aperçu)"
      v-model:searchQuery="search"
      :sidebarOpen="sidebarOpen"
    />
 
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
 
                <!-- Grid lines -->
                <line v-for="y in [40,80,120,160,200]" :key="y" x1="0" :y1="y" x2="540" :y2="y"
                  stroke="#f1f5f9" stroke-width="1" />
 
                <!-- Blue area (inscriptions) -->
                <path :d="blueArea" fill="url(#gradBlue)" />
                <path :d="blueLine" fill="none" stroke="#6366f1" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round" />
 
                <!-- Cyan area (soumissions) -->
                <path :d="cyanArea" fill="url(#gradCyan)" />
                <path :d="cyanLine" fill="none" stroke="#06b6d4" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
 
              <!-- X labels -->
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
                  cx="80" cy="80" r="60"
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
 
        <!-- Activity table -->
        <ActivityTable />
 
      </section>
    </main>
  </div>
</template>
 
<script setup>
import { ref, computed } from 'vue'
import { Users, Briefcase, CheckCircle, Clock } from 'lucide-vue-next'
 
import AdminNavbar  from '../components/admin/AdminNavbar.vue'
import AdminSidebar from '../components/admin/AdminSidebar.vue'
import AdminSubbar  from '../components/admin/AdminSubbar.vue'
import StatCard from '../components/admin/StatCard.vue'
import ActivityTable from '../components/admin/ActivityTable.vue'
 
const search = ref('')
const sidebarOpen = ref(true)
 
const stats = [
  { label: 'Profils Totaux',     value: 12482, trend: 12,  icon: Users },
  { label: 'Portfolios Soumis',  value: 8650,  trend: 8.4, icon: Briefcase },
  { label: 'Vérifiés',           value: 11200, trend: 1.6, icon: CheckCircle },
  { label: 'En Attente',         value: 432,   trend: -5,  icon: Clock },
]
 
const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun']
 
// Data points normalised to 200px height (0 = top)
const blueRaw  = [180, 162, 145, 110, 60, 10]  // inscriptions
const cyanRaw  = [190, 175, 158, 130, 90, 40]  // soumissions
const xs       = [0, 108, 216, 324, 432, 540]
 
const toPath = (ys) =>
  ys.map((y, i) => `${i === 0 ? 'M' : 'L'} ${xs[i]} ${y}`).join(' ')
 
const toArea = (ys) =>
  toPath(ys) + ` L ${xs[xs.length - 1]} 200 L 0 200 Z`
 
const blueLine = computed(() => toPath(blueRaw))
const blueArea = computed(() => toArea(blueRaw))
const cyanLine = computed(() => toPath(cyanRaw))
const cyanArea = computed(() => toArea(cyanRaw))
 
// Donut: circumference of r=60 circle ≈ 376.99
const total = 1650
const sectors = [
  { label: 'Design',        count: 450, color: '#6366f1' },
  { label: 'Développement', count: 680, color: '#06b6d4' },
  { label: 'Marketing',     count: 240, color: '#f59e0b' },
  { label: 'IA & Data',     count: 280, color: '#8b5cf6' },
]
 
const C = 376.99
let cumulative = 0
const donutSegments = sectors.map((s) => {
  const dash   = (s.count / total) * C
  const offset = -cumulative
  cumulative  += dash
  return { ...s, dash, offset }
})
</script>
 
<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: #f5f7fb;
  font-family: 'Geist', 'DM Sans', 'Inter', sans-serif;
}
 
/*
  main-content : occupe toute la fenêtre
  SAUF la navbar (top: 50px) et la sidebar (margin-left: 185px).
  Transition synchro avec le collapse de la sidebar.
*/
.main-content {
  position: fixed;
  top: 50px;
  left: 0;          /* sidebar collapsed → pas de marge */
  right: 0;
  bottom: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  transition: left 0.25s ease;
}
 
/* Quand la sidebar est ouverte, décale le contenu */
.main-content.sidebar-open {
  left: 185px;
}
 
.dashboard-content {
  padding-top: 50px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  flex: 1;
}
 
/* ── Stat grid ─────────────────────────────────── */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
 
/* ── Charts row ────────────────────────────────── */
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
.btn-outline:hover { background: #f8fafc; }
 
/* ── Line chart ────────────────────────────────── */
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
 
/* ── Donut chart ───────────────────────────────── */
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
 
/* ── Responsive ────────────────────────────────── */
@media (max-width: 1100px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-row { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .stat-grid { grid-template-columns: 1fr; }
}
</style>
 