<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Sidebar from '../components/explore/Sidebar.vue'
import Topbar from '../components/explore/Topbar.vue'
import ProfileCard from '../components/explore/ProfileCard.vue'
import FilterPanel from '../components/explore/FilterPanel.vue'

interface Profile {
  id: number
  name: string
  role: string
  school: string
  field: string
  city: string
  score: number
  year: number
  skills: string[]
  recommendations: number
}

interface Filters {
  year: number | null
  school: string | null
  field: string | null
  city: string | null
  scoreMin: number | null
  skills: string[]
  recMin: number | null
}

const searchQuery = ref('')
const selectedFilters = reactive<Filters>({
  year: null,
  school: null,
  field: null,
  city: null,
  scoreMin: null,
  skills: [],
  recMin: null
})

const profiles = ref<Profile[]>([
  {
    id: 1,
    name: 'Nora Bennis',
    role: 'UX Designer & Frontend',
    school: 'ENSA Tanger',
    field: 'GINF',
    city: 'Tangier',
    score: 94,
    year: 2026,
    skills: ['Figma', 'Vue.js', 'Tailwind'],
    recommendations: 120
  },
  {
    id: 2,
    name: 'Youssef Aarab',
    role: 'DevOps Engineer',
    school: 'ENSA Rabat',
    field: 'GSEA',
    city: 'Rabat',
    score: 88,
    year: 2025,
    skills: ['Docker', 'GitOps', 'CI/CD'],
    recommendations: 84
  },
  {
    id: 3,
    name: 'Imane El Hadi',
    role: 'Data Scientist',
    school: 'ENSA',
    field: 'GINF',
    city: 'Casablanca',
    score: 91,
    year: 2026,
    skills: ['Python', 'Machine Learning', 'SQL'],
    recommendations: 104
  },
  {
    id: 4,
    name: 'Rachid Bakkali',
    role: 'Full Stack Developer',
    school: 'ENSA Tanger',
    field: 'GINF',
    city: 'Tanger',
    score: 86,
    year: 2024,
    skills: ['Vue.js', 'Node.js', 'PostgreSQL'],
    recommendations: 65
  }
])

const filterOptions = {
  years: [2026, 2025, 2024],
  schools: ['ENSA', 'ENSA Tanger', 'ENSA Rabat'],
  fields: ['GINF', 'GSEA', 'FST'],
  cities: ['Tangier', 'Rabat', 'Casablanca'],
  scores: ['90', '80', '70'],
  skills: ['Vue.js', 'DevOps', 'Machine Learning', 'Backend', 'Figma'],
  recommendations: ['50', '100', '200']
}

const normalizedQuery = (value: string) => value.trim().toLowerCase()

const filteredProfiles = computed(() =>
  profiles.value.filter(profile => {
    const query = normalizedQuery(searchQuery.value)
    const matchesQuery =
      !query ||
      profile.name.toLowerCase().includes(query) ||
      profile.role.toLowerCase().includes(query) ||
      profile.school.toLowerCase().includes(query) ||
      profile.field.toLowerCase().includes(query) ||
      profile.city.toLowerCase().includes(query)

    const matchesYear = !selectedFilters.year || profile.year === selectedFilters.year
    const matchesSchool = !selectedFilters.school || profile.school === selectedFilters.school
    const matchesField = !selectedFilters.field || profile.field === selectedFilters.field
    const matchesCity = !selectedFilters.city || profile.city === selectedFilters.city
    const matchesScore =
      !selectedFilters.scoreMin || profile.score >= selectedFilters.scoreMin
    const matchesRec =
      !selectedFilters.recMin || profile.recommendations >= selectedFilters.recMin
    const matchesSkills =
      selectedFilters.skills.length === 0 ||
      selectedFilters.skills.every(skill => profile.skills.includes(skill))

    return (
      matchesQuery &&
      matchesYear &&
      matchesSchool &&
      matchesField &&
      matchesCity &&
      matchesScore &&
      matchesRec &&
      matchesSkills
    )
  })
)

const updateFilters = (filters: Filters) => Object.assign(selectedFilters, filters)

const resetFilters = () => {
  Object.assign(selectedFilters, {
    year: null,
    school: null,
    field: null,
    city: null,
    scoreMin: null,
    skills: [],
    recMin: null
  })
}
</script>

<template>
  <div class="min-h-screen bg-[#081224] text-slate-100">
    <div class="flex min-h-screen">
      <Sidebar />

      <main class="flex-1 px-4 py-5 sm:px-6 lg:px-8">
        <Topbar
          :searchQuery="searchQuery"
          @update:searchQuery="value => (searchQuery = value)"
        />

        <div class="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <section class="space-y-6">
            <div
              class="rounded-[32px] border border-slate-800/90 bg-[#0f172a]/95 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.9)]"
            >
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p class="text-sm uppercase tracking-[0.35em] text-cyan-300/70">
                    PheraCore Explorer
                  </p>
                  <h1 class="mt-2 text-3xl font-semibold text-white">
                    Découvrez les talents prêts à collaborer
                  </h1>
                </div>

                <div class="rounded-3xl bg-slate-950/80 px-4 py-3 text-sm text-slate-400">
                  <span class="font-semibold text-white">{{ filteredProfiles.length }}</span>
                  profils correspondants
                </div>
              </div>
            </div>

            <div class="space-y-5">
              <ProfileCard
                v-for="profile in filteredProfiles"
                :key="profile.id"
                :profile="profile"
              />
            </div>
          </section>

          <FilterPanel
            :filters="selectedFilters"
            :options="filterOptions"
            @update:filters="updateFilters"
            @clear-filters="resetFilters"
          />
        </div>
      </main>
    </div>
  </div>
</template>
