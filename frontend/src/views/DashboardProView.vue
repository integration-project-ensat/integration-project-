<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  FilePlus2,
  UserCheck,
  UserPlus,
  Users,
} from "../lib/icons";
import SidebarPro from "../components/explorePro/SidebarPro.vue";
import SkillBadges from "../components/exploreStudent/SkillBadges.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import profApi from "@/services/profApi";
import { postService } from "../services/post.service";
import { resolveProfileBadges } from "../utils/profileBadges";

interface Intern {
  id: string;
  initials: string;
  name: string;
  school: string;
  field: string;
  city: string;
  score: number;
  startDate: string;

  badges: string[];
  status: "Actif" | "Terminé";

  profilePath: string;
  portfolioPath: string;
}

interface SavedProfile {
  id: string;
  name: string;
  school: string;
  field: string;
  city: string;
  score: number;
  recommendations: number;
  badges: string[];
  hasPortfolio: boolean;
  profilePath: string;
  portfolioPath: string;
}

const router = useRouter();
const sidebarOpen = ref(true);
const isStageModalOpen = ref(false);
const savedProfiles = ref<SavedProfile[]>([]);
const pendingRequests = ref(0);
const acceptedRequests = ref(0);
const refusedRequests = ref(0);
const publishedOffers = ref(0);
const profileName = ref("Bienvenue, professionnel");
const totalSaved = computed(() => savedProfiles.value.length);
const isSubmittingStage = ref(false);
const isLoadingDashboard = ref(false);
const dashboardError = ref("");

const interns = ref<Intern[]>([]);

const newStage = ref({
  title: "",
  field: "",
  city: "",
  duration: "",
  description: "",
});

const stats = computed(() => [
  {
    title: "Total stagiaires",
    value: interns.value.length,
    info: "Connexions étudiantes",
    icon: Users,
  },
  {
    title: "Stagiaires actifs",
    value: interns.value.filter((intern) => intern.status === "Actif").length,
    info: "Suivi en cours",
    icon: UserCheck,
  },
  {
    title: "Demandes de connexion",
    value: pendingRequests.value,
    info: "À traiter",
    icon: UserPlus,
    path: "/pro/connexions?tab=pending",
  },
  {
    title: "Profils sauvegardés",
    value: totalSaved.value,
    info: "Top Profiles",
    icon: CheckCircle2,
  },
  {
    title: "Offres publiées",
    value: publishedOffers.value,
    info: "Posts professionnels",
    icon: BriefcaseBusiness,
  },
]);

