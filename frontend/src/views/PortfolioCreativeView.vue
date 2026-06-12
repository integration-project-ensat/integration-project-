<template>
  <main class="portfolio-page">

    <!-- ────── HEADER ────── -->
    <header class="portfolio-header">
      <div class="header-left">
        <RouterLink :to="profileLink" class="brand">
          <img src="@/assets/PheraCoreLogo.svg" alt="PheraCore" />
          <span>heraCore</span>
        </RouterLink>
      </div>

      <nav class="nav-links" aria-label="Sections">
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
          :class="{ active: activeSectionId === section.id }"
          @click="scrollToSection(section.id)"
        >
          {{ section.label }}
        </button>
      </nav>

      <div class="header-right">
        <button type="button" class="hbtn" @click="downloadHtml">HTML</button>
        <button type="button" class="hbtn" @click="downloadPdf">PDF</button>
        <button type="button" class="hbtn accent" @click="openTemplateSelector">Template</button>
      </div>
    </header>

    <!-- ────── TEMPLATE MODAL ────── -->
    <div v-if="showTemplateModal" class="template-modal">
      <div class="template-card">
        <h3>Choisir un template</h3>
        <div
          v-for="template in templates"
          :key="template.id_modele"
          class="template-item"
          @click="selectTemplate(template.id_modele)"
        >{{ template.nom }}</div>
        <button type="button" @click="showTemplateModal = false">Fermer</button>
      </div>
    </div>

    <!-- ────── STATES ────── -->
    <div v-if="loading" class="page-state">Chargement…</div>
    <div v-else-if="error" class="page-state page-state--error">{{ error }}</div>

    <template v-else>

      <!-- ── HERO ─────────────────────────────────────── -->
      <section id="about" data-section-id="about" class="hero-section">
        <div class="hero-meta">
          <span class="label">Portfolio Professionnel</span>
          <span class="divider">—</span>
          <span class="label">{{ profile.school }}</span>
        </div>

        <div class="hero-main">
          <div class="hero-name">
            <h1><span class="italic">{{ profile.firstName }}</span><br /><span class="last">{{ profile.lastName }}</span></h1>
            <p class="hero-title">{{ profile.title }}</p>
          </div>

          <div class="hero-aside">
            <div class="hero-photo">
              <img v-if="profile.avatar" :src="profile.avatar" alt="Profile" />
              <span v-else>{{ profileInitials }}</span>
            </div>

            <div class="hero-contacts">
              <a v-if="profile.email"    :href="`mailto:${profile.email}`"  class="contact-row">✉ {{ profile.email }}</a>
              <a v-if="profile.phone"    :href="`tel:${profile.phone}`"     class="contact-row">📞 {{ profile.phone }}</a>
              <a v-if="profile.linkedin" :href="profile.linkedin" target="_blank" rel="noopener" class="contact-row">in  LinkedIn</a>
              <a v-if="profile.github"   :href="profile.github"  target="_blank" rel="noopener" class="contact-row">GH  GitHub</a>
            </div>
          </div>
        </div>

        <div class="hero-bio-strip">
          <div class="bio-label">À propos</div>
          <p class="bio-text">{{ profile.bio }}</p>
          <div class="recos-row">
            <span v-for="person in recosPreview" :key="person.name" class="recos-avatar" :class="avatarColorClass(person.name)">{{ getInitials(person.name) }}</span>
            <span class="recos-num">{{ profile.recos }} recommandations</span>
          </div>
        </div>
      </section>

      <!-- ── TWO-COL LAYOUT ─────────────────────────── -->
      <div class="two-col-wrap">

        <!-- LEFT COLUMN -->
        <aside class="sidebar">

          <section id="skills" data-section-id="skills" class="sidebar-section">
            <h2 class="sidebar-title">Compétences</h2>
            <template v-if="skills.length">
              <div v-for="group in skills" :key="group.title" class="skill-group">
                <h3 class="skill-cat">{{ group.title }}</h3>
                <ul class="skill-list">
                  <li v-for="skill in group.items" :key="skill">{{ skill }}</li>
                </ul>
              </div>
            </template>
            <p v-else class="empty">Aucune compétence.</p>
          </section>

          <section id="certifications" data-section-id="certifications" class="sidebar-section">
            <h2 class="sidebar-title">Certifications</h2>
            <template v-if="sortedCertifications.length">
              <div v-for="cert in sortedCertifications" :key="cert.name" class="cert-row">
                <div class="cert-bar" :style="{ width: `${cert.strength}%` }"></div>
                <div class="cert-info">
                  <span class="cert-name">{{ cert.name }}</span>
                  <span class="cert-org">{{ cert.organization }} · {{ cert.date }}</span>
                </div>
                <a v-if="cert.link" :href="cert.link" target="_blank" rel="noopener" class="cert-link">↗</a>
              </div>
            </template>
            <p v-else class="empty">Aucune certification.</p>
          </section>

          <section id="contact" data-section-id="contact" class="sidebar-section">
            <h2 class="sidebar-title">Contact</h2>
            <div class="contact-list">
              <a v-if="profile.phone"    :href="`tel:${profile.phone}`"      class="contact-item">📞<span>{{ profile.phone }}</span></a>
              <a v-if="profile.email"    :href="`mailto:${profile.email}`"   class="contact-item">✉<span>{{ profile.email }}</span></a>
              <a v-if="profile.linkedin" :href="profile.linkedin" target="_blank" rel="noopener" class="contact-item">in<span>LinkedIn</span></a>
              <a v-if="profile.github"   :href="profile.github"  target="_blank" rel="noopener" class="contact-item">GH<span>GitHub</span></a>
            </div>
          </section>

        </aside>

        <!-- MAIN COLUMN -->
        <main class="main-col">

          <section id="journey" data-section-id="journey" class="main-section">
            <h2 class="main-title">Parcours</h2>
            <div v-if="diplomas.length" class="timeline">
              <div v-for="diploma in diplomas" :key="`${diploma.title}-${diploma.period}`" class="tl-row">
                <div class="tl-year">{{ diploma.period }}</div>
                <div class="tl-connector"><div class="tl-dot"></div><div class="tl-line"></div></div>
                <div class="tl-body">
                  <h3>{{ diploma.title }}</h3>
                  <p class="tl-school">{{ diploma.school }}</p>
                  <p class="tl-desc">{{ diploma.description }}</p>
                </div>
              </div>
            </div>
            <p v-else class="empty">Aucun diplôme renseigné.</p>
          </section>

          <section id="experience" data-section-id="experience" class="main-section">
            <h2 class="main-title">Expérience</h2>
            <div v-if="experiences.length" class="exp-list">
              <article v-for="exp in experiences" :key="`${exp.role}-${exp.company}`" class="exp-row">
                <div class="exp-header">
                  <div>
                    <h3>{{ exp.role }}</h3>
                    <span class="exp-company">{{ exp.company }}</span>
                  </div>
                  <div class="exp-right">
                    <span class="exp-period">{{ exp.period }}</span>
                    <span class="exp-location">{{ exp.location }}</span>
                    <span class="exp-mode-tag">{{ exp.mode }}</span>
                  </div>
                </div>
                <p class="exp-desc">{{ exp.description }}</p>
              </article>
            </div>
            <p v-else class="empty">Aucune expérience renseignée.</p>
          </section>

          <section id="projects" data-section-id="projects" class="main-section">
            <h2 class="main-title">Projets</h2>
            <div v-if="projects.length" class="proj-table">
              <div
                v-for="project in projects"
                :key="project.id"
                class="proj-row"
                :class="{ 'proj-row--selected': selectedProjectId === project.id }"
                @click="selectedProjectId = selectedProjectId === project.id ? null : project.id"
              >
                <div class="proj-row-top">
                  <div class="proj-row-left">
                    <span class="proj-icon" :class="`proj-icon--${(project.id % 3) + 1}`">{{ project.icon }}</span>
                    <div>
                      <h3>{{ project.title }}</h3>
                      <span class="proj-type">{{ project.type }}</span>
                    </div>
                  </div>
                  <div class="proj-tags">
                    <span v-for="tech in project.tech.slice(0, 3)" :key="tech" class="tag">{{ tech }}</span>
                  </div>
                  <span class="proj-chevron">{{ selectedProjectId === project.id ? '▲' : '▼' }}</span>
                </div>
                <div v-if="selectedProjectId === project.id" class="proj-detail">
                  <p>{{ project.details }}</p>
                  <div v-if="project.github || project.images.length" class="proj-links">
                    <a v-if="project.github" :href="project.github" target="_blank" rel="noopener">→ Voir le code</a>
                    <div class="proj-media">
                      <div v-for="(img, idx) in project.images" :key="idx" class="media-thumb">
                        <img v-if="img" :src="img" alt="capture" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="empty">Aucun projet pour le moment.</p>
          </section>

        </main>
      </div>

    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { portfolioService }      from "../services/portfolio.service";
