<template>
  <div class="page">
    <TopBar @toggleSidebar="sidebarOpen = !sidebarOpen" />

    <div class="body-area">
      <SideBar :role="userRole" :user="currentUser" :isOpen="sidebarOpen" />

      <main class="content" :class="{ shifted: sidebarOpen }">

        <!-- Header -->
        <div class="page-header">
          <div>
            <h1>Lettres de recommandation</h1>
            <p>Toutes vos lettres reçues</p>
          </div>
          <div class="header-badge">{{ letters.length }} lettres</div>
        </div>

        <!-- Empty state -->
        <div v-if="letters.length === 0" class="empty-state">
          <div class="empty-icon">✉️</div>
          <p>Aucune lettre de recommandation reçue pour le moment.</p>
        </div>

        <!-- Letters list -->
        <div v-else class="letters-list">
          <div
            v-for="letter in letters"
            :key="letter.id"
            class="letter-card"
            @click="openLetter(letter)"
          >
            <div class="author-avatar">
              <img v-if="letter.author.avatar" :src="letter.author.avatar" :alt="letter.author.name" />
              <span v-else class="avatar-initials">{{ getInitials(letter.author.name) }}</span>
            </div>

            <div class="letter-info">
              <div class="author-name">{{ letter.author.name }}</div>
              <div class="author-role">{{ letter.author.role }} · {{ letter.author.institution }}</div>
              <div class="letter-preview">{{ letter.preview }}</div>
            </div>

            <div class="letter-meta">
              <span class="letter-date">{{ formatDate(letter.receivedAt) }}</span>
              <div class="letter-actions" @click.stop>
                <button class="btn-read" @click="openLetter(letter)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  Lire
                </button>
                <button class="btn-download" @click="downloadPdf(letter)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="selectedLetter" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-author">
              <div class="author-avatar large">
                <img v-if="selectedLetter.author.avatar" :src="selectedLetter.author.avatar" />
                <span v-else class="avatar-initials">{{ getInitials(selectedLetter.author.name) }}</span>
              </div>
              <div>
                <div class="author-name">{{ selectedLetter.author.name }}</div>
                <div class="author-role">{{ selectedLetter.author.role }} · {{ selectedLetter.author.institution }}</div>
                <div class="letter-date-modal">Reçue le {{ formatDate(selectedLetter.receivedAt) }}</div>
              </div>
            </div>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <h2 class="letter-subject">{{ selectedLetter.subject }}</h2>
            <div class="letter-content" v-html="selectedLetter.content"></div>
          </div>

          <div class="modal-footer">
            <button class="btn-download-modal" @click="downloadPdf(selectedLetter)">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Télécharger en PDF
            </button>
            <button class="btn-secondary" @click="closeModal">Fermer</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopBar from '../components/TopBar.vue'
import SideBar from '../components/exploreStudent/Sidebar.vue'

const sidebarOpen = ref(true)
const userRole = 'student'
const currentUser = {
  name: 'Nom Prenom',
  email: 'Exemple.exemple@univ.etu.ac.ma',
  avatar: '',
}

interface Letter {
  id: number
  subject: string
  preview: string
  content: string
  receivedAt: string
  author: {
    name: string
    role: string
    institution: string
    avatar: string | null
  }
}

const letters = ref<Letter[]>([
  {
    id: 1,
    subject: 'Lettre de recommandation – Stage Développeur Web',
    preview: 'C\'est avec grand plaisir que je recommande Ferdaous pour ce poste...',
    content: `<p>Madame, Monsieur,</p>
      <p>C'est avec grand plaisir que je recommande <strong>Ferdaous</strong> pour ce poste de développeur web.</p>
      <p>Durant son parcours académique, elle a démontré des qualités exceptionnelles de rigueur et d'investissement.</p>
      <p>Cordialement,</p>`,
    receivedAt: '2025-04-10T09:30:00',
    author: { name: 'Dr. Karim Benali', role: 'Professeur', institution: 'FSTT Tanger', avatar: null },
  },
  {
    id: 2,
    subject: 'Recommandation pour Master MIAGE',
    preview: 'Je soussigné atteste que cette étudiante a suivi avec excellence...',
    content: `<p>À qui de droit,</p>
      <p>Je soussigné atteste que cette étudiante a suivi avec excellence le cours de Systèmes d'Information.</p>
      <p>Je la recommande sans réserve pour intégrer un programme de Master.</p>`,
    receivedAt: '2025-03-22T14:00:00',
    author: { name: 'Prof. Samira Ouali', role: 'Maître de conférences', institution: 'ENCG Tanger', avatar: null },
  },
])

