<script setup lang="ts">
import FilterPanel from "../components/exploreStudent/FilterPanel.vue";
import ProfileCard from "../components/exploreStudent/ProfileCard.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import { Bell, ChevronDown, Search } from "lucide-vue-next";
import { computed, ref } from "vue";

interface Profile {
  id: number;
  name: string;
  role: string;
  school: string;
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
    school: "Ex Dassault  Universite de Bretagne Occidentale",
    city: "Ex Tanger, Tanger-Tetouan-Hussima, Maroc",
    score: 90,
    recommendations: 500,
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
    score: 85,
    recommendations: 500,
    recos: [],
  },
]);

const filters = ref({
  year: 2026,
  school: "ENSA",
  field: "GINF",
  city: "Tanger",
  score: "80+",
  skills: ["DevOps"],
  recommendations: "500+",
});

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

const handleNotification = () => {
  alert("Notifications clicked!");
};

const handleUpdateFilters = (next: typeof filters.value) => {
  filters.value = next;
};

const sidebarOpen = ref(true);
</script>

<template>
  <div class="explore-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarProf :isOpen="sidebarOpen" />

    <div class="explore-shell" :class="{ 'explore-shellShift': sidebarOpen }">

      <main class="explore-middle">
        <div class="explore-middle-inner">
          <div class="explore-panel">
            <section class="explore-header">
              <h1 class="explore-title">Explore</h1>

              <div class="explore-actions">
                <div class="explore-search">
                  <input v-model="searchQuery" type="text" />
                  <Search class="explore-search-icon" />
                </div>

                <button
                  type="button"
                  class="explore-notif"
                  @click="handleNotification"
                >
                  <span class="explore-notif-dot" />
                  <Bell class="h-4 w-4" />
                </button>

                <button type="button" class="explore-profile">
                  <span class="explore-flag">FR</span>
                  <ChevronDown class="h-4 w-4" />
                </button>
              </div>
            </section>

            <div class="explore-feed">
              <ProfileCard
                v-for="profile in filteredProfiles"
                :key="profile.id"
                :profile="profile"
                :default-expanded="profile.id === 1"
              />
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
  padding-top: 60px;
}

.explore-shell {
  height: calc(100vh - 60px);
  display: grid;
  grid-template-columns: 1fr 290px;
  gap: 24px;
  padding: 18px 20px;
  overflow: hidden;
}

.explore-right {
  position: sticky;
  top: 0;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 8px;
}

.explore-shellShift {
  padding-left: 240px;
}

.explore-middle {
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 18px 0 18px;
}

.explore-middle-inner {
  margin: 0 auto;
  width: 100%;
  max-width: 900px;
  padding: 0 20px;
}

.explore-panel {
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.09);
  overflow: hidden;
}

.explore-header {
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.explore-title {
  font-size: 28px;
  line-height: 1;
  font-weight: 650;
  color: rgb(2 6 23);
}

.explore-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.explore-search {
  position: relative;
  width: 340px;
}

.explore-search input {
  height: 36px;
  width: 100%;
  border-radius: 9999px;
  border: 1px solid rgb(226 232 240);
  background: #eef0f6;
  padding: 0 40px 0 14px;
  font-size: 12px;
  font-weight: 600;
  color: rgb(51 65 85);
  outline: none;
}

.explore-search input:focus {
  border-color: #6c5ce7;
  box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.12);
}

.explore-search-icon {
  pointer-events: none;
  position: absolute;
  right: 14px;
  top: 50%;
  height: 16px;
  width: 16px;
  transform: translateY(-50%);
  color: rgb(148 163 184);
}

.explore-notif {
  position: relative;
  display: inline-flex;
  height: 36px;
  width: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #4f46e5;
  color: white;
  box-shadow: 0 8px 18px rgba(79, 70, 229, 0.25);
  transition: background 0.15s ease;
}

.explore-notif:hover {
  background: #4338ca;
}

.explore-notif-dot {
  position: absolute;
  right: -2px;
  top: -2px;
  height: 10px;
  width: 10px;
  border-radius: 9999px;
  background: rgb(244 63 94);
  box-shadow: 0 0 0 2px #ffffff;
}

.explore-profile {
  display: inline-flex;
  height: 36px;
  align-items: center;
  gap: 8px;
  border-radius: 9999px;
  background: #0ea5b7;
  color: white;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(14, 165, 183, 0.25);
  transition: background 0.15s ease;
}

.explore-profile:hover {
  background: #0b93a3;
}

.explore-flag {
  display: inline-flex;
  height: 16px;
  width: 16px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.22);
  font-size: 10px;
  font-weight: 800;
}

.explore-feed {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 18px 18px;
  background: #ffffff;
}
</style>