import { postService }           from "../services/post.service";
import { profileService }        from "../services/profile.service";
import { recommendationService } from "../services/recommendation.service";
import { attestationService }    from "../services/attestation.service";
import { projetService }         from "../services/projet.service";
import { activiteService }       from "../services/activite.service";
import { stageService }          from "../services/stage.service";
import { resolveBackendAsset }   from "../utils/backendAsset";

const showTemplateModal = ref(false);
const templates = ref<Array<{ id_modele: number; nom: string }>>([]);
const currentTemplate = ref<number>(3);

type SectionId = "about"|"skills"|"journey"|"projects"|"experience"|"certifications"|"contact";
type SkillGroup    = { title: string; items: string[] };
type DiplomaItem   = { title: string; school: string; period: string; description: string };
type Project       = { id: number; icon: string; title: string; type: string; description: string; details: string; tech: string[]; github: string; images: string[] };
type ExperienceItem = { role: string; company: string; period: string; location: string; mode: string; description: string };
type CertificationItem = { name: string; organization: string; date: string; strength: number; link: string };

const route  = useRoute();
const router = useRouter();

const sections: Array<{ id: SectionId; label: string }> = [
  { id: "about",          label: "À propos"      },
  { id: "skills",         label: "Compétences"   },
  { id: "journey",        label: "Parcours"      },
  { id: "projects",       label: "Projets"       },
  { id: "experience",     label: "Expérience"    },
  { id: "certifications", label: "Certifications"},
  { id: "contact",        label: "Contact"       },
];

function getCurrentUserIdFromStorage() {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;
  try {
    const parsed = JSON.parse(rawUser);
    const id = parsed?.id ?? parsed?.id_utilisateur;
    const numericId = Number(id);
    return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
  } catch { return null; }
}

const openTemplateSelector = () => { showTemplateModal.value = true; };

const loadTemplates = async () => {
  try {
    const response = await portfolioService.getTemplates();
    templates.value = Array.isArray(response) ? response : (response?.data ?? []);
  } catch (err) { console.error(err); }
};

