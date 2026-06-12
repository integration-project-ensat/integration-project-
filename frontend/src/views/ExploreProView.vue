<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Bookmark } from 'lucide-vue-next'
import { useDebounceFn } from '@vueuse/core'
import ExploreHeader  from '../components/exploreStudent/ExploreHeader.vue'
import FilterPanel    from '../components/exploreStudent/FilterPanel.vue'
import ProfileCard    from '../components/exploreStudent/ProfileCard.vue'
import Topbar         from '../components/exploreStudent/Topbar.vue'
import SidebarPro     from '../components/explorePro/SidebarPro.vue'
import {
  explorerProfils,
  sauvegarderProfil,
  supprimerSauvegarde,
  getMesSauvegardes,
  type ProfilExplore
} from '../services/profilApi'
import { mapExploreProfileCard } from '../utils/exploreProfileCard'
// â”€â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const searchQuery    = ref('')
const sidebarOpen    = ref(true)
const loading        = ref(false)
const error          = ref<string | null>(null)
const profiles       = ref<ProfilExplore[]>([])
const savedIds       = ref<Set<string>>(new Set())
const savedFeedbackId = ref<string | null>(null)
const pagination     = ref({ total: 0, page: 1, limit: 10, pages: 1 })

const filters = ref({
  filiere:         '',
  ville:           '',
  competences:     [] as string[],
  score:           undefined as number | undefined,
  recommandations: false
})

const savedProfilesStorageKey = "proSavedProfiles"

const readLocalSavedProfiles = () => {
  try {
    const raw = localStorage.getItem(savedProfilesStorageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeLocalSavedProfiles = (items: any[]) => {
  localStorage.setItem(savedProfilesStorageKey, JSON.stringify(items))
}

const toSavedProfile = (profile: ProfilExplore) => ({
  id: String(profile.id_utilisateur),
  name: `${profile.prenom ?? ""} ${profile.nom ?? ""}`.trim() || "Profil",
  school: profile.etudiant?.diplomes?.[0]?.etablissement ?? profile.etudiant?.filiere ?? "Étudiant",
  field: profile.etudiant?.filiere ?? "",
  city: profile.profil?.adresse ?? "",
  score: Number(profile.etudiant?.score_credibilite?.score_total ?? 0),
  recommendations: profile.nb_recommandations ?? 0,
  badges: (profile.etudiant?.badges ?? [])
    .map((item: any) => item.badge?.nom ?? item.nom)
    .filter(Boolean),
  hasPortfolio: Boolean(profile.etudiant?.score_credibilite),
  savedAt: new Date().toLocaleDateString("fr-FR"),
  profilePath: `/profile/student/${profile.id_utilisateur}?from=pro`,
  portfolioPath: `/portfolio/${profile.id_utilisateur}?from=pro`,
})

const addLocalSavedProfile = (profile: ProfilExplore) => {
  const savedProfile = toSavedProfile(profile)
  const items = readLocalSavedProfiles().filter((item: any) => item.id !== savedProfile.id)
  writeLocalSavedProfiles([savedProfile, ...items])
}

const removeLocalSavedProfile = (id: string) => {
  writeLocalSavedProfiles(readLocalSavedProfiles().filter((item: any) => item.id !== id))
}

// â”€â”€â”€ Charger les profils â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Charger les sauvegardes existantes â”€â”€â”€â”€â”€â”€â”€
const chargerSauvegardes = async () => {
  const localIds = readLocalSavedProfiles().map((item: any) => String(item.id))

  try {
    const saved = await getMesSauvegardes()
    const remoteIds = saved
      .map((s: any) => String(s.etudiant?.id_utilisateur ?? ""))
      .filter(Boolean)
    savedIds.value = new Set([...localIds, ...remoteIds])
  } catch {
    savedIds.value = new Set(localIds)
  }
}

// â”€â”€â”€ Debounce sur la recherche â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const debouncedSearch = useDebounceFn(() => {
  pagination.value.page = 1
  chargerProfils()
}, 400)

watch(searchQuery, debouncedSearch)

// â”€â”€â”€ Watch filtres â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
watch(filters, () => {
  pagination.value.page = 1
  chargerProfils()
}, { deep: true })

// â”€â”€â”€ Init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
onMounted(() => {
  chargerProfils()
  chargerSauvegardes()
})

// â”€â”€â”€ Sauvegarder / retirer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const toggleSavedProfile = async (profile: ProfilExplore) => {
  const id = profile.id_utilisateur
  try {
    if (savedIds.value.has(id)) {
      await supprimerSauvegarde(id)
      removeLocalSavedProfile(id)
    } else {
      await sauvegarderProfil(id)
      addLocalSavedProfile(profile)
    }
    // forcer la réactivité
    await chargerSauvegardes()

    savedFeedbackId.value = id
    window.setTimeout(() => {
      if (savedFeedbackId.value === id) savedFeedbackId.value = null
    }, 1200)
  } catch {
    error.value = 'Erreur lors de la sauvegarde'
  }
}

// â”€â”€â”€ Pagination â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const changerPage = (page: number) => {
  pagination.value.page = page
  chargerProfils()
}

// â”€â”€â”€ Adapter le profil pour ProfileCard â”€â”€â”€â”€â”€â”€â”€
const adapterProfil = (p: ProfilExplore) => mapExploreProfileCard(p, 'pro')

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const profileId = (profile: ProfilExplore) => profile.id_utilisateur
const isSaved = (id: string) => savedIds.value.has(id)

const handleUpdateFilters = (next: Record<string, any>) => {
  filters.value = {
    filiere: next.filiere ?? '',
    ville: next.ville ?? '',
    competences: next.competences ?? [],
    score: next.score,
    recommandations: next.recommandations ?? false
  }
}
</script>

<template>
  <div class="explore-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarPro :isOpen="sidebarOpen" />

    <div class="explore-shell" :class="{ 'explore-shellShift': sidebarOpen }">
      <main class="explore-middle">
        <div class="explore-middle-inner">
          <div class="explore-panel">
            <ExploreHeader v-model="searchQuery" user-type="professionnel" />

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
              <div
                v-for="profile in profiles"
                :key="profile.id_utilisateur"
                class="profile-save-wrap"
              >
                <button
                  type="button"
                  class="save-profile-btn"
                  :class="{ saved: isSaved(profileId(profile)) }"
                  :aria-label="
                    isSaved(profileId(profile))
                      ? 'Retirer le profil sauvegardé'
                      : 'Sauvegarder le profil'
                  "
                  @click="toggleSavedProfile(profile)"
                >
                  <Bookmark class="save-icon" />
                </button>

                <span
                  v-if="savedFeedbackId === profile.id_utilisateur"
                  class="save-feedback"
                >
                  {{
                    isSaved(profileId(profile))
                      ? "Profil sauvegardé"
                      : "Profil retiré"
                  }}
                </span>

                <ProfileCard
                  :profile="adapterProfil(profile)"
                  :show-score="false"
                  :default-expanded="profile.id_utilisateur === profiles[0]?.id_utilisateur"
                />
              </div>
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
.profile-save-wrap { position: relative; }
.save-profile-btn {
  position: absolute;
  right: 18px;
  top: 18px;
  z-index: 5;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: var(--white);
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 8px 18px rgba(17, 24, 39, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.save-profile-btn.saved { background: var(--violet); border-color: var(--violet); color: var(--white); }
.save-icon { width: 18px; height: 18px; }
.save-feedback {
  position: absolute;
  right: 62px;
  top: 22px;
  z-index: 6;
  border-radius: 9999px;
  background: var(--text-strong);
  color: var(--white);
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.2);
}
</style>





