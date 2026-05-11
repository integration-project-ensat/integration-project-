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
  <aside class="w-[270px] flex-shrink-0 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
    <div class="space-y-6">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Filtres
        </p>
        <h3 class="mt-2 text-sm font-semibold text-slate-950">Affiner la recherche</h3>
      </div>

      <template v-for="section in sections" :key="section.title">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-3">
            {{ section.title }}
          </p>
          <div class="flex flex-wrap gap-2">
            <template v-for="option in section.options" :key="option">
              <button
                :class="[
                  'rounded-full px-3 py-2 text-xs font-semibold transition',
                  section.key === 'skills'
                    ? filters.skills.includes(String(option))
                      ? 'bg-[#f3efff] border border-[#6c5ce7] text-[#6c5ce7]'
                      : 'border border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                    : filters[section.key as keyof typeof filters] === option
                      ? 'bg-[#f3efff] border border-[#6c5ce7] text-[#6c5ce7]'
                      : 'border border-slate-300 bg-white text-slate-600 hover:border-slate-400',
                ]"
              >
                {{ option }}
              </button>
            </template>
            <button class="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-slate-400 hover:text-slate-700">
              Plus
              <ChevronDown class="h-3 w-3" />
            </button>
          </div>
        </div>
      </template>
    </div>
  </aside>
</template>