const selectTemplate = async (id_modele: number) => {
  try {
    const studentId = profileStudentId.value;
    if (!studentId) throw new Error("Étudiant introuvable.");
    await portfolioService.changeTemplate(Number(id_modele));
    showTemplateModal.value = false;
    const templateRoutes: Record<number, string> = {
      1: `/portfolio/${studentId}`,
      2: `/portfolio-creative/${studentId}`,
      3: `/portfolio-professional/${studentId}`,
    };
    await router.push(templateRoutes[id_modele] ?? `/portfolio/${studentId}`);
  } catch (err) { console.error(err); }
};

const profileStudentId = computed(() => {
  const id = Number(route.params.id);
  if (Number.isFinite(id) && id > 0) return id;
  return getCurrentUserIdFromStorage();
});

const fromQuery = computed(() => {
  const from = typeof route.query.from === "string" ? route.query.from : "";
  return from === "prof" || from === "pro" || from === "student" ? from : "student";
});

const profileLink = computed(() =>
  profileStudentId.value
    ? `/profile/student/${profileStudentId.value}?from=${fromQuery.value}`
    : "/profile"
);

const loading          = ref(false);
const error            = ref<string | null>(null);
const activeSectionId  = ref<SectionId>("about");
const selectedProjectId = ref<number | null>(null);

const profile = ref({
  firstName: "Nom", lastName: "Prenom", title: "Profil étudiant",
  school: "Établissement", recos: "0+", avatar: "",
  phone: "", email: "", linkedin: "", github: "https://github.com",
  bio: "Aucune description disponible pour le moment.",
});

const recosPreview   = ref<Array<{ name: string }>>([]);
const skills         = ref<SkillGroup[]>([]);
const diplomas       = ref<DiplomaItem[]>([]);
const projects       = ref<Project[]>([]);
const experiences    = ref<ExperienceItem[]>([]);
const certifications = ref<CertificationItem[]>([]);
let observer: IntersectionObserver | null = null;

const profileInitials = computed(() => {
  const f = profile.value.firstName?.[0] || "";
  const l = profile.value.lastName?.[0]  || "";
  return `${f}${l}`.toUpperCase() || "NP";
});
const sortedCertifications = computed(() => [...certifications.value].sort((a, b) => b.strength - a.strength));

const githubPattern = /(github\.com\/[^\s)]+)/i;

function getInitials(name: string) {
  return String(name || "").split(" ").filter(Boolean).map(p => p[0]).join("").slice(0, 2).toUpperCase();
}
function avatarColorClass(name: string) {
  const colors = ["avatar-blue","avatar-orange","avatar-indigo","avatar-green","avatar-deep-blue","avatar-brown","avatar-purple","avatar-slate"];
  const sum = String(name || "").split("").reduce((t, c) => t + c.charCodeAt(0), 0);
  return colors[sum % colors.length];
}
function scrollToSection(id: SectionId) {
  const element = document.getElementById(id);
  if (!element) return;
  const header = document.querySelector(".portfolio-page .portfolio-header") as HTMLElement | null;
  const headerOffset = (header?.offsetHeight ?? 80) + 20;
  const targetTop =
    window.scrollY + element.getBoundingClientRect().top - headerOffset;
  window.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
}
function inferGithubUrl(...sources: Array<string | null | undefined>) {
  for (const s of sources) {
    const m = String(s || "").match(githubPattern);
    if (m?.[1]) return m[1].startsWith("http") ? m[1] : `https://${m[1]}`;
  }
  return "";
}
function parseStructuredContent(content: string) {
  try { const p = JSON.parse(content); return typeof p === "object" && p ? p : null; } catch { return null; }
}
function responseList(response: any) {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}
function templateRoute(idModele: number, studentId: number) {
  const routes: Record<number, string> = {
    1: `/portfolio/${studentId}`,
    2: `/portfolio-creative/${studentId}`,
    3: `/portfolio-professional/${studentId}`,
  };
  return routes[idModele] ?? `/portfolio/${studentId}`;
}
function categoryLabel(category: string) {
  const n = String(category || "").toUpperCase();
  if (n.includes("COMPORT")) return "Soft Skills";
  if (n.includes("OUTIL") || n.includes("DEVOPS")) return "Outils & DevOps";
  return "Développement";
}
function formatYearRange(endYear?: number | string | null) {
  if (!endYear) return "Année non précisée";
  const end = Number(endYear);
  return Number.isFinite(end) ? `${end - 2} – ${end}` : String(endYear);
}
function formatStagePeriod(start?: string | null, end?: string | null) {
  const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
  return `${start ? fmt(start) : "Début"} – ${end ? fmt(end) : "Présent"}`;
}

