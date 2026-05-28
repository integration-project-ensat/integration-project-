<template>
  <div class="page">
    <TopBar @toggleSidebar="sidebarOpen = !sidebarOpen" />

    <div class="body-area">
      <SideBar
        :role="userRole"
        :user="currentUser"
        :isOpen="sidebarOpen"
      />

      <main class="content" :class="{ shifted: sidebarOpen }">
        <!-- État de chargement -->
        <div v-if="isLoading" class="loading-state">
          <p>Chargement de votre dashboard...</p>
        </div>

        <!-- État d'erreur -->
        <div v-else-if="error" class="error-state">
          <p>⚠️ {{ error }}</p>
        </div>

        <!-- Contenu principal -->
        <template v-else>
          <section class="dashboard-head">
            <div>
              <h1>Dashboard</h1>
              <p>Vue globale des statistiques, profils et opportunités.</p>
            </div>

            <div class="role-tabs">
              <button
                type="button"
                class="role-tab"
                :class="{ active: userRole === 'student' }"
                @click="userRole = 'student'"
              >
                Étudiant
              </button>
              <button
                type="button"
                class="role-tab"
                :class="{ active: userRole === 'teacher' }"
                @click="userRole = 'teacher'"
              >
                Professeur
              </button>
              <button
                type="button"
                class="role-tab"
                :class="{ active: userRole === 'professional' }"
                @click="userRole = 'professional'"
              >
                Professionnel
              </button>
            </div>
          </section>

          <section class="stats-grid">
            <div
              v-for="stat in stats"
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
                <li>Informations personnelles complétées</li>
                <li>GitHub connecté</li>
                <li>Ajouter un CV</li>
              </ul>
            </article>

            <article class="panel">
              <h2>Activité récente</h2>
              <div class="activity-list">
                <p v-for="(activity, index) in activities" :key="activity">
                  <span :class="`dot-${index}`"></span>
                  {{ activity }}
                </p>
              </div>
            </article>

            <article class="panel">
              <h2>Opportunités</h2>
              <div class="opportunity">
                <strong>
                  <span class="opp-badge green">3 stages</span>
                  compatibles
                </strong>
                <p>Basés sur vos compétences et votre filière.</p>
              </div>
              <div class="opportunity">
                <strong>
                  <span class="opp-badge coral">5 professionnels</span>
                  à connecter
                </strong>
                <p>Profils proches de votre domaine.</p>
              </div>
            </article>
          </section>

          <section class="results-card">
            <div class="results-head">
              <h2>Résultats filtrés</h2>
              <span>{{ filteredProfiles.length }} profils</span>
            </div>
            <div class="profile-grid">
              <article
                v-for="profile in filteredProfiles"
                :key="profile.name"
                class="profile-card"
              >
                <div class="avatar" :class="avatarColorClass(profile.name)">
                  {{ getInitials(profile.name) }}
                </div>
                <div>
                  <h3>{{ profile.name }}</h3>
                  <p>{{ profile.role }} • {{ profile.city }}</p>
                  <p>{{ profile.level }} • {{ profile.skill }}</p>
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
import TopBar from "../components/TopBar.vue";
import SideBar from "../components/exploreStudent/Sidebar.vue";
import studentApi from "@/services/studentApi";

type UserRole = "student" | "teacher" | "professional";
type FilterKey = "category" | "degree" | "certification" | "city" | "gender";

const sidebarOpen = ref(true);
const userRole = ref<UserRole>("student");
const openFilter = ref<FilterKey | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const currentUser = ref({
  name: "Chargement...",
  email: "",
  avatar: "",
});

const profileProgress = ref(75);

const filters = reactive<Record<FilterKey, string>>({
  category: "Tous",
  degree: "Tous",
  certification: "Toutes",
  city: "Toutes",
  gender: "Tous",
});

const filterConfigs: Array<{ key: FilterKey; label: string; options: string[] }> = [
  { key: "category",      label: "Catégorie",     options: ["Tous", "Étudiant", "Professeur", "Professionnel"] },
  { key: "degree",        label: "Diplôme",       options: ["Tous", "Licence", "Master", "Doctorat", "Ingénieur"] },
  { key: "certification", label: "Certification", options: ["Toutes", "Vue.js", "Docker", "AWS", "Python"] },
  { key: "city",          label: "Ville",         options: ["Toutes", "Tanger", "Tétouan", "Rabat", "Casablanca"] },
  { key: "gender",        label: "Sexe",          options: ["Tous", "Femme", "Homme"] },
];

const studentStats = ref([
  { label: "Score profil",    value: "0",    color: "#5b4fcf" },
  { label: "Recommandations", value: "0",   color: "#0f9e74" },
  { label: "Projets",         value: "0",    color: "#d85a30" },
  { label: "Stages postulés", value: "0",    color: "#ba7517" },
  { label: "Certifications",  value: "0",   color: "#185fa5" },
  { label: "Vues du profil",  value: "0", color: "#d4537e" },
]);

const teacherStats = [
  { label: "Étudiants suivis",        value: "34",   color: "#5b4fcf" },
  { label: "Recos envoyées",          value: "128",  color: "#0f9e74" },
  { label: "Projets encadrés",        value: "12",   color: "#d85a30" },
  { label: "Demandes reçues",         value: "18",   color: "#ba7517" },
  { label: "Certifications validées", value: "9",    color: "#185fa5" },
  { label: "Vues du profil",          value: "860",  color: "#d4537e" },
];

