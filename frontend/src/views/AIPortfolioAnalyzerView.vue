<template>
  <div class="ai-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" @toggleTheme="undefined" />
    <Sidebar :is-open="sidebarOpen" />

    <main class="ai-content" :class="{ shifted: sidebarOpen }">
      <section class="hero-card">
        <div>
          <p class="eyebrow">Espace étudiant</p>
          <h1>AI Portfolio Analyzer</h1>
          <p class="subtitle">
            Analysez votre portfolio réel, vos compétences et vos projets avec les données du backend.
          </p>
        </div>
        <button class="primary-btn hero-btn" :disabled="loadingAnalysis || !studentId" @click="analyzeMyPortfolio">
          <span v-if="loadingAnalysis" class="loader" />
          {{ loadingAnalysis ? 'Analyse en cours...' : 'Analyser mon portfolio' }}
        </button>
      </section>

      <div v-if="pageLoading" class="page-state">Chargement de votre portfolio...</div>
      <div v-else-if="pageError" class="page-state page-state--error">{{ pageError }}</div>

      <template v-else>
        <section class="profile-overview">
          <article class="overview-card">
            <p class="eyebrow">Profil analysé</p>
            <h2>{{ profilePreview.student.name }}</h2>
            <p class="overview-text">
              {{ profilePreview.student.filiere || 'Filière non renseignée' }}
              <span v-if="profilePreview.student.anneeUniversitaire">· {{ profilePreview.student.anneeUniversitaire }}</span>
            </p>
            <div class="chips">
              <span v-for="skill in displayedSkills" :key="skill">{{ skill }}</span>
              <span v-if="!displayedSkills.length">Aucune compétence détectée.</span>
            </div>
          </article>

          <article class="overview-card stats-card">
            <div class="stat-item">
              <strong>{{ profilePreview.projectsMeta.length }}</strong>
              <span>Projets</span>
            </div>
            <div class="stat-item">
              <strong>{{ profilePreview.stages.length }}</strong>
              <span>Stages</span>
            </div>
            <div class="stat-item">
              <strong>{{ profilePreview.skills.length }}</strong>
              <span>Compétences</span>
            </div>
            <div class="stat-item">
              <strong>{{ profilePreview.badges.length }}</strong>
              <span>Badges</span>
            </div>
          </article>
        </section>

        <section class="score-section">
          <div class="score-card">
            <div class="score-ring-wrap">
              <svg class="score-ring" width="130" height="130" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r="56" fill="none" stroke="#ede9fe" stroke-width="10" />
                <circle
                  cx="65"
                  cy="65"
                  r="56"
                  fill="none"
                  stroke="url(#scoreGrad)"
                  stroke-width="10"
                  stroke-linecap="round"
                  :stroke-dasharray="scoreDasharray"
                  stroke-dashoffset="88"
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#a78bfa" />
                    <stop offset="100%" stop-color="#6d28d9" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="score-inner">
                <span class="score-num">{{ analysis.score }}</span>
                <span class="score-max">/100</span>
              </div>
            </div>

            <div class="score-meta">
              <h2>Score portfolio</h2>
              <p>{{ analysisFeedback }}</p>
              <div class="score-level" :class="scoreLevelClass">
                <span class="level-dot"></span>
                {{ scoreLevel }}
              </div>
            </div>
          </div>
        </section>

        <section class="cards-grid">
          <article class="info-card card-forces">
            <div class="card-header">
              <div class="card-icon-wrap green-icon">✓</div>
              <h3>Forces</h3>
            </div>
            <ul>
              <li v-for="item in analysis.strengths" :key="item"><span class="li-dot green-dot"></span>{{ item }}</li>
              <li v-if="!analysis.strengths.length"><span class="li-dot green-dot"></span>Aucune force détectée pour le moment.</li>
            </ul>
          </article>

          <article class="info-card card-weak">
            <div class="card-header">
              <div class="card-icon-wrap red-icon">!</div>
              <h3>Points à améliorer</h3>
            </div>
            <ul>
              <li v-for="item in analysis.weaknesses" :key="item"><span class="li-dot red-dot"></span>{{ item }}</li>
              <li v-if="!analysis.weaknesses.length"><span class="li-dot red-dot"></span>Aucun point bloquant détecté.</li>
            </ul>
          </article>

          <article class="info-card card-reco">
            <div class="card-header">
              <div class="card-icon-wrap purple-icon">+</div>
              <h3>Recommandations</h3>
            </div>
            <ul>
              <li v-for="item in analysis.recommendations" :key="item"><span class="li-dot purple-dot"></span>{{ item }}</li>
              <li v-if="!analysis.recommendations.length"><span class="li-dot purple-dot"></span>Aucune recommandation supplémentaire.</li>
            </ul>
          </article>
        </section>

        <section class="ai-section">
          <div class="ai-feedback-card">
            <div class="ai-card-head">
              <div class="ai-logo">AI</div>
              <span>Résumé de l'analyse</span>
            </div>
            <p class="ai-feedback-text">{{ analysisFeedback }}</p>
          </div>

          <div class="ai-right-col">
            <div class="tool-card">
              <h3 class="tool-title">Description du projet</h3>
              <label class="field-label" v-if="projectOptions.length">
                <span>Projet source</span>
                <select v-model="selectedProjectId" class="styled-input">
                  <option v-for="project in projectOptions" :key="project.id" :value="project.id">
                    {{ project.title }}
                  </option>
                </select>
              </label>
              <textarea
                v-model="projectDescription"
                rows="5"
                class="styled-textarea"
                placeholder="Décrivez votre projet..."
              />
              <button class="primary-btn" :disabled="loadingDesc || !projectDescription.trim()" @click="improveDescription">
                <span v-if="loadingDesc" class="loader" />
                {{ loadingDesc ? 'Amélioration...' : 'Améliorer avec IA' }}
              </button>
              <div v-if="toolErrors.improve" class="inline-error">{{ toolErrors.improve }}</div>
              <div v-if="improvedDescription" class="result-box">
                <div class="result-label">Description améliorée</div>
                <p>{{ improvedDescription }}</p>
              </div>
            </div>

            <div class="tool-card">
              <h3 class="tool-title">Outils IA</h3>
              <div class="tools-btns">
                <button class="primary-btn slim" :disabled="loadingContent" @click="generateSummary">
                  <span v-if="loadingContent && activeTool === 'summary'" class="loader" />
                  Résumé professionnel
                </button>
                <button class="ghost-btn slim" :disabled="loadingContent || !selectedProject" @click="generateReadmeFile">
                  <span v-if="loadingContent && activeTool === 'readme'" class="loader dark" />
                  Générer README
                </button>
              </div>
              <div v-if="toolErrors.content" class="inline-error">{{ toolErrors.content }}</div>
              <div v-if="generatedContent" class="result-box generated-result">
                <div class="result-label">Résultat IA</div>
                <textarea readonly rows="10" :value="generatedContent" class="output-textarea"></textarea>
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Sidebar from '../components/exploreStudent/Sidebar.vue'
import Topbar from '../components/exploreStudent/Topbar.vue'
import { generateProfessionalSummary, generateReadme, improveProjectDescription } from '../services/ai.service'
import { portfolioAnalyzerService } from '../services/portfolioAnalyzer.service'
import { profileService } from '../services/profile.service'