function mapProfileData(backendProfile: any, portfolioData: any) {
  const raw = backendProfile?.raw || {};
  const userProfile = raw?.profil || {};
  const student = raw?.etudiant || {};
  const fullName = String(backendProfile?.name || "Nom Prenom").trim().split(/\s+/);

  profile.value = {
    firstName: fullName[0] || "Nom",
    lastName:  fullName.slice(1).join(" ") || "Prenom",
    title:    portfolioData?.objectif_pro || backendProfile?.title || student?.filiere || "Profil étudiant",
    school:   backendProfile?.school || userProfile?.adresse || "Établissement non renseigné",
    recos:    backendProfile?.recos || "0+",
    avatar:   resolveBackendAsset(backendProfile?.avatar || userProfile?.photo_profil),
    phone:    userProfile?.telephone || "",
    email:    backendProfile?.email || "",
    linkedin: backendProfile?.linkedin || userProfile?.linkedin_url || "",
    github:   inferGithubUrl(portfolioData?.titre, portfolioData?.objectif_pro, backendProfile?.website, userProfile?.bio),
    bio:      userProfile?.bio || portfolioData?.objectif_pro || "Aucune description disponible pour le moment.",
  };

  const grouped = (student?.competences || []).reduce((g: Record<string, string[]>, item: any) => {
    const label = categoryLabel(item?.competence?.categorie);
    const nom   = item?.competence?.nom;
    if (!nom) return g;
    if (!g[label]) g[label] = [];
    if (!g[label].includes(nom)) g[label].push(nom);
    return g;
  }, {});
  skills.value = Object.entries(grouped).map(([title, items]) => ({ title, items: items as string[] }));

  diplomas.value = (student?.diplomes || []).map((d: any) => ({
    title: d?.titre_diplome || "Diplôme",
    school: d?.etablissement || "Établissement non renseigné",
    period: formatYearRange(d?.annee_fin),
    description: `Formation obtenue à ${d?.etablissement || "l'établissement concerné"}.`,
  }));

  experiences.value = (student?.stages || []).map((s: any, i: number) => ({
    role: s?.poste || `Stage ${i + 1}`,
    company: s?.entreprise || "Entreprise",
    period:  formatStagePeriod(s?.date_debut, s?.date_fin),
    location: s?.lieu || userProfile?.adresse || "Maroc",
    mode:    s?.mode || "Non précisé",
    description: s?.description || s?.missions || "Expérience de stage.",
  }));

  certifications.value = [];
}

function mapRecommendations(items: any[]) {
  recosPreview.value = items.slice(0, 4).map(item => ({
    name: [item?.auteur?.prenom, item?.auteur?.nom].filter(Boolean).join(" ") || "Recommandation",
  }));
  profile.value.recos = `${items.length}+`;
}

function isValidatedProject(project: any) {
  const status = String(project?.statut || project?.status || "").toUpperCase();
  return ["VALIDE", "ACCEPTE", "APPROUVE"].includes(status);
}

function mapProjects(items: any[]) {
  projects.value = items.map((post: any, i: number) => {
    const s = parseStructuredContent(post?.contenu || "");
    return {
      id:    Number(post?.id_poste ?? i + 1),
      icon:  i % 3 === 0 ? "📚" : i % 3 === 1 ? "💼" : "📊",
      title: s?.projectTitle || (String(post?.contenu || "Projet").split("\n")[0] ?? "Projet").slice(0, 70),
      type:  post?.visibilite || "Projet",
      description: s?.description || post?.contenu || "Aucune description.",
      details: s?.details || s?.description || post?.contenu || "Aucun détail supplémentaire.",
      tech:   Array.isArray(s?.technologies) ? s.technologies.filter(Boolean) : [],
      github: inferGithubUrl(s?.github, post?.contenu),
      images: post?.image_url ? [resolveBackendAsset(post.image_url)] : [],
    };
  });
}

function projectTechnologies(project: any) {
  const relations = Array.isArray(project?.technologies) ? project.technologies : [];
  const names = relations
    .map((relation: any) => relation?.technologie?.nom || relation?.nom)
    .filter(Boolean);
  return names.length ? names : project?.type ? [String(project.type)] : [];
}

function mapBackendProject(project: any, index: number): Project {
  return {
    id: Number(project?.id_projet ?? project?.id ?? index + 1),
    icon: index % 3 === 0 ? "PR" : index % 3 === 1 ? "UX" : "AI",
    title: project?.titre || project?.title || `Projet ${index + 1}`,
    type: project?.type || project?.statut || "Projet",
    description: project?.description || "Aucune description.",
    details: project?.resultats || project?.appreciation_professeur || project?.description || "Aucun detail supplementaire.",
    tech: projectTechnologies(project),
    github: project?.lien_github || inferGithubUrl(project?.description, project?.resultats),
    images: Array.isArray(project?.captures)
      ? project.captures.map(resolveBackendAsset).filter(Boolean)
      : [],
  };
}

function mapBackendActivity(activity: any, index: number): Project {
  const rawId = Number(activity?.id_activite ?? activity?.id ?? index + 1);
  return {
    id: 900000 + (Number.isFinite(rawId) ? rawId : index + 1),
    icon: "AC",
    title: activity?.nom || activity?.title || `Activite ${index + 1}`,
    type: activity?.type || "Activite",
    description: activity?.description || "Aucune description.",
    details: activity?.description || "Aucun detail supplementaire.",
    tech: [],
    github: "",
    images: activity?.justificatif_url ? [resolveBackendAsset(activity.justificatif_url)] : [],
  };
}

