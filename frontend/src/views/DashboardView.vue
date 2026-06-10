<template>
  <div class="page">
    <TopBar @toggleSidebar="sidebarOpen = !sidebarOpen" />

    <div class="body-area">
      <SideBar :isOpen="sidebarOpen" />

      <main class="content" :class="{ shifted: sidebarOpen }">
        <div v-if="isLoading" class="loading-state">
          <p>Chargement de votre dashboard...</p>
        </div>

        <div v-else-if="error" class="error-state">
          <p>⚠️ {{ error }}</p>
        </div>

        <template v-else>
          <section class="dashboard-head">
            <div>
              <p class="dashboard-kicker">Espace étudiant</p>
              <h1>Bonjour{{ profileName ? `, ${profileName}` : '' }}</h1>
              <p>
                {{ profileFiliere || 'Vue globale de votre progression, activité récente et opportunités.' }}
              </p>
            </div>
            <div class="dashboard-actions">
              <button type="button" class="ghost-action" :disabled="isLoading" @click="loadDashboard">
                Actualiser
              </button>
              <button type="button" class="primary-action" @click="goTo('/profile/edit')">
                Compléter mon profil
              </button>
            </div>
          </section>

          <section class="stats-grid">
            <div
              v-for="stat in studentStats"
              :key="stat.label"
              class="stat-card"
              :style="{ '--accent': stat.color }"
            >
              <p>{{ stat.label }}</p>
              <strong>{{ stat.value }}</strong>
            </div>
          </section>

          <section class="filters-card">
            <div
              v-for="filter in filterConfigs"
              :key="filter.key"
              class="filter-field"
            >
              <label>{{ filter.label }}</label>
              <div class="custom-select" :class="{ open: openFilter === filter.key }">
                <button
                  type="button"
                  class="select-trigger"
                  @click="toggleFilter(filter.key)"
                >
                  <span>{{ filters[filter.key] }}</span>
                  <span class="chevron">
                    <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </button>
                <div v-if="openFilter === filter.key" class="select-menu">
                  <button
                    v-for="option in filter.options"
                    :key="option"
                    type="button"
                    class="select-option"
                    :class="{ selected: filters[filter.key] === option }"
                    @click="selectFilter(filter.key, option)"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="dashboard-grid">
            <article class="panel progress-panel">
              <h2>Progression du profil</h2>
              <div class="progress-row">
                <span>Portfolio</span>
                <strong>{{ profileProgress }}%</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: profileProgress + '%' }"></div>
              </div>
              <ul>
                <li
                  v-for="section in progressChecklist"
                  :key="section.label"
                  :class="{ completed: section.completed }"
                >
                  {{ section.label }}
                </li>
              </ul>
            </article>

            <article class="panel">
              <h2>Activité récente</h2>
              <div class="activity-list">
                <p v-for="(activity, index) in activities" :key="`${activity}-${index}`">
                  <span :class="`dot-${index}`"></span>
                  {{ activity }}
                </p>
                <p v-if="!activities.length">Aucune activité récente.</p>
              </div>
            </article>

            <article class="panel">
              <h2>Opportunités</h2>
              <div class="opportunity">
                <strong>
                  <span class="opp-badge green">{{ studentStats.find(s => s.label === 'Stages postulés')?.value || '0' }} stages</span>
                  enregistrés
                </strong>
                <p>Issus de vos données backend étudiant.</p>
              </div>
              <div class="opportunity">
                <strong>
                  <span class="opp-badge coral">{{ filteredProfiles.length }} professionnels</span>
                  à connecter
                </strong>
                <p>Profils pertinents détectés par la plateforme.</p>
              </div>
            </article>
          </section>

          <section class="results-card">
            <div class="results-head">
              <h2>Professionnels suggérés</h2>
              <span>{{ filteredProfiles.length }} profils</span>
            </div>
            <div class="profile-grid">
              <article
                v-for="profile in filteredProfiles"
                :key="profile.id"
                class="profile-card"
                role="button"
                tabindex="0"
                @click="goTo(`/profile/user/${profile.id}`)"
                @keyup.enter="goTo(`/profile/user/${profile.id}`)"
              >
                <div class="avatar" :class="avatarColorClass(profile.name)">
                  <img v-if="profile.photo" :src="profile.photo" :alt="profile.name" />
                  <span v-else>{{ getInitials(profile.name) }}</span>
                </div>
                <div>
                  <h3>{{ profile.name }}</h3>
                  <p>{{ profile.role }} • {{ profile.city }}</p>
                  <p>{{ profile.company }} • {{ profile.skill }}</p>
                </div>
              </article>
            </div>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import TopBar from "../components/TopBar.vue";
import SideBar from "../components/exploreStudent/Sidebar.vue";
import studentApi from "@/services/studentApi";

