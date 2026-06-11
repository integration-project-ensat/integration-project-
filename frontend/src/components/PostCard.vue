<template>
  <div class="post-card">
    <div class="post-header">
      <div class="post-avatar" :class="avatarColorClass(post.author)">
        <img v-if="post.avatar" :src="post.avatar" alt="avatar" />
        <span v-else>{{ initials }}</span>
      </div>

      <div class="post-meta">
        <p class="post-author">{{ post.author }}</p>
        <p class="post-subtitle">{{ post.subtitle }}</p>
      </div>

      <div v-if="manageable" class="post-owner-actions">
        <button type="button" class="owner-action-btn" @click="emit('edit', post)">
          Modifier
        </button>
        <button type="button" class="owner-action-btn owner-action-btn--danger" @click="emit('delete', post)">
          Supprimer
        </button>
      </div>
    </div>

    <p class="post-desc">
      {{ expanded ? post.description : shortDesc }}
      <span
        v-if="post.description.length > 200"
        class="more"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'moins' : 'plus' }}
      </span>
    </p>

    <div v-if="mediaItems.length" class="media-slider">
      <button
        v-if="mediaItems.length > 1"
        type="button"
        class="slide-btn prev"
        @click="prevMedia"
      >
        ‹
      </button>

      <div class="media-frame">
        <img
          v-if="activeMedia.type === 'image'"
          :src="activeMedia.url"
          :alt="activeMedia.name || 'media image'"
        />

        <video
          v-else-if="activeMedia.type === 'video'"
          :src="activeMedia.url"
          controls
        />

        <iframe
          v-else-if="activeMedia.type === 'pdf'"
          :src="activeMedia.url"
          title="PDF preview"
        />

        <a
          v-else
          :href="activeMedia.url"
          target="_blank"
          rel="noopener"
          class="file-preview"
        >
          <span class="file-icon">FILE</span>
          <span>{{ activeMedia.name || 'Ouvrir le fichier' }}</span>
        </a>
      </div>

      <button
        v-if="mediaItems.length > 1"
        type="button"
        class="slide-btn next"
        @click="nextMedia"
      >
        ›
      </button>

      <div v-if="mediaItems.length > 1" class="media-dots">
        <button
          v-for="(_, index) in mediaItems"
          :key="index"
          type="button"
          class="media-dot"
          :class="{ active: index === currentIndex }"
          @click="currentIndex = index"
        />
      </div>
    </div>

    <div v-else class="empty-media">
      <div class="img-placeholder" />
      <div class="img-placeholder" />
      <div class="img-placeholder" />
    </div>

    <div class="post-actions">
      <button 
        class="action-btn like-btn" 
        :class="{ 'is-liked': isLiked }" 
        @click="toggleLike"
        :aria-label="isLiked ? 'Je n\'aime plus' : 'J\'aime'"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </button>

      <button 
        class="action-btn comment-trigger-btn"
        :class="{ 'is-active': showCommentBox }"
        @click="toggleCommentBox" 
        aria-label="Commenter"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
      </button>

      <button 
        class="action-btn repost-btn" 
        :class="{ 'is-reposted': isReposted }" 
        @click="toggleRepost" 
        aria-label="Republier"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 1l4 4-4 4" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <path d="M7 23l-4-4 4-4" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      </button>
    </div>

    <div v-if="showCommentBox" class="comment-section">
      <div class="comment-input-wrapper">
        <input 
          v-model="commentText" 
          type="text" 
          placeholder="Écrire un commentaire pour ce projet..." 
          @keyup.enter="submitComment"
        />
        <button 
          class="send-comment-btn" 
          :disabled="!commentText.trim()" 
          @click="submitComment"
        >
          Envoyer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type MediaType = 'image' | 'video' | 'pdf' | 'file'

type MediaItem = {
  url: string
  type: MediaType
  name?: string
}

const fallbackMedia: MediaItem = {
  url: '',
  type: 'file',
  name: ''
}

const props = defineProps<{
  post: {
    id?: number
    author: string
    subtitle: string
    description: string
    liked?: boolean
    reposted?: boolean
    avatar?: string
    images?: string[]
    media?: Array<string | {
      url: string
      type?: MediaType
      name?: string
    }>
  }
  manageable?: boolean
}>()

