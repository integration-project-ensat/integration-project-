<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";

interface Props {
  filters: {
    year: number;
    school: string;
    field: string;
    city: string;
    score: string;
    skills: string[];
    recommendations: string;
  };
}

const props = defineProps<Props>();

const sections = [
  { title: "Annee", key: "year", options: [2026, 2025, 2024] },
  { title: "Ecole/Faculte", key: "school", options: ["ENSA", "ENSAM", "FST"] },
  { title: "Filiere", key: "field", options: ["GSR", "GINF", "GSEA"] },
  { title: "Ville", key: "city", options: ["Tanger", "Rabat", "Fes"] },
  { title: "Score", key: "score", options: ["90+", "80+", "70+"] },
  { title: "Competences", key: "skills", options: ["KiCad", "Sec.", "DevOps"] },
  {
    title: "Recommandations",
    key: "recommendations",
    options: ["500+", "100+", "50+"],
  },
] as const;

const isSelected = (key: (typeof sections)[number]["key"], option: string | number) => {
  if (key === "skills") return props.filters.skills.includes(String(option));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (props.filters as any)[key] === option;
};
</script>

<template>
  <aside class="fp-wrap">
    <div class="fp-card">
      <div v-for="section in sections" :key="section.title" class="fp-section">
        <h4 class="fp-title">{{ section.title }}</h4>
        <div class="fp-pillsRow">
          <button
            v-for="option in section.options"
            :key="option"
            type="button"
            class="fp-pill"
            :class="{ 'fp-pillActive': isSelected(section.key, option) }"
          >
            {{ option }}
          </button>
        </div>
        <div class="fp-plusRow">
          <button type="button" class="fp-pill fp-plus">
            Plus
            <ChevronDown class="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.fp-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
}

.fp-card {
  width: 100%;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  padding: 16px 14px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
  max-height: 100%;
  overflow-y: auto;
}

.fp-section + .fp-section {
  margin-top: 18px;
}

.fp-title {
  font-size: 12px;
  font-weight: 800;
  color: rgb(2 6 23);
  margin-bottom: 10px;
}

.fp-pillsRow {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 12px;
}

.fp-pill {
  height: 28px;
  padding: 0 16px;
  border-radius: 9999px;
  border: 1.5px solid rgba(15, 23, 42, 0.45);
  background: #ffffff;
  color: rgb(71 85 105);
  font-size: 12px;
  font-weight: 800;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.fp-pill:hover {
  border-color: rgba(15, 23, 42, 0.65);
  color: rgb(15 23 42);
}

.fp-pillActive {
  border-color: #6c5ce7;
  background: rgba(108, 92, 231, 0.16);
  color: rgb(2 6 23);
}

.fp-plusRow {
  margin-top: 8px;
}

.fp-plus {
  border-color: rgba(15, 23, 42, 0.25);
  color: rgb(100 116 139);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.fp-card::-webkit-scrollbar {
  width: 8px;
}

.fp-card::-webkit-scrollbar-track {
  background: rgba(2, 6, 23, 0.04);
  border-radius: 9999px;
}

.fp-card::-webkit-scrollbar-thumb {
  background: rgba(2, 6, 23, 0.16);
  border-radius: 9999px;
}

.fp-card {
  scrollbar-width: thin;
  scrollbar-color: rgba(2, 6, 23, 0.2) rgba(2, 6, 23, 0.05);
}
</style>
