<template>
  <div class="page">
    <TopBar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <div class="body-area">
      <SideBar :role="userRole" :user="currentUser" :isOpen="sidebarOpen" />

      <main class="content" :class="{ shifted: sidebarOpen }">

        <!-- ── Header ── -->
        <section class="page-head">
          <div class="head-left">
            <div class="head-badge">
              <span class="badge-dot"></span>
              IA Active
            </div>
            <h1>AI Portfolio <span class="gradient-text">Analyzer</span></h1>
            <p>Analyse intelligente de votre portfolio professionnel.</p>
          </div>
          <button class="analyze-btn" @click="analyzeMyPortfolio" :disabled="loading">
            <span v-if="loading" class="btn-spinner"></span>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            {{ loading ? 'Analyse en cours…' : 'Analyser mon portfolio' }}
          </button>
        </section>

        <!-- ── Score ── -->
        <section class="score-section">
          <div class="score-card">
            <div class="score-ring-wrap">
              <svg class="score-ring" width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="56" fill="none" stroke="#ede9fe" stroke-width="10"/>
                <circle
                  cx="65" cy="65" r="56" fill="none"
                  stroke="url(#scoreGrad)" stroke-width="10"
                  stroke-linecap="round"
                  :stroke-dasharray="`${2 * Math.PI * 56 * analysis.score / 100} ${2 * Math.PI * 56 * (1 - analysis.score / 100)}`"
                  stroke-dashoffset="88"
                  style="transition: stroke-dasharray .9s cubic-bezier(.4,0,.2,1)"
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#a78bfa"/>
                    <stop offset="100%" stop-color="#6d28d9"/>
                  </linearGradient>
                </defs>
              </svg>
              <div class="score-inner">
                <span class="score-num">{{ analysis.score }}</span>
                <span class="score-max">/100</span>
              </div>
            </div>
            <div class="score-meta">
              <h2>Portfolio Score</h2>
              <p>Votre portfolio est globalement bien construit mais peut être amélioré.</p>
              <div class="score-level" :class="scoreLevelClass">
                <span class="level-dot"></span>
                {{ scoreLevel }}
              </div>
            </div>
          </div>
        </section>

        <!-- ── 3 cards ── -->
        <section class="cards-grid">

          <article class="info-card card-forces">
            <div class="card-header">
              <div class="card-icon-wrap green-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
              </div>
              <h3>Forces</h3>
            </div>
            <ul>
              <li v-for="item in analysis.strengths" :key="item">
                <span class="li-dot green-dot"></span>{{ item }}
              </li>
            </ul>
          </article>

          <article class="info-card card-weak">
            <div class="card-header">
              <div class="card-icon-wrap red-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h3>Faiblesses</h3>
            </div>
            <ul>
              <li v-for="item in analysis.weaknesses" :key="item">
                <span class="li-dot red-dot"></span>{{ item }}
              </li>
            </ul>
          </article>

          <article class="info-card card-reco">
            <div class="card-header">
              <div class="card-icon-wrap purple-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </div>
              <h3>Recommandations</h3>
            </div>
            <ul>
              <li v-for="item in analysis.recommendations" :key="item">
                <span class="li-dot purple-dot"></span>{{ item }}
              </li>
            </ul>
          </article>

        </section>

        <!-- ── AI Section ── -->
        <section class="ai-section">

          <!-- AI Feedback -->
          <div class="ai-feedback-card">
            <div class="ai-card-head">
              <div class="ai-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
              </div>
              <span>Analyse IA</span>
            </div>
            <p class="ai-feedback-text">{{ analysis.aiFeedback }}</p>
          </div>

          <!-- Right column -->
          <div class="ai-right-col">

            <!-- Improve description -->
            <div class="tool-card">
              <h3 class="tool-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Description du projet
              </h3>
              <textarea
                v-model="projectDescription"
                rows="4"
                class="styled-textarea"
                placeholder="Décrivez votre projet…"
              />
              <button class="action-btn primary-action" @click="improveDescription" :disabled="loadingDesc">
                <span v-if="loadingDesc" class="btn-spinner small"></span>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                Améliorer avec IA
              </button>
              <transition name="slide-up">
                <div v-if="improvedDescription" class="result-box">
                  <div class="result-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                    Description améliorée
                  </div>
                  <p>{{ improvedDescription }}</p>
                </div>
              </transition>
            </div>

            <!-- AI Tools -->
            <div class="tool-card">
              <h3 class="tool-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                Outils IA
              </h3>
              <div class="tools-btns">
                <button class="action-btn primary-action" @click="generateSummary" :disabled="loadingContent">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Résumé Professionnel
                </button>
                <button class="action-btn ghost-action" @click="generateReadmeFile" :disabled="loadingContent">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                  Générer README
                </button>
              </div>
              <transition name="slide-up">
                <div v-if="generatedContent" class="result-box generated-result">
                  <div class="result-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    Résultat IA
                  </div>
                  <textarea readonly rows="8" :value="generatedContent" class="output-textarea"/>
                </div>
              </transition>
            </div>

          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TopBar from '../components/TopBar.vue'