type FilterKey = "category" | "sector" | "role" | "city";

const sidebarOpen = ref(true);
const router = useRouter();
const openFilter = ref<FilterKey | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const profileProgress = ref(0);
const profileName = ref("");
const profileFiliere = ref("");
const activities = ref<string[]>([]);
const progressSections = ref<Record<string, { completed: boolean; percentage: number }>>({});
const profiles = ref<Array<{ id: string; name: string; role: string; city: string; company: string; skill: string; sector: string; photo?: string }>>([]);

const filters = reactive<Record<FilterKey, string>>({
  category: "Tous",
  sector: "Tous",
  role: "Tous",
  city: "Toutes",
});

const filterConfigs: Array<{ key: FilterKey; label: string; options: string[] }> = [
  { key: "category", label: "Catégorie", options: ["Tous", "Professionnel"] },
  { key: "sector", label: "Secteur", options: ["Tous", "Tech", "Finance", "Conseil", "Industrie", "Autre"] },
  { key: "role", label: "Poste", options: ["Tous", "Développeur", "Chef de projet", "Consultant", "Ingénieur", "Autre"] },
  { key: "city", label: "Ville", options: ["Toutes", "Tanger", "Tétouan", "Rabat", "Casablanca", "Marrakech", "Fès"] },
];

const studentStats = ref([
  { label: "Score profil", value: "0", color: "#5b4fcf" },
  { label: "Recommandations", value: "0", color: "#0f9e74" },
  { label: "Projets", value: "0", color: "#d85a30" },
  { label: "Stages postulés", value: "0", color: "#ba7517" },
  { label: "Certifications", value: "0", color: "#185fa5" },
  { label: "Compétences", value: "0", color: "#d4537e" },
]);

const progressLabels: Record<string, string> = {
  personalInfo: "Informations personnelles",
  education: "Parcours académique",
  skills: "Compétences",
  projects: "Projets",
  portfolio: "Portfolio",
};

const progressChecklist = computed(() => {
  const entries = Object.entries(progressSections.value);

  if (!entries.length) {
    return [
      { label: "Informations personnelles", completed: profileProgress.value >= 15 },
      { label: "Compétences et projets", completed: profileProgress.value >= 50 },
      { label: "Portfolio", completed: profileProgress.value >= 80 },
    ];
  }

  return entries.map(([key, section]) => ({
    label: progressLabels[key] || key,
    completed: section.completed,
  }));
});

const filteredProfiles = computed(() =>
  profiles.value.filter((profile) => {
    const matchCategory = filters.category === "Tous" || profile.role.includes(filters.category);
    const matchSector = filters.sector === "Tous" || profile.sector === filters.sector;
    const matchRole = filters.role === "Tous" || profile.skill.includes(filters.role);
    const matchCity = filters.city === "Toutes" || profile.city === filters.city;

    return matchCategory && matchSector && matchRole && matchCity;
  })
);

const loadDashboard = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const [dashboardResponse, opportunitiesResponse, profileProgressResponse] = await Promise.all([
      studentApi.getStudentDashboard(),
      studentApi.getOpportunities(),
      studentApi.getProfileProgress().catch(() => null),
    ]);

    if (dashboardResponse.data.success) {
      const data = dashboardResponse.data.data;
      profileProgress.value = data.profileProgress ?? 0;
      profileName.value = data.profile?.nom || "";
      profileFiliere.value = data.profile?.filiere || "";

      studentStats.value = [
        { label: "Score profil", value: String(data.stats.scoreProfile ?? 0), color: "#5b4fcf" },
        { label: "Recommandations", value: String(data.stats.recommandations ?? 0), color: "#0f9e74" },
        { label: "Projets", value: String(data.stats.projets ?? 0), color: "#d85a30" },
        { label: "Stages postulés", value: String(data.stats.stages ?? 0), color: "#ba7517" },
        { label: "Certifications", value: String(data.stats.badges ?? 0), color: "#185fa5" },
        { label: "Compétences", value: String(data.stats.competences ?? 0), color: "#d4537e" },
      ];

      activities.value = Array.isArray(data.activities)
        ? data.activities.map((a: any) => `${a.action}${a.date ? ` • ${new Date(a.date).toLocaleDateString('fr-FR')}` : ''}`)
        : [];
    }

    if (opportunitiesResponse.data.success) {
      profiles.value = (opportunitiesResponse.data.data.professionnels || []).map((pro: any) => ({
        id: String(pro.id),
        name: pro.nom || "Professionnel",
        role: "Professionnel",
        city: pro.adresse || "—",
        company: pro.entreprise || "Entreprise non renseignée",
        skill: pro.poste || "Autre",
        sector: pro.secteur || "Autre",
        photo: pro.photo || undefined,
      }));
    }

    if (profileProgressResponse?.data.success) {
      profileProgress.value = Math.round(profileProgressResponse.data.data.totalScore ?? profileProgress.value);
      progressSections.value = profileProgressResponse.data.data.sections || {};
    }
  } catch (err: any) {
    console.error("Erreur lors du chargement du dashboard:", err);
    error.value = err.response?.data?.message || "Erreur lors du chargement des données";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadDashboard();
});

