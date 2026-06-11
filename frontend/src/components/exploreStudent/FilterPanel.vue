<script setup lang="ts">
import { computed, ref } from "vue";
import { ChevronDown } from "../../lib/icons";

interface Props {
  // The parent may use French or English keys (filiere/field, ville/city, competences/skills).
  // Accept a loose shape and handle keys defensively in the component.
  filters: Record<string, any>;
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
      "Informatique",
      "Reseaux et Telecoms",
      "Data Science",
      "Cybersecurite",
      "IA",
      "Developpement",
      "DevOps",
      "Cloud",
      "Marketing",
      "Design",
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
  const f: Record<string, any> = props.filters || {};

  if (key === "skills") {
    const skills: string[] = f.skills ?? f.competences ?? [];
    return Array.isArray(skills) && skills.includes(String(option));
  }

  if (key === "year") return f.year === option;

  if (key === "school") return f.school === option;

  if (key === "field") {
    return (f.field ?? f.filiere) === option;
  }

  if (key === "city") return (f.city ?? f.ville) === option;

  if (key === "score") return f.score === option;

  return (f.recommendations ?? f.recommandations) === option;
};

const toggleOption = (key: SectionKey, option: string | number) => {
  const f: Record<string, any> = props.filters || {};

  if (key === "skills") {
    const value = String(option);
    const currentSkills: string[] = f.skills ?? f.competences ?? [];
    const nextSkills = Array.isArray(currentSkills) && currentSkills.includes(value)
      ? currentSkills.filter((s) => s !== value)
      : [...(Array.isArray(currentSkills) ? currentSkills : []), value];

    // Preserve parent's property name if using French key
    if (f.competences !== undefined) {
      emit("update:filters", { ...f, competences: nextSkills });
    } else {
      emit("update:filters", { ...f, skills: nextSkills });
    }
    return;
  }

  if (key === "year") {
    const nextValue = f.year === Number(option) ? "" : Number(option);
    emit("update:filters", { ...f, year: nextValue });
    return;
  }

  if (key === "school") {
    const nextValue = f.school === String(option) ? "" : String(option);
    emit("update:filters", { ...f, school: nextValue });
    return;
  }

  if (key === "field") {
    const currentValue = f.field ?? f.filiere ?? "";
    const nextValue = currentValue === String(option) ? "" : String(option);

    if (f.filiere !== undefined) {
      emit("update:filters", { ...f, filiere: nextValue });
    } else {
      emit("update:filters", { ...f, field: nextValue });
    }
    return;
  }

  if (key === "city") {
    const currentValue = f.city ?? f.ville ?? "";
    const nextValue = currentValue === String(option) ? "" : String(option);

    if (f.ville !== undefined) {
      emit("update:filters", { ...f, ville: nextValue });
    } else {
      emit("update:filters", { ...f, city: nextValue });
    }
    return;
  }

  if (key === "score") {
    const currentValue = String(f.score ?? "");
    const nextValue = currentValue === String(option) ? undefined : String(option);
    emit("update:filters", { ...f, score: nextValue });
    return;
  }

  const currentValue = f.recommendations ?? f.recommandations ?? "";
  const nextValue = currentValue === String(option) ? "" : String(option);

  if (f.recommandations !== undefined) {
    emit("update:filters", { ...f, recommandations: nextValue });
  } else {
    emit("update:filters", { ...f, recommendations: nextValue });
  }
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
  height: 100%;
  background: var(--white);
  border: 1px solid var(--overlay-slate-08);
  border-radius: 0;
  padding: 8px 14px 0;
  box-shadow: 0 14px 30px var(--overlay-slate-08);
  max-height: 100%;
  overflow-y: auto;
}

.fp-section + .fp-section {
  margin-top: 14px;
}

.fp-title {
  font-size: 12px;
  font-weight: 800;
  color: rgb(2 6 23);
  margin-bottom: 8px;
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
  border: 1px solid var(--text-light);
  background: var(--white);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 2px 8px var(--overlay-black-06);
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.fp-pill:hover {
  border-color: var(--text-slate);
  color: var(--text-strong);
}

.fp-pillActive {
  border: 2px solid #5b4dff;
  background: #f1f1f5;
  color: var(--navy);
  box-shadow: 0 2px 8px var(--overlay-slate-08);
  font-weight: 900;
}

.fp-pillActive:hover {
  background: #e9e9ef;
}

.fp-pillYear {
  padding: 0 16px;
}

.fp-plusRow {
  margin-top: 5px;
}

.fp-plus {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: flex-start;
  padding-left: 14px;
  color: var(--text-neutral);
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

