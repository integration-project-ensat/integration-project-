<template>
  <div class="page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <Sidebar :isOpen="sidebarOpen" />

    <div class="shell" :class="{ shellShift: sidebarOpen }">
      <div class="content-panel">
        <div class="panel-header">
          <div>
            <h1 class="panel-title">GitHub</h1>
            <p class="panel-subtitle">Vos dépôts connectés et les liens GitHub de vos projets.</p>
          </div>
          <a v-if="githubUrl" :href="githubUrl" target="_blank" rel="noopener" class="profile-btn">
            Ouvrir le profil GitHub
          </a>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <strong>{{ githubUsername || "Non connecté" }}</strong>
            <span>Username GitHub</span>
          </div>
          <div class="stat-card">
            <strong>{{ repos.length }}</strong>
            <span>Dépôts synchronisés</span>
          </div>
          <div class="stat-card">
            <strong>{{ projectLinks.length }}</strong>
            <span>Projets avec lien GitHub</span>
          </div>
        </div>

        <section class="section">
          <div class="section-head">
            <h2>Dépôts</h2>
          </div>

          <div v-if="repos.length === 0" class="empty-state">
            <p>Aucun dépôt GitHub synchronisé pour le moment.</p>
          </div>

          <div v-else class="cards">
            <article v-for="repo in repos" :key="repo.id" class="card">
              <div class="card-body">
                <div class="card-head">
                  <div>
                    <h3>{{ repo.name }}</h3>
                    <p>{{ repo.languages.join(" · ") || "Langages non renseignés" }}</p>
                  </div>
                  <span class="commit-badge">{{ repo.commits }} commits</span>
                </div>
                <a v-if="repo.url" :href="repo.url" target="_blank" rel="noopener" class="repo-link">
                  {{ repo.url }}
                </a>
              </div>
            </article>
          </div>
        </section>

        <section class="section">
          <div class="section-head">
            <h2>Liens GitHub de vos projets</h2>
          </div>

          <div v-if="projectLinks.length === 0" class="empty-state">
            <p>Aucun projet avec lien GitHub trouvé.</p>
          </div>

          <div v-else class="cards">
            <article v-for="project in projectLinks" :key="project.id" class="card">
              <div class="card-body">
                <div class="card-head">
                  <div>
                    <h3>{{ project.title }}</h3>
                    <p>{{ project.technologies.join(" · ") || "Technologies non renseignées" }}</p>
                  </div>
                </div>
                <a :href="project.url" target="_blank" rel="noopener" class="repo-link">
                  {{ project.url }}
                </a>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Sidebar from "../components/exploreStudent/Sidebar.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import { profileService } from "../services/profile.service";

interface RepoItem {
  id: number;
  name: string;
  url: string;
  commits: number;
  languages: string[];
}

interface ProjectLink {
  id: number;
  title: string;
  url: string;
  technologies: string[];
}

const sidebarOpen = ref(true);
const githubUsername = ref("");
const githubUrl = ref("");
const repos = ref<RepoItem[]>([]);
const projectLinks = ref<ProjectLink[]>([]);

async function loadGithubData() {
  try {
    const profile = await profileService.getProfile();
    githubUsername.value = profile?.githubUsername || "";
    githubUrl.value = profile?.github || "";
    repos.value = Array.isArray(profile?.githubRepos) ? profile.githubRepos : [];

    const rawProjects = Array.isArray(profile?.projectsData) ? profile.projectsData : [];
    projectLinks.value = rawProjects
      .filter((project: any) => project?.lien_github)
      .map((project: any) => ({
        id: Number(project?.id_projet ?? project?.id ?? Date.now()),
        title: project?.titre || "Projet",
        url: project?.lien_github,
        technologies: Array.isArray(project?.technologies)
          ? project.technologies.map((entry: any) => entry?.technologie?.nom).filter(Boolean)
          : [],
      }));
  } catch (error) {
    console.warn("Chargement des données GitHub impossible", error);
    repos.value = [];
    projectLinks.value = [];
  }
}

onMounted(() => {
  loadGithubData();
});
</script>

<style scoped>
.page { height: 100vh; width: 100vw; overflow: hidden; background: var(--bg-soft-purple); padding-top: 50px; font-family: var(--font-body); }
.shell { height: calc(100vh - 50px); padding: 14px; overflow-y: auto; transition: var(--ease); }
.shellShift { padding-left: 234px; padding-right: 14px; }
.content-panel { width: 100%; background: #fff; border-radius: var(--radius-card); box-shadow: 0 4px 24px rgba(17,24,39,0.08); overflow: hidden; border: 1px solid rgba(17,24,39,0.04); }
.panel-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; padding:22px 28px; border-bottom:1px solid var(--input-bg); }
.panel-title { font-size:1.25rem; font-weight:700; color:var(--text-dark); margin:0; font-family:var(--font-head); }
.panel-subtitle { font-size:.82rem; color:var(--text-gray); margin:4px 0 0; }
.profile-btn { background:var(--purple); color:#fff; border-radius:999px; padding:10px 16px; text-decoration:none; font-weight:700; transition: var(--ease); }
.profile-btn:hover { background: var(--purple-hover); }
.stats-grid { display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:14px; padding:18px 28px; border-bottom:1px solid var(--input-bg); }
.stat-card { background:linear-gradient(180deg, #ffffff 0%, #f8f8ff 100%); border:1px solid var(--input-bg); border-radius:16px; padding:18px; display:flex; flex-direction:column; gap:6px; }
.stat-card strong { font-size:1rem; color:var(--text-dark); }
.stat-card span { font-size:.82rem; color:var(--text-gray); }
.section { padding:18px 28px 28px; }
.section-head { margin-bottom:12px; }
.section-head h2 { margin:0; font-size:1rem; font-family:var(--font-head); color:var(--text-dark); }
.cards { display:flex; flex-direction:column; gap:14px; }
.card { border:1px solid var(--input-bg); border-radius:var(--radius-card); padding:18px; background: linear-gradient(180deg, #ffffff 0%, #fbfbff 100%); }
.card-head { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:10px; }
.card-head h3 { margin:0; font-size:.98rem; font-family:var(--font-head); }
.card-head p { margin:4px 0 0; font-size:.8rem; color:var(--text-gray); }
.commit-badge { background:#eeecff; color:var(--purple); border-radius:999px; padding:6px 10px; font-size:.76rem; font-weight:700; }
.repo-link { color:var(--purple); text-decoration:none; word-break:break-all; }
.repo-link:hover { text-decoration:underline; }
.empty-state { color:var(--text-gray); text-align:center; padding:24px 12px; }
@media (max-width: 900px) { .stats-grid { grid-template-columns:1fr; } }
</style>
