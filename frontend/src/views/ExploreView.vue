<script setup lang="ts">
import { ref, computed } from "vue";
import { Search, Bell, Globe } from "lucide-vue-next";
import Sidebar from "../components/explore/Sidebar.vue";
import Topbar from "../components/explore/Topbar.vue";
import ProfileCard from "../components/explore/ProfileCard.vue";
import FilterPanel from "../components/explore/FilterPanel.vue";

interface Profile {
  id: number;
  name: string;
  role: string;
  school: string;
  field: string;
  city: string;
  score: number;
  recommendations: number;
  recos?: Array<{ name: string; role: string }>;
}

const searchQuery = ref("");

const profiles = ref<Profile[]>([
  {
    id: 1,
    name: "Nom Prenom",
    role: "Ex Developer Operation & Support",
    school: "Ex Dassault Université de Bretagne Occidentale",
    field: "GINF",
    city: "Ex Tanger, Tanger-Tetouan-Al Hoceima, Maroc",
    score: 90,
    recommendations: 500,
    recos: [
      {
        name: "Nom Prof",
        role: "Ex commentaire de recommandation.",
      },
      {
        name: "Nom Professionnelle",
        role: "Ex commentaire de recommandation.",
      },
    ],
  },
  {
    id: 2,
    name: "Nom Prenom",
    role: "Ex Developer Operation & Support",
    school: "Ex Dassault Université de Bretagne Occidentale",
    field: "GSEA",
    city: "Ex Tanger, Tanger-Tetouan-Al Hoceima, Maroc",
    score: 85,
    recommendations: 400,
  },
]);

const filters = ref({
  year: 2026,
  school: "ENSA",
  field: "GINF",
  city: "Tanger",
  score: 80,
  skills: ["DevOps"],
  recommendations: 500,
});

const filteredProfiles = computed(() => {
  return profiles.value.filter((p) => {
    const matchesQuery =
      !searchQuery.value ||
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.role.toLowerCase().includes(searchQuery.value.toLowerCase());

    return matchesQuery;
  });
});
</script>

<template>
  <div
    class="min-h-screen w-screen overflow-x-hidden bg-[#eef1fb] text-slate-900"
  >
    <Topbar />

    <div class="flex min-h-[calc(100vh-60px)]">
      <Sidebar />

      <main class="flex-1 overflow-hidden">
        <div
          class="mx-auto flex h-full max-w-[1400px] flex-col gap-5 px-5 py-5"
        >
          <section
            class="rounded-xl bg-white px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
          >
            <div
              class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <h1 class="text-2xl font-semibold text-slate-950">Explore</h1>

              <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div class="relative w-full max-w-[280px]">
                  <Search
                    class="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search profiles..."
                    class="w-full rounded-lg border border-slate-200 bg-[#ececf4] py-2 pl-9 pr-4 text-xs text-slate-800 placeholder:text-slate-500 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <button
                  class="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#5b4df0] text-white shadow-sm transition hover:bg-[#4837d2]"
                >
                  <Bell class="h-3 w-3" />
                </button>
                <button
                  class="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Globe class="h-3 w-3 stroke-[2.2] text-slate-700" />
                  FR
                </button>
              </div>
            </div>
          </section>

          <div class="flex min-h-0 gap-5">
            <div class="flex-1 min-w-0 space-y-5 overflow-y-auto pr-0 sm:pr-4">
              <ProfileCard
                v-for="profile in filteredProfiles"
                :key="profile.id"
                :profile="profile"
              />
            </div>

            <FilterPanel :filters="filters" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