import SideBar from '../components/exploreStudent/Sidebar.vue'
import {
  analyzePortfolio,
  generateProfessionalSummary,
  generateReadme,
  improveProjectDescription
} from '../services/ai.service'

const sidebarOpen = ref(true)
const loading = ref(false)
const loadingDesc = ref(false)
const loadingContent = ref(false)
const userRole = 'student'
const currentUser = { name: 'Nom Prenom', email: 'etudiant@example.com', avatar: '' }

const projectDescription = ref('Application de gestion de stock.')
const improvedDescription = ref('')
const generatedContent = ref('')

const analysis = ref({
  score: 74,
  strengths: ['GitHub connecté', '3 projets publiés', '5 compétences validées'],
  weaknesses: ['Descriptions trop courtes', 'Pas de screenshots', 'Profil LinkedIn absent'],
  recommendations: ["Ajouter des captures d'écran", 'Ajouter un profil LinkedIn', 'Détailler davantage les projets'],
  aiFeedback: "Votre portfolio possède une bonne base technique. Les projets sont pertinents mais les descriptions manquent de détails. Ajoutez des captures d'écran et un profil LinkedIn pour améliorer votre visibilité auprès des recruteurs."
})

const scoreLevel = computed(() => {
  const s = analysis.value.score
  if (s >= 85) return 'Excellent'
  if (s >= 70) return 'Bon niveau'
  if (s >= 50) return 'Moyen'
  return 'À améliorer'
})

const scoreLevelClass = computed(() => {
  const s = analysis.value.score
  if (s >= 85) return 'level-excellent'
  if (s >= 70) return 'level-good'
  if (s >= 50) return 'level-mid'
  return 'level-low'
})

const improveDescription = async () => {
  loadingDesc.value = true
  const result = await improveProjectDescription(projectDescription.value)
  improvedDescription.value = result.result
  loadingDesc.value = false
}

const generateSummary = async () => {
  loadingContent.value = true
  const result = await generateProfessionalSummary({ nom: 'Khadija', skills: ['Vue.js', 'Node.js', 'PostgreSQL'], projects: ['Portfolio Platform'] })
  generatedContent.value = result.result
  loadingContent.value = false
}

const generateReadmeFile = async () => {
  loadingContent.value = true
  const result = await generateReadme({ title: 'Gestion Stock', description: 'Application web de gestion de stock', technologies: ['Vue.js', 'Node.js', 'PostgreSQL'] })
  generatedContent.value = result.result
  loadingContent.value = false
}

const analyzeMyPortfolio = async () => {
  loading.value = true
  try {
    const result = await analyzePortfolio({
      nom: 'Khadija',
      skills: ['Vue.js', 'Node.js', 'PostgreSQL'],
      projects: [{ title: 'Portfolio Platform', description: 'Application web portfolio' }]
    })
    analysis.value = {
      score: result.score,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      recommendations: result.recommendations,
      aiFeedback: result.professionalFeedback
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Figtree:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  min-height: 100vh;
  background: #f5f4f8;
  padding-top: 60px;
  font-family: 'Figtree', sans-serif;
  color: #1e1a2e;
}

.body-area { position: relative; }

.content {
  padding: 36px 32px;
  transition: padding-left .3s ease;
}

.content.shifted { padding-left: 262px; }

/* ── Header ── */
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 36px;
  flex-wrap: wrap;
  gap: 20px;
}

.head-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #6d28d9;
  background: #ede9fe;
  border: 1px solid #ddd6fe;
  padding: 5px 12px;
  border-radius: 999px;
  margin-bottom: 12px;
}

.badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #7c3aed;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,.35); }
  50%       { box-shadow: 0 0 0 5px rgba(124,58,237,0); }
}

.head-left h1 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 2.4rem;
  font-weight: 800;
  color: #1e1a2e;
  line-height: 1.1;
  margin-bottom: 8px;
}

.gradient-text {
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.head-left p {
  font-size: 14px;
  color: #6b7280;
  max-width: 400px;
}

.analyze-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: white;
  border: none;
  padding: 13px 24px;
  border-radius: 12px;
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s ease;
  white-space: nowrap;
  box-shadow: 0 4px 18px rgba(124,58,237,.3);
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(124,58,237,.4);
}

.analyze-btn:disabled { opacity: .5; cursor: not-allowed; }

/* ── Score ── */
.score-section { margin-bottom: 24px; }

.score-card {
  background: white;
  border: 1px solid #e5e3f0;
  border-radius: 20px;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  gap: 32px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(124,58,237,.06);
}

.score-card::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(167,139,250,.07) 0%, transparent 70%);
  pointer-events: none;
}

.score-ring-wrap {
  position: relative;
  width: 130px; height: 130px;
  flex-shrink: 0;
}

.score-ring { transform: rotate(-90deg); }

