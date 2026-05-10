<script setup lang="ts">
import { Moon } from "lucide-vue-next";

interface Props {
  modelValue: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <header
    class="flex items-center justify-between bg-[#0f1729] px-6 py-4 text-white"
  >
    <div class="flex items-center gap-3">
      <img
        src="@/assets/PheraCoreLogo.svg"
        alt="PheraCore"
        class="h-8 w-auto"
      />
      <div class="text-lg font-semibold tracking-tight">PheraCore</div>
    </div>

    <button
      type="button"
      class="rounded-full border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
    >
      <Moon class="h-5 w-5" />
    </button>
  </header>
</template>
