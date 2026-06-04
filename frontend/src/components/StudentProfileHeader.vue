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
            <a v-if="profile.github"   :href="profile.github"   target="_blank" rel="noopener" class="social-btn github"   aria-label="GitHub">
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

  <!-- Bouton modifier le profil -->
  <div class="edit-bar">
    <button v-if="!loading" class="btn-edit-profile" @click="openEdit">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      Modifier le profil
    </button>
  </div>

    <!-- Message d'erreur API -->
    <p v-if="error" class="api-error">
      ⚠️ Impossible de charger le profil : {{ error }}
    </p>

  </section>

  <!-- Modal d'édition du profil -->
  <Teleport to="body">
    <div v-if="editing" class="edit-backdrop" @click.self="editing = false">
      <div class="edit-modal" role="dialog" aria-modal="true">

        <div class="edit-modal-head">
          <h2>Modifier le profil</h2>
          <button class="close-btn" @click="editing = false" aria-label="Fermer">✕</button>
        </div>

        <div class="edit-modal-body">

          <!-- Avatar + couleur bannière -->
          <div class="edit-avatar-row">
            <div class="edit-avatar-preview" :style="{ background: editForm.bannerColor }">
              <img v-if="editForm.avatarPreview" :src="editForm.avatarPreview" class="edit-avatar-img" alt="Avatar" />
              <span v-else class="edit-avatar-initials">{{ editInitials }}</span>
            </div>
            <div class="edit-avatar-actions">
              <label class="btn-upload-avatar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Changer la photo
                <input type="file" accept="image/*" @change="onAvatarFileChange" />
              </label>
              <button v-if="editForm.avatarPreview" type="button" class="btn-remove-avatar" @click="editForm.avatarPreview = null">
                Supprimer la photo
              </button>
              <div class="color-row">
                <span class="color-label">Couleur bannière :</span>
                <input type="color" v-model="editForm.bannerColor" class="color-input" />
              </div>
            </div>
          </div>

          <!-- Champs -->
          <div class="edit-grid">
            <div class="edit-field">
              <label>Nom complet</label>
              <input v-model="editForm.name" placeholder="Ex: Khadija Bennani" />
            </div>
            <div class="edit-field">
              <label>Filière</label>
              <input v-model="editForm.field" placeholder="Ex: GINF, IoT, DevOps..." />
            </div>
            <div class="edit-field">
              <label>Année</label>
              <input v-model="editForm.year" placeholder="Ex: 3ème année" />
            </div>
            <div class="edit-field">
              <label>École / Établissement</label>
              <input v-model="editForm.school" placeholder="Ex: ENSA Tanger" />
            </div>
            <div class="edit-field">
              <label>Ville</label>
              <input v-model="editForm.city" placeholder="Ex: Tanger, Casablanca..." />
            </div>
            <div class="edit-field">
              <label>APOGEE</label>
              <input v-model="editForm.apogee" placeholder="Ex: 12345678" />
            </div>
            <div class="edit-field">
              <label>GitHub</label>
              <input v-model="editForm.github" placeholder="https://github.com/votre-username" />
            </div>
            <div class="edit-field">
              <label>LinkedIn</label>
              <input v-model="editForm.linkedin" placeholder="https://linkedin.com/in/votre-profil" />
            </div>
          </div>

          <div class="edit-field full">
            <label>Bio</label>
            <textarea v-model="editForm.bio" placeholder="Parlez de vous, vos passions, vos objectifs..." rows="3" />
          </div>

        </div>

        <div class="edit-modal-foot">
          <button class="btn-cancel" @click="editing = false">Annuler</button>
          <button class="btn-save" @click="saveEdit">Enregistrer</button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { profileService } from '@/services/profile.service.js'

const props = defineProps({
  userId: { type: [Number, String], default: null }
})

// ── State ──
const profile = ref({
  name: '', email: '', apogee: '', field: '', year: '', school: '',
  city: '', avatar: null, bannerColor: '#1a3c5e', bio: '',
  isVerified: false, github: null, linkedin: null,
})
const loading = ref(true)
const error   = ref(null)

// ── Edit modal state ──
const editing  = ref(false)
const editForm = reactive({
  name: '', field: '', year: '', school: '', city: '', apogee: '',
  bio: '', github: '', linkedin: '', bannerColor: '#1a3c5e',
  avatarPreview: null,
})

