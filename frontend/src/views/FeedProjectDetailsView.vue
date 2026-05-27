<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import SidebarStudent from "../components/exploreStudent/Sidebar.vue";
import SkillBadges from "../components/exploreStudent/SkillBadges.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";

const route = useRoute();
const router = useRouter();
const sidebarOpen = ref(true);

interface ProjectDetails {
  id: string;
  studentName: string;
  initials: string;
  school: string;
  title: string;
  description: string;
  badges: string[];
  technologies: string[];
  github?: string;
  demo?: string;
}

const projects: ProjectDetails[] = [
  {
    id: "portfolio-web",
    studentName: "Khadija Bennani",
    initials: "KB",
    school: "ENSA Tanger · GINF",
    title: "Portfolio Web",
    description:
      "Application portfolio moderne avec recommandations, projets, authentification et dashboard de suivi.",
    badges: ["🌐 Web Developer", "🔐 Security Aware", "🏆 Hackathon Participant"],
    technologies: ["Vue.js", "Node.js", "Docker", "PostgreSQL"],
    github: "github.com/khadija/portfolio-web",
    demo: "portfolio-demo.local",
  },
  {
    id: "stage-devops",
    studentName: "Yassine El Amrani",
    initials: "YE",
    school: "ENSA Tanger · DevOps",
    title: "Pipeline CI/CD pour microservices",
    description:
      "Mise en place d'un pipeline CI/CD avec tests automatisés, Docker Compose et monitoring Prometheus.",
    badges: ["🌊 DevOps", "🔐 Security Aware"],
    technologies: ["Docker", "CI/CD", "GitLab", "Prometheus"],
    github: "github.com/yassine/devops-pipeline",
  },
  {
    id: "cloud-dashboard",
    studentName: "Sara Alaoui",
    initials: "SA",
    school: "ENSA Tanger · Cloud",
    title: "Cloud Cost Dashboard",
    description:
      "Dashboard pour suivre les coûts cloud, détecter les anomalies et proposer des optimisations.",
    badges: ["🧠 AI / Data", "🌐 Web Developer"],
    technologies: ["AWS", "Vue.js", "Python", "Figma"],
    demo: "cloud-cost-demo.local",
  },
  {
    id: "mobile-ensa",
    studentName: "Nora Tazi",
    initials: "NT",
    school: "ENSA Tanger · Mobile",
    title: "Application Mobile ENSA",
    description:
      "Application mobile pour les annonces, événements, clubs et demandes administratives des étudiants.",
    badges: ["🌐 Web Developer", "🏆 Hackathon Participant"],
    technologies: ["Flutter", "Firebase", "Figma"],
  },
];

const project = computed<ProjectDetails>(() =>
  projects.find((item) => item.id === route.params.id) ?? projects[0]!,
);
</script>

<template>
  <div class="project-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarStudent :isOpen="sidebarOpen" />

    <main class="project-shell" :class="{ 'project-shellShift': sidebarOpen }">
      <section class="project-card">
        <button type="button" class="back-button" @click="router.back()">
          Retour au fil
        </button>

        <div class="student-row">
          <div class="student-avatar">{{ project.initials }}</div>
          <div>
            <h1>{{ project.title }}</h1>
            <button
              type="button"
              class="student-link"
              @click="router.push(`/profile/student/${project.id}`)"
            >
              {{ project.studentName }}
            </button>
            <SkillBadges :badges="project.badges" compact />
            <p>{{ project.school }}</p>
          </div>
        </div>

        <div class="preview">{{ project.title }}</div>
        <p class="description">{{ project.description }}</p>

        <div class="tag-row">
          <span v-for="technology in project.technologies" :key="technology">
            {{ technology }}
          </span>
        </div>

        <div class="link-row">
          <a v-if="project.github" href="#" @click.prevent>{{ project.github }}</a>
          <a v-if="project.demo" href="#" @click.prevent>{{ project.demo }}</a>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.project-page {
  min-height: 100vh;
  width: 100vw;
  background: #eef1fb;
  color: var(--text-dark);
  font-family: var(--font-body);
  padding-top: 50px;
}

.project-shell {
  padding: 22px;
  transition: padding-left 0.3s ease;
}

.project-shellShift {
  padding-left: 242px;
}

.project-card {
  width: min(860px, 100%);
  margin: 0 auto;
  background: white;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: var(--radius-card);
  box-shadow: 0 14px 32px rgba(17, 24, 39, 0.08);
  padding: 24px;
}

.back-button,
.student-link {
  background: transparent;
  color: var(--purple);
  font-weight: 800;
}

.student-row {
  display: flex;
  gap: 16px;
  margin-top: 18px;
}

.student-avatar {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: var(--input-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

h1 {
  font-size: 30px;
  font-weight: 800;
}

p {
  color: var(--navy-mid);
  font-weight: 700;
}

.preview {
  height: 250px;
  border-radius: var(--radius-card);
  background: var(--input-bg);
  color: var(--text-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 22px 0;
  font-weight: 800;
}

.description {
  line-height: 1.6;
}

.tag-row,
.link-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.tag-row span,
.link-row a {
  border-radius: var(--radius-pill);
  background: rgba(79, 70, 229, 0.12);
  color: var(--purple);
  padding: 8px 13px;
  font-size: 12px;
  font-weight: 800;
}
</style>
