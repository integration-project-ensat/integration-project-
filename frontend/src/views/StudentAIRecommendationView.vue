<script setup lang="ts">
import { computed, ref } from "vue";
import Sidebar from "../components/exploreStudent/Sidebar.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import { getCareerRecommendation } from "../services/aiRecommendation.service";

type Career =
  | "Web Developer"
  | "Frontend Developer"
  | "Backend Developer"
  | "Full Stack Developer"
  | "DevOps"
  | "Cloud Engineer"
  | "Cybersecurity"
  | "Data Science"
  | "AI Engineer"
  | "Mobile Developer"
  | "UI/UX Designer";

interface RecommendationResult {
  predictedCareer: string;
  matchScore: number;
  missingSkills: string[];
  recommendedProjects: string[];
  technologiesToLearn: string[];
  summary: string;
  roadmap: Array<{ step: string; title: string; items: string[] }>;
}

const sidebarOpen = ref(true);
const targetCareer = ref<Career>("DevOps");
const loading = ref(false);
const error = ref("");
const result = ref<RecommendationResult | null>(null);
const profileSource = ref<any>(null);

const careers: Career[] = [
  "Web Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps",
  "Cloud Engineer",
  "Cybersecurity",
  "Data Science",
  "AI Engineer",
  "Mobile Developer",
  "UI/UX Designer",
];

const mockStudentProfile = {
  name: "Nom Étudiant",
  filiere: "GINF",
  skills: ["Vue", "Node.js", "Git", "PostgreSQL", "REST API"],
  projects: [
    "Portfolio Web avec Vue",
    "API backend Node.js",
    "Dashboard de suivi de stages",
  ],
  technologies: ["Vue.js", "Express", "PostgreSQL", "Docker", "GitHub"],
  badges: ["Web Developer", "Backend", "Full Stack"],
  stages: ["Stage développement full stack avec Vue 3 et Node.js"],
};

const scoreStyle = computed(() => ({
  width: `${result.value?.matchScore ?? 0}%`,
}));

async function analyzeProfile() {
  loading.value = true;
  error.value = "";

  try {
    const response = await getCareerRecommendation({
      targetCareer: targetCareer.value,
      skills: mockStudentProfile.skills,
      projects: mockStudentProfile.projects,
      technologies: mockStudentProfile.technologies,
      badges: mockStudentProfile.badges,
      stages: mockStudentProfile.stages,
      student: {
        name: mockStudentProfile.name,
        filiere: mockStudentProfile.filiere,
        source: "mock",
      },
    });
    result.value = response.data.data;
    profileSource.value = response.data.profileSource || mockStudentProfile;
  } catch (apiError: any) {
    error.value =
      apiError.response?.data?.message ||
      "Impossible de générer la recommandation IA pour le moment.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="ai-page">
    <Topbar
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
      @toggle-theme="undefined"
    />
    <Sidebar :is-open="sidebarOpen" />

    <main class="ai-content" :class="{ shifted: sidebarOpen }">
      <section class="hero-card">
        <div>
          <p class="eyebrow">Espace étudiant</p>
          <h1>Recommandation IA carrière</h1>
          <p class="subtitle">
            Analysez votre portfolio, vos compétences et vos projets avec notre modèle IA interne.
          </p>
        </div>
        <div class="hero-badge">Modèle personnalisé</div>
      </section>

      <section class="analysis-grid">
        <article class="config-card">
          <h2>Objectif carrière</h2>
          <p class="card-text">Choisissez le métier que vous voulez viser.</p>

          <div class="career-options">
            <button
              v-for="career in careers"
              :key="career"
              class="pill-btn"
              :class="{ active: targetCareer === career }"
              @click="targetCareer = career"
            >
              {{ career }}
            </button>
          </div>

          <div class="profile-box">
            <h3>Profil analysé</h3>
            <p class="profile-source">
              {{ mockStudentProfile.name }} · {{ mockStudentProfile.filiere }}
            </p>
            <div class="chips">
              <span v-for="skill in mockStudentProfile.skills" :key="skill">{{ skill }}</span>
            </div>
          </div>

          <button class="primary-btn" :disabled="loading" @click="analyzeProfile">
            <span v-if="loading" class="loader" />
            {{ loading ? "Analyse en cours..." : "Analyser mon profil" }}
          </button>

          <p v-if="error" class="error-message">{{ error }}</p>
        </article>

        <article class="result-card">
          <template v-if="result">
            <div class="result-header">
              <div>
                <p class="eyebrow">Score de compatibilité</p>
                <h2>{{ result.matchScore }}%</h2>
              </div>
              <span class="prediction">Prédit : {{ result.predictedCareer }}</span>
            </div>

            <div class="score-track">
              <div class="score-fill" :style="scoreStyle" />
            </div>

            <p class="summary">{{ result.summary }}</p>
          </template>
          <div v-else class="empty-state">
            <h2>Prêt pour l’analyse</h2>
            <p>Le résultat IA apparaîtra ici après l’analyse du profil mock.</p>
          </div>
        </article>
      </section>

      <section v-if="result" class="recommendation-grid">
        <article class="info-card">
          <h3>Compétences manquantes</h3>
          <ul>
            <li v-for="skill in result.missingSkills" :key="skill">{{ skill }}</li>
          </ul>
        </article>

        <article class="info-card">
          <h3>Projets recommandés</h3>
          <ul>
            <li v-for="project in result.recommendedProjects" :key="project">{{ project }}</li>
          </ul>
        </article>

        <article class="info-card">
          <h3>Technologies à apprendre</h3>
          <ul>
            <li v-for="technology in result.technologiesToLearn" :key="technology">
              {{ technology }}
            </li>
          </ul>
        </article>
      </section>

      <section v-if="result" class="roadmap-card">
        <div>
          <p class="eyebrow">Plan d’amélioration</p>
          <h2>Roadmap personnalisée</h2>
        </div>

        <div class="timeline">
          <article v-for="step in result.roadmap" :key="step.step" class="timeline-item">
            <div class="step-dot">{{ step.step }}</div>
            <div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.items.join(" · ") }}</p>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

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
.config-card,
.result-card,
.info-card,
.roadmap-card {
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
.card-text,
.summary,
.empty-state p,
.timeline p {
  color: var(--navy-mid);
  font-weight: 700;
}

.hero-badge,
.prediction {
  background: #eeecff;
  color: var(--purple);
  border-radius: var(--radius-pill);
  padding: 12px 18px;
  font-family: var(--font-head);
  font-weight: 800;
}

.analysis-grid {
  display: grid;
  grid-template-columns: minmax(280px, 0.8fr) minmax(320px, 1.2fr);
  gap: 20px;
}

.config-card,
.result-card,
.roadmap-card {
  padding: 24px;
}

.career-options,
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 18px 0;
}