interface AnalysisState {
  score: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

const sidebarOpen = ref(true)
const pageLoading = ref(true)
const loadingAnalysis = ref(false)
const loadingDesc = ref(false)
const loadingContent = ref(false)
const pageError = ref('')
const improvedDescription = ref('')
const generatedContent = ref('')
const activeTool = ref<'summary' | 'readme' | ''>('')
const selectedProjectId = ref<number | null>(null)
const projectDescription = ref('')
const toolErrors = ref({ improve: '', content: '' })

const emptyAnalysis = (): AnalysisState => ({
  score: 0,
  strengths: [],
  weaknesses: [],
  recommendations: [],
})

const analysis = ref<AnalysisState>(emptyAnalysis())
const profilePreview = ref({
  student: {
    id: null as number | null,
    name: 'Profil étudiant',
    filiere: '',
    anneeUniversitaire: '',
    email: '',
    linkedin: '',
    github: '',
    bio: '',
    source: 'profile',
  },
  skills: [] as string[],
  projectsMeta: [] as Array<{
    id: number
    title: string
    type: string
    description: string
    github: string
    technologies: string[]
    images: string[]
  }>,
  projects: [] as string[],
  technologies: [] as string[],
  badges: [] as string[],
  stages: [] as string[],
})

const studentId = computed(() => {
  if (profilePreview.value.student.id) return profilePreview.value.student.id

  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Number(parsed?.id ?? parsed?.id_utilisateur ?? 0) || null
  } catch {
    return null
  }
})

const projectOptions = computed(() => profilePreview.value.projectsMeta)
const selectedProject = computed(
  () => projectOptions.value.find((project) => project.id === selectedProjectId.value) || null,
)
const displayedSkills = computed(() => profilePreview.value.skills.slice(0, 10))