async function loadPortfolio() {
  if (!profileStudentId.value) return;
  loading.value = true; error.value = null;
  try {
    const [attestationsResponse, portfolioResponse, profileResponse, postsResponse, recommendationsResponse, projetsResponse, activitesResponse, stagesResponse] = await Promise.all([
      attestationService.getAttestations({ etudiantId: profileStudentId.value, statut: "VALIDE" }),
      portfolioService.getPortfolio(profileStudentId.value),
      profileService.getProfile(profileStudentId.value),
      postService.getPosts(),
      recommendationService.getRecommendations({ id_etudiant_cible: profileStudentId.value, statut: "VALIDE" }),
      projetService.getMesProjets({ etudiantId: profileStudentId.value, statut: "VALIDE" }),
      activiteService.getMesActivites({ etudiantId: profileStudentId.value, statut: "ATTESTEE_INSTITUTION" }),
      stageService.getMesStages({ etudiantId: profileStudentId.value, statut: "VALIDE" }),
    ]);

    mapProfileData(profileResponse, portfolioResponse?.data ?? {});

    currentTemplate.value = Number(portfolioResponse?.data?.modele?.id_modele || portfolioResponse?.data?.id_modele || 2);
    if (currentTemplate.value !== 2) {
      await router.replace(templateRoute(currentTemplate.value, profileStudentId.value));
      return;
    }

    const validatedProjects = Array.isArray(profileResponse?.projectsData)
      ? profileResponse.projectsData.filter((project: any) => isValidatedProject(project))
      : [];
    const posts = Array.isArray(postsResponse?.data?.data)
      ? postsResponse.data.data.filter((p: any) =>
          Number(p?.auteur?.id_utilisateur ?? p?.id_auteur ?? 0) === Number(profileStudentId.value))
      : [];
    const projets = responseList(projetsResponse);
    const activites = responseList(activitesResponse);
    const stages = responseList(stagesResponse);
    const projectSource = projets.length ? projets : validatedProjects;

    projects.value = [
  ...projectSource.map(mapBackendProject),
  ...(projectSource.length ? [] : posts.map((post: any, index: number) => {
    const structured = parseStructuredContent(post?.contenu || "");

    return {
      id: Number(post?.id_poste ?? index + 1),
      icon: index % 3 === 0 ? "PR" : index % 3 === 1 ? "UX" : "AI",
      title:
        structured?.projectTitle ||
        (String(post?.contenu || "Projet").split("\n")[0] ?? "Projet").slice(0, 70),
      type: post?.visibilite || "Projet",
      description:
        structured?.description || post?.contenu || "Aucune description.",
      details:
        structured?.details ||
        structured?.description ||
        post?.contenu ||
        "Aucun detail supplementaire.",
      tech: Array.isArray(structured?.technologies)
        ? structured.technologies.filter(Boolean)
        : [],
      github: inferGithubUrl(structured?.github, post?.contenu),
      images: post?.image_url
        ? [resolveBackendAsset(post.image_url)]
        : [],
    };
  })),
];
    selectedProjectId.value = projects.value[0]?.id ?? null;

    experiences.value = [
  ...stages.map((stage: any) => ({
    role: stage?.poste || "Stage",
    company: stage?.entreprise || "",
    period: formatStagePeriod(stage?.date_debut, stage?.date_fin),
    location: stage?.lieu || "",
    mode: stage?.mode || "",
    description: stage?.missions || stage?.description || "",
  })),

  ...activites.map((activite: any) => ({
    role: activite.nom || "Activité",
    company: activite.type || "Activité parascolaire",
    period: "",
    location: "",
    mode: "",
    description: activite.description || "",
  })),
];
    mapRecommendations(Array.isArray(recommendationsResponse?.data?.data) ? recommendationsResponse.data.data : []);

    const attestations = responseList(attestationsResponse);
    certifications.value = attestations.map((a: any, i: number) => ({
      name: a?.titre || a?.type || `Certification ${i + 1}`,
      organization: a?.organisme || "Organisme non renseigné",
      date: a?.date ? new Date(a.date).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "Date non précisée",
      strength: Math.max(40, 100 - i * 10),
      link: "",
    }));
  } catch (err: any) {
    error.value = err?.response?.data?.message || "Impossible de charger ce portfolio.";
  } finally {
    loading.value = false;
  }
}

function downloadPdf()  { if (profileStudentId.value) window.open(portfolioService.getPortfolioExportPdfUrl(profileStudentId.value), "_blank"); }
function downloadHtml() { if (profileStudentId.value) window.open(portfolioService.getPortfolioExportHtmlUrl(profileStudentId.value), "_blank"); }

function initSectionObserver() {
  observer?.disconnect();
  const els = document.querySelectorAll<HTMLElement>("[data-section-id]");
  observer = new IntersectionObserver(entries => {
    const vis = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    const id = (vis?.target as HTMLElement | undefined)?.dataset.sectionId;
    if (id) activeSectionId.value = id as SectionId;
  }, { root: null, threshold: [0.25, 0.4, 0.6], rootMargin: "-120px 0px -45% 0px" });
  els.forEach(el => observer?.observe(el));
}

onMounted(async () => { await loadPortfolio(); loadTemplates(); initSectionObserver(); });
watch(profileStudentId, loadPortfolio);
onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════
   IMPORTANT : toutes les couleurs sont en valeurs hex
   directes pour éviter les conflits avec les variables
   CSS globales de l'application.
   ═══════════════════════════════════════════════════════ */

/* ── BASE ───────────────────────────────────────────────── */
.portfolio-page * {
  box-sizing: border-box;
}

.portfolio-page {
  min-height: 100vh;
  background-color: #0D0D0D !important;
  color: #F0EFE8 !important;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif !important;
  padding-bottom: 140px;
}

.portfolio-page [data-section-id] {
  scroll-margin-top: 96px;
}

/* ── HEADER ─────────────────────────────────────────────── */
.portfolio-page .portfolio-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: 180px 1fr 180px;
  align-items: center;
  padding: 0 32px;
  height: 56px;
  background-color: #111111 !important;
  border-bottom: 1px solid #1F1F1F !important;
}

