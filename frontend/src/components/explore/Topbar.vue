<script setup lang="ts">
import { Search, Bell } from "lucide-vue-next";

interface Props {
  modelValue: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <header
    class="bg-[#0f1729] border-b border-slate-700/50 px-6 py-4 flex items-center justify-between gap-4"
  >
    <!-- Left: Title -->
    <div>
      <p class="text-xs font-semibold text-cyan-400 tracking-wider">EXPLORE</p>
      <h1 class="text-2xl font-bold text-slate-100 mt-1">Discover Talents</h1>
    </div>

    <!-- Center: Search -->
    <div class="flex-1 max-w-md">
      <div class="relative">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
        />
        <input
          :value="modelValue"
          @input="
            emit('update:modelValue', ($event.target as HTMLInputElement).value)
          "
          type="text"
          placeholder="Search profiles..."
          class="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50"
        />
      </div>
    </div>

    <!-- Right: Icons -->
    <div class="flex items-center gap-3">
      <button
        class="p-2 hover:bg-slate-800/50 rounded-lg text-slate-300 hover:text-slate-100 transition"
      >
        <Bell class="w-5 h-5" />
      </button>
      <div
        class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500"
      ></div>
    </div>
  </header>
</template>
