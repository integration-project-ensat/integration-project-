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
  <div
    class="rounded-[2rem] bg-[#17243c] border border-slate-700/30 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
  >
    <div
      class="rounded-[1.5rem] bg-[#0f1729] p-6 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]"
    >
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div
          class="flex h-28 w-28 items-center justify-center rounded-full bg-slate-300 text-2xl font-bold text-slate-900"
        >
          {{
            profile.name
              .split(" ")
              .map((n) => n[0])
              .join("")
          }}
        </div>

        <div class="flex-1 min-w-0">
          <div
            class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 class="text-2xl font-bold text-white">{{ profile.name }}</h3>
              <p class="text-sm text-slate-400 mt-2">{{ profile.role }}</p>
            </div>

            <div class="text-right">
              <p class="text-sm font-semibold text-slate-100">
                {{ profile.recommendations }}+ recos
              </p>
            </div>
          </div>

          <div class="mt-4 space-y-1 text-sm text-slate-400">
            <p>{{ profile.school }}</p>
            <p>{{ profile.city }}</p>
          </div>

          <a
            href="#"
            class="mt-4 inline-block text-cyan-400 hover:text-cyan-300"
          >
            Contact info
          </a>
        </div>

        <div
          class="flex items-center justify-between gap-3 rounded-full bg-slate-900/70 px-4 py-3 text-sm text-slate-300"
        >
          <span class="font-semibold text-white">{{ profile.score }}+</span>
          <span>score</span>
        </div>
      </div>
    </div>

    <div class="mt-5 flex flex-col gap-3 sm:flex-row">
      <button
        class="inline-flex items-center justify-center rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
      >
        Portfolio
      </button>
      <button
        class="inline-flex items-center justify-center rounded-full border border-slate-600 bg-transparent px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
      >
        Voir Profile
      </button>
    </div>

    <div class="mt-6 rounded-[1.5rem] bg-slate-900/70 p-4">
      <div
        class="flex items-center justify-between text-sm font-semibold text-slate-200"
      >
        <span>Details recos</span>
        <span class="text-slate-400">⌄</span>
      </div>

      <template v-if="profile.recos && profile.recos.length > 0">
        <div class="mt-4 space-y-3">
          <template v-for="(reco, idx) in profile.recos" :key="idx">
            <div class="rounded-3xl bg-slate-950/80 p-4">
              <p class="font-semibold text-slate-100">{{ reco.name }}</p>
              <p class="mt-1 text-sm text-slate-400">{{ reco.role }}</p>
            </div>
          </template>
        </div>
      </template>

      <template v-else>
        <p class="mt-4 text-sm text-slate-400">Details recos -</p>
      </template>
    </div>
  </div>
</template>