.portfolio-page .header-left,
.portfolio-page .header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.portfolio-page .header-right { justify-content: flex-end; }

.portfolio-page .brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #C8F135 !important;
  text-decoration: none !important;
  font-weight: 900;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
}
.portfolio-page .brand img {
  width: 26px;
  height: 26px;
  filter: invert(1) sepia(1) saturate(5) hue-rotate(30deg);
}

.portfolio-page .nav-links {
  display: flex;
  justify-content: center;
  gap: 0;
}
.portfolio-page .nav-links button {
  padding: 0 13px;
  height: 56px;
  border: none !important;
  background: transparent !important;
  color: #BDBDBD !important;
  font-size: 0.73rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  border-bottom: 2px solid transparent !important;
  margin-bottom: -1px;
  transition: all 0.15s;
}
.portfolio-page .nav-links button:hover {
  color: #F0EFE8 !important;
  background-color: rgba(255,255,255,0.04) !important;
}
.portfolio-page .nav-links button.active {
  color: #C8F135 !important;
  border-bottom-color: #C8F135 !important;
}

.portfolio-page .hbtn {
  padding: 6px 12px;
  border: 1px solid #333333 !important;
  background: transparent !important;
  color: #BDBDBD !important;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 3px;
  transition: all 0.15s;
}
.portfolio-page .hbtn:hover {
  border-color: #555555 !important;
  color: #F0EFE8 !important;
}
.portfolio-page .hbtn.accent {
  background-color: #C8F135 !important;
  border-color: #C8F135 !important;
  color: #0D0D0D !important;
}

/* ── HERO ───────────────────────────────────────────────── */
.portfolio-page .hero-section {
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 32px;
  border-bottom: 1px solid #1F1F1F;
}

.portfolio-page .hero-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #1F1F1F;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #E0E0E0 !important;
}
.portfolio-page .divider { color: #333333; }

.portfolio-page .hero-main {
  display: grid;
  grid-template-columns: 1fr 340px;
  border-bottom: 1px solid #1F1F1F;
}

.portfolio-page .hero-name {
  padding: 48px 40px 48px 0;
  border-right: 1px solid #1F1F1F;
}

.portfolio-page h1 {
  margin: 0 0 18px !important;
  font-size: clamp(52px, 7vw, 88px) !important;
  font-weight: 800 !important;
  line-height: 0.9 !important;
  letter-spacing: -0.03em !important;
  color: #F0EFE8 !important;
}
.portfolio-page h1 .italic {
  font-style: italic !important;
  font-weight: 400 !important;
  color: #C8F135 !important;
}
.portfolio-page .last {
  font-style: normal !important;
  font-weight: 800 !important;
  color: #F0EFE8 !important;
}

.portfolio-page .hero-title {
  font-size: 0.78rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.14em !important;
  text-transform: uppercase !important;
  color: #E0E0E0 !important;
  margin: 0 !important;
}

.portfolio-page .hero-aside {
  display: flex;
  flex-direction: column;
}

.portfolio-page .hero-photo {
  flex: 1;
  overflow: hidden;
  background-color: #1A1A1A !important;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: 900;
  color: #C8F135 !important;
  min-height: 220px;
  letter-spacing: -0.02em;
}
.portfolio-page .hero-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.portfolio-page .hero-contacts {
  border-top: 1px solid #1F1F1F;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: #111111 !important;
}
.portfolio-page .contact-row {
  font-size: 0.78rem;
  font-weight: 500;
  color: #BDBDBD !important;
  text-decoration: none !important;
  padding: 5px 0;
  border-bottom: 1px solid #1A1A1A;
  display: block;
  transition: color 0.15s;
}
.portfolio-page .contact-row:last-child { border-bottom: none; }
.portfolio-page .contact-row:hover { color: #C8F135 !important; }

.portfolio-page .hero-bio-strip {
  display: grid;
  grid-template-columns: 140px 1fr auto;
  gap: 24px;
  align-items: start;
  padding: 24px 0;
}
.portfolio-page .bio-label {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #E0E0E0 !important;
  padding-top: 3px;
}
.portfolio-page .bio-text {
  font-size: 0.9rem;
  line-height: 1.7;
  color: #BDBDBD !important;
  margin: 0;
  font-style: italic;
}
.portfolio-page .recos-row {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.portfolio-page .recos-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #0D0D0D;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 800;
  color: var(--white) !important;
  margin-left: -8px;
}
.portfolio-page .recos-avatar:first-child { margin-left: 0; }
.portfolio-page .recos-num {
  font-size: 0.72rem;
  font-weight: 700;
  color: #E0E0E0 !important;
  margin-left: 4px;
}

/* ── TWO-COL ─────────────────────────────────────────────── */
.portfolio-page .two-col-wrap {
  display: grid;
  grid-template-columns: 300px 1fr;
  max-width: 1360px;
  margin: 0 auto;
}

/* ── SIDEBAR ─────────────────────────────────────────────── */
.portfolio-page .sidebar {
  background-color: #111111 !important;
  border-right: 1px solid #1F1F1F;
  min-height: 100%;
}

.portfolio-page .sidebar-section {
  padding: 32px 24px;
  border-bottom: 1px solid #1F1F1F;
}

.portfolio-page .sidebar-title {
  font-size: 0.68rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.18em !important;
  text-transform: uppercase !important;
  color: #E0E0E0 !important;
  margin: 0 0 20px !important;
  padding-bottom: 10px !important;
  border-bottom: 1px solid #C8F135 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}
.portfolio-page .sidebar-title::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: #C8F135;
  border-radius: 50%;
  flex-shrink: 0;
}

.portfolio-page .skill-group { margin-bottom: 20px; }
.portfolio-page .skill-cat {
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase !important;
  color: #5263F0 !important;
  margin: 0 0 8px !important;
}
.portfolio-page .skill-list {
  list-style: none !important;
  padding: 0 !important;
  margin: 0 !important;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.portfolio-page .skill-list li {
  font-size: 0.82rem !important;
  padding: 6px 0 6px 14px !important;
  border-bottom: 1px solid #1A1A1A !important;
  color: #C0BFB7 !important;
  position: relative;
}
.portfolio-page .skill-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background-color: #C8F135;
  border-radius: 50%;
}
.portfolio-page .skill-list li:last-child { border-bottom: none !important; }

.portfolio-page .cert-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #1A1A1A;
  position: relative;
}
.portfolio-page .cert-row:last-child { border-bottom: none; }
.portfolio-page .cert-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, #C8F135, #5263F0);
  border-radius: 1px;
  opacity: 0.7;
}
.portfolio-page .cert-info { display: flex; flex-direction: column; gap: 2px; }
.portfolio-page .cert-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #F0EFE8 !important;
}
.portfolio-page .cert-org {
  font-size: 0.7rem;
  color: #E0E0E0 !important;
}
.portfolio-page .cert-link {
  color: #C8F135 !important;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
}

