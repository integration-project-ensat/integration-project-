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

<<<<<<< HEAD
// ─── State ────────────────────────────────────
const searchQuery    = ref('')
const sidebarOpen    = ref(true)
const loading        = ref(false)
const error          = ref<string | null>(null)
const profiles       = ref<ProfilExplore[]>([])
const savedIds       = ref<Set<string>>(new Set())
const savedFeedbackId = ref<string | null>(null)
const pagination     = ref({ total: 0, page: 1, limit: 10, pages: 1 })
=======
interface Profile {
  id: number;
  name: string;
  role: string;
  school: string;
  city: string;
  score: number;
  recommendations: number;
  badges?: string[];
  recos?: Array<{ name: string; role: string }>;
}

const searchQuery = ref("");
const sidebarOpen = ref(true);
const savedFeedbackId = ref<string | null>(null);
const { isSaved, saveProfile } = useProSavedProfiles();

const profiles = ref<Profile[]>([
  {
    id: 1,
    name: "Nom Prenom",
    role: "Ex Developer Operation & Support",
    school: "Ex Dassault  Universite de Bretagne Occidentale",
    city: "Ex Tanger, Tanger-Tetouan-Hussima, Maroc",
    score: 90,
    recommendations: 500,
    badges: ["🌊 DevOps", "🌐 Web Developer", "🔐 Security Aware"],
    recos: [
      { name: "Nom Prof", role: "Ex Ecole Nationale des Sciences Appliques" },
      {
        name: "Nom Professionelle",
        role: "Ex Ecole Nationale des Sciences Appliques",
      },
    ],
  },
  {
    id: 2,
    name: "Nom Prenom",
    role: "Ex Developer Operation & Support",
    school: "Ex Dassault  Universite de Bretagne Occidentale",
    city: "Ex Tanger, Tanger-Tetouan-Hussima, Maroc",
    score: 75,
    recommendations: 500,
    badges: ["🌐 Web Developer", "🧠 AI / Data", "🏆 Hackathon Participant"],
    recos: [],
  },
]);
>>>>>>> c6bc05489cb3c5addd301459ec1ee473be200fec

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

// ─── Charger les sauvegardes existantes ───────
const chargerSauvegardes = async () => {
  try {
    const saved = await getMesSauvegardes()
    savedIds.value = new Set(saved.map(s => s.id_utilisateur))
  } catch {
    // silencieux
  }
}

// ─── Debounce sur la recherche ────────────────
const debouncedSearch = useDebounceFn(() => {
  pagination.value.page = 1
  chargerProfils()
}, 400)

watch(searchQuery, debouncedSearch)

// ─── Watch filtres ────────────────────────────
watch(filters, () => {
  pagination.value.page = 1
  chargerProfils()
}, { deep: true })

// ─── Init ─────────────────────────────────────
onMounted(() => {
  chargerProfils()
  chargerSauvegardes()
})

// ─── Sauvegarder / retirer ────────────────────
const toggleSavedProfile = async (profile: ProfilExplore) => {
  const id = profile.id_utilisateur
  try {
    if (savedIds.value.has(id)) {
      await supprimerSauvegarde(id)
      savedIds.value.delete(id)
    } else {
      await sauvegarderProfil(id)
      savedIds.value.add(id)
    }
    // forcer la réactivité
    savedIds.value = new Set(savedIds.value)

    savedFeedbackId.value = id
    window.setTimeout(() => {
      if (savedFeedbackId.value === id) savedFeedbackId.value = null
    }, 1200)
  } catch {
    error.value = 'Erreur lors de la sauvegarde'
  }
}

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
  filters.value = next;
};

const profileId = (profile: Profile) => `explore-pro-${profile.id}`;

const toggleSavedProfile = (profile: Profile) => {
  const id = profileId(profile);
  const saved = saveProfile({
    id,
    name: profile.name,
    school: profile.school,
    field: profile.role,
    city: profile.city,
    score: profile.score,
    recommendations: profile.recommendations,
    badges: profile.badges,
    hasPortfolio: true,
    profilePath: `/profile/student/${id}`,
    portfolioPath: `/projects/${id}`,
  });

  savedFeedbackId.value = id;
  window.setTimeout(() => {
    if (savedFeedbackId.value === id) savedFeedbackId.value = null;
  }, 1200);
};

const filteredProfiles = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return profiles.value;
  return profiles.value.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      p.school.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q),
  );
});

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
                  :class="{ saved: savedIds.has(profile.id_utilisateur) }"
                  :aria-label="savedIds.has(profile.id_utilisateur) ? 'Retirer' : 'Sauvegarder'"
                  @click="toggleSavedProfile(profile)"
                >
                  <Bookmark class="save-icon" />
                </button>

                <span
                  v-if="savedFeedbackId === profile.id_utilisateur"
                  class="save-feedback"
                >
                  {{ savedIds.has(profile.id_utilisateur) ? 'Profil sauvegardé' : 'Profil retiré' }}
                </span>

                <ProfileCard
                  :profile="adapterProfil(profile)"
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
.profile-save-wrap { position: relative; }
.save-profile-btn {
  position: absolute;
  right: 18px;
  top: 18px;
  z-index: 5;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: white;
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 8px 18px rgba(17, 24, 39, 0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.save-profile-btn.saved { background: #6c5ce7; border-color: #6c5ce7; color: white; }
.save-icon { width: 18px; height: 18px; }
.save-feedback {
  position: absolute;
  right: 62px;
  top: 22px;
  z-index: 6;
  border-radius: 9999px;
  background: rgb(15 23 42);
  color: white;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.2);
}
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