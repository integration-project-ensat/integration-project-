<template>
  <div class="project-card">
    <h1>{{ project.title }}</h1>
    <ValidationStatus :status="project.status" />
  </div>
</template>

<script setup>
import ValidationStatus from './ValidationStatus.vue'

defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>
