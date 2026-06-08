<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import SidebarStudent from "../components/exploreStudent/Sidebar.vue";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import SidebarPro from "../components/explorePro/SidebarPro.vue";
import SkillBadges from "../components/exploreStudent/SkillBadges.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import { postService } from "../services/post.service";
import { resolveProfileBadges } from "../utils/profileBadges";

const route = useRoute();
const router = useRouter();
const sidebarOpen = ref(true);
const loading = ref(true);
const error = ref("");

const fromQuery = computed(() => String(route.query.from || ""));
const role = computed<"student" | "prof" | "pro">(() => {
  if (fromQuery.value === "prof" || fromQuery.value === "teacher") return "prof";
  if (fromQuery.value === "pro" || fromQuery.value === "professional") return "pro";

  const storedRole = String(localStorage.getItem("role") || "").toUpperCase();
  if (storedRole === "PROFESSEUR" || storedRole === "TEACHER") return "prof";
  if (storedRole === "PROFESSIONNEL" || storedRole === "PROFESSIONAL") return "pro";
  return "student";
});

interface ProjectDetails {
  id: string;
  studentId: string;
  studentName: string;
  initials: string;
  school: string;
  title: string;
  description: string;
  badges: string[];
  technologies: string[];
  github?: string;
  demo?: string;
  previewImage?: string;
  profilePath: string;
}

const project = ref<ProjectDetails | null>(null);

const toInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const parseStructuredContent = (content: string) => {
  try {
    const parsed = JSON.parse(content);
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
};

const fullName = (user: any) =>
  [user?.prenom, user?.nom].filter(Boolean).join(" ").trim() || "Étudiant";

const resolveBackendAsset = (path: string) => {
  if (!path || /^https?:\/\//.test(path)) return path;
  const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
  const backendBase = apiBase.replace(/\/api\/?$/, "");
  return `${backendBase}${path}`;
};

const normalizeExternalUrl = (value?: string) => {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const mapProject = (post: any): ProjectDetails => {
  const structured = parseStructuredContent(post?.contenu || "");
  const studentName = fullName(post?.auteur);
  const studentId = String(post?.auteur?.id_utilisateur ?? "");
  const school = [post?.auteur?.profil?.adresse, post?.auteur?.etudiant?.filiere || post?.auteur?.role]
    .filter(Boolean)
    .join(" · ");

  return {
    id: String(post?.id_poste ?? route.params.id ?? ""),
    studentId,
    studentName,
    initials: toInitials(studentName),
    school: school || "Maroc",
    title:
      structured?.projectTitle ||
      String(post?.contenu || "").split("\n")[0]?.slice(0, 70) ||
      "Publication",
    description: structured?.description || post?.contenu || "",
    badges: resolveProfileBadges({
      badges: post?.auteur?.etudiant?.badges,
      competences: post?.auteur?.etudiant?.competences,
      filiere: post?.auteur?.etudiant?.filiere,
      bio: post?.auteur?.profil?.bio,
    }),
    technologies: Array.isArray(structured?.technologies)
      ? structured.technologies.filter(Boolean)
      : [],
    github: normalizeExternalUrl(structured?.github),
    demo: normalizeExternalUrl(structured?.demo),
    previewImage: post?.image_url ? resolveBackendAsset(post.image_url) : "",
    profilePath: `/profile/student/${studentId}?from=${role.value}`,
  };
};

async function loadProject() {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await postService.getPost(route.params.id);
    const backendPost = data?.data || data;

    if (!backendPost) {
      error.value = "Projet introuvable.";
      project.value = null;
      return;
    }

    project.value = mapProject(backendPost);
  } catch (apiError: any) {
    error.value = apiError?.response?.data?.message || "Impossible de charger ce projet.";
    project.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(loadProject);
</script>

<template>
  <div class="project-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarStudent v-if="role === 'student'" :is-open="sidebarOpen" />
    <SidebarProf v-else-if="role === 'prof'" :is-open="sidebarOpen" />
    <SidebarPro v-else :is-open="sidebarOpen" />

    <main class="project-shell" :class="{ 'project-shellShift': sidebarOpen }">
      <section class="project-card">
        <button type="button" class="back-button" @click="router.back()">
          Retour au fil
        </button>

        <div v-if="loading" class="page-state">Chargement du projet...</div>
        <div v-else-if="error" class="page-state page-state--error">{{ error }}</div>

        <template v-else-if="project">
          <div class="student-row">
            <div class="student-avatar">{{ project.initials }}</div>
            <div>
              <h1>{{ project.title }}</h1>
              <button
                type="button"
                class="student-link"
                @click="router.push(project.profilePath)"
              >
                {{ project.studentName }}
              </button>
              <SkillBadges :badges="project.badges" compact />
              <p>{{ project.school }}</p>
            </div>
          </div>

          <div v-if="project.previewImage" class="preview has-image">
            <img :src="project.previewImage" :alt="project.title" class="preview-image" />
          </div>
          <div v-else class="preview">{{ project.title }}</div>

          <p class="description">{{ project.description }}</p>

          <div class="tag-row">
            <span v-for="technology in project.technologies" :key="technology">
              {{ technology }}
            </span>
          </div>

          <div class="link-row">
            <a v-if="project.github" :href="project.github" target="_blank" rel="noopener">GitHub</a>
            <a v-if="project.demo" :href="project.demo" target="_blank" rel="noopener">Démo</a>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<style scoped>
.project-page {
  min-height: 100vh;
  width: 100vw;
  background: var(--bg-soft-purple);
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

.page-state {
  color: var(--navy-mid);
  font-weight: 700;
}

.page-state--error {
  color: var(--error);
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
  font-family: var(--font-head);
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

.preview.has-image {
  padding: 0;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

@media (max-width: 980px) {
  .project-shellShift {
    padding-left: 22px;
  }
}
</style>
