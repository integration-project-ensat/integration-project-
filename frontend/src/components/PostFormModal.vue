<script setup lang="ts">
import { reactive, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  post?: Record<string, any> | null
}>()

const emit = defineEmits<{
  (e: 'save', data: Record<string, any>): void
  (e: 'close'): void
}>()

const form = reactive({
  projectTitle: '',
  description: '',
  technologies: '',
  github: '',
  demo: '',
  imagePreview: null as string | null,
  imageFile: null as File | null,
  isCollaboration: false,
  collaborators: [] as string[],
  collaboratorInput: '',
})

watch(() => props.visible, (val) => {
  if (!val) return
  if (props.post) {
    form.projectTitle      = props.post.projectTitle ?? ''
    form.description       = props.post.description ?? ''
    form.technologies      = (props.post.technologies ?? []).join(', ')
    form.github            = props.post.github ?? ''
    form.demo              = props.post.demo ?? ''
    form.imagePreview      = props.post.imagePreview ?? null
    form.imageFile         = null
    form.isCollaboration   = (props.post.collaborators?.length ?? 0) > 0
    form.collaborators     = [...(props.post.collaborators ?? [])]
    form.collaboratorInput = ''
  } else {
    Object.assign(form, {
      projectTitle: '', description: '', technologies: '', github: '', demo: '',
      imagePreview: null, imageFile: null, isCollaboration: false, collaborators: [], collaboratorInput: ''
    })
  }
})

function onImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  form.imageFile = file
  const reader = new FileReader()
  reader.onload = ev => { form.imagePreview = ev.target?.result as string }
  reader.readAsDataURL(file)
}

function addCollaborator() {
  const name = form.collaboratorInput.trim()
  if (!name || form.collaborators.length >= 9) return
  if (!form.collaborators.includes(name)) form.collaborators.push(name)
  form.collaboratorInput = ''
}

function removeCollaborator(i: number) {
  form.collaborators.splice(i, 1)
}

function save() {
  if (!form.projectTitle.trim()) return
  emit('save', {
    projectTitle:  form.projectTitle.trim(),
    description:   form.description.trim(),
    technologies:  form.technologies.split(',').map((t: string) => t.trim()).filter(Boolean),
    github:        form.github.trim() || undefined,
    demo:          form.demo.trim() || undefined,
    imagePreview:  form.imagePreview,
    imageFile:     form.imageFile,
    collaborators: form.isCollaboration ? [...form.collaborators] : [],
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-backdrop" @click.self="$emit('close')">
      <dialog class="modal" aria-modal="true">

        <div class="modal-head">
          <h2>{{ post ? 'Modifier le post' : 'Nouveau post' }}</h2>
          <button class="close-btn" @click="$emit('close')" aria-label="Fermer">✕</button>
        </div>

        <div class="modal-body">

          <div class="form-group">
            <label>Titre du projet *</label>
            <input v-model="form.projectTitle" placeholder="Ex: Portfolio Web, Pipeline CI/CD..." />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" placeholder="Décrivez votre projet, vos missions, vos résultats..." rows="3" />
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Technologies</label>
              <input v-model="form.technologies" placeholder="Vue.js, Node.js, Docker (séparées par virgules)" />
            </div>
            <div class="form-group">
              <label>Lien GitHub</label>
              <input v-model="form.github" placeholder="github.com/vous/projet" />
            </div>
            <div class="form-group">
              <label>Lien Démo</label>
              <input v-model="form.demo" placeholder="demo.monprojet.com" />
            </div>
          </div>

          <!-- Image du projet -->
          <div class="form-group">
            <label>Image du projet</label>
            <div class="image-upload-area">
              <img v-if="form.imagePreview" :src="form.imagePreview" class="image-preview" alt="Aperçu" />
              <div v-else class="image-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Aucune image sélectionnée</span>
              </div>
              <div class="image-actions">
                <label class="btn-upload">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  {{ form.imagePreview ? "Changer l'image" : 'Ajouter une image' }}
                  <input type="file" accept="image/*" @change="onImageChange" />
                </label>
                <button v-if="form.imagePreview" type="button" class="btn-remove-img" @click="form.imagePreview = null">
                  Supprimer l'image
                </button>
              </div>
            </div>
          </div>

          <!-- Collaboration -->
          <div class="collab-section">
            <label class="collab-toggle">
              <input type="checkbox" v-model="form.isCollaboration" />
              <span>Post en collaboration (plusieurs personnes)</span>
            </label>

            <div v-if="form.isCollaboration" class="collab-panel">
              <p class="collab-hint">
                Vous êtes inclus automatiquement · Ajoutez jusqu'à 9 collaborateurs (total max : 10)
              </p>
              <div class="collab-input-row">
                <input
                  v-model="form.collaboratorInput"
                  placeholder="Nom du collaborateur..."
                  :disabled="form.collaborators.length >= 9"
                  @keydown.enter.prevent="addCollaborator"
                />
                <button
                  type="button"
                  class="btn-add-collab"
                  :disabled="form.collaborators.length >= 9"
                  @click="addCollaborator"
                >
                  Ajouter
                </button>
              </div>
              <p class="collab-count">{{ form.collaborators.length }}/9 collaborateurs ajoutés</p>
              <div v-if="form.collaborators.length" class="collab-chips">
                <span v-for="(name, i) in form.collaborators" :key="i" class="collab-chip">
                  {{ name }}
                  <button type="button" @click="removeCollaborator(i)" aria-label="Retirer">✕</button>
                </span>
              </div>
            </div>
          </div>

        </div>

        <div class="modal-foot">
          <button class="btn-cancel" @click="$emit('close')">Annuler</button>
          <button class="btn-save" :disabled="!form.projectTitle.trim()" @click="save">
            {{ post ? 'Enregistrer les modifications' : 'Publier' }}
          </button>
        </div>

      </dialog>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(17, 24, 39, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  background: var(--white);
  border-radius: 18px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px rgba(17, 24, 39, 0.22);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--input-bg);
  flex-shrink: 0;
}

.modal-head h2 {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-dark);
  font-family: var(--font-head);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: var(--text-gray);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}
.close-btn:hover { background: var(--input-bg); }

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-gray);
  font-family: var(--font-head);
}

