<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { SlidersHorizontal } from "../lib/icons";
import SidebarPro from "../components/explorePro/SidebarPro.vue";
import SkillBadges from "../components/exploreStudent/SkillBadges.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import { useProSavedProfiles } from "../store/proSavedProfiles";
import { resolveProfileBadges } from "../utils/profileBadges";

const router = useRouter();
const sidebarOpen = ref(true);
const {
  savedProfiles,
  totalSaved,
  averageScore,
  totalRecommendations,
  profilesWithPortfolio,
  removeProfile,
} = useProSavedProfiles();

const showFilters = ref(false);
const universitySearch = ref("");
const fieldSearch = ref("");
const minScore = ref("");
const minRecommendations = ref("");

const filteredProfiles = computed(() => {
  const university = universitySearch.value.trim().toLowerCase();
  const field = fieldSearch.value.trim().toLowerCase();
  const score = Number(minScore.value) || 0;
  const recommendations = Number(minRecommendations.value) || 0;

  return savedProfiles.value.filter(
    (profile) =>
      profile.school.toLowerCase().includes(university) &&
      profile.field.toLowerCase().includes(field) &&
      profile.score >= score &&
      profile.recommendations >= recommendations,
  );
});

const openPath = (path: string) => {
  router.push(path);
};

const fallbackBadges = (profile: { badges?: string[]; field: string; school: string }) =>
  profile.badges?.length
    ? profile.badges
    : resolveProfileBadges({
        field: profile.field,
        school: profile.school,
      });
</script>

<template>
  <div class="top-profiles-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarPro :isOpen="sidebarOpen" />

    <main class="top-profiles-shell" :class="{ shifted: sidebarOpen }">
      <section class="top-profiles-panel">
        <div class="page-heading">
          <p>Espace professionnel</p>
          <h1>Top Profiles</h1>
        </div>

        <div class="stats-grid">
          <article class="stat-card">
            <span>Total profils sauvegardés</span>
            <strong>{{ totalSaved }}</strong>
          </article>
          <article class="stat-card">
            <span>Score moyen</span>
            <strong>{{ averageScore }}+</strong>
          </article>
          <article class="stat-card">
            <span>Total recommandations</span>
            <strong>{{ totalRecommendations }}+</strong>
          </article>
          <article class="stat-card">
            <span>Profils avec portfolio</span>
            <strong>{{ profilesWithPortfolio }}</strong>
          </article>
        </div>

        <div class="profiles-table-card">
          <div class="table-title">
            <div>
              <h2>Profils sauvegardés</h2>
              <span>{{ filteredProfiles.length }} profils affichés</span>
            </div>

            <button
              type="button"
              class="filter-toggle"
              :class="{ active: showFilters }"
              @click="showFilters = !showFilters"
            >
              <SlidersHorizontal class="filter-icon" />
              Filtrer
            </button>
          </div>

          <div v-if="showFilters" class="filters-panel">
            <label>
              Rechercher école / faculté
              <input
                v-model="universitySearch"
                type="search"
                placeholder="ENSA, FST, ENSAM..."
              />
            </label>
            <label>
              Filière
              <input
                v-model="fieldSearch"
                type="search"
                placeholder="GINF, DevOps, Cloud..."
              />
            </label>
            <label>
              Score minimum
              <input v-model="minScore" type="number" min="0" placeholder="80" />
            </label>
            <label>
              Recommandations minimum
              <input
                v-model="minRecommendations"
                type="number"
                min="0"
                placeholder="100"
              />
            </label>
          </div>

          <div v-if="filteredProfiles.length" class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>École / Faculté</th>
                  <th>Filière</th>
                  <th>Ville</th>
                  <th>Score</th>
                  <th>Recommandations</th>
                  <th>Date sauvegarde</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="profile in filteredProfiles" :key="profile.id">
                  <td>
                    <button
                      type="button"
                      class="profile-cell"
                      @click="openPath(profile.profilePath)"
                    >
                      <span>{{ profile.name.slice(0, 2).toUpperCase() }}</span>
                      <div>
                        <strong>{{ profile.name }}</strong>
                        <SkillBadges
                          :badges="fallbackBadges(profile)"
                          compact
                        />
                      </div>
                    </button>
                  </td>
                  <td>{{ profile.school }}</td>
                  <td>{{ profile.field }}</td>
                  <td>{{ profile.city }}</td>
                  <td>
                    <span class="score-pill">{{ profile.score }}+</span>
                  </td>
                  <td>{{ profile.recommendations }}+</td>
                  <td>{{ profile.savedAt }}</td>
                  <td>
                    <div class="action-row">
                      <button type="button" @click="openPath(profile.profilePath)">
                        Voir profil
                      </button>
                      <button
                        type="button"
                        :disabled="!profile.hasPortfolio"
                        @click="openPath(profile.portfolioPath)"
                      >
                        Voir portfolio
                      </button>
                      <button
                        type="button"
                        class="remove-btn"
                        @click="removeProfile(profile.id)"
                      >
                        Retirer
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-else class="empty-state">
            Aucun profil sauvegardé pour le moment.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.top-profiles-page {
  min-height: 100vh;
  width: 100vw;
  background: #eef1fb;
  color: var(--text-dark);
  font-family: var(--font-body);
  padding-top: 50px;
}