const fieldDistribution = computed(() => {
  const counts = interns.value.reduce<Record<string, number>>((acc, intern) => {
    const key = intern.field || "Autre";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const total = Math.max(interns.value.length, 1);

  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      value: Math.round((count / total) * 100),
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 4);
});

const schoolDistribution = computed(() => {
  const counts = interns.value.reduce<Record<string, number>>((acc, intern) => {
    const key = intern.school || "Autre";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 4);
});

const connectionAnalytics = computed(() => [
  { label: "Acceptées", value: acceptedRequests.value, path: "/pro/connexions?tab=accepted" },
  { label: "Refusées", value: refusedRequests.value },
  { label: "En attente", value: pendingRequests.value, path: "/pro/connexions?tab=pending" },
]);

const loadDashboard = async () => {
  isLoadingDashboard.value = true;
  dashboardError.value = "";

  try {
    const response = await profApi.getProDashboard();
    if (response.data?.success) {
      const data = response.data.data;
      profileName.value = data.profile?.name ?? profileName.value;
      interns.value = Array.isArray(data.interns)
        ? data.interns.map((intern: Intern) => ({
            ...intern,
            badges:
              Array.isArray(intern.badges) && intern.badges.length
                ? intern.badges
                : resolveProfileBadges({
                    filiere: intern.field,
                    school: intern.school,
                  }),
          }))
        : [];
      savedProfiles.value = Array.isArray(data.savedProfiles) ? data.savedProfiles : [];
      pendingRequests.value = data.connections?.pending ?? 0;
      acceptedRequests.value = data.connections?.accepted ?? 0;
      refusedRequests.value = data.connections?.refused ?? 0;
      publishedOffers.value = data.stats?.publishedOffers ?? 0;
    }
  } catch (err: any) {
    console.error("Erreur chargement dashboard professionnel", err);
    dashboardError.value =
      err.response?.data?.message ||
      "Impossible de charger le dashboard professionnel.";
  } finally {
    isLoadingDashboard.value = false;
  }
};

onMounted(() => {
  loadDashboard();
});

const openPath = (path: string) => {
  router.push(path);
};

const submitStage = async () => {
  if (
    !newStage.value.title.trim() ||
    !newStage.value.field.trim() ||
    !newStage.value.city.trim() ||
    !newStage.value.duration.trim() ||
    !newStage.value.description.trim()
  ) {
    return;
  }

  isSubmittingStage.value = true;

  try {
    const payload = new FormData();
    payload.append(
      "contenu",
      JSON.stringify({
        projectTitle: newStage.value.title.trim(),
        description: newStage.value.description.trim(),
        technologies: [newStage.value.field.trim(), newStage.value.duration.trim()],
        demo: newStage.value.city.trim(),
        github: "",
      }),
    );
    payload.append("visibilite", "PUBLIC");

    await postService.createPost(payload);

    newStage.value = {
      title: "",
      field: "",
      city: "",
      duration: "",
      description: "",
    };
    isStageModalOpen.value = false;
    await loadDashboard();
  } catch (err: any) {
    console.error("Erreur publication offre/stage", err);
  } finally {
    isSubmittingStage.value = false;
  }
};
</script>

<template>
  <div class="pro-dashboard-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarPro :isOpen="sidebarOpen" />

    <main class="pro-dashboard-shell" :class="{ shifted: sidebarOpen }">
      <section class="dashboard-header-card">
        <div>
          <p>Espace Professionnel</p>
          <h1>{{ profileName }}</h1>
          <span>Suivez vos stagiaires, connexions et interactions.</span>
        </div>
        <button
          type="button"
          class="primary-action"
          @click="isStageModalOpen = true"
        >
          <FilePlus2 class="button-icon" />
          Ajouter un stage
        </button>
      </section>

      <section class="stats-grid">
        <article
          v-for="stat in stats"
          :key="stat.title"
          class="stat-card"
          :class="{ 'stat-cardAction': stat.path }"
          :tabindex="stat.path ? 0 : undefined"
          :role="stat.path ? 'button' : undefined"
          @click="stat.path && openPath(stat.path)"
          @keydown.enter="stat.path && openPath(stat.path)"
          @keydown.space.prevent="stat.path && openPath(stat.path)"
        >
          <div class="stat-icon">
            <component :is="stat.icon" />
          </div>
          <div>
            <p>{{ stat.title }}</p>
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.info }}</span>
          </div>
        </article>
      </section>

      <section class="dashboard-grid single-grid">
        <article class="panel wide-panel">
          <div class="section-heading">
            <div>
              <p>Suivi professionnel</p>
              <h2>Mes stagiaires</h2>
            </div>
            <span>{{ interns.length }} profils</span>
          </div>

          <div class="intern-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>École / Faculté</th>
                  <th>Filière</th>
                  <th>Ville</th>
                  <th>Score</th>
                  <th>Date début stage</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoadingDashboard">
                  <td colspan="8" class="table-state">Chargement du dashboard...</td>
                </tr>
                <tr v-else-if="dashboardError">
                  <td colspan="8" class="table-state error-state">{{ dashboardError }}</td>
                </tr>
                <tr v-else-if="!interns.length">
                  <td colspan="8" class="table-state">
                    Aucun stagiaire lié pour le moment.
                  </td>
                </tr>
                <tr v-for="intern in interns" :key="intern.id">
                  <td>
                    <button
                      type="button"
                      class="student-cell"
                      @click="openPath(intern.profilePath)"
                    >
                      <span>{{ intern.initials }}</span>
                      <div>
                        <strong>{{ intern.name }}</strong>
                        <SkillBadges :badges="intern.badges" compact />
                      </div>
                    </button>
                  </td>
                  <td>{{ intern.school }}</td>
                  <td>{{ intern.field }}</td>
                  <td>{{ intern.city }}</td>
                  <td>
                    <span class="score-pill">{{ intern.score }}+</span>
                  </td>
                  <td>{{ intern.startDate }}</td>
                  <td>
                    <span
                      class="status-pill"
                      :class="{ done: intern.status === 'Terminé' }"
                    >
                      {{ intern.status }}
                    </span>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button type="button" @click="openPath(intern.portfolioPath)">
                        Portfolio
                      </button>
                      <button type="button" @click="openPath(intern.profilePath)">
                        Voir profil
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

      </section>

      <section class="dashboard-grid lower-grid">
        <article class="panel">
          <div class="section-heading">
            <div>
              <p>Top Profiles</p>
              <h2>Profils sauvegardés récents</h2>
            </div>
          </div>

          <div class="saved-list">
            <article
              v-for="profile in savedProfiles.slice(0, 4)"
              :key="profile.id"
              class="saved-card"
            >
              <span>{{ profile.name.slice(0, 2).toUpperCase() }}</span>
              <div>
                <strong>{{ profile.name }}</strong>

                <SkillBadges :badges="profile.badges" compact />
                <p>{{ profile.score }}+ · {{ profile.recommendations }} recos</p>

                <small>{{
                  profile.hasPortfolio ? "Portfolio disponible" : "Sans portfolio"
                }}</small>
                <div class="saved-actions">
                  <button type="button" @click="openPath(profile.profilePath)">
                    Voir profil
                  </button>
                  <button
                    v-if="profile.hasPortfolio"
                    type="button"
                    @click="openPath(profile.portfolioPath)"
                  >
                    Portfolio
                  </button>
                </div>
              </div>
            </article>
            <p v-if="!savedProfiles.length" class="empty-state">
              Aucun profil sauvegardé.
            </p>
          </div>
        </article>

        <article class="panel analytics-panel">
          <div class="section-heading">
            <div>
              <p>Analytics</p>
              <h2>Vue réseau</h2>
            </div>
            <BarChart3 class="analytics-icon" />
          </div>

          <div class="chart-block">
            <h3>Répartition des filières</h3>
            <div v-for="item in fieldDistribution" :key="item.label" class="bar-row">
              <span>{{ item.label }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ width: `${item.value}%` }" />
              </div>
              <strong>{{ item.value }}%</strong>
            </div>
          </div>

          <div class="mini-chart-grid">
            <div>
              <h3>Stagiaires par école</h3>
              <p v-for="item in schoolDistribution" :key="item.label">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </p>
            </div>
            <div>
              <h3>Connexions</h3>
              <template v-for="item in connectionAnalytics" :key="item.label">
                <button
                  v-if="item.path"
                  type="button"
                  class="connection-row"
                  @click="openPath(item.path)"
                >
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </button>
                <p v-else>
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </p>
              </template>
            </div>
          </div>
        </article>
      </section>
    </main>

    <div v-if="isStageModalOpen" class="modal-backdrop" @click.self="isStageModalOpen = false">
      <section class="stage-modal">
        <div class="modal-heading">
          <div>
            <p>Nouvelle offre</p>
            <h2>Ajouter un stage</h2>
          </div>
          <button type="button" @click="isStageModalOpen = false">×</button>
        </div>

        <form class="stage-form" @submit.prevent="submitStage">
          <label>
            Titre du stage
            <input v-model="newStage.title" required placeholder="Stage PFE DevOps" />
          </label>
          <label>
            Filière recherchée
            <input v-model="newStage.field" required placeholder="DevOps, Cloud..." />
          </label>
          <label>
            Ville
            <input v-model="newStage.city" required placeholder="Tanger" />
          </label>
          <label>
            Durée
            <input v-model="newStage.duration" required placeholder="4 à 6 mois" />
          </label>
          <label class="full-field">
            Description
            <textarea
              v-model="newStage.description"
              required
              placeholder="Décrivez les missions, technologies et profil recherché..."
            />
          </label>

          <div class="modal-actions">
            <button type="button" @click="isStageModalOpen = false">Annuler</button>
            <button type="submit" :disabled="isSubmittingStage">
              {{ isSubmittingStage ? 'Publication...' : 'Publier l’offre' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.pro-dashboard-page {
  min-height: 100vh;
  width: 100vw;
  background: #eef1fb;
  color: var(--text-dark);
  font-family: var(--font-body);
  padding-top: 50px;
}

.pro-dashboard-shell {
  height: calc(100vh - 50px);
  overflow-y: auto;
  padding: 14px;
  transition: padding-left 0.3s ease;
}

.pro-dashboard-shell.shifted {
  padding-left: 234px;
}

.dashboard-header-card,
.stat-card,
.panel,
.stage-modal {
  background: white;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: var(--radius-card);
  box-shadow: 0 14px 32px rgba(17, 24, 39, 0.08);
}

.dashboard-header-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 24px;
}

.dashboard-header-card p,
.section-heading p,
.stat-card p,
.modal-heading p {
  color: var(--text-gray);
  font-weight: 900;
}

.dashboard-header-card h1 {
  color: var(--text-dark);
  font-size: 34px;
  font-weight: 900;
}

.dashboard-header-card span {
  color: var(--navy-mid);
  font-weight: 800;
}

.primary-action,
.row-actions button,
.open-connections,
.modal-actions button {
  border-radius: 100px 180px 0px 100px;
  font-weight: 900;
}

.primary-action,
.modal-actions button[type="submit"] {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--purple);
  color: white;
  padding: 12px 18px;
}