const emit = defineEmits(['comment', 'share', 'like', 'submit-comment', 'edit', 'delete'])

// États réactifs existants et nouveaux
const expanded = ref(false)
const currentIndex = ref(0)
const isLiked = ref(false)
const isReposted = ref(false)
const showCommentBox = ref(false)
const commentText = ref('')

const initials = computed(() => {
  return getInitials(props.post.author)
})

const manageable = computed(() => Boolean(props.manageable))

watch(
  () => props.post.liked,
  (value) => {
    isLiked.value = Boolean(value)
  },
  { immediate: true },
)

watch(
  () => props.post.reposted,
  (value) => {
    isReposted.value = Boolean(value)
  },
  { immediate: true },
)

const shortDesc = computed(() => {
  return props.post.description.length > 200
    ? props.post.description.slice(0, 200) + '... '
    : props.post.description
})

const mediaItems = computed<MediaItem[]>(() => {
  if (props.post.media?.length) {
    return props.post.media.map((item) => {
      if (typeof item === 'string') {
        return normalizeMedia(item)
      }

      return {
        url: item.url,
        type: item.type || detectMediaType(item.url),
        name: item.name
      }
    })
  }

  return (props.post.images || []).map((url) => normalizeMedia(url))
})

const activeMedia = computed<MediaItem>(() => {
  return mediaItems.value[currentIndex.value] ?? mediaItems.value[0] ?? fallbackMedia
})

watch(mediaItems, () => {
  if (currentIndex.value >= mediaItems.value.length) {
    currentIndex.value = 0
  }
})

function normalizeMedia(url: string): MediaItem {
  return {
    url,
    type: detectMediaType(url),
    name: fileNameFromUrl(url)
  }
}

function detectMediaType(url: string): MediaType {
  const cleanUrl = (url.split('?')[0] || '').toLowerCase()

  if (/\.(png|jpg|jpeg|webp|gif|bmp|svg)$/.test(cleanUrl)) return 'image'
  if (/\.(mp4|webm|ogg|mov)$/.test(cleanUrl)) return 'video'
  if (/\.pdf$/.test(cleanUrl)) return 'pdf'

  return 'file'
}

function fileNameFromUrl(url: string) {
  const fileName = url.split('/').pop() || 'Fichier'
  return decodeURIComponent(fileName)
}

function prevMedia() {
  currentIndex.value =
    (currentIndex.value - 1 + mediaItems.value.length) % mediaItems.value.length
}

function nextMedia() {
  currentIndex.value =
    (currentIndex.value + 1) % mediaItems.value.length
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function toggleLike() {
  isLiked.value = !isLiked.value
  emit('like', isLiked.value)
}

function toggleRepost() {
  isReposted.value = !isReposted.value
  emit('share', isReposted.value)
}

function toggleCommentBox() {
  showCommentBox.value = !showCommentBox.value
  emit('comment')
}

function submitComment() {
  if (!commentText.value.trim()) return
  emit('submit-comment', commentText.value)
  commentText.value = '' 
}

function avatarColorClass(name: string) {
  const colors = [
    'avatar-blue',
    'avatar-orange',
    'avatar-indigo',
    'avatar-green',
    'avatar-deep-blue',
    'avatar-brown',
    'avatar-purple',
    'avatar-slate'
  ]

  const sum = name
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0)

  return colors[sum % colors.length]
}
</script>

<style scoped>
.post-card {
  background: var(--white);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: flex-start;
}

.post-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--avatar-bg, var(--sky));
  color: var(--white);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head);
  font-size: .8rem;
  font-weight: 700;
  overflow: hidden;
}

.post-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-author {
  font-size: .9rem;
  font-weight: 600;
  color: var(--text-dark, var(--text-heading));
}

