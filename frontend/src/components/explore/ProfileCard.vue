<template>
  <article
    class="rounded-[32px] border border-slate-800/80 bg-[#111827]/95 p-6 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.8)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-600/60"
  >
    <div
      class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-4">
        <div
          class="h-20 w-20 overflow-hidden rounded-[28px] bg-slate-900 text-slate-500 grid place-items-center text-3xl font-semibold"
        >
          <img
            v-if="profile.avatar"
            :src="profile.avatar"
            :alt="profile.name"
            class="h-full w-full object-cover"
          />
          <template v-else>
            {{
              profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")
            }}
          </template>
        </div>
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-xl font-semibold text-white">{{ profile.name }}</h3>
            <span v-if="showScore"
              class="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300"
              >{{ profile.score }}+</span
            >
        </div>
          <p class="mt-2 text-sm text-slate-400">{{ profile.role }}</p>
          <p class="mt-1 text-sm text-slate-500">
            {{ profile.school }} · {{ profile.field }} · {{ profile.city }}
          </p>
        </div>
      </div>
      <div class="grid gap-3 sm:place-items-end">
        <div
          class="rounded-3xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300"
        >
          Recommandations :
          <span class="font-semibold text-white"
            >{{ profile.recommendations }}+</span
          >
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            class="rounded-3xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Portfolio
          </button>
          <button
            class="rounded-3xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
          >
            Voir Profil
          </button>
        </div>
      </div>
    </div>
    <div class="mt-6 grid gap-3 sm:grid-cols-3">
      <div v-if="showScore" class="rounded-3xl bg-slate-900/90 px-4 py-4 text-sm text-slate-300">
        <span class="block text-xs uppercase tracking-[0.25em] text-slate-500"
          >Score</span
        >
        <p class="mt-2 text-lg font-semibold text-white">{{ profile.score }}</p>
      </div>
      <div class="rounded-3xl bg-slate-900/90 px-4 py-4 text-sm text-slate-300">
        <span class="block text-xs uppercase tracking-[0.25em] text-slate-500"
          >Ville</span
        >
        <p class="mt-2 text-lg font-semibold text-white">{{ profile.city }}</p>
      </div>
      <div class="rounded-3xl bg-slate-900/90 px-4 py-4 text-sm text-slate-300">
        <span class="block text-xs uppercase tracking-[0.25em] text-slate-500"
          >Compétences</span
        >
        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="skill in profile.skills"
            :key="skill"
            class="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300"
          >
            {{ skill }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Profile {
  id: number;
  name: string;
  avatar?: string;
  role: string;
  school: string;
  field: string;
  city: string;
  score: number;
  year: number;
  skills: string[];
  recommendations: number;
}

const props = defineProps<{ profile: Profile; showScore?: boolean }>();
const showScore = computed(() => props.showScore !== false);
</script>
