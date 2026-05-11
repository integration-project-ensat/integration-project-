<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";

interface Props {
  filters: {
    year: number;
    school: string;
    field: string;
    city: string;
    score: number;
    skills: string[];
    recommendations: number;
  };
}

defineProps<Props>();

const sections = [
  {
    title: "Année",
    options: [2026, 2025, 2024],
    key: "year",
    type: "number",
  },
  {
    title: "Ecole/Faculte",
    options: ["ENSA", "ENSAM", "FST"],
    key: "school",
    type: "text",
  },
  {
    title: "Filiere",
    options: ["GSR", "GINF", "GSEA"],
    key: "field",
    type: "text",
  },
  {
    title: "Ville",
    options: ["Tanger", "Rabat", "Fes"],
    key: "city",
    type: "text",
  },
  {
    title: "Score",
    options: ["90+", "80+", "70+"],
    key: "score",
    type: "number",
  },
  {
    title: "Competences",
    options: ["KiCad", "Sec.", "DevOps"],
    key: "skills",
    type: "text",
  },
  {
    title: "Recommendations",
    options: ["500+", "100+", "50+"],
    key: "recommendations",
    type: "number",
  },
];
</script>

<template>
  <aside
    class="w-72 bg-[#0f1729] border-l border-slate-700/50 p-5 overflow-y-auto"
  >
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <p class="text-xs font-semibold text-cyan-400 tracking-wider">
          FILTERS
        </p>
        <h3 class="text-lg font-bold text-slate-100 mt-2">Refine Search</h3>
      </div>

      <!-- Filter Sections -->
      <template v-for="section in sections" :key="section.title">
        <div>
          <p class="text-xs font-semibold text-slate-300 mb-3">
            {{ section.title }}
          </p>
          <div class="flex flex-wrap gap-2">
            <template v-for="option in section.options" :key="option">
              <button
                :class="[
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition',
                  (
                    section.key === 'skills'
                      ? filters.skills.includes(String(option))
                      : filters[section.key as keyof typeof filters] === option
                  )
                    ? 'bg-purple-600/20 border-purple-400 text-purple-200'
                    : 'border-slate-600 text-slate-300 hover:border-slate-500 hover:text-slate-100',
                ]"
              >
                {{ option }}
              </button>
            </template>
            <button
              class="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-600 text-slate-400 hover:text-slate-300 transition flex items-center gap-1"
            >
              Plus
              <ChevronDown class="w-3 h-3" />
            </button>
          </div>
        </div>
      </template>
    </div>
  </aside>
</template>