.top-profiles-shell {
  height: calc(100vh - 50px);
  overflow-y: auto;
  padding: 14px;
  transition: padding-left 0.3s ease;
}

.top-profiles-shell.shifted {
  padding-left: 234px;
}

.top-profiles-panel {
  display: grid;
  gap: 16px;
}

.page-heading,
.profiles-table-card,
.stat-card {
  background: white;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: var(--radius-card);
  box-shadow: 0 14px 32px rgba(17, 24, 39, 0.08);
}

.page-heading {
  padding: 24px;
}

.page-heading p,
.stat-card span,
.table-title span {
  color: var(--text-gray);
  font-weight: 800;
}

.page-heading h1 {
  color: var(--text-dark);
  font-size: 34px;
  font-weight: 900;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 14px;
}

.stat-card {
  padding: 18px;
}

.stat-card strong {
  display: block;
  margin-top: 12px;
  color: var(--purple);
  font-size: 32px;
  font-weight: 900;
}

.profiles-table-card {
  overflow: hidden;
}

.table-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border-bottom: 1px solid var(--input-bg);
}

.table-title h2 {
  color: var(--text-dark);
  font-size: 22px;
  font-weight: 900;
}

.filter-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  border-radius: 100px 180px 0px 100px;
  border: 1px solid rgba(17, 24, 39, 0.35);
  background: white;
  color: var(--navy-mid);
  padding: 0 14px;
  font-weight: 900;
}

.filter-toggle.active {
  background: var(--purple);
  border-color: var(--purple);
  color: white;
}

.filter-icon {
  width: 17px;
  height: 17px;
}

.filters-panel {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--input-bg);
  background: rgba(229, 231, 235, 0.45);
}

.filters-panel label {
  display: grid;
  gap: 7px;
  color: var(--text-gray);
  font-size: 12px;
  font-weight: 900;
}

.filters-panel input {
  height: 36px;
  border-radius: var(--radius-pill);
  background: white;
  color: var(--text-dark);
  padding: 0 14px;
  font-weight: 800;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid var(--input-bg);
  color: var(--navy-mid);
  font-weight: 800;
  white-space: nowrap;
}

th {
  color: var(--text-gray);
  font-size: 12px;
  text-transform: uppercase;
}

.profile-cell {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: var(--text-dark);
  font-weight: 900;
}

.profile-cell span {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--input-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.score-pill {
  border-radius: var(--radius-pill);
  background: rgba(79, 70, 229, 0.12);
  color: var(--purple);
  padding: 7px 12px;
}

.action-row {
  display: flex;
  gap: 8px;
}

.action-row button {
  border-radius: 100px 180px 0px 100px;
  border: 1px solid rgba(17, 24, 39, 0.35);
  background: white;
  color: var(--navy-mid);
  padding: 8px 12px;
  font-weight: 800;
}

.action-row button:hover {
  background: rgba(79, 70, 229, 0.12);
}

.action-row button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-row .remove-btn {
  background: rgba(223, 30, 33, 0.08);
  border-color: rgba(223, 30, 33, 0.2);
  color: var(--error);
}

.empty-state {
  padding: 28px;
  color: var(--text-gray);
  font-weight: 800;
}

@media (max-width: 1100px) {
  .stats-grid,
  .filters-panel {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }
}
</style>