.score-inner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.score-num {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  color: #1e1a2e;
  line-height: 1;
}

.score-max {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
}

.score-meta h2 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e1a2e;
  margin-bottom: 8px;
}

.score-meta p {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 14px;
  max-width: 460px;
}

.score-level {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 999px;
  letter-spacing: .04em;
}

.level-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

.level-excellent { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
.level-excellent .level-dot { background: #10b981; }
.level-good { background: #ede9fe; color: #5b21b6; border: 1px solid #ddd6fe; }
.level-good .level-dot { background: #7c3aed; }
.level-mid  { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.level-mid .level-dot  { background: #f59e0b; }
.level-low  { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.level-low .level-dot  { background: #ef4444; }

/* ── 3 Cards ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

@media (max-width: 860px) { .cards-grid { grid-template-columns: 1fr; } }

.info-card {
  background: white;
  border: 1px solid #e5e3f0;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
  transition: border-color .2s, box-shadow .2s, transform .2s;
}

.info-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.08); }
.card-forces:hover { border-color: #a7f3d0; }
.card-weak:hover   { border-color: #fca5a5; }
.card-reco:hover   { border-color: #c4b5fd; }

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.card-header h3 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #1e1a2e;
}

.card-icon-wrap {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.green-icon  { background: #d1fae5; color: #059669; }
.red-icon    { background: #fee2e2; color: #dc2626; }
.purple-icon { background: #ede9fe; color: #7c3aed; }

.info-card ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }

.info-card li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  color: #4b5563;
  line-height: 1.55;
}

.li-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
.green-dot  { background: #10b981; }
.red-dot    { background: #ef4444; }
.purple-dot { background: #7c3aed; }

/* ── AI Section ── */
.ai-section {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 18px;
}

@media (max-width: 900px) { .ai-section { grid-template-columns: 1fr; } }

.ai-feedback-card {
  background: white;
  border: 1px solid #e5e3f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
}

.ai-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #1e1a2e;
}

.ai-logo {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  border: 1px solid #c4b5fd;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c3aed;
}

.ai-feedback-text {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.8;
}

.ai-right-col { display: flex; flex-direction: column; gap: 18px; }

.tool-card {
  background: white;
  border: 1px solid #e5e3f0;
  border-radius: 16px;
  padding: 22px;
  box-shadow: 0 2px 8px rgba(0,0,0,.04);
}

.tool-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #1e1a2e;
  margin-bottom: 14px;
}

.tool-title svg { color: #7c3aed; flex-shrink: 0; }

.styled-textarea {
  width: 100%;
  background: #faf9ff;
  border: 1px solid #e5e3f0;
  border-radius: 10px;
  padding: 12px 14px;
  font-family: 'Figtree', sans-serif;
  font-size: 13.5px;
  color: #374151;
  resize: vertical;
  transition: border-color .2s;
  outline: none;
  margin-bottom: 12px;
  line-height: 1.6;
}

.styled-textarea::placeholder { color: #c4b5fd; }
.styled-textarea:focus { border-color: #a78bfa; box-shadow: 0 0 0 3px rgba(167,139,250,.15); }

.tools-btns { display: flex; gap: 10px; flex-wrap: wrap; }

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  border-radius: 9px;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .18s;
  border: none;
}

.primary-action {
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: white;
  box-shadow: 0 3px 12px rgba(124,58,237,.25);
}

.primary-action:hover:not(:disabled) {
  box-shadow: 0 5px 18px rgba(124,58,237,.38);
  transform: translateY(-1px);
}

.ghost-action {
  background: #f9f8ff;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
}

.ghost-action:hover:not(:disabled) {
  background: #ede9fe;
  border-color: #c4b5fd;
}

.action-btn:disabled { opacity: .45; cursor: not-allowed; }

.result-box {
  margin-top: 14px;
  background: #faf9ff;
  border: 1px solid #e5e3f0;
  border-radius: 10px;
  padding: 14px 16px;
}

.result-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: #7c3aed;
  margin-bottom: 10px;
}

.result-box p {
  font-size: 13.5px;
  color: #4b5563;
  line-height: 1.7;
}

.output-textarea {
  width: 100%;
  background: transparent;
  border: none;
  font-family: 'Figtree', sans-serif;
  font-size: 13px;
  color: #4b5563;
  resize: none;
  outline: none;
  line-height: 1.7;
}

.btn-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin .65s linear infinite;
  flex-shrink: 0;
}

.btn-spinner.small { width: 12px; height: 12px; }

@keyframes spin { to { transform: rotate(360deg); } }

.slide-up-enter-active { transition: all .3s cubic-bezier(.4,0,.2,1); }
.slide-up-enter-from   { opacity: 0; transform: translateY(8px); }

@media (max-width: 700px) {
  .content { padding: 20px 16px; }
  .head-left h1 { font-size: 1.8rem; }
  .score-card { flex-direction: column; text-align: center; }
  .content.shifted { padding-left: 16px; }
}
</style>