.button-icon,
.analytics-icon {
  width: 18px;
  height: 18px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  margin-top: 14px;
}

.stat-card {
  display: flex;
  gap: 12px;
  padding: 16px;
}

.stat-cardAction {
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.stat-cardAction:hover,
.stat-cardAction:focus-visible {
  border-color: rgba(79, 70, 229, 0.38);
  box-shadow: 0 16px 34px rgba(79, 70, 229, 0.16);
  outline: none;
  transform: translateY(-1px);
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(79, 70, 229, 0.12);
  color: var(--purple);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat-card strong {
  display: block;
  color: var(--purple);
  font-size: 28px;
  font-weight: 900;
  margin-top: 4px;
}

.stat-card span {
  color: var(--text-gray);
  font-size: 12px;
  font-weight: 800;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.8fr);
  gap: 14px;
  margin-top: 14px;
}

.single-grid {
  grid-template-columns: 1fr;
}

.lower-grid {
  grid-template-columns: minmax(320px, 0.8fr) minmax(0, 1.2fr);
}

.panel {
  overflow: hidden;
}

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px;
  border-bottom: 1px solid var(--input-bg);
}

.section-heading h2,
.modal-heading h2 {
  color: var(--text-dark);
  font-size: 22px;
  font-weight: 900;
}

