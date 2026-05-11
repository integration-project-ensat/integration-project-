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
    name: "Amine Bennani",
    role: "Full Stack Developer",
    school: "ENSA",
    field: "GINF",
    city: "Tanger",
    score: 92,
    recommendations: 520,
    skills: ["DevOps", "Vue.js", "Docker"],
    recos: [
      {
        name: "Sofia El Fassi",
        role: "Excellent collaborateur sur les projets cloud",
      },
      {
        name: "Youssef Kher",
        role: "Très bon sens de l'architecture logicielle",
      },
    ],
  },
  {
    id: 2,
    name: "Lina Bouziane",
    role: "Data Analyst",
    school: "ENSAM",
    field: "GSEA",
    city: "Rabat",
    score: 88,
    recommendations: 430,
    skills: ["Python", "SQL", "PowerBI"],
    recos: [],
  },
  {
    id: 3,
    name: "Rayan Saidi",
    role: "DevOps Engineer",
    school: "FST",
    field: "GSR",
    city: "Fes",
    score: 87,
    recommendations: 380,
    skills: ["Kubernetes", "AWS", "Terraform"],
    recos: [],
  },
  {
    id: 4,
    name: "Sara Idrissi",
    role: "UI/UX Designer",
    school: "ENSA",
    field: "GINF",
    city: "Tanger",
    score: 84,
    recommendations: 320,
    skills: ["Figma", "Adobe XD", "Web Design"],
    recos: [],
  },
  {
    id: 5,
    name: "Yassine Najib",
    role: "Mobile Developer",
    school: "ENSA",
    field: "GSEA",
    city: "Casablanca",
    score: 90,
    recommendations: 470,
    skills: ["Flutter", "React Native"],
    recos: [],
  },
  {
    id: 6,
    name: "Meryem Ziani",
    role: "Cybersecurity Specialist",
    school: "ENSAM",
    field: "GINF",
    city: "Rabat",
    score: 86,
    recommendations: 410,
    skills: ["Pentesting", "Network Security"],
    recos: [],
  },
  {
    id: 7,
    name: "Nabil Haddad",
    role: "Cloud Architect",
    school: "FST",
    field: "GSR",
    city: "Fes",
    score: 89,
    recommendations: 450,
    skills: ["Azure", "Docker", "CI/CD"],
    recos: [],
  },
  {
    id: 8,
    name: "Fatima Zahra",
    role: "Product Manager",
    school: "ENSA",
    field: "GINF",
    city: "Tanger",
    score: 83,
    recommendations: 340,
    skills: ["Roadmapping", "Agile"],
    recos: [],
  },
  {
    id: 9,
    name: "Omar El Amrani",
    role: "QA Engineer",
    school: "ENSAM",
    field: "GSEA",
    city: "Rabat",
    score: 82,
    recommendations: 300,
    skills: ["Test Automation", "Selenium"],
    recos: [],
  },
  {
    id: 10,
    name: "Salma Hachimi",
    role: "AI Researcher",
    school: "FST",
    field: "GINF",
    city: "Fes",
    score: 91,
    recommendations: 510,
    skills: ["Machine Learning", "TensorFlow"],
    recos: [],
  },
  {
    id: 11,
    name: "Hakim Boudhir",
    role: "Back-end Developer",
    school: "ENSA",
    field: "GSR",
    city: "Mohammedia",
    score: 88,
    recommendations: 420,
    skills: ["Node.js", "Express"],
    recos: [],
  },
  {
    id: 12,
    name: "Nora Amraoui",
    role: "Digital Marketing",
    school: "ENSAM",
    field: "GSEA",
    city: "Rabat",
    score: 80,
    recommendations: 295,
    skills: ["SEO", "Content Strategy"],
    recos: [],
  },
  {
    id: 13,
    name: "Youssef Chraibi",
    role: "Frontend Developer",
    school: "FST",
    field: "GINF",
    city: "Casablanca",
    score: 86,
    recommendations: 390,
    skills: ["Vue.js", "Tailwind"],
    recos: [],
  },
  {
    id: 14,
    name: "Imane Kabbaj",
    role: "Business Analyst",
    school: "ENSA",
    field: "GSEA",
    city: "Tanger",
    score: 85,
    recommendations: 375,
    skills: ["Excel", "PowerBI"],
    recos: [],
  },
  {
    id: 15,
    name: "Rachid Elmouden",
    role: "Systems Engineer",
    school: "ENSAM",
    field: "GSR",
    city: "Rabat",
    score: 87,
    recommendations: 405,
    skills: ["Linux", "Virtualization"],
    recos: [],
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

const language = ref("FR");

const handleNotification = () => {
  alert("Notifications clicked!");
};

const toggleLanguage = () => {
  language.value = language.value === "FR" ? "EN" : "FR";
};
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
                  type="button"
                  class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-[#5b4df0] text-white shadow-sm transition hover:bg-[#4837d2]"
                  @click="handleNotification"
                >
                  <Bell class="h-3 w-3" />
                </button>
                <button
                  type="button"
                  class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  @click="toggleLanguage"
                >
                  <Globe class="h-3 w-3 stroke-[2.2] text-slate-700" />
                  {{ language }}
                </button>
              </div>
            </div>
          </section>

          <div class="flex min-h-0 gap-5 overflow-hidden">
            <div
              class="flex-1 min-w-0 space-y-5 overflow-y-auto pr-0 sm:pr-4 scroll-smooth"
              style="scrollbar-width: none; -ms-overflow-style: none"
            >
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
