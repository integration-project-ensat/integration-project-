<template>
  <!-- Ce composant détecte le rôle et redirige vers le bon dashboard -->
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()

onMounted(() => {
  const role = localStorage.getItem('role')
  
  if (role === 'student') {
    router.replace('/student/dashboard')
  } else if (role === 'teacher') {
    router.replace('/prof/dashboard')
  } else if (role === 'professional') {
    router.replace('/pro/dashboard')
  } else if (role === 'admin') {
    router.replace('/admin')
  } else {
    router.replace('/login')
  }
})
</script>