.form-group input,
.form-group textarea {
  border: 1px solid var(--input-bg);
  border-radius: 10px;
  padding: 9px 12px;
  font-size: 0.85rem;
  color: var(--text-dark);
  background: var(--white);
  outline: none;
  resize: vertical;
  font-family: var(--font-body);
  transition: var(--ease);
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 3px var(--overlay-purple-12);
}

/* ── Image ── */
.image-upload-area {
  border: 1.5px dashed var(--input-bg);
  border-radius: 12px;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-gray);
  font-size: 0.82rem;
}

.image-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-top: 1px solid var(--input-bg);
  background: #fafafa;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: var(--purple);
  color: var(--white);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-head);
}
.btn-upload input { display: none; }

.btn-remove-img {
  background: none;
  border: none;
  color: var(--error);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: var(--radius-pill);
}
.btn-remove-img:hover { background: rgba(223, 30, 33, 0.08); }

/* ── Collaboration ── */
.collab-section {
  border-top: 1px solid var(--input-bg);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.collab-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-dark);
  font-family: var(--font-head);
}
.collab-toggle input { accent-color: var(--purple); width: 16px; height: 16px; cursor: pointer; }

.collab-panel { display: flex; flex-direction: column; gap: 10px; }

.collab-hint {
  font-size: 0.78rem;
  color: var(--text-gray);
  margin: 0;
}

.collab-input-row { display: flex; gap: 8px; }

.collab-input-row input {
  flex: 1;
  border: 1px solid var(--input-bg);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 0.85rem;
  color: var(--text-dark);
  outline: none;
  font-family: var(--font-body);
  transition: var(--ease);
}
.collab-input-row input:focus { border-color: var(--purple); }
.collab-input-row input:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-add-collab {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  background: var(--purple);
  color: var(--white);
  border: none;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  font-family: var(--font-head);
  transition: var(--ease);
}
.btn-add-collab:hover { background: var(--navy-mid); }
.btn-add-collab:disabled { opacity: 0.4; cursor: not-allowed; }

.collab-count {
  font-size: 0.75rem;
  color: var(--text-gray);
  margin: 0;
}

.collab-chips { display: flex; flex-wrap: wrap; gap: 8px; }

.collab-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--overlay-purple-10);
  color: var(--purple);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-family: var(--font-head);
}

.collab-chip button {
  background: none;
  border: none;
  color: var(--purple);
  cursor: pointer;
  font-size: 0.7rem;
  padding: 0;
  line-height: 1;
}
.collab-chip button:hover { color: var(--error); }

/* ── Footer ── */
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1px solid var(--input-bg);
  flex-shrink: 0;
}

.btn-cancel {
  padding: 9px 18px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--input-bg);
  background: var(--white);
  color: var(--text-gray);
  font-size: 0.85rem;
  cursor: pointer;
  font-family: var(--font-head);
  transition: var(--ease);
}
.btn-cancel:hover { background: var(--input-bg); }

.btn-save {
  padding: 9px 22px;
  border-radius: var(--radius-pill);
  border: none;
  background: var(--purple);
  color: var(--white);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-head);
  transition: var(--ease);
}
.btn-save:hover { background: var(--navy-mid); }
.btn-save:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 600px) {
  .form-grid { grid-template-columns: 1fr; }
}
</style>
