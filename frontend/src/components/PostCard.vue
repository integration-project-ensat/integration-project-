<template>
  <div class="post-card">

    <!-- Header -->
    <div class="post-header">
      <div class="post-avatar">
        <img v-if="post.avatar" :src="post.avatar" alt="avatar" />
        <span v-else>{{ initials }}</span>
      </div>
      <div class="post-meta">
        <p class="post-author">{{ post.author }}</p>
        <p class="post-subtitle">{{ post.subtitle }}</p>
        <div class="post-likes">
          <span></span>
          <span></span>
        </div>
      </div>
    </div>

    <!-- Description -->
    <p class="post-desc">
      {{ expanded ? post.description : shortDesc }}
      <span
        v-if="post.description.length > 200"
        class="more"
        @click="expanded = !expanded">
        {{ expanded ? 'moins' : 'plus' }}
      </span>
    </p>

    <!-- Images -->
    <div class="post-images" v-if="post.images && post.images.length">
      <div
        v-for="(img, i) in post.images"
        :key="i"
        class="img-placeholder">
        <img v-if="img" :src="img" alt="project image" />
      </div>
    </div>
    <div class="post-images" v-else>
      <div class="img-placeholder" v-for="i in 3" :key="i" />
    </div>

    <!-- Actions -->
    <div class="post-actions">
      <button class="action-btn" @click="$emit('comment')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      </button>
      <button class="action-btn" @click="$emit('share')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  post: {
    author: string
    subtitle: string
    description: string
    avatar?: string
    images?: string[]
  }
}>()

defineEmits(['comment', 'share'])

const expanded = ref(false)

const initials = computed(() => {
  return props.post.author.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
})

const shortDesc = computed(() => {
  return props.post.description.length > 200
    ? props.post.description.slice(0, 200) + '... '
    : props.post.description
})
</script>

<style scoped>
.post-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
}

.post-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.post-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: repeating-conic-gradient(#e0e0e0 0% 25%, #f5f5f5 0% 50%) 0 0 / 12px 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: .8rem;
  font-weight: 600;
  color: #666;
  overflow: hidden;
}
.post-avatar img { width: 100%; height: 100%; object-fit: cover; }

.post-author   { font-size: .9rem; font-weight: 600; color: var(--text-dark); }
.post-subtitle { font-size: .78rem; color: var(--text-muted); margin-top: 2px; }
.post-likes    { display: flex; gap: 4px; margin-top: 4px; font-size: .82rem; }

.post-desc {
  font-size: .83rem;
  color: var(--text-secondary, #5a6a7a);
  line-height: 1.6;
  margin-bottom: 14px;
}
.more {
  color: var(--purple);
  cursor: pointer;
  font-weight: 600;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.img-placeholder {
  height: 130px;
  background: repeating-conic-gradient(#e0e0e0 0% 25%, #f5f5f5 0% 50%) 0 0 / 16px 16px;
  border-radius: 6px;
  overflow: hidden;
}
.img-placeholder img { width: 100%; height: 100%; object-fit: cover; }

.post-actions { display: flex; gap: 8px; }

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--purple);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: var(--ease);
}
.action-btn:hover {
  background: var(--purple-hover);
  transform: translateY(-1px);
}
</style>