.section-heading > span {
  border-radius: var(--radius-pill);
  background: rgba(79, 70, 229, 0.12);
  color: var(--purple);
  padding: 8px 12px;
  font-weight: 900;
}

.intern-table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 14px;
  border-bottom: 1px solid var(--input-bg);
  text-align: left;
  color: var(--navy-mid);
  font-weight: 800;
  white-space: nowrap;
}

th {
  color: var(--text-gray);
  font-size: 12px;
  text-transform: uppercase;
}

.student-cell {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: var(--text-dark);
  font-weight: 900;
}

.student-cell span,
.saved-card > span {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--input-bg);
  color: var(--text-dark);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.score-pill,
.status-pill {
  border-radius: var(--radius-pill);
  padding: 7px 12px;
  font-weight: 900;
}

.score-pill {
  background: rgba(79, 70, 229, 0.12);
  color: var(--purple);
}

.status-pill {
  background: rgba(6, 182, 212, 0.12);
  color: var(--blue-w);
}

.status-pill.done {
  background: var(--input-bg);
  color: var(--text-gray);
}

.row-actions {
  display: flex;
  gap: 8px;
}

.row-actions button,
.open-connections,
.modal-actions button:first-child {
  border: 1px solid rgba(17, 24, 39, 0.35);
  background: white;
  color: var(--navy-mid);
  padding: 8px 12px;
}

