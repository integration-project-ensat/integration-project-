<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Sidebar from "../components/exploreStudent/Sidebar.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import { getCareerRecommendation } from "../services/aiRecommendation.service";
import { profileService } from "../services/profile.service";

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
  targetCareer?: string;
  correctedCareer?: string;
  analysisMode?: "custom" | "trained";
  matchedDomains?: string[];
  matchScore: number;
  missingSkills: string[];
  recommendedProjects: string[];
  technologiesToLearn: string[];
  summary: string;
  roadmap: Array<{ step: string; title: string; items: string[] }>;
  debug?: {
    modelScore?: number;
    rulesScore?: number;
    alignmentBonus?: number;
    profileRichness?: number;
  };
}

const sidebarOpen = ref(true);
const targetCareer = ref<Career>("DevOps");
const loading = ref(false);
const loadingProfile = ref(true);
const error = ref("");
const profileError = ref("");
const result = ref<RecommendationResult | null>(null);
const profileSource = ref<any>(null);
const customCareerInput = ref("");
const profilePreview = ref<any>(null);

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

const analyzedProfile = computed(() => profileSource.value || profilePreview.value || null);
const analyzedStudent = computed(() => analyzedProfile.value?.student || null);
const analyzedSkills = computed(() => {
  const values = analyzedProfile.value?.skills;
  return Array.isArray(values) ? values.filter(Boolean) : [];
});

const scoreStyle = computed(() => ({
  width: `${result.value?.matchScore ?? 0}%`,
}));

const selectedCareer = computed(() => customCareerInput.value.trim() || targetCareer.value);

const storedUserId = computed(() => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id || parsed?.id_utilisateur || null;
  } catch {
    return null;
  }
});

async function analyzeProfile() {
  if (!profilePreview.value || !storedUserId.value) {
    error.value = "Impossible de lancer l'analyse sans un vrai profil étudiant chargé depuis le backend.";
    result.value = null;
    profileSource.value = null;
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const response = await getCareerRecommendation({
      targetCareer: selectedCareer.value,
      studentId: storedUserId.value,
      skills: profilePreview.value.skills,
      projects: profilePreview.value.projects,
      technologies: profilePreview.value.technologies,
      badges: profilePreview.value.badges,
      stages: profilePreview.value.stages,
      student: profilePreview.value.student,
    });
    result.value = response.data.data;
    profileSource.value = response.data.profileSource || profilePreview.value;
  } catch (apiError: any) {
    error.value =
      apiError.response?.data?.message ||
      "Impossible de générer la recommandation IA sans un vrai profil étudiant connecté.";
    result.value = null;
    profileSource.value = null;
  } finally {
    loading.value = false;
  }
}

function buildProfilePreview(profile: any) {
  const raw = profile?.raw || {};
  const student = raw?.etudiant || {};

  return {
    skills: Array.isArray(profile?.competences) ? profile.competences : [],
    projects: Array.isArray(profile?.projectsData)
      ? profile.projectsData
          .flatMap((project: any) => [
            project?.titre,
            project?.description,
            project?.type,
            project?.role,
            project?.resultats,
          ])
          .filter(Boolean)
      : [],
    technologies: Array.isArray(profile?.projectsData)
      ? profile.projectsData.flatMap((project: any) =>
          Array.isArray(project?.technologies)
            ? project.technologies
                .map((item: any) => item?.technologie?.nom)
                .filter(Boolean)
            : [],
        )
      : [],
    badges: Array.isArray(profile?.badgesData)
      ? profile.badgesData.map((item: any) => item?.badge?.nom).filter(Boolean)
      : [],
    stages: Array.isArray(profile?.stagesData)
      ? profile.stagesData
          .flatMap((stage: any) => [
            stage?.entreprise,
            stage?.poste,
            stage?.missions,
            stage?.technologies,
          ])
          .filter(Boolean)
      : [],
    student: {
      id: profile?.id || storedUserId.value,
      name: profile?.name || "Profil étudiant",
      filiere: student?.filiere || profile?.title || "Filière non renseignée",
      anneeUniversitaire: student?.annee_universitaire || null,
      objectifPro: raw?.portfolio?.objectif_pro || null,
      source: "profile",
    },
  };
}