.portfolio-page .contact-list { display: flex; flex-direction: column; }
.portfolio-page .contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #1A1A1A;
  text-decoration: none !important;
  color: #BDBDBD !important;
  font-size: 0.82rem;
  transition: color 0.15s;
}
.portfolio-page .contact-item:last-child { border-bottom: none; }
.portfolio-page .contact-item:hover { color: #C8F135 !important; }
.portfolio-page .contact-item span { font-weight: 600; }

/* ── MAIN ───────────────────────────────────────────────── */
.portfolio-page .main-col {
  background-color: #0D0D0D !important;
}

.portfolio-page .main-section {
  padding: 40px;
  border-bottom: 1px solid #1F1F1F;
}

.portfolio-page .main-title {
  font-size: 0.68rem !important;
  font-weight: 800 !important;
  letter-spacing: 0.18em !important;
  text-transform: uppercase !important;
  color: #E0E0E0 !important;
  margin: 0 0 28px !important;
  padding-bottom: 10px !important;
  border-bottom: 1px solid #1F1F1F !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}
.portfolio-page .main-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, #C8F135 0%, transparent 70%);
}

/* TIMELINE */
.portfolio-page .timeline { display: flex; flex-direction: column; }
.portfolio-page .tl-row {
  display: grid;
  grid-template-columns: 120px 32px 1fr;
  padding: 20px 0;
  border-bottom: 1px solid #1A1A1A;
}
.portfolio-page .tl-row:last-child { border-bottom: none; }
.portfolio-page .tl-year {
  font-size: 0.76rem;
  font-weight: 700;
  color: #E0E0E0 !important;
  padding-top: 4px;
  padding-right: 16px;
  text-align: right;
}
.portfolio-page .tl-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 12px;
}
.portfolio-page .tl-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #C8F135 !important;
  margin-top: 6px;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(200, 241, 53, 0.5);
}
.portfolio-page .tl-line {
  flex: 1;
  width: 1px;
  background-color: #1F1F1F !important;
  margin-top: 4px;
}
.portfolio-page .tl-body h3 {
  margin: 0 0 4px !important;
  font-size: 1rem !important;
  font-weight: 700 !important;
  color: #F0EFE8 !important;
}
.portfolio-page .tl-school {
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  color: #5263F0 !important;
  margin: 0 0 6px !important;
}
.portfolio-page .tl-desc {
  font-size: 0.86rem !important;
  color: #BDBDBD !important;
  margin: 0 !important;
  line-height: 1.6 !important;
}

/* EXPERIENCE */
.portfolio-page .exp-list { display: flex; flex-direction: column; }
.portfolio-page .exp-row {
  padding: 24px 0;
  border-bottom: 1px solid #1A1A1A;
}
.portfolio-page .exp-row:last-child { border-bottom: none; }
.portfolio-page .exp-header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  align-items: start;
  margin-bottom: 10px;
}
.portfolio-page .exp-header h3 {
  margin: 0 0 4px !important;
  font-size: 1rem !important;
  font-weight: 700 !important;
  color: #F0EFE8 !important;
}
.portfolio-page .exp-company {
  font-size: 0.82rem !important;
  font-weight: 600 !important;
  color: #C8F135 !important;
}
.portfolio-page .exp-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}
.portfolio-page .exp-period {
  font-size: 0.76rem;
  font-weight: 700;
  color: #888888 !important;
}
.portfolio-page .exp-location {
  font-size: 0.7rem;
  color: #E0E0E0 !important;
}
.portfolio-page .exp-mode-tag {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border: 1px solid #5263F0 !important;
  color: #5263F0 !important;
  border-radius: 3px;
  background: transparent !important;
}
.portfolio-page .exp-desc {
  font-size: 0.86rem !important;
  color: #BDBDBD !important;
  margin: 0 !important;
  line-height: 1.65 !important;
}

