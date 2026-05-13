<script setup lang="ts">
import { Moon } from "lucide-vue-next";
</script>

<template>
  <header
    class="flex h-[60px] items-center justify-between bg-[#141e36] px-6 text-white shadow-[0_16px_40px_rgba(15,23,42,0.25)]"
  >
    <div class="flex items-center gap-3">
      <img
        src="@/assets/PheraCoreLogo.svg"
        alt="PheraCore"
        class="h-7 w-auto"
      />
    </div>

    <button
      type="button"
      class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
    >
      <Moon class="h-4 w-4" />
    </button>
  </header>
</template>
