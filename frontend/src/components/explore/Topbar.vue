<template>
  <header
    class="flex flex-col gap-4 rounded-[28px] bg-[#111827] p-5 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.85)] sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="space-y-1">
      <p class="text-sm uppercase tracking-[0.35em] text-cyan-300/80">
        Explore
      </p>
      <h2 class="text-2xl font-semibold text-white">
        Découvre les talents du moment
      </h2>
    </div>

    <div
      class="flex w-full items-center gap-3 rounded-3xl bg-slate-950/80 px-4 py-3 sm:max-w-md"
    >
      <Search class="h-5 w-5 text-slate-400" />
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Recherche par nom, école, ville..."
        class="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
      />
    </div>

    <div class="flex items-center gap-3">
      <button
        class="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-slate-300 transition hover:bg-slate-800"
      >
        <Bell class="h-5 w-5" />
      </button>
      <div class="flex items-center gap-3 rounded-3xl bg-slate-900 px-4 py-3">
        <div
          class="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500"
        ></div>
        <div class="hidden text-right sm:block">
          <p class="text-sm text-slate-300">Salma Benali</p>
          <p class="text-xs text-slate-500">Responsable Talent</p>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Bell, Search } from "lucide-vue-next";
import { computed } from "vue";

const props = withDefaults(defineProps<{ searchQuery?: string }>(), {
  searchQuery: "",
});

const emit = defineEmits<{
  "update:searchQuery": [value: string];
}>();

const searchQuery = computed({
  get: () => props.searchQuery,
  set: (value) => emit("update:searchQuery", value),
});
</script>
