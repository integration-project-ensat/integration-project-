<script setup lang="ts">
import { ref } from "vue";

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

const showDetails = ref(true);

const handlePortfolio = () => {
  alert("Portfolio clicked!");
};

const handleViewProfile = () => {
  alert("View Profile clicked!");
};

const handleContact = () => {
  alert("Contact info clicked!");
};

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};
</script>

<template>
  <div
    class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
  >
    <div class="rounded-[1.75rem] bg-[#f4f4ff] p-5">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div
          class="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-xl font-semibold text-slate-700"
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
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div class="flex flex-wrap items-center gap-3">
                <h3 class="text-xl font-semibold text-slate-950">
                  {{ profile.name }}
                </h3>
                <span
                  class="rounded-full bg-rose-100 px-3 py-1 text-sm font-semibold text-rose-600"
                  >{{ profile.score }}+</span
                >
              </div>
              <p class="mt-2 text-sm text-slate-500">{{ profile.role }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ profile.school }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ profile.city }}</p>
            </div>
          </div>

          <a
            href="#"
            class="mt-3 inline-block text-sm font-semibold text-[#5b4df0] hover:text-[#4837d2]"
            @click.prevent="handleContact"
          >
            Contact info
          </a>
        </div>
      </div>
    </div>

    <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        class="inline-flex cursor-pointer items-center justify-center rounded-full bg-[#5b4df0] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4837d2]"
        @click="handlePortfolio"
      >
        Portfolio
      </button>
      <button
        type="button"
        class="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
        @click="handleViewProfile"
      >
        Voir Profile
      </button>
    </div>

    <div
      class="mt-5 rounded-[1.5rem] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
    >
      <button
        type="button"
        class="flex w-full items-center justify-between text-sm font-semibold text-slate-900"
        @click="toggleDetails"
      >
        <span>Details recos</span>
        <span class="text-slate-400">{{ showDetails ? "⌄" : "›" }}</span>
      </button>

      <template v-if="showDetails">
        <div
          v-if="profile.recos && profile.recos.length > 0"
          class="mt-4 space-y-3"
        >
          <template v-for="(reco, idx) in profile.recos" :key="idx">
            <div class="rounded-[1.5rem] bg-slate-100 p-4">
              <p class="text-sm font-semibold text-slate-950">
                {{ reco.name }}
              </p>
              <p class="mt-1 text-sm text-slate-500">{{ reco.role }}</p>
            </div>
          </template>
        </div>

        <div v-else class="mt-4">
          <p class="text-sm text-slate-500">
            Aucune recommandation disponible.
          </p>
        </div>
      </template>
    </div>
  </div>
</template>
