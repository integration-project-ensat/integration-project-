<template>
  <aside
    class="w-full max-w-xs space-y-6 rounded-[32px] border border-slate-800/90 bg-[#0f172a]/95 p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.9)] lg:block"
  >
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.35em] text-cyan-300/80">
          Filtres
        </p>
        <h3 class="text-xl font-semibold text-white">Affiner la recherche</h3>
      </div>
      <button
        @click="clearFilters"
        class="text-sm text-slate-400 transition hover:text-white"
      >
        Effacer
      </button>
    </div>

    <section class="space-y-4">
      <div>
        <p class="text-sm font-semibold text-slate-200">Année</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="year in options.years"
            :key="year"
            type="button"
            @click="setFilter('year', year)"
            :class="buttonClass(filters.year === year)"
          >
            {{ year }}
          </button>
        </div>
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-200">École</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="school in options.schools"
            :key="school"
            type="button"
            @click="setFilter('school', school)"
            :class="buttonClass(filters.school === school)"
          >
            {{ school }}
          </button>
        </div>
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-200">Filière</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="field in options.fields"
            :key="field"
            type="button"
            @click="setFilter('field', field)"
            :class="buttonClass(filters.field === field)"
          >
            {{ field }}
          </button>
        </div>
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-200">Ville</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="city in options.cities"
            :key="city"
            type="button"
            @click="setFilter('city', city)"
            :class="buttonClass(filters.city === city)"
          >
            {{ city }}
          </button>
        </div>
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-200">Score</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="score in options.scores"
            :key="score"
            type="button"
            @click="setFilter('scoreMin', Number(score))"
            :class="buttonClass(filters.scoreMin === Number(score))"
          >
            {{ score }}
          </button>
        </div>
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-200">Compétences</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="skill in options.skills"
            :key="skill"
            type="button"
            @click="toggleArrayFilter('skills', skill)"
            :class="buttonClass(filters.skills.includes(skill))"
          >
            {{ skill }}
          </button>
        </div>
      </div>
      <div>
        <p class="text-sm font-semibold text-slate-200">Recommandations</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="rec in options.recommendations"
            :key="rec"
            type="button"
            @click="setFilter('recMin', Number(rec))"
            :class="buttonClass(filters.recMin === Number(rec))"
          >
            {{ rec }}+
          </button>
        </div>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">

interface FilterState {
  year: number | null;
  school: string | null;
  field: string | null;
  city: string | null;
  scoreMin: number | null;
  skills: string[];
  recMin: number | null;
}

interface FilterOptions {
  years: number[];
  schools: string[];
  fields: string[];
  cities: string[];
  scores: string[];
  skills: string[];
  recommendations: string[];
}

const props = defineProps<{
  filters: FilterState;
  options: FilterOptions;
}>();

const emit = defineEmits<{
  (e: "update:filters", filters: FilterState): void;
  (e: "clear-filters"): void;
}>();

type SingleFilterKey = Exclude<keyof FilterState, "skills">;

const emitNextFilters = (next: FilterState) => {
  emit("update:filters", next);
};

const setScalarFilter = (key: SingleFilterKey, value: string | number) => {
  const nextValue = props.filters[key] === value ? null : value;
  emitNextFilters({
    ...props.filters,
    skills: [...props.filters.skills],
    [key]: nextValue,
  });
};

const setFilter = (key: SingleFilterKey, value: string | number) => {
  setScalarFilter(key, value);
};

const toggleArrayFilter = (_key: "skills", value: string) => {
  const skills = [...props.filters.skills];
  const index = skills.indexOf(value);
  if (index === -1) skills.push(value);
  else skills.splice(index, 1);
  emitNextFilters({ ...props.filters, skills });
};

const clearFilters = () => emit("clear-filters");

const buttonClass = (active: boolean) => {
  return [
    "rounded-full border px-4 py-2 text-sm transition-colors duration-200",
    active
      ? "border-cyan-400 bg-cyan-500/15 text-cyan-200"
      : "border-slate-700 bg-slate-950/70 text-slate-400 hover:border-slate-500 hover:text-slate-200",
  ].join(" ");
};
</script>