const scoreDasharray = computed(() => {
  const circumference = 2 * Math.PI * 56
  return `${circumference * analysis.value.score / 100} ${circumference * (1 - analysis.value.score / 100)}`
})

const scoreLevel = computed(() => {
  const score = analysis.value.score
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Bon niveau'
  if (score >= 50) return 'Moyen'
  return 'À améliorer'
})

const scoreLevelClass = computed(() => {
  const score = analysis.value.score
  if (score >= 85) return 'level-excellent'
  if (score >= 70) return 'level-good'
  if (score >= 50) return 'level-mid'
  return 'level-low'
})

const analysisFeedback = computed(() => {
  if (analysis.value.score >= 85) {
    return 'Votre portfolio est solide et prêt à être présenté, avec quelques optimisations possibles pour le rendre encore plus convaincant.'
  }
  if (analysis.value.score >= 70) {
    return 'Votre portfolio repose sur de bonnes bases. En renforçant les éléments listés ci-dessous, vous gagnerez vite en crédibilité.'
  }
  if (analysis.value.score >= 50) {
    return 'Votre portfolio est exploitable mais plusieurs informations importantes manquent encore pour bien valoriser votre profil.'
  }
  return 'Votre portfolio a besoin d’être enrichi avant de refléter correctement votre niveau et vos expériences.'
})

function normalizeTechnologies(project: any) {
  if (!Array.isArray(project?.technologies)) return []
  return project.technologies
    .map((item: any) => item?.technologie?.nom || item?.nom || item)
    .filter(Boolean)
}

function normalizeImages(project: any) {
  if (Array.isArray(project?.captures) && project.captures.length) return project.captures.filter(Boolean)
  if (project?.image_url) return [project.image_url]
  return []
}

function buildProfilePreview(profile: any) {
  const raw = profile?.raw || {}
  const student = raw?.etudiant || {}
  const projectsMeta = Array.isArray(profile?.projectsData)
    ? profile.projectsData.map((project: any) => ({
        id: Number(project?.id_projet ?? project?.id ?? Date.now()),
        title: project?.titre || 'Projet',
        type: project?.type || 'Projet',
        description: project?.description || '',
        github: project?.lien_github || '',
        technologies: normalizeTechnologies(project),
        images: normalizeImages(project),
      }))
    : []

  return {
    student: {
      id: profile?.id || null,
      name: profile?.name || 'Profil étudiant',
      filiere: student?.filiere || profile?.title || '',
      anneeUniversitaire: student?.annee_universitaire || profile?.school || '',
      email: profile?.email || '',
      linkedin: profile?.linkedin || '',
      github: profile?.github || '',
      bio: profile?.bio || '',
      source: 'profile',
    },
    skills: Array.isArray(profile?.competences) ? profile.competences.filter(Boolean) : [],
    projectsMeta,
    projects: projectsMeta.flatMap((project) => [project.title, project.description]).filter(Boolean),
    technologies: projectsMeta.flatMap((project) => project.technologies).filter(Boolean),
    badges: Array.isArray(profile?.badgesData)
      ? profile.badgesData.map((item: any) => item?.badge?.nom || item?.nom).filter(Boolean)
      : [],
    stages: Array.isArray(profile?.stagesData)
      ? profile.stagesData.flatMap((stage: any) => [stage?.entreprise, stage?.poste, stage?.missions]).filter(Boolean)
      : [],
  }
}

async function loadProfile() {
  pageLoading.value = true
  pageError.value = ''

  try {
    const profile = await profileService.getProfile(null)
    profilePreview.value = buildProfilePreview(profile)
    selectedProjectId.value = profilePreview.value.projectsMeta[0]?.id || null
    projectDescription.value = profilePreview.value.projectsMeta[0]?.description || profilePreview.value.student.bio || ''
  } catch (error: any) {
    pageError.value = error?.response?.data?.message || 'Impossible de charger le portfolio étudiant.'
  } finally {
    pageLoading.value = false
  }
}

async function analyzeMyPortfolio() {
  if (!studentId.value) {
    pageError.value = 'Aucun étudiant connecté n’a été détecté pour analyser le portfolio.'
    return
  }

  loadingAnalysis.value = true
  pageError.value = ''

  try {
    const result = await portfolioAnalyzerService.analyzePortfolio(studentId.value)
    analysis.value = {
      score: Number(result?.score ?? 0),
      strengths: Array.isArray(result?.strengths) ? result.strengths : [],
      weaknesses: Array.isArray(result?.weaknesses) ? result.weaknesses : [],
      recommendations: Array.isArray(result?.recommendations) ? result.recommendations : [],
    }
  } catch (error: any) {
    pageError.value = error?.response?.data?.message || 'Impossible d’analyser le portfolio pour le moment.'
    analysis.value = emptyAnalysis()
  } finally {
    loadingAnalysis.value = false
  }
}