onMounted(async () => {
  try {
    const id = props.userId ?? localStorage.getItem('userId') ?? 1
    const data = await profileService.getProfile(id)
    profile.value = { ...profile.value, ...data }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})

// ── Computed ──
const initials = computed(() => {
  if (!profile.value.name) return '?'
  return profile.value.name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
})

const editInitials = computed(() => {
  if (!editForm.name) return '?'
  return editForm.name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
})

const accentColor = computed(() => profile.value.bannerColor ?? '#1a3c5e')

const bannerStyle = computed(() => ({
  background: `linear-gradient(135deg, ${accentColor.value} 0%, #2e6da4 100%)`
}))

// ── Méthodes ──
function onAvatarError(e) {
  e.target.style.display = 'none'
  profile.value.avatar = null
}

function openEdit() {
  Object.assign(editForm, {
    name:          profile.value.name,
    field:         profile.value.field,
    year:          profile.value.year,
    school:        profile.value.school,
    city:          profile.value.city,
    apogee:        profile.value.apogee,
    bio:           profile.value.bio,
    github:        profile.value.github ?? '',
    linkedin:      profile.value.linkedin ?? '',
    bannerColor:   profile.value.bannerColor ?? '#1a3c5e',
    avatarPreview: profile.value.avatar ?? null,
  })
  editing.value = true
}

function onAvatarFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => { editForm.avatarPreview = ev.target?.result }
  reader.readAsDataURL(file)
}

function saveEdit() {
  profile.value = {
    ...profile.value,
    name:        editForm.name,
    field:       editForm.field,
    year:        editForm.year,
    school:      editForm.school,
    city:        editForm.city,
    apogee:      editForm.apogee,
    bio:         editForm.bio,
    github:      editForm.github || null,
    linkedin:    editForm.linkedin || null,
    bannerColor: editForm.bannerColor,
    avatar:      editForm.avatarPreview,
  }
  editing.value = false
}
</script>

<style scoped>
/* ══ SCRUM-137 : BANNER ══════════════════════════════ */
.profile-header {
  width: 100%;
  background: #f5f7fa;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Arial, sans-serif;
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
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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

/* ══ EDIT BAR ════════════════════════════════════════ */
.edit-bar {
  display: flex;
  justify-content: flex-end;
  padding: 10px 32px 16px;
}

.btn-edit-profile {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  border-radius: 20px;
  border: 1.5px solid #4f46e5;
  background: white;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-edit-profile:hover { background: #4f46e5; color: white; }

/* ══ MODAL EDIT ══════════════════════════════════════ */
.edit-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(17, 24, 39, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.edit-modal {
  background: white;
  border-radius: 18px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(17, 24, 39, 0.22);
  font-family: 'Segoe UI', Arial, sans-serif;
}

.edit-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.edit-modal-head h2 {
  font-size: 1.1rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: #7a7f88;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}
.close-btn:hover { background: #e5e7eb; }

.edit-modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
}

.edit-avatar-row {
  display: flex;
  align-items: center;
  gap: 18px;
}

.edit-avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.edit-avatar-img { width: 100%; height: 100%; object-fit: cover; }

.edit-avatar-initials {
  font-size: 26px;
  font-weight: 700;
  color: white;
  letter-spacing: 1px;
}

.edit-avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-upload-avatar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 20px;
  background: #4f46e5;
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-upload-avatar input { display: none; }

.btn-remove-avatar {
  background: none;
  border: none;
  color: #df1e21;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-align: left;
}
.btn-remove-avatar:hover { text-decoration: underline; }

.color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-label { font-size: 0.78rem; color: #7a7f88; }

.color-input {
  width: 36px;
  height: 26px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0;
}

.edit-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.edit-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.edit-field.full { grid-column: 1 / -1; }

.edit-field label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #7a7f88;
}

.edit-field input,
.edit-field textarea {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 0.85rem;
  color: #111827;
  background: white;
  outline: none;
  resize: vertical;
  font-family: 'Segoe UI', Arial, sans-serif;
  transition: all 0.2s ease;
}
.edit-field input:focus,
.edit-field textarea:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}

.edit-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.btn-cancel {
  padding: 9px 18px;
  border-radius: 50px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #7a7f88;
  font-size: 0.85rem;
  cursor: pointer;
}
.btn-cancel:hover { background: #e5e7eb; }

.btn-save {
  padding: 9px 22px;
  border-radius: 50px;
  border: none;
  background: #4f46e5;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}
.btn-save:hover { background: #243559; }

/* ══ SCRUM-140 : RESPONSIVE ══════════════════════════ */

/* Tablette (≤ 768px) */
@media (max-width: 768px) {
  .banner { height: 120px; }

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
}

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