onMounted(async () => {
  loadingProfile.value = true;
  profileError.value = "";

  try {
    const profile = await profileService.getCurrentUser();
    profilePreview.value = buildProfilePreview(profile);
  } catch (apiError: any) {
    profilePreview.value = null;
    profileError.value =
      apiError?.response?.data?.message ||
      "Impossible de charger le vrai profil étudiant pour l'analyse IA.";
  } finally {
    loadingProfile.value = false;
  }
});
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
            <p v-if="loadingProfile" class="profile-source">Chargement du profil backend...</p>
            <p v-else-if="profileError" class="profile-source error-message">{{ profileError }}</p>
            <template v-else-if="analyzedStudent">
              <p class="profile-source">
                {{ analyzedStudent.name }} · {{ analyzedStudent.filiere || "Filière non renseignée" }}
              </p>
              <div class="chips">
                <span v-for="skill in analyzedSkills" :key="skill">{{ skill }}</span>
                <span v-if="!analyzedSkills.length">Aucune compétence détectée.</span>
              </div>
            </template>
            <p v-else class="profile-source">Aucun profil réel détecté.</p>
          </div>

          <label class="career-field">
            <span>Ou écrivez le métier que vous visez</span>
            <input
              v-model="customCareerInput"
              type="text"
              placeholder="Exemple : Machine Learning Engineer, QA Engineer..."
            />
            <small>Si vous écrivez un métier ici, il remplace le choix sélectionné.</small>
          </label>

          <button class="primary-btn" :disabled="loading || loadingProfile || !profilePreview" @click="analyzeProfile">
            <span v-if="loading" class="loader" />
            {{ loading ? "Analyse en cours..." : "Analyser mon profil" }}
          </button>

          <p v-if="error" class="error-message">{{ error }}</p>
        </article>

        <article class="result-card">
          <template v-if="result && analyzedStudent">
            <div class="result-header">
              <div>
                <p class="eyebrow">Score de compatibilité</p>
                <h2>{{ result.matchScore }}%</h2>
              </div>
              <span class="prediction">
                Métier analysé : {{ result.correctedCareer || result.targetCareer || selectedCareer }}
              </span>
            </div>

            <div
              v-if="result.analysisMode === 'custom' && result.matchedDomains?.length"
              class="detected-domains"
            >
              Domaines détectés :
              <span v-for="domain in result.matchedDomains" :key="domain">{{ domain }}</span>
            </div>

            <div class="score-track">
              <div class="score-fill" :style="scoreStyle" />
            </div>

            <div class="analysis-debug">
              <span>ID: {{ analyzedStudent.id || storedUserId || "?" }}</span>
              <span>Source: {{ analyzedStudent.source || "unknown" }}</span>
              <span>Model: {{ result.debug?.modelScore ?? "-" }}</span>
              <span>Rules: {{ result.debug?.rulesScore ?? "-" }}</span>
              <span>Align: {{ result.debug?.alignmentBonus ?? "-" }}</span>
              <span>Richness: {{ result.debug?.profileRichness ?? "-" }}</span>
            </div>

            <p class="summary">{{ result.summary }}</p>
          </template>
          <div v-else class="empty-state">
            <h2>Prêt pour l'analyse</h2>
            <p>Le résultat IA apparaîtra ici après l'analyse de votre vrai profil backend.</p>
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
          <p class="eyebrow">Plan d'amélioration</p>
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
.timeline p,
.profile-source {
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

.career-field {
  display: grid;
  gap: 8px;
  margin: 18px 0;
}

.career-field span {
  color: var(--navy);
  font-family: var(--font-head);
  font-weight: 800;
}

.career-field input {
  width: 100%;
  border: 1px solid #d7dce5;
  border-radius: 16px;
  background: white;
  color: var(--navy);
  padding: 14px 16px;
  font: inherit;
  font-weight: 700;
  outline: none;
  transition: var(--ease);
}

.career-field input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
}

.career-field small {
  color: var(--text-gray);
  font-weight: 700;
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

.detected-domains {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  color: var(--text-gray);
  font-weight: 800;
  margin-top: 16px;
}

.detected-domains span {
  background: #eeecff;
  color: var(--purple);
  border-radius: var(--radius-pill);
  padding: 6px 10px;
  font-family: var(--font-head);
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

.analysis-debug {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 16px;
}

.analysis-debug span {
  background: #eeecff;
  color: var(--purple);
  border-radius: var(--radius-pill);
  padding: 6px 10px;
  font-size: 0.78rem;
  font-weight: 800;
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
