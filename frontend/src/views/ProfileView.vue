<template>
  <div class="profile-page">
    <!-- SCRUM-125 : Student Profile Header Section -->
    <StudentProfileHeader :userId="userId" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import StudentProfileHeader from '@/components/StudentProfileHeader.vue'
import { useAuthStore } from '@/store/auth.js'

const auth   = useAuthStore()
const userId = computed(() => auth.user?.id ?? null)
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 32px auto;
  padding: 0 16px;
}
</style>
