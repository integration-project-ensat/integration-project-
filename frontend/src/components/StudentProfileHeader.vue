<template>
  <!-- ═══════════════════════════════════════════════════════
       SCRUM-125 : Student Profile Header Section
       Sous-tâches couvertes :
         SCRUM-135 — Profile cover section
         SCRUM-136 — Avatar display
         SCRUM-137 — Banner display
         SCRUM-138 — Student information
         SCRUM-139 — API connection (via profileService)
         SCRUM-140 — Responsive behavior
  ═══════════════════════════════════════════════════════ -->
  <section class="profile-header" aria-label="En-tête du profil étudiant">

    <!-- ── SCRUM-137 : Banner ── -->
    <div
      class="banner"
      :style="bannerStyle"
      role="img"
      :aria-label="`Bannière de ${profile.name}`"
    >
      <div class="banner-overlay" />
    </div>

    <!-- ── SCRUM-135 : Cover section ── -->
    <div class="cover">

      <!-- ── SCRUM-136 : Avatar ── -->
      <div class="avatar-wrapper">
        <img
          v-if="profile.avatar"
          :src="profile.avatar"
          :alt="`Photo de ${profile.name}`"
          class="avatar"
          @error="onAvatarError"
        />
        <!-- Fallback initiales si pas d'image -->
        <div v-else class="avatar avatar-initials" :style="{ background: accentColor }">
          {{ initials }}
        </div>

        <!-- Badge vérifié -->
        <span v-if="profile.isVerified" class="verified-badge" title="Profil vérifié">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>

      <!-- ── SCRUM-138 : Student information ── -->
      <div class="student-info">

        <!-- Squelette de chargement -->
        <template v-if="loading">
          <div class="skeleton skeleton-name" />
          <div class="skeleton skeleton-sub" />
          <div class="skeleton skeleton-sub" style="width: 40%" />
        </template>

        <template v-else>
          <h1 class="student-name">{{ profile.name }}</h1>

          <p class="student-field">
            <span class="field-badge">{{ profile.field }}</span>
            <span class="separator">·</span>
            <span>{{ profile.year }}</span>
          </p>

          <p class="student-school">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {{ profile.school }}
          </p>

          <div class="meta-row">
            <span class="meta-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              APOGEE : {{ profile.apogee }}
            </span>

            <span class="meta-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              {{ profile.email }}
            </span>

            <span v-if="profile.city" class="meta-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {{ profile.city }}
            </span>
          </div>

          <p v-if="profile.bio" class="student-bio">{{ profile.bio }}</p>

          <!-- Liens réseaux sociaux -->
          <div v-if="profile.github || profile.linkedin" class="social-links">
            <a v-if="profile.github" :href="profile.github" target="_blank" rel="noopener" class="social-btn github" aria-label="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a v-if="profile.linkedin" :href="profile.linkedin" target="_blank" rel="noopener" class="social-btn linkedin" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>
        </template>
      </div>
    </div>

    <!-- Message d'erreur API -->
    <p v-if="error" class="api-error">
      ⚠️ Impossible de charger le profil : {{ error }}
    </p>

  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { profileService } from '@/services/profile.service.js'

// ── Props ──────────────────────────────────────────────
const props = defineProps({
  userId: {
    type: [Number, String],
    default: null
  }
})

const route = useRoute()

const resolvedId = computed(() => {
  if (props.userId != null) return props.userId
  if (route.params.id)      return route.params.id
  return null
})

// ── State ──────────────────────────────────────────────
const profile = ref({
  name:        '',
  email:       '',
  apogee:      '',
  field:       '',
  year:        '',
  school:      '',
  city:        '',
  avatar:      null,
  bannerColor: '#1a3c5e',
  bio:         '',
  isVerified:  false,
  github:      null,
  linkedin:    null,
})
const loading = ref(true)
const error   = ref(null)