async function improveDescription() {
  toolErrors.value.improve = ''
  improvedDescription.value = ''
  loadingDesc.value = true

  try {
    const result = await improveProjectDescription(projectDescription.value)
    improvedDescription.value = result?.result || ''
  } catch (error: any) {
    toolErrors.value.improve = error?.response?.data?.message || 'Le service IA de réécriture est indisponible.'
  } finally {
    loadingDesc.value = false
  }
}

async function generateSummary() {
  toolErrors.value.content = ''
  generatedContent.value = ''
  loadingContent.value = true
  activeTool.value = 'summary'

  try {
    const result = await generateProfessionalSummary({
      nom: profilePreview.value.student.name,
      filiere: profilePreview.value.student.filiere,
      anneeUniversitaire: profilePreview.value.student.anneeUniversitaire,
      bio: profilePreview.value.student.bio,
      email: profilePreview.value.student.email,
      linkedin: profilePreview.value.student.linkedin,
      github: profilePreview.value.student.github,
      skills: profilePreview.value.skills,
      badges: profilePreview.value.badges,
      projects: profilePreview.value.projectsMeta.map((project) => ({
        title: project.title,
        description: project.description,
        technologies: project.technologies,
      })),
      stages: profilePreview.value.stages,
    })
    generatedContent.value = result?.result || ''
  } catch (error: any) {
    toolErrors.value.content = error?.response?.data?.message || 'Le résumé IA n’est pas disponible pour le moment.'
  } finally {
    loadingContent.value = false
    activeTool.value = ''
  }
}

async function generateReadmeFile() {
  if (!selectedProject.value) return

  toolErrors.value.content = ''
  generatedContent.value = ''
  loadingContent.value = true
  activeTool.value = 'readme'

  try {
    const result = await generateReadme({
      title: selectedProject.value.title,
      description: projectDescription.value || selectedProject.value.description,
      technologies: selectedProject.value.technologies,
      github: selectedProject.value.github,
    })
    generatedContent.value = result?.result || ''
  } catch (error: any) {
    toolErrors.value.content = error?.response?.data?.message || 'La génération README n’est pas disponible pour le moment.'
  } finally {
    loadingContent.value = false
    activeTool.value = ''
  }
}

watch(selectedProject, (project) => {
  if (!project) return
  improvedDescription.value = ''
  if (!projectDescription.value || projectDescription.value === '') {
    projectDescription.value = project.description || ''
    return
  }
  projectDescription.value = project.description || projectDescription.value
})

onMounted(async () => {
  await loadProfile()
  if (!pageError.value) {
    await analyzeMyPortfolio()
  }
})
</script>

<style scoped>
.ai-page {
  min-height: 100vh;
  background: var(--bg-soft-purple);
  color: var(--text-dark);
  font-family: var(--font-body);
}

.ai-content {
  width: 100%;
  padding: 78px 24px 32px;
  transition: var(--ease);
}

.ai-content.shifted {
  padding-left: 244px;
}

.hero-card,
.overview-card,
.score-card,
.info-card,
.ai-feedback-card,
.tool-card {
  background: white;
  border-radius: var(--radius-card);
  box-shadow: 0 18px 35px rgba(17, 24, 39, 0.08);
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  padding: 28px;
  margin-bottom: 20px;
}

.hero-btn {
  width: auto;
  min-width: 220px;
}

.eyebrow {
  color: var(--text-gray);
  font-weight: 800;
  font-family: var(--font-head);
  margin-bottom: 8px;
}

h1,
h2,
h3 {
  font-family: var(--font-head);
  color: var(--navy);
}

h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1;
}

.subtitle,
.overview-text,
.ai-feedback-text,
.page-state,
.result-box p {
  color: var(--navy-mid);
  font-weight: 700;
}

.page-state {
  background: white;
  border-radius: var(--radius-card);
  padding: 24px;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.page-state--error,
.inline-error {
  color: var(--error);
}

.profile-overview {
  display: grid;
  grid-template-columns: minmax(320px, 1.2fr) minmax(220px, 0.8fr);
  gap: 20px;
  margin-bottom: 20px;
}

.overview-card {
  padding: 24px;
}

.stats-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-content: start;
}

