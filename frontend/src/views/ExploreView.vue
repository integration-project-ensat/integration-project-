<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Bookmark } from 'lucide-vue-next'
import { useDebounceFn } from '@vueuse/core'
import ExploreHeader from '../components/exploreStudent/ExploreHeader.vue'
import FilterPanel   from '../components/exploreStudent/FilterPanel.vue'
import ProfileCard   from '../components/exploreStudent/ProfileCard.vue'
import Sidebar       from '../components/exploreStudent/Sidebar.vue'
import Topbar        from '../components/exploreStudent/Topbar.vue'
import { explorerProfils, type ProfilExplore } from '../services/profilApi'

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
const adapterProfil = (p: ProfilExplore) => ({
  id:              Number(p.id_utilisateur),
  name:            `${p.prenom} ${p.nom}`,
  role:            p.etudiant?.diplomes?.[0]?.titre_diplome ?? '',
  school:          p.etudiant?.diplomes?.[0]?.etablissement ?? '',
  city:            p.profil?.adresse ?? '',
  score:           p.etudiant?.score_credibilite?.score_total ?? 0,
  recommendations: p.nb_recommandations,
  recos:           []
})

const handleUpdateFilters = (next: typeof filters.value) => {
  filters.value = next
}
</script>

<template>
  <div class="explore-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <Sidebar :isOpen="sidebarOpen" />

    <div class="explore-shell" :class="{ 'explore-shellShift': sidebarOpen }">
      <main class="explore-middle">
        <div class="explore-middle-inner">
          <div class="explore-panel">
            <ExploreHeader v-model="searchQuery" user-type="student" />

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
  background: #eef1fb;
  color: rgb(15 23 42);
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
  scrollbar-width: thin;
  scrollbar-color: rgba(2, 6, 23, 0.2) rgba(2, 6, 23, 0.05);
}
.explore-right::-webkit-scrollbar { width: 8px; }
.explore-right::-webkit-scrollbar-track { background: rgba(2, 6, 23, 0.04); border-radius: 9999px; }
.explore-right::-webkit-scrollbar-thumb { background: rgba(2, 6, 23, 0.16); border-radius: 9999px; }
.explore-middle {
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 14px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(2, 6, 23, 0.22) rgba(2, 6, 23, 0.05);
}
.explore-middle::-webkit-scrollbar { width: 8px; }
.explore-middle::-webkit-scrollbar-track { background: rgba(2, 6, 23, 0.04); border-radius: 9999px; }
.explore-middle::-webkit-scrollbar-thumb { background: rgba(2, 6, 23, 0.2); border-radius: 9999px; }
.explore-middle-inner { margin: 0; width: 100%; max-width: none; padding: 0; }
.explore-panel {
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.09);
  overflow: hidden;
}
.explore-feed {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 18px 18px;
  background: #ffffff;
}
.explore-state {
  padding: 40px;
  text-align: center;
  color: rgb(100 116 139);
  font-size: 14px;
}
.explore-state--error { color: #e11d48; }
.explore-pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
}
.page-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.page-btn.active { background: #6c5ce7; color: white; border-color: #6c5ce7; }
</style>
