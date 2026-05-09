<script setup lang="ts">
import { ref, computed } from "vue";
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
        role: "Excellent travailleur des Sciences Appliquées",
      },
      {
        name: "Nom Professionnelle",
        role: "Ex commentaires de recommandations",
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
  <div class="flex h-screen bg-[#081224]">
    <Sidebar />

    <main class="flex-1 flex flex-col overflow-hidden">
      <Topbar v-model="searchQuery" />

      <div class="flex flex-1 overflow-hidden">
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <div class="space-y-5">
            <ProfileCard
              v-for="profile in filteredProfiles"
              :key="profile.id"
              :profile="profile"
            />
          </div>
        </div>

        <FilterPanel :filters="filters" />
      </div>
    </main>
  </div>
</template>