.pill-btn,
.primary-btn {
  border-radius: var(--radius-pill);
  font-weight: 800;
  font-family: var(--font-head);
  transition: var(--ease);
}

.pill-btn {
  border: 1px solid #9aa4b2;
  color: var(--navy-mid);
  background: white;
  padding: 10px 18px;
}

.pill-btn.active,
.primary-btn {
  background: var(--purple);
  color: white;
  box-shadow: 0 12px 26px rgba(79, 70, 229, 0.22);
}

.profile-box {
  background: var(--bg-soft-purple);
  border-radius: 14px;
  padding: 16px;
  margin: 18px 0;
}

.chips span {
  background: white;
  color: var(--purple);
  border-radius: var(--radius-pill);
  padding: 8px 12px;
  font-weight: 800;
}

.primary-btn {
  width: 100%;
  padding: 14px 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.primary-btn:disabled {
  opacity: 0.75;
}

.loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.result-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.result-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
}

.result-header h2 {
  color: var(--purple);
  font-size: 3.4rem;
}

.score-track {
  height: 14px;
  background: var(--input-bg);
  border-radius: var(--radius-pill);
  overflow: hidden;
  margin: 18px 0;
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--purple), var(--blue-w));
  border-radius: var(--radius-pill);
  transition: width 0.5s ease;
}

.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.info-card {
  padding: 22px;
}

.info-card ul {
  list-style: none;
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.info-card li {
  background: var(--bg-soft-purple);
  color: var(--navy-mid);
  border-radius: 12px;
  padding: 12px 14px;
  font-weight: 800;
}

.roadmap-card {
  margin-top: 20px;
}

.timeline {
  display: grid;
  gap: 16px;
  margin-top: 18px;
}

.timeline-item {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 16px;
  border-radius: 14px;
  background: var(--bg-soft-purple);
}

.step-dot {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--purple);
  color: white;
  font-family: var(--font-head);
  font-weight: 900;
  flex: 0 0 auto;
}

.error-message {
  color: var(--error);
  font-weight: 800;
  margin-top: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .ai-content.shifted {
    padding-left: 24px;
  }

  .analysis-grid,
  .recommendation-grid {
    grid-template-columns: 1fr;
  }

  .hero-card,
  .result-header {
    flex-direction: column;
  }
}
</style>