.stat-item {
  background: var(--bg-soft-purple);
  border-radius: 16px;
  padding: 18px;
  text-align: center;
}

.stat-item strong {
  display: block;
  font-size: 1.8rem;
  font-family: var(--font-head);
  color: var(--purple);
}

.stat-item span {
  color: var(--navy-mid);
  font-weight: 800;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.chips span {
  background: white;
  color: var(--purple);
  border-radius: var(--radius-pill);
  padding: 8px 12px;
  font-weight: 800;
  border: 1px solid #e5defe;
}

.score-section,
.cards-grid,
.ai-section {
  margin-top: 20px;
}

.score-card {
  padding: 28px 32px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.score-ring-wrap {
  position: relative;
  width: 130px;
  height: 130px;
  flex-shrink: 0;
}

.score-ring {
  transform: rotate(-90deg);
}

.score-inner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.score-num {
  font-family: var(--font-head);
  font-size: 2.2rem;
  font-weight: 900;
  color: var(--navy);
}

.score-max {
  font-size: 0.85rem;
  color: var(--text-gray);
}

.score-meta p {
  margin: 10px 0 14px;
  line-height: 1.6;
}

.score-level {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: var(--radius-pill);
}

.level-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.level-excellent {
  background: #d1fae5;
  color: #065f46;
}
.level-excellent .level-dot { background: #10b981; }
.level-good {
  background: #ede9fe;
  color: #5b21b6;
}
.level-good .level-dot { background: #7c3aed; }
.level-mid {
  background: #fef3c7;
  color: #92400e;
}
.level-mid .level-dot { background: #f59e0b; }
.level-low {
  background: #fee2e2;
  color: #991b1b;
}
.level-low .level-dot { background: #ef4444; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.info-card,
.ai-feedback-card,
.tool-card {
  padding: 22px;
}

.card-header,
.ai-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.card-icon-wrap,
.ai-logo {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.green-icon { background: #d1fae5; color: #059669; }
.red-icon { background: #fee2e2; color: #dc2626; }
.purple-icon,
.ai-logo { background: #ede9fe; color: #7c3aed; }

.info-card ul {
  list-style: none;
  display: grid;
  gap: 10px;
}

.info-card li {
  display: flex;
  gap: 10px;
  color: var(--navy-mid);
  font-weight: 700;
  line-height: 1.55;
}

.li-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 7px;
}

.green-dot { background: #10b981; }
.red-dot { background: #ef4444; }
.purple-dot { background: #7c3aed; }

.ai-section {
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) minmax(320px, 1.1fr);
  gap: 18px;
}

.ai-right-col {
  display: grid;
  gap: 18px;
}

.tool-title {
  margin-bottom: 14px;
}

.field-label {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}

.field-label span {
  color: var(--navy);
  font-family: var(--font-head);
  font-weight: 800;
}

.styled-input,
.styled-textarea,
.output-textarea {
  width: 100%;
  border-radius: 16px;
  border: 1px solid #d7dce5;
  background: white;
  color: var(--navy);
  padding: 14px 16px;
  font: inherit;
  font-weight: 700;
  outline: none;
}

.styled-textarea,
.output-textarea {
  resize: vertical;
  line-height: 1.6;
}

.tools-btns {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.primary-btn,
.ghost-btn {
  border-radius: var(--radius-pill);
  font-weight: 800;
  font-family: var(--font-head);
  transition: var(--ease);
  border: 1px solid transparent;
  padding: 14px 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.primary-btn {
  background: var(--purple);
  color: white;
  box-shadow: 0 12px 26px rgba(79, 70, 229, 0.22);
}

.ghost-btn {
  background: white;
  color: var(--navy);
  border-color: #d7dce5;
}

.slim {
  width: auto;
  min-width: 180px;
}

.primary-btn:disabled,
.ghost-btn:disabled {
  opacity: 0.75;
}

.result-box {
  margin-top: 14px;
  background: var(--bg-soft-purple);
  border: 1px solid #e5e3f0;
  border-radius: 16px;
  padding: 16px;
}

.result-label {
  color: var(--purple);
  font-family: var(--font-head);
  font-size: 0.8rem;
  font-weight: 900;
  margin-bottom: 10px;
}

.loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loader.dark {
  border-color: rgba(79, 70, 229, 0.24);
  border-top-color: var(--purple);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 980px) {
  .ai-content.shifted {
    padding-left: 24px;
  }

  .profile-overview,
  .cards-grid,
  .ai-section {
    grid-template-columns: 1fr;
  }

  .hero-card,
  .score-card {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
