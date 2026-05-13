<script setup lang="ts">
import { computed, ref } from "vue";
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
const emit = defineEmits<{
  (e: "update:filters", value: Props["filters"]): void;
}>();

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

type SectionKey = (typeof sections)[number]["key"];

const isSelected = (key: SectionKey, option: string | number) => {
  if (key === "skills") return props.filters.skills.includes(String(option));
  if (key === "year") return props.filters.year === option;
  if (key === "school") return props.filters.school === option;
  if (key === "field") return props.filters.field === option;
  if (key === "city") return props.filters.city === option;
  if (key === "score") return props.filters.score === option;
  return props.filters.recommendations === option;
};

const toggleOption = (key: SectionKey, option: string | number) => {
  if (key === "skills") {
    const value = String(option);
    const nextSkills = props.filters.skills.includes(value)
      ? props.filters.skills.filter((s) => s !== value)
      : [...props.filters.skills, value];
    emit("update:filters", { ...props.filters, skills: nextSkills });
    return;
  }

  if (key === "year") {
    emit("update:filters", { ...props.filters, year: Number(option) });
    return;
  }
  if (key === "school") {
    emit("update:filters", { ...props.filters, school: String(option) });
    return;
  }
  if (key === "field") {
    emit("update:filters", { ...props.filters, field: String(option) });
    return;
  }
  if (key === "city") {
    emit("update:filters", { ...props.filters, city: String(option) });
    return;
  }
  if (key === "score") {
    emit("update:filters", { ...props.filters, score: String(option) });
    return;
  }
  emit("update:filters", { ...props.filters, recommendations: String(option) });
};

const expanded = ref<Record<string, boolean>>({});

const toggleMore = (key: SectionKey) => {
  expanded.value = { ...expanded.value, [key]: !expanded.value[key] };
};

const extraOptions: Record<SectionKey, Array<string | number>> = {
  year: [],
  school: ["Plus 1", "Plus 2"],
  field: ["Plus 1", "Plus 2"],
  city: ["Plus 1", "Plus 2"],
  score: ["60+", "50+"],
  skills: ["UI/UX", "Cloud", "AI"],
  recommendations: ["20+", "10+"],
};

const sectionOptions = computed(() => {
  const map = new Map<string, Array<string | number>>();
  for (const s of sections) {
    const isOpen = Boolean(expanded.value[s.key]);
    map.set(s.key, isOpen ? [...s.options, ...extraOptions[s.key]] : [...s.options]);
  }
  return map;
});
</script>

<template>
  <aside class="fp-wrap">
    <div class="fp-card">
      <div v-for="section in sections" :key="section.title" class="fp-section">
        <h4 class="fp-title">{{ section.title }}</h4>
        <div class="fp-pillsRow">
          <button
            v-for="option in sectionOptions.get(section.key) ?? section.options"
            :key="option"
            type="button"
            class="fp-pill"
            :class="{
              'fp-pillActive': isSelected(section.key, option),
              'fp-pillYear': section.key === 'year',
            }"
            @click="toggleOption(section.key, option)"
          >
            {{ option }}
          </button>
        </div>
        <div class="fp-plusRow">
          <button
            type="button"
            class="fp-pill fp-plus"
            @click="toggleMore(section.key)"
          >
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
  padding: 0 14px;
  border-radius: 100px 180px 0px 100px;
  border: 2px solid rgba(107, 114, 128, 0.65);
  background: #ffffff;
  color: #6b7280;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.fp-pill:hover {
  border-color: rgba(107, 114, 128, 0.9);
  color: #334155;
}

.fp-pillActive {
  background: var(--purple);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 100px 180px 0px 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.fp-pillYear {
  color: #111827;
}

.fp-plusRow {
  margin-top: 8px;
}

.fp-plus {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-start;
  padding-left: 14px;
  color: #6b7280;
  border-color: rgba(107, 114, 128, 0.45);
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
