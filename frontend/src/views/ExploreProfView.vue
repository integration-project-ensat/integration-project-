<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import FilterPanel  from '../components/exploreStudent/FilterPanel.vue'
import ExploreHeader from '../components/exploreStudent/ExploreHeader.vue'
import ProfileCard  from '../components/exploreStudent/ProfileCard.vue'
import Topbar       from '../components/exploreStudent/Topbar.vue'
import SidebarProf  from '../components/exploreProf/SidebarProf.vue'
import { explorerProfils, type ProfilExplore } from '../services/profilApi'
import { mapExploreProfileCard } from '../utils/exploreProfileCard'

// ─── State ────────────────────────────────────
const searchQuery = ref('')
const sidebarOpen = ref(true)
const loading     = ref(false)
const error       = ref<string | null>(null)
const profiles    = ref<ProfilExplore[]>([])
const pagination  = ref({ total: 0, page: 1, limit: 10, pages: 1 })

const filters = ref({
  filiere:         '',
  ville:           '',
  competences:     [] as string[],
  score:           undefined as number | undefined,
  recommandations: false
})

// ─── Charger les profils ──────────────────────
const chargerProfils = async () => {
  loading.value = true
  error.value   = null
  try {
    const res = await explorerProfils({
      search:          searchQuery.value || undefined,
      filiere:         filters.value.filiere         || undefined,
      ville:           filters.value.ville           || undefined,
      competences:     filters.value.competences.length ? filters.value.competences : undefined,
      score:           filters.value.score           || undefined,
      recommandations: filters.value.recommandations || undefined,
      page:            pagination.value.page,
      limit:           pagination.value.limit
    })
    profiles.value   = res.data
    pagination.value = res.pagination
  } catch (e) {
    error.value = 'Erreur lors du chargement des profils'
  } finally {
    loading.value = false
  }
}

// ─── Debounce recherche ───────────────────────
const debouncedSearch = useDebounceFn(() => {
  pagination.value.page = 1
  chargerProfils()
}, 400)

watch(searchQuery, debouncedSearch)
watch(filters, () => {
  pagination.value.page = 1
  chargerProfils()
}, { deep: true })

onMounted(chargerProfils)

// ─── Pagination ───────────────────────────────
const changerPage = (page: number) => {
  pagination.value.page = page
  chargerProfils()
}

// ─── Adapter le profil pour ProfileCard ───────
const adapterProfil = (p: ProfilExplore) => mapExploreProfileCard(p, 'prof')

const handleUpdateFilters = (
  next: Record<string, any>
) => {
  filters.value = {
    ...filters.value,
    ...next
  }
}
</script>

<template>
  <div class="explore-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarProf :isOpen="sidebarOpen" />

    <div class="explore-shell" :class="{ 'explore-shellShift': sidebarOpen }">
      <main class="explore-middle">
        <div class="explore-middle-inner">
          <div class="explore-panel">
            <ExploreHeader v-model="searchQuery" user-type="professeur" />

            <!-- Chargement -->
            <div v-if="loading" class="explore-state">
              Chargement...
            </div>

            <!-- Erreur -->
            <div v-else-if="error" class="explore-state explore-state--error">
              {{ error }}
            </div>

            <!-- Aucun résultat -->
            <div v-else-if="profiles.length === 0" class="explore-state">
              Aucun profil trouvé
            </div>

            <!-- Liste -->
            <div v-else class="explore-feed">
              <ProfileCard
                v-for="profile in profiles"
                :key="profile.id_utilisateur"
                :profile="adapterProfil(profile)"
                :show-score="false"
                :default-expanded="profile.id_utilisateur === profiles[0]?.id_utilisateur"
              />
            </div>

            <!-- Pagination -->
            <div v-if="pagination.pages > 1" class="explore-pagination">
              <button
                v-for="page in pagination.pages"
                :key="page"
                class="page-btn"
                :class="{ active: page === pagination.page }"
                @click="changerPage(page)"
              >
                {{ page }}
              </button>
            </div>
          </div>
        </div>
      </main>

      <div class="explore-right">
        <FilterPanel :filters="filters" @update:filters="handleUpdateFilters" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.explore-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--surface-page);
  color: var(--text-strong);
  padding-top: 50px;
}
.explore-shell {
  height: calc(100vh - 50px);
  display: grid;
  grid-template-columns: minmax(730px, 1fr) 270px;
  justify-content: start;
  gap: 16px;
  padding: 14px;
  overflow: hidden;
}
.explore-shellShift { padding-left: 238px; }
.explore-right {
  position: sticky;
  top: 0;
  height: 100%;
  overflow-y: auto;
  padding: 0;
}
.explore-middle {
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 14px 0;
}
.explore-middle-inner { margin: 0; width: 100%; max-width: none; padding: 0; }
.explore-panel {
  border-radius: 14px;
  background: var(--white);
  border: 1px solid var(--overlay-slate-06);
  box-shadow: 0 18px 40px var(--overlay-slate-09);
  overflow: hidden;
}
.explore-feed {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 18px 18px;
  background: var(--white);
}
.explore-state {
  padding: 40px;
  text-align: center;
  color: var(--text-slate);
  font-size: 14px;
}
.explore-state--error { color: #e11d48; }
.explore-pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid var(--overlay-slate-border-soft);
}
.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: var(--white);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.page-btn.active { background: var(--violet); color: var(--white); border-color: var(--violet); }
</style>
