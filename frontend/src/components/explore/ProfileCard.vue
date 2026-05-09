<script setup lang="ts">
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

defineProps<{ profile: Profile }>();
</script>

<template>
  <div class="bg-[#1a2847] rounded-lg border border-slate-700/30 p-5 space-y-4">
    <!-- Header with profile info -->
    <div class="flex gap-4">
      <!-- Avatar -->
      <div
        class="w-20 h-20 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex-shrink-0 flex items-center justify-center text-sm font-semibold text-slate-900"
      >
        {{
          profile.name
            .split(" ")
            .map((n) => n[0])
            .join("")
        }}
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="text-lg font-semibold text-slate-100">
            {{ profile.name }}
          </h3>
          <span
            class="inline-block bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            >{{ profile.score }}+</span
          >
        </div>
        <p class="text-sm text-slate-400 mt-1">{{ profile.role }}</p>
        <p class="text-xs text-slate-500 mt-2">{{ profile.school }}</p>
        <p class="text-xs text-slate-500">{{ profile.city }}</p>
        <a
          href="#"
          class="text-xs text-cyan-400 hover:text-cyan-300 mt-1 inline-block"
          >Contact info</a
        >
      </div>

      <!-- Right side -->
      <div class="text-right">
        <p class="text-sm text-slate-300">
          <span class="font-semibold text-slate-100"
            >{{ profile.recommendations }}+</span
          >
          <span class="text-slate-400"> recos</span>
        </p>
      </div>
    </div>

    <!-- Buttons -->
    <div class="flex gap-2">
      <button
        class="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
      >
        Portfolio
      </button>
      <button
        class="flex-1 border border-slate-600 text-slate-300 hover:text-slate-100 px-4 py-2 rounded-lg text-sm font-semibold transition hover:border-slate-500"
      >
        Voir Profile
      </button>
    </div>

    <!-- Recommendations -->
    <template v-if="profile.recos && profile.recos.length > 0">
      <div class="space-y-2">
        <p class="text-xs font-semibold text-slate-300">Recommendations:</p>
        <template v-for="(reco, idx) in profile.recos" :key="idx">
          <div class="bg-slate-800/50 rounded p-3 text-xs">
            <p class="font-semibold text-slate-200">{{ reco.name }}</p>
            <p class="text-slate-400 mt-1">{{ reco.role }}</p>
          </div>
        </template>
      </div>
    </template>
    <template v-else>
      <p class="text-xs text-slate-400 cursor-pointer hover:text-slate-300">
        Details recos -
      </p>
    </template>
  </div>
</template>