function toggleFilter(key: FilterKey) {
  openFilter.value = openFilter.value === key ? null : key;
}

function selectFilter(key: FilterKey, value: string) {
  filters[key] = value;
  openFilter.value = null;
}

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function avatarColorClass(name: string) {
  const colors = [
    "avatar-blue", "avatar-orange", "avatar-indigo", "avatar-green",
    "avatar-deep-blue", "avatar-brown", "avatar-purple", "avatar-slate",
  ];
  const sum = name.split("").reduce((t, c) => t + c.charCodeAt(0), 0);
  return colors[sum % colors.length];
}

function goTo(path: string) {
  router.push(path);
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-top: 60px;
}

.body-area {
  position: relative;
  min-height: calc(100vh - 60px);
  background: #f0f2f8;
  overflow-x: hidden;
}

.content {
  position: relative;
  width: 100%;
  min-width: 0;
  padding: 24px 26px 40px;
  min-height: calc(100vh - 60px);
  background: transparent;
  transition: padding-left 0.3s ease;
}

.content.shifted {
  padding-left: 246px;
}

.content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8px;
  right: 8px;
  bottom: 24px;
  background: white;
  border-radius: 8px;
  z-index: 0;
  box-shadow:
    0 2px 8px rgba(17, 24, 39, 0.06),
    0 0 0 1px rgba(17, 24, 39, 0.03);
}

.content.shifted::before {
  left: 230px;
}

.content > * {
  position: relative;
  z-index: 1;
}

.dashboard-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.dashboard-kicker {
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 6px;
}

.dashboard-head h1 {
  font-family: var(--font-head);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 6px;
}

.dashboard-head p {
  font-size: .9rem;
  color: var(--text-dark);
}

.dashboard-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.ghost-action,
.primary-action {
  min-height: 42px;
  border-radius: var(--radius-pill);
  padding: 0 18px;
  font-family: var(--font-body);
  font-size: .86rem;
  font-weight: 700;
  transition: var(--ease);
}

.ghost-action {
  background: #ffffff;
  color: var(--text-dark);
  border: 1px solid #e5e7eb;
}

.ghost-action:disabled {
  cursor: not-allowed;
  opacity: .6;
}

.primary-action {
  background: var(--purple);
  color: #ffffff;
  border: 1px solid var(--purple);
}