.row-actions button:hover,
.open-connections:hover {
  background: rgba(79, 70, 229, 0.12);
}

.request-list,
.saved-list {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.saved-card {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
  background: white;
  border: 1px solid var(--input-bg);
  border-radius: 16px;
  padding: 14px;
  text-align: left;
}

.saved-card > div {
  min-width: 0;
}

.saved-card strong {
  color: var(--text-dark);
  font-weight: 900;
}

.saved-card p,
.saved-card small {
  color: var(--text-gray);
  font-weight: 800;
}

.saved-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.saved-actions button {
  border: 1px solid rgba(79, 70, 229, 0.22);
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.08);
  color: var(--purple);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  padding: 7px 10px;
}

.saved-actions button:hover,
.saved-actions button:focus-visible {
  background: var(--purple);
  color: white;
  outline: none;
}

.open-connections {
  justify-self: start;
}

.analytics-panel {
  padding-bottom: 16px;
}

.chart-block,
.mini-chart-grid {
  padding: 16px;
}

.chart-block h3,
.mini-chart-grid h3 {
  color: var(--text-dark);
  font-size: 14px;
  font-weight: 900;
  margin-bottom: 10px;
}

.bar-row {
  display: grid;
  grid-template-columns: 90px 1fr 44px;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: var(--navy-mid);
  font-weight: 800;
}

.bar-track {
  height: 10px;
  border-radius: var(--radius-pill);
  background: var(--input-bg);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--purple);
}

.mini-chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.mini-chart-grid > div {
  border: 1px solid var(--input-bg);
  border-radius: 16px;
  padding: 14px;
}

.mini-chart-grid p,
.connection-row {
  display: flex;
  justify-content: space-between;
  color: var(--navy-mid);
  font-weight: 800;
  margin-top: 8px;
}

.connection-row {
  width: 100%;
  border: 0;
  background: transparent;
  padding: 0;
  text-align: left;
  cursor: pointer;
}

.connection-row:hover span,
.connection-row:focus-visible span {
  color: var(--purple);
}

.connection-row:focus-visible {
  outline: 2px solid rgba(79, 70, 229, 0.28);
  outline-offset: 3px;
  border-radius: 8px;
}

.mini-chart-grid strong,
.connection-row strong {
  color: var(--purple);
}

.empty-state {
  color: var(--text-gray);
  font-weight: 800;
  padding: 8px;
}

.table-state {
  color: var(--text-gray);
  font-weight: 900;
  text-align: center;
  padding: 28px 14px;
}

.error-state {
  color: var(--error);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(17, 24, 39, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.stage-modal {
  width: min(760px, 100%);
  padding: 24px;
}

.modal-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.modal-heading button {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--input-bg);
  color: var(--text-dark);
  font-size: 24px;
  font-weight: 900;
}

.stage-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 18px;
}

.stage-form label {
  display: grid;
  gap: 7px;
  color: var(--text-gray);
  font-size: 12px;
  font-weight: 900;
}

.stage-form input,
.stage-form textarea {
  border-radius: 16px;
  background: var(--input-bg);
  color: var(--text-dark);
  padding: 12px 14px;
  font-weight: 800;
}

.stage-form textarea {
  min-height: 110px;
  resize: vertical;
}

.full-field,
.modal-actions {
  grid-column: 1 / -1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(140px, 1fr));
  }

  .dashboard-grid,
  .lower-grid {
    grid-template-columns: 1fr;
  }
}
</style>

