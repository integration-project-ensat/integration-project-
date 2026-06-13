<script setup>
import { ref, onMounted } from 'vue'
import { themeService } from '@/services/theme.service'

const themes = ref([])

const loadThemes = async () => {
  const { data } = await themeService.getThemes()
  themes.value = data
}

const selectTheme = async (id) => {
  await themeService.saveTheme(id)
  alert('Template sélectionné')
}

onMounted(loadThemes)
</script>

<template>
  <div>
    <h1>Choisir un template</h1>

    <div
      v-for="theme in themes"
      :key="theme.id"
    >
      <h3>{{ theme.nom }}</h3>

      <button
        @click="selectTheme(theme.id)"
      >
        Utiliser
      </button>
    </div>
  </div>
</template>