<<<<<<< HEAD
.post-subtitle {
  font-size: .78rem;
  color: var(--text-muted, var(--text-slate));
  margin-top: 2px;
}
=======
.post-subtitle {
  font-size: .78rem;
  color: var(--text-muted, #64748b);
  margin-top: 2px;
}

.post-owner-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.owner-action-btn {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid #dbe3ef;
  background: white;
  color: #334155;
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
}

.owner-action-btn--danger {
  color: #dc2626;
  border-color: rgba(220, 38, 38, .2);
  background: #fff5f5;
}

.post-desc {
  font-size: .83rem;
  color: var(--text-secondary, #5a6a7a);
  line-height: 1.6;
  margin-bottom: 14px;
}

.more {
  color: var(--purple, var(--indigo));
  cursor: pointer;
  font-weight: 600;
}

.media-slider {
  position: relative;
  margin-bottom: 14px;
}

.media-frame {
  width: 100%;
  height: clamp(260px, 32vw, 460px);
  background: #eef2f7;
  border-radius: 6px;
  overflow: hidden;
}

.media-frame img,
.media-frame video,
.media-frame iframe {
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: cover;
  display: block;
}

.media-frame iframe {
  background: var(--white);
}

.file-preview {
  width: 100%;
  height: 100%;
  color: var(--text-dark);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-decoration: none;
}

.file-icon {
  width: 58px;
  height: 58px;
  border-radius: 8px;
  background: var(--purple, var(--indigo));
  color: var(--white);
  font-family: var(--font-head);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-btn {
  position: absolute;
  top: 50%;
  z-index: 2;
  width: 34px;
  height: 46px;
  transform: translateY(-50%);
  background: rgba(17, 24, 39, .68);
  color: var(--white);
  font-size: 2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.slide-btn.prev { left: 10px; }
.slide-btn.next { right: 10px; }

.media-dots {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  display: flex;
  gap: 7px;
}

.media-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: rgba(255, 255, 255, .72);
  cursor: pointer;
}

.media-dot.active {
  background: var(--purple, var(--indigo));
}

.empty-media {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}

.img-placeholder {
  height: clamp(220px, 20vw, 320px);
  background: #eef2f7;
  border-radius: 6px;
}

/* --- Section Boutons d'actions --- */
.post-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--surface-muted);
  color: var(--text-slate);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--border-light);
  color: var(--text-heading);
}

/* État actif déclencheur de la boîte de com */
.comment-trigger-btn.is-active {
  background: var(--purple, var(--indigo));
  color: var(--white);
}

/* État J'aime Rempli (Rouge) */
.like-btn.is-liked {
  background: var(--danger-light);
  color: var(--white);
}
.like-btn.is-liked:hover {
  background: var(--danger);
}

/* État Republier Activé (Vert) */
.repost-btn.is-reposted {
  background: #10b981;
  color: var(--white);
}
.repost-btn.is-reposted:hover {
  background: var(--success-strong);
}

/* --- Bloc commentaires --- */
.comment-section {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--surface-muted);
}

.comment-input-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.comment-input-wrapper input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 20px;
  border: 1px solid #cbd5e1;
  font-size: 0.82rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.comment-input-wrapper input:focus {
  border-color: var(--purple, var(--indigo));
}

.send-comment-btn {
  padding: 8px 16px;
  border-radius: 18px;
  background: var(--purple, var(--indigo));
  color: var(--white);
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.send-comment-btn:disabled {
  background: #cbd5e1;
  color: var(--text-light);
  cursor: not-allowed;
}

/* Couleurs dynamiques des avatars */
.avatar-blue { --avatar-bg: var(--sky); }
.avatar-orange { --avatar-bg: var(--tech-amber); }
.avatar-indigo { --avatar-bg: var(--tech-slate); }
.avatar-green { --avatar-bg: var(--tech-green); }
.avatar-deep-blue { --avatar-bg: var(--tech-blue); }
.avatar-brown { --avatar-bg: var(--tech-brown); }
.avatar-purple { --avatar-bg: var(--tech-deep-purple); }
.avatar-slate { --avatar-bg: var(--tech-periwinkle); }
</style>
=======
.avatar-blue { --avatar-bg: #039be5; }
.avatar-orange { --avatar-bg: #f57c00; }
.avatar-indigo { --avatar-bg: #5e6ad2; }
.avatar-green { --avatar-bg: #43a047; }
.avatar-deep-blue { --avatar-bg: #0277bd; }
.avatar-brown { --avatar-bg: #8d6e63; }
.avatar-purple { --avatar-bg: #5e35b1; }
.avatar-slate { --avatar-bg: #5c6bc0; }
</style>
>>>>>>> a062242619048820d9654a2daf97487c3f101f72
