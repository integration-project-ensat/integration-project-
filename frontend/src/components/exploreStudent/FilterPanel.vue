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
  {
    title: "Annee",
    key: "year",
    options: [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018],
  },
  {
    title: "Ecole/Faculte",
    key: "school",
    options: [
      "ENSA",
      "ENSAM",
      "FST",
      "EMI",
      "INPT",
      "EHTP",
      "ENSEM",
      "ENSET",
      "ENSIAS",
      "ENCG",
      "UIR",
      "UM6P",
      "EMSI",
      "SUPMTI",
      "1337",
      "YouCode",
    ],
  },
  {
    title: "Filiere",
    key: "field",
    options: [
      "GINF",
      "GSTR",
      "GSEA",
      "GIL",
      "GTR",
      "IID",
      "Data Science",
      "Cybersecurity",
      "IA",
      "DevOps",
      "Cloud",
      "Big Data",
      "Web",
      "Mobile",
      "Réseaux",
    ],
  },
  {
    title: "Ville",
    key: "city",
    options: [
      "Tanger",
      "Rabat",
      "Fès",
      "Casablanca",
      "Marrakech",
      "Agadir",
      "Oujda",
      "Tetouan",
      "Kenitra",
      "Meknes",
      "El Jadida",
      "Safi",
      "Beni Mellal",
      "Nador",
      "Settat",
      "Taza",
      "Khouribga",
      "Mohammedia",
      "Laayoune",
      "Dakhla",
    ],
  },
  {
    title: "Score",
    key: "score",
    options: [
      "95+",
      "90+",
      "85+",
      "80+",
      "75+",
      "70+",
      "65+",
      "60+",
      "55+",
      "50+",
      "45+",
      "40+",
      "35+",
      "30+",
    ],
  },
  {
    title: "Competences",
    key: "skills",
    options: [
      "Java",
      "Python",
      "Spring",
      "React",
      "Vue.js",
      "Node.js",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "DevOps",
      "Linux",
      "Git",
      "Cybersecurity",
      "AWS",
      "Figma",
      "Flutter",
    ],
  },
  {
    title: "Recommandations",
    key: "recommendations",
    options: ["1000+", "500+", "300+", "200+", "100+", "50+", "20+"],
  },
] as const;

type SectionKey = (typeof sections)[number]["key"];
const INITIAL_VISIBLE_OPTIONS = 3;
const VISIBLE_OPTIONS_STEP = 3;

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

const visibleCounts = ref<Record<string, number>>({});

const showMore = (key: SectionKey) => {
  const section = sections.find((item) => item.key === key);
  if (!section) return;

  const currentCount = visibleCounts.value[key] ?? INITIAL_VISIBLE_OPTIONS;

  visibleCounts.value = {
    ...visibleCounts.value,
    [key]: Math.min(currentCount + VISIBLE_OPTIONS_STEP, section.options.length),
  };
};

const showLess = (key: SectionKey) => {
  visibleCounts.value = {
    ...visibleCounts.value,
    [key]: INITIAL_VISIBLE_OPTIONS,
  };
};

const visibleCountFor = (key: SectionKey) => {
  return visibleCounts.value[key] ?? INITIAL_VISIBLE_OPTIONS;
};

const sectionOptions = computed(() => {
  const map = new Map<string, Array<string | number>>();
  for (const s of sections) {
    map.set(s.key, [...s.options].slice(0, visibleCountFor(s.key)));
  }
  return map;
});

const canToggleMore = (key: SectionKey) => {
  const section = sections.find((item) => item.key === key);
  return Boolean(section && section.options.length > INITIAL_VISIBLE_OPTIONS);
};

const hasMoreOptions = (key: SectionKey) => {
  const section = sections.find((item) => item.key === key);
  return Boolean(section && visibleCountFor(key) < section.options.length);
};

const isExpanded = (key: SectionKey) => {
  return visibleCountFor(key) > INITIAL_VISIBLE_OPTIONS;
};
</script>

<template>
  <aside class="fp-wrap">
    <div class="fp-card">
      <div v-for="section in sections" :key="section.title" class="fp-section">
        <h4 class="fp-title">{{ section.title }}</h4>
        <TransitionGroup
          name="fp-pillFade"
          tag="div"
          class="fp-pillsRow"
          :class="{ 'fp-pillsRowYear': section.key === 'year' }"
        >
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
        </TransitionGroup>
        <div v-if="canToggleMore(section.key)" class="fp-plusRow">
          <button
            v-if="hasMoreOptions(section.key)"
            type="button"
            class="fp-pill fp-plus"
            @click="showMore(section.key)"
          >
            Plus
            <ChevronDown class="h-3 w-3" />
          </button>
          <button
            v-if="isExpanded(section.key)"
            type="button"
            class="fp-pill fp-plus"
            @click="showLess(section.key)"
          >
            Voir moins
            <ChevronDown class="h-3 w-3 fp-plusIconOpen" />
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

.fp-pillFade-enter-active,
.fp-pillFade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.fp-pillFade-enter-from,
.fp-pillFade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.fp-pillsRowYear {
  flex-wrap: wrap;
}

.fp-pill {
  height: 24px;
  padding: 0 14px;
  border-radius: 100px 180px 0px 100px;
  border: 1px solid rgb(148 163 184);
  background: #ffffff;
  color: rgb(71 85 105);
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
  border-color: rgb(100 116 139);
  color: rgb(15 23 42);
}

.fp-pillActive {
  border: 2px solid #5b4dff;
  background: #f1f1f5;
  color: #111827;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
  font-weight: 900;
}

.fp-pillActive:hover {
  background: #e9e9ef;
}

.fp-pillYear {
  padding: 0 16px;
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
  background: transparent;
}

.fp-plusIconOpen {
  transform: rotate(180deg);
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
