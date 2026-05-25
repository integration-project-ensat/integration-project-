<template>
  <div class="loading-wrap">
    <p>Connexion Google en cours...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  if (!token) {
    router.push('/login')
    return
  }

  localStorage.setItem('token', token)

  router.push('/explore')
})
</script>

<style scoped>
.loading-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}
</style>