/* PROJECTS */
.portfolio-page .proj-table { display: flex; flex-direction: column; }
.portfolio-page .proj-row {
  border-bottom: 1px solid #1A1A1A;
  cursor: pointer;
  transition: background 0.1s;
}
.portfolio-page .proj-row:hover { background-color: #141414 !important; }
.portfolio-page .proj-row--selected { background-color: #141414 !important; }

.portfolio-page .proj-row-top {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 20px;
  padding: 16px 0;
}
.portfolio-page .proj-row-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.portfolio-page .proj-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.portfolio-page .proj-icon--1 { background-color: #1A2A1A !important; }
.portfolio-page .proj-icon--2 { background-color: #1A1A2A !important; }
.portfolio-page .proj-icon--3 { background-color: #2A1A1A !important; }

.portfolio-page .proj-row-left h3 {
  margin: 0 0 3px !important;
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  color: #F0EFE8 !important;
}
.portfolio-page .proj-type {
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  color: #E0E0E0 !important;
}
.portfolio-page .proj-tags { display: flex; gap: 5px; flex-wrap: wrap; justify-content: flex-end; }
.portfolio-page .tag {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 3px 8px;
  background-color: #1A1F3A !important;
  color: #5263F0 !important;
  letter-spacing: 0.04em;
  border-radius: 3px;
}
.portfolio-page .proj-chevron {
  font-size: 0.68rem;
  color: #E0E0E0 !important;
  width: 20px;
  text-align: center;
}
.portfolio-page .proj-detail {
  padding: 0 0 20px 52px;
  border-top: 1px solid #1A1A1A;
}
.portfolio-page .proj-detail p {
  font-size: 0.86rem !important;
  color: #BDBDBD !important;
  line-height: 1.65 !important;
  margin: 16px 0 12px !important;
}
.portfolio-page .proj-links { display: flex; flex-direction: column; gap: 12px; }
.portfolio-page .proj-links a {
  font-size: 0.82rem;
  font-weight: 700;
  color: #C8F135 !important;
  text-decoration: none;
}
.portfolio-page .proj-media { display: flex; gap: 10px; flex-wrap: wrap; }
.portfolio-page .media-thumb {
  width: 160px;
  height: 100px;
  background-color: #1A1A1A !important;
  overflow: hidden;
  border-radius: 4px;
}
.portfolio-page .media-thumb img { width: 100%; height: 100%; object-fit: cover; }

/* ── TEMPLATE MODAL ─────────────────────────────────────── */
.portfolio-page .template-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.8);
}
.portfolio-page .template-card {
  background-color: #111111 !important;
  border: 1px solid #333333 !important;
  border-radius: 8px;
  padding: 32px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.portfolio-page .template-card h3 {
  margin: 0 !important;
  font-size: 1rem !important;
  font-weight: 800 !important;
  color: #F0EFE8 !important;
}
.portfolio-page .template-item {
  padding: 12px 16px;
  border: 1px solid #333333 !important;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  color: #888888 !important;
  transition: all 0.1s;
  background: transparent !important;
}
.portfolio-page .template-item:hover {
  background-color: #C8F135 !important;
  color: #0D0D0D !important;
  border-color: #C8F135 !important;
}
.portfolio-page .template-card > button {
  padding: 10px;
  border: 1px solid #333333 !important;
  border-radius: 4px;
  background: transparent !important;
  color: #888888 !important;
  font-weight: 700;
  cursor: pointer;
}
.portfolio-page .template-card > button:hover {
  border-color: #555555 !important;
  color: #F0EFE8 !important;
}

/* ── STATES ─────────────────────────────────────────────── */
.portfolio-page .page-state {
  padding: 60px 32px;
  text-align: center;
  color: #BDBDBD !important;
}
.portfolio-page .page-state--error { color: #F05263 !important; }
.portfolio-page .empty {
  color: #E0E0E0 !important;
  font-size: 0.86rem !important;
  font-style: italic !important;
}

/* ── AVATAR COLORS ──────────────────────────────────────── */
.portfolio-page .avatar-blue      { background-color: var(--sky) !important; }
.portfolio-page .avatar-orange    { background-color: var(--tech-amber) !important; }
.portfolio-page .avatar-indigo    { background-color: #5263F0 !important; }
.portfolio-page .avatar-green     { background-color: #C8F135 !important; color: #0D0D0D !important; }
.portfolio-page .avatar-deep-blue { background-color: var(--tech-blue) !important; }
.portfolio-page .avatar-brown     { background-color: var(--tech-brown) !important; }
.portfolio-page .avatar-purple    { background-color: var(--tech-deep-purple) !important; }
.portfolio-page .avatar-slate     { background-color: var(--tech-periwinkle) !important; }

/* ── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width: 1100px) {
  .portfolio-page .portfolio-header { grid-template-columns: 1fr; height: auto; padding: 12px 20px; gap: 8px; }
  .portfolio-page .nav-links button { height: 40px; }
  .portfolio-page .two-col-wrap { grid-template-columns: 1fr; }
  .portfolio-page .sidebar { border-right: none; border-bottom: 1px solid #1F1F1F; }
  .portfolio-page .hero-main { grid-template-columns: 1fr; }
  .portfolio-page .hero-name { border-right: none; border-bottom: 1px solid #1F1F1F; padding-right: 0; }
  .portfolio-page .hero-bio-strip { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .portfolio-page .hero-section,
  .portfolio-page .main-section,
  .portfolio-page .sidebar-section { padding: 24px 16px; }
  .portfolio-page .tl-row { grid-template-columns: 80px 24px 1fr; }
  .portfolio-page .proj-row-top { grid-template-columns: 1fr auto; }
  .portfolio-page .proj-tags { display: none; }
}
</style>