const professionalStats = [
  { label: "Stages publiés",       value: "7",     color: "#5b4fcf" },
  { label: "Candidatures",         value: "96",    color: "#0f9e74" },
  { label: "Étudiants connectés",  value: "42",    color: "#d85a30" },
  { label: "Recos envoyées",       value: "31",    color: "#ba7517" },
  { label: "Entretiens",           value: "14",    color: "#185fa5" },
  { label: "Vues du profil",       value: "1 080", color: "#d4537e" },
];

const stats = computed(() => {
  if (userRole.value === "teacher") return teacherStats;
  if (userRole.value === "professional") return professionalStats;
  return studentStats.value;
});

const activities = ref([
  "Nouvelle recommandation reçue",
  "Projet ajouté au portfolio",
  "Certification ajoutée",
]);

// Ajout de la propriété 'gender' sur chaque profil pour correspondre au filtre
const profiles = [
  { name: "Sara El Amrani",    role: "Étudiante",     city: "Tanger",     level: "Ingénieur", skill: "Vue.js",    gender: "Femme" },
  { name: "Yassine Benali",    role: "Étudiant",      city: "Tétouan",    level: "Master",    skill: "Docker",    gender: "Homme" },
  { name: "Mme Professeur Nom",  role: "Professeur",     city: "Rabat",      level: "Doctorat",  skill: "Python",    gender: "Femme" },
  { name: "Mr Professionnel Nom",role: "Professionnel",  city: "Casablanca", level: "Master",    skill: "AWS",       gender: "Homme" },
];

// Prise en compte du filtre 'gender' dans le filtrage dynamique
const filteredProfiles = computed(() =>
  profiles.filter((profile) => {
    const matchCategory      = filters.category === "Tous"       || profile.role.includes(filters.category);
    const matchDegree        = filters.degree === "Tous"         || profile.level === filters.degree;
    const matchCertification = filters.certification === "Toutes"|| profile.skill === filters.certification;
    const matchCity          = filters.city === "Toutes"         || profile.city === filters.city;
    const matchGender        = filters.gender === "Tous"         || profile.gender === filters.gender;
    
    return matchCategory && matchDegree && matchCertification && matchCity && matchGender;
  })
);

// Charge les données du dashboard depuis l'API
const loadDashboard = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    // Charger le dashboard étudiant
    const dashboardResponse = await studentApi.getStudentDashboard();
    
    if (dashboardResponse.data.success) {
      const data = dashboardResponse.data.data;
      
      // Mettre à jour l'utilisateur courant
      currentUser.value = {
        name: data.profile.nom,
        email: data.profile.email,
        avatar: data.profile.photo || "",
      };
      
      // Mettre à jour la progression du profil
      profileProgress.value = data.profileProgress || 75;
      
      // Mettre à jour les statistiques
      studentStats.value = [
        { label: "Score profil",    value: String(data.stats.scoreProfile),    color: "#5b4fcf" },
        { label: "Recommandations", value: String(data.stats.recommandations), color: "#0f9e74" },
        { label: "Projets",         value: String(data.stats.projets),         color: "#d85a30" },
        { label: "Stages postulés", value: String(data.stats.stagesPostules),  color: "#ba7517" },
        { label: "Certifications",  value: String(data.stats.certifications),  color: "#185fa5" },
        { label: "Vues du profil",  value: String(data.stats.vuesProfile),     color: "#d4537e" },
      ];
      
      // Mettre à jour l'activité récente
      activities.value = data.activities.map((a: any) => a.action).slice(0, 3);
    }
  } catch (err: any) {
    console.error("Erreur lors du chargement du dashboard:", err);
    error.value = err.response?.data?.message || "Erreur lors du chargement des données";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // Charger les données au montage du composant
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
</script>

<style scoped>
/* ── Page & layout ────────────────────────────────────────────────────────── */
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

/* ── Header ───────────────────────────────────────────────────────────────── */
.dashboard-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
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

.role-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.07);
}

.role-tab {
  min-height: 38px;
  padding: 0 18px;
  border-radius: 100px;
  background: transparent;
  color: var(--text-dark);
  font-family: var(--font-head);
  font-size: .85rem;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.role-tab.active {
  background: var(--purple);
  color: white;
}

.role-tab:hover:not(.active) {
  border-color: var(--purple);
  color: var(--purple);
}

/* ── Stats ────────────────────────────────────────────────────────────────── */
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

/* ── Filters ──────────────────────────────────────────────────────────────── */
.filters-card {
  background: #ffffff;
  border-radius: 14px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
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
  z-index: 150; /* Augmenté pour passer devant le reste */
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

/* ── Mid grid ─────────────────────────────────────────────────────────────── */
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

/* Progress */
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

/* Activity dots */
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

/* Opportunities */
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

/* ── Results ──────────────────────────────────────────────────────────────── */
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
}

.profile-card:hover {
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(91, 79, 207, 0.10);
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

/* ── Avatars ──────────────────────────────────────────────────────────────── */
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

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 1200px) {
  .stats-grid,
  .profile-grid    { grid-template-columns: repeat(3, 1fr); }
  .filters-card    { grid-template-columns: repeat(3, 1fr); }
  .dashboard-grid  { grid-template-columns: 1fr; }
}

@media (max-width: 900px) {
  .content,
  .content.shifted { padding: 16px 16px 32px; }
  .content::before { left: 12px; right: 12px; top: 68px; bottom: 12px; }
  .content.shifted::before { left: 12px; }
  .dashboard-head  { flex-direction: column; align-items: flex-start; }
  .role-tabs       { width: 100%; overflow-x: auto; }
  .stats-grid,
  .filters-card,
  .profile-grid    { grid-template-columns: 1fr; }
}

/* ── States (Loading & Error) ──────────────────────────────────────────── */
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