const selectedLetter = ref<Letter | null>(null)

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function openLetter(letter: Letter) {
  selectedLetter.value = letter
}

function closeModal() {
  selectedLetter.value = null
}

async function downloadPdf(letter: Letter) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(letter.subject, 20, 30)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`De : ${letter.author.name} — ${letter.author.role}, ${letter.author.institution}`, 20, 42)
  doc.text(`Reçue le : ${formatDate(letter.receivedAt)}`, 20, 50)
  doc.setLineWidth(0.3)
  doc.line(20, 55, 190, 55)

  const plainText = letter.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const lines = doc.splitTextToSize(plainText, 170)
  doc.text(lines, 20, 65)

  doc.save(`lettre_${letter.id}_${letter.author.name.replace(/\s/g, '_')}.pdf`)
}
</script>

<style scoped>
/* ── Layout identique à DashboardView ─────────────────────────────────────── */
.page {
  min-height: 100vh;
  background: #f0f2f8;
  padding-top: 60px;
}

.body-area {
  position: relative;
  min-height: calc(100vh - 60px);
  background: #f0f2f8;
  overflow-x: hidden;
}

.content {
  width: 100%;
  padding: 24px 26px;
  min-height: calc(100vh - 60px);
  background: #f0f2f8;
  transition: padding-left 0.3s ease;
}

.content.shifted {
  padding-left: 246px;
}

.content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8px;
  right: 8px;
  bottom: 24px;
  background: white;
  border-radius: 8px;
  z-index: 0;
  box-shadow:
    0 2px 8px rgba(17, 24, 39, 0.06),
    0 0 0 1px rgba(17, 24, 39, 0.03);
}

.content.shifted::before { left: 230px; }

.content > * { position: relative; z-index: 1; }

/* ── Header ───────────────────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-header h1 {
  font-family: var(--font-head);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 6px;
}

.page-header p {
  font-size: .9rem;
  color: var(--text-dark);
}

.header-badge {
  background: #ede9fe;
  color: var(--purple);
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
}

/* ── Cards ────────────────────────────────────────────────────────────────── */
.letters-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.letter-card {
  background: white;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.letter-card:hover {
  box-shadow: 0 6px 20px rgba(91, 63, 212, 0.12);
}

/* ── Avatar ───────────────────────────────────────────────────────────────── */
.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--purple);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.author-avatar.large {
  width: 56px;
  height: 56px;
}

.author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  font-family: var(--font-head);
}

/* ── Info ─────────────────────────────────────────────────────────────────── */
.letter-info {
  flex: 1;
  min-width: 0;
}

.author-name {
  font-family: var(--font-head);
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.95rem;
}

.author-role {
  font-size: 0.82rem;
  color: #6b7280;
  margin: 0.1rem 0 0.35rem;
}

.letter-preview {
  font-size: 0.88rem;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 420px;
}

/* ── Meta ─────────────────────────────────────────────────────────────────── */
.letter-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.6rem;
  flex-shrink: 0;
}

.letter-date {
  font-size: 0.8rem;
  color: #9ca3af;
}

.letter-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-read,
.btn-download {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.15s;
}

.btn-read {
  background: #ede9fe;
  color: var(--purple);
}

.btn-read:hover { background: #ddd6fe; }

.btn-download {
  background: #f3f4f6;
  color: #374151;
}

.btn-download:hover { background: #e5e7eb; }

/* ── Modal ────────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1.5rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 680px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0,0,0,0.2);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.letter-date-modal {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 0.2rem;
}

.btn-close {
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  width: 34px;
  height: 34px;
  cursor: pointer;
  font-size: 1rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover { background: #e5e7eb; }

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.letter-subject {
  font-family: var(--font-head);
  font-size: 1.1rem;
  color: var(--text-dark);
  margin: 0 0 1.25rem;
}

.letter-content {
  font-size: 0.95rem;
  color: #374151;
  line-height: 1.75;
}

.modal-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-download-modal {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--purple);
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-download-modal:hover { background: #5b21b6; }

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-secondary:hover { background: #e5e7eb; }

/* ── Empty ────────────────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #9ca3af;
  background: white;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
</style>