// ── Helper pour charger le profil ──────────────────────
const loadProfile = async () => {
  try {
    loading.value = true
    error.value   = null
    const data = await profileService.getProfile(resolvedId.value)
    profile.value = { ...profile.value, ...data }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// ── SCRUM-139 : Connexion API ──────────────────────────
onMounted(loadProfile)

// ── Watch for userId changes ───────────────────────────
watch(resolvedId, loadProfile)

// ── Computed ───────────────────────────────────────────
const initials = computed(() => {
  if (!profile.value.name) return '?'
  return profile.value.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
})

const accentColor = computed(() => profile.value.bannerColor ?? '#1a3c5e')

// SCRUM-137 : style dynamique de la bannière
const bannerStyle = computed(() => ({
  background: `linear-gradient(135deg, ${accentColor.value} 0%, #2e6da4 100%)`
}))

// ── Méthodes ───────────────────────────────────────────
function onAvatarError(e) {
  e.target.style.display = 'none'
  profile.value.avatar = null
}
</script>

<style scoped>
/* ══ SCRUM-137 : BANNER ══════════════════════════════ */
.profile-header {

  background: white;
  border-radius: 14px;
  margin-top: 35px;
  margin-bottom: 10px;
  overflow: hidden;
  box-shadow: 0 14px 38px rgba(15, 23, 42, .08);
}

.cover-section {
  position: relative;
  margin-bottom: 56px;
  isolation: isolate;
}

.cover-img {
  width: 100%;
  height: 190px;
  background-color: #eef5ff;
  background-image:
    linear-gradient(135deg, rgba(255, 255, 255, .9) 0%, rgba(255, 255, 255, .14) 38%, rgba(255, 255, 255, 0) 72%),
    radial-gradient(circle at 86% 18%, rgba(3, 155, 229, .34) 0%, rgba(3, 155, 229, .11) 36%, transparent 62%),
    radial-gradient(circle at 18% 78%, rgba(94, 53, 177, .2) 0%, rgba(94, 53, 177, .08) 42%, transparent 66%),
    radial-gradient(#9ca3af .85px, transparent .85px),
    radial-gradient(#cbd5e1 .85px, transparent .85px),
    linear-gradient(120deg, #f8fbff 0%, #eaf4ff 46%, #f6f2ff 100%);
  background-size: 100% 100%, 100% 100%, 100% 100%, 22px 22px, 22px 22px, 100% 100%;
  background-position: 0 0, 0 0, 0 0, 0 0, 11px 11px, 0 0;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(148, 163, 184, .26);
  border-radius: 0 0 34px 34px / 0 0 18px 18px;
  clip-path: ellipse(116% 100% at 50% 0%);
}

.cover-img::before,
.cover-img::after {
  content: "";
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
}

.cover-img::before {
  width: 290px;
  height: 88px;
  right: -42px;
  top: 34px;
  background: linear-gradient(90deg, rgba(3, 155, 229, .2), rgba(94, 53, 177, .12));
  transform: rotate(-13deg);
}

.cover-img::after {
  width: 230px;
  height: 70px;
  left: -64px;
  bottom: 18px;
  background: linear-gradient(90deg, rgba(94, 53, 177, .14), rgba(3, 155, 229, .14));
  transform: rotate(16deg);
}

.cover-section::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 64px;
  z-index: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), #ffffff 78%);

}

.banner {
  position: relative;
  height: 160px;
  width: 100%;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.15);
}

/* ══ SCRUM-135 : COVER SECTION ═══════════════════════ */
.cover {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  padding: 0 32px 28px;
  margin-top: -56px;
  position: relative;
}

/* ══ SCRUM-136 : AVATAR ══════════════════════════════ */
.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
  z-index: 2;
  bottom: -50px;
  left: 24px;
  padding: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .8);
  box-shadow: 0 14px 32px rgba(15, 23, 42, .14);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  background: var(--avatar-bg, #039be5);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head);
  font-size: 1.5rem;
  font-weight: 700;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .2);
}

.avatar img,
.recos-avatar img,
.reco-avatar img {
  width: 100%;
  height: 100%;

  object-fit: cover;
  display: block;
  background: #e0e7ef;
}

.avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 2px;
  user-select: none;
}

.verified-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: #2e7d32;
  border-radius: 50%;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ══ SCRUM-138 : STUDENT INFORMATION ════════════════ */
.student-info {
  flex: 1;
  min-width: 0;
  padding-top: 60px;
}

.student-name {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
  margin: 0 0 6px;
  flex-wrap: wrap;
}

.field-badge {
  background: #e8f0fe;
  color: #1a3c5e;
  padding: 2px 10px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
}

.separator { color: #bbb; }

.student-school {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #777;
  margin: 0 0 10px;
}

.student-school svg { flex-shrink: 0; color: #888; }

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f0f4f8;
  border: 1px solid #dce3ed;
  color: #444;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 20px;
}

.meta-chip svg { color: #888; flex-shrink: 0; }

.student-bio {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px;
  line-height: 1.6;
  max-width: 560px;
}

/* Liens sociaux */
.social-links { display: flex; gap: 10px; flex-wrap: wrap; }

.social-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.2s;
}
.social-btn:hover { opacity: 0.82; }
.social-btn.github   { background: #24292f; color: #fff; }
.social-btn.linkedin { background: #0a66c2; color: #fff; }

/* ══ SQUELETTE CHARGEMENT ════════════════════════════ */
.skeleton {
  background: linear-gradient(90deg, #e0e7ef 25%, #f0f4f8 50%, #e0e7ef 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: 6px;
  margin-bottom: 10px;
}
.skeleton-name { height: 26px; width: 55%; }
.skeleton-sub  { height: 14px; width: 70%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Erreur API */
.api-error {
  padding: 10px 32px 16px;
  font-size: 13px;
  color: #c62828;
}

/* ══ SCRUM-140 : RESPONSIVE ══════════════════════════ */

/* Tablette (≤ 768px) */
@media (max-width: 768px) {

  .banner { height: 120px; }

  .profile-header {
    border-radius: 12px;
  }

  .cover-section {
    margin-bottom: 50px;
  }

  .cover-img {
    height: 158px;
    clip-path: ellipse(130% 100% at 50% 0%);
  }

  .cover-img::before {
    width: 210px;
    height: 68px;
    right: -76px;
    top: 28px;
  }

  .cover-img::after {
    width: 180px;
    height: 58px;
    left: -86px;
    bottom: 20px;
  }

  .avatar-wrap {
    left: 18px;
    bottom: -46px;
  }

  .avatar {
    width: 88px;
    height: 88px;
  }

  .competances-dropdown {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}


  .cover {
    flex-direction: column;
    align-items: flex-start;
    padding: 0 20px 22px;
    margin-top: -40px;
    gap: 12px;
  }

  .avatar { width: 80px; height: 80px; }
  .avatar-initials { font-size: 26px; }

  .student-info { padding-top: 0; }
  .student-name { font-size: 18px; white-space: normal; }

  .meta-row { gap: 6px; }
  .meta-chip { font-size: 11px; }



/* Mobile (≤ 480px) */
@media (max-width: 480px) {
  .banner { height: 90px; }

  .cover { padding: 0 16px 18px; margin-top: -36px; }

  .avatar { width: 68px; height: 68px; border-width: 3px; }
  .avatar-initials { font-size: 20px; }

  .student-name { font-size: 16px; }
  .field-badge  { font-size: 11px; }

  .social-btn { font-size: 11px; padding: 5px 10px; }
}
</style>