.ghost-action:not(:disabled):hover,
.primary-action:hover {
  box-shadow: 0 8px 22px rgba(91, 79, 207, 0.16);
  transform: translateY(-1px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(140px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.stat-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
  border: none;
  box-shadow:
    0 1px 3px rgba(17, 24, 39, 0.06),
    0 4px 14px rgba(17, 24, 39, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.stat-card:hover {
  box-shadow:
    0 4px 8px rgba(91, 79, 207, 0.10),
    0 10px 28px rgba(91, 79, 207, 0.15);
  transform: translateY(-2px);
}

.stat-card p {
  font-size: .85rem;
  color: var(--text-dark);
  margin-bottom: 8px;
}

.stat-card strong {
  font-family: var(--font-head);
  font-size: 1.55rem;
  color: var(--accent);
}

.filters-card {
  background: #ffffff;
  border-radius: 14px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  padding: 18px;
  margin-bottom: 20px;
  box-shadow:
    0 1px 3px rgba(17, 24, 39, 0.06),
    0 4px 14px rgba(17, 24, 39, 0.07);
  overflow: visible;
  position: relative;
  z-index: 10;
}

.filter-field {
  position: relative;
  display: grid;
  gap: 8px;
  z-index: 10;
}

.filter-field label {
  font-size: .78rem;
  font-weight: 700;
  color: var(--text-dark);
}

.custom-select { position: relative; }

.select-trigger {
  width: 100%;
  height: 46px;
  border-radius: var(--radius-pill);
  background: var(--input-bg);
  color: var(--text-dark);
  padding: 0 38px 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-body);
  font-size: .86rem;
  border: 2px solid transparent;
  position: relative;
  transition: var(--ease);
  z-index: 100;
}

.custom-select.open .select-trigger { border-color: var(--purple); }

.chevron {
  position: absolute;
  right: 18px;
  top: 50%;
  color: #7f7f7f;
  pointer-events: none;
  transform: translateY(-50%);
  transition: transform .2s ease;
}

.custom-select.open .chevron { transform: translateY(-50%) rotate(180deg); }
.chevron-icon { display: block; }

.select-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 150;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 10px 0;
  overflow: hidden;
  box-shadow: 0 18px 35px rgba(17, 24, 39, .10);
}

.select-option {
  width: 100%;
  min-height: 42px;
  padding: 0 26px;
  border-radius: 0;
  background: white;
  color: var(--text-gray);
  display: flex;
  align-items: center;
  text-align: left;
  font-family: var(--font-body);
  font-size: .86rem;
  transition: var(--ease);
}

.select-option:hover,
.select-option.selected {
  background: var(--input-bg);
  color: var(--text-dark);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.panel {
  background: #ffffff;
  border-radius: 14px;
  padding: 24px;
  min-height: 238px;
  border: none;
  box-shadow:
    0 1px 3px rgba(17, 24, 39, 0.06),
    0 4px 14px rgba(17, 24, 39, 0.08);
}

.panel h2,
.results-card h2 {
  font-family: var(--font-head);
  font-size: 1rem;
  color: var(--text-dark);
  margin-bottom: 18px;
}

.progress-row {
  display: flex;
  justify-content: space-between;
  font-size: .9rem;
  margin-bottom: 10px;
}

.progress-track {
  width: 100%;
  height: 10px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 14px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #5b4fcf, #9c6fe4);
  border-radius: 999px;
  transition: width 0.4s ease;
}

.progress-panel ul {
  padding-left: 22px;
  display: grid;
  gap: 8px;
  font-size: .88rem;
}

.progress-panel li.completed {
  color: #0f9e74;
  font-weight: 700;
}

.activity-list {
  display: grid;
  gap: 20px;
}

.activity-list p {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: .9rem;
}

.activity-list span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-0 { background: #185fa5; }
.dot-1 { background: #0f9e74; }
.dot-2 { background: #ba7517; }

.opportunity {
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.opportunity:last-child { border-bottom: none; }

.opportunity strong {
  font-family: var(--font-head);
  font-size: .9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.opportunity p {
  margin-top: 4px;
  font-size: .84rem;
  color: var(--text-dark);
}

.opp-badge {
  display: inline-block;
  font-size: .78rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 6px;
}

.opp-badge.green { background: #eaf3de; color: #3b6d11; }
.opp-badge.coral { background: #faece7; color: #993c1d; }

.results-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 24px;
  border: none;
  box-shadow:
    0 1px 3px rgba(17, 24, 39, 0.06),
    0 4px 14px rgba(17, 24, 39, 0.08);
}

.results-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.results-head h2 { margin-bottom: 0; }

.results-head span {
  font-size: .85rem;
  color: var(--text-dark);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.profile-card {
  background: #f8f9fc;
  border: 1px solid #eef0f8;
  border-radius: 10px;
  padding: 20px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: box-shadow 0.2s ease, background 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.profile-card:hover,
.profile-card:focus-visible {
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(91, 79, 207, 0.10);
  outline: none;
  transform: translateY(-1px);
}

.profile-card h3 {
  font-family: var(--font-head);
  font-size: .9rem;
  color: var(--text-dark);
}

.profile-card p {
  font-size: .78rem;
  color: var(--text-dark);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--avatar-bg, #039be5);
  color: white;
  font-family: var(--font-head);
  font-size: .9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-blue      { --avatar-bg: #039be5; }
.avatar-orange    { --avatar-bg: #f57c00; }
.avatar-indigo    { --avatar-bg: #5e6ad2; }
.avatar-green     { --avatar-bg: #43a047; }
.avatar-deep-blue { --avatar-bg: #0277bd; }
.avatar-brown     { --avatar-bg: #8d6e63; }
.avatar-purple    { --avatar-bg: #5e35b1; }
.avatar-slate     { --avatar-bg: #5c6bc0; }

@media (max-width: 1200px) {
  .stats-grid,
  .profile-grid    { grid-template-columns: repeat(3, 1fr); }
  .filters-card    { grid-template-columns: repeat(2, 1fr); }
  .dashboard-grid  { grid-template-columns: 1fr; }
}

@media (max-width: 900px) {
  .content,
  .content.shifted { padding: 16px 16px 32px; }
  .content::before { left: 12px; right: 12px; top: 68px; bottom: 12px; }
  .content.shifted::before { left: 12px; }
  .dashboard-head  { flex-direction: column; align-items: flex-start; }
  .stats-grid,
  .filters-card,
  .profile-grid    { grid-template-columns: 1fr; }
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
  text-align: center;
}

.loading-state p {
  font-size: 1.1rem;
  color: var(--text-gray);
  font-weight: 500;
}

.error-state {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  min-height: 200px;
}

.error-state p {
  font-size: 1rem;
  color: #d32f2f;
  font-weight: 500;
}
</style>
