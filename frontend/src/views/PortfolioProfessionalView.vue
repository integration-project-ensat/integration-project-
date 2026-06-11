<template>
  <main class="pf">
    <header class="pf-header">
      <RouterLink :to="profileLink" class="pf-logo">
        <img src="@/assets/PheraCoreLogo.svg" alt="PheraCore" />
        <span>PheraCore</span>
      </RouterLink>
      <nav class="pf-nav" aria-label="Navigation">
        <button v-for="s in sections" :key="s.id" type="button" class="pf-nav-btn" :class="{ 'is-active': activeSectionId === s.id }" @click="scrollToSection(s.id)">{{ s.label }}</button>
      </nav>
      <div class="pf-actions">
        <button type="button" class="pf-btn-ghost" @click="downloadHtml">HTML</button>
        <button type="button" class="pf-btn-ghost" @click="downloadPdf">PDF</button>
        <button type="button" class="pf-btn-solid" @click="openTemplateSelector">Template</button>
      </div>
    </header>

    <div v-if="showTemplateModal" class="pf-modal-mask" @click.self="showTemplateModal = false">
      <div class="pf-modal">
        <h3>Choisir un template</h3>
        <div class="pf-modal-list">
          <div v-for="t in templates" :key="t.id_modele" class="pf-modal-item" @click="selectTemplate(t.id_modele)">
            <span>{{ t.nom }}</span><span class="pf-modal-arrow">→</span>
          </div>
        </div>
        <button type="button" class="pf-modal-close" @click="showTemplateModal = false">Fermer</button>
      </div>
    </div>

    <div v-if="loading" class="pf-state">Chargement…</div>
    <div v-else-if="error" class="pf-state pf-state-err">{{ error }}</div>

    <template v-else>
      <section id="about" data-section-id="about" class="pf-hero">
        <div class="pf-hero-text">
          <p class="pf-hero-school">{{ profile.school }}</p>
          <h1 class="pf-hero-name">{{ profile.firstName }}<br /><span class="pf-hero-name-last">{{ profile.lastName }}</span></h1>
          <div class="pf-hero-divider"></div>
          <p class="pf-hero-role">{{ profile.title }}</p>
          <p class="pf-hero-bio">{{ profile.bio }}</p>
          <div class="pf-hero-links">
            <a v-if="profile.email"    :href="`mailto:${profile.email}`"            class="pf-chip">✉ {{ profile.email }}</a>
            <a v-if="profile.phone"    :href="`tel:${profile.phone}`"               class="pf-chip">☎ {{ profile.phone }}</a>
            <a v-if="profile.linkedin" :href="profile.linkedin" target="_blank" rel="noopener" class="pf-chip">in LinkedIn</a>
            <a v-if="profile.github"   :href="profile.github"  target="_blank" rel="noopener" class="pf-chip">⌥ GitHub</a>
          </div>
          <div class="pf-hero-recos">
            <div class="pf-reco-faces">
              <span v-for="p in recosPreview" :key="p.name" class="pf-face" :class="avatarColorClass(p.name)">{{ getInitials(p.name) }}</span>
            </div>
            <span class="pf-reco-count">{{ profile.recos }} recommandations</span>
          </div>
        </div>
        <div class="pf-hero-photo-col">
          <div class="pf-hero-photo">
            <img v-if="profile.avatar" :src="profile.avatar" alt="Photo" />
            <span v-else class="pf-hero-initials">{{ profileInitials }}</span>
          </div>
        </div>
      </section>

      <section id="skills" data-section-id="skills" class="pf-skills-band">
        <div class="pf-skills-inner">
          <h2 class="pf-band-title">Compétences</h2>
          <div class="pf-skills-groups" v-if="skills.length">
            <div v-for="g in skills" :key="g.title" class="pf-skill-group">
              <p class="pf-skill-cat">{{ g.title }}</p>
              <div class="pf-skill-pills">
                <span v-for="sk in g.items" :key="sk" class="pf-pill">{{ sk }}</span>
              </div>
            </div>
          </div>
          <p v-else class="pf-empty">Aucune compétence renseignée.</p>
        </div>
      </section>

      <div class="pf-two-col">
        <section id="journey" data-section-id="journey" class="pf-col-section">
          <h2 class="pf-col-title">Parcours</h2>
          <div v-if="diplomas.length" class="pf-timeline">
            <div v-for="(d, i) in diplomas" :key="`${d.title}-${i}`" class="pf-tl-entry">
              <div class="pf-tl-marker">
                <div class="pf-tl-dot"></div>
                <div class="pf-tl-line" v-if="i < diplomas.length - 1"></div>
              </div>
              <div class="pf-tl-content">
                <span class="pf-tl-period">{{ d.period }}</span>
                <h3 class="pf-tl-title">{{ d.title }}</h3>
                <p class="pf-tl-school">{{ d.school }}</p>
                <p class="pf-tl-desc">{{ d.description }}</p>
              </div>
            </div>
          </div>
          <p v-else class="pf-empty">Aucun diplôme renseigné.</p>
        </section>
        <section id="experience" data-section-id="experience" class="pf-col-section pf-col-section--right">
          <h2 class="pf-col-title">Expérience</h2>
          <div v-if="experiences.length" class="pf-exp-list">
            <article v-for="e in experiences" :key="`${e.role}-${e.company}`" class="pf-exp-card">
              <div class="pf-exp-top">
                <div>
                  <h3 class="pf-exp-role">{{ e.role }}</h3>
                  <span class="pf-exp-company">{{ e.company }}</span>
                </div>
                <div class="pf-exp-meta">
                  <span class="pf-exp-period">{{ e.period }}</span>
                  <span class="pf-exp-loc">{{ e.location }}</span>
                  <span class="pf-exp-mode">{{ e.mode }}</span>
                </div>
              </div>
              <p class="pf-exp-desc">{{ e.description }}</p>
            </article>
          </div>
          <p v-else class="pf-empty">Aucune expérience renseignée.</p>
        </section>
      </div>

      <section id="projects" data-section-id="projects" class="pf-projects-section">
        <div class="pf-projects-header">
          <h2 class="pf-section-title">Projets</h2>
          <span class="pf-section-count">{{ projects.length }}</span>
        </div>
        <div v-if="projects.length" class="pf-projects-grid">
          <div v-for="p in projects" :key="p.id" class="pf-project-card" :class="{ 'pf-project-card--open': selectedProjectId === p.id }" @click="selectedProjectId = selectedProjectId === p.id ? null : p.id">
            <div class="pf-project-top">
              <span class="pf-project-icon" :class="`pf-icon-${(p.id % 3) + 1}`">{{ p.icon }}</span>
              <div class="pf-project-info">
                <h3 class="pf-project-title">{{ p.title }}</h3>
                <p class="pf-project-type">{{ p.type }}</p>
              </div>
              <div class="pf-project-tags">
                <span v-for="t in p.tech.slice(0,3)" :key="t" class="pf-tag">{{ t }}</span>
              </div>
              <span class="pf-project-toggle">{{ selectedProjectId === p.id ? '−' : '+' }}</span>
            </div>
            <div v-if="selectedProjectId === p.id" class="pf-project-body">
              <p>{{ p.details }}</p>
              <div class="pf-project-footer" v-if="p.github || p.images.length">
                <a v-if="p.github" :href="p.github" target="_blank" rel="noopener" class="pf-project-link">Voir le code →</a>
                <div class="pf-project-imgs">
                  <div v-for="(img, idx) in p.images" :key="idx" class="pf-thumb">
                    <img v-if="img" :src="img" alt="capture" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="pf-empty">Aucun projet pour le moment.</p>
      </section>

      <div class="pf-bottom-row">
        <section id="certifications" data-section-id="certifications" class="pf-bottom-panel">
          <h2 class="pf-bottom-title">Certifications</h2>
          <div v-if="sortedCertifications.length" class="pf-cert-list">
            <div v-for="c in sortedCertifications" :key="c.name" class="pf-cert-item">
              <div class="pf-cert-header">
                <span class="pf-cert-name">{{ c.name }}</span>
                <a v-if="c.link" :href="c.link" target="_blank" rel="noopener" class="pf-cert-link">↗</a>
              </div>
              <span class="pf-cert-org">{{ c.organization }} · {{ c.date }}</span>
              <div class="pf-cert-bar"><div class="pf-cert-fill" :style="{ width: `${c.strength}%` }"></div></div>
            </div>
          </div>
          <p v-else class="pf-empty">Aucune certification.</p>
        </section>
        <section id="contact" data-section-id="contact" class="pf-bottom-panel pf-contact-panel">
          <h2 class="pf-bottom-title">Contact</h2>
          <div class="pf-contact-grid">
            <a v-if="profile.phone"    :href="`tel:${profile.phone}`"      class="pf-contact-card">
              <span class="pf-contact-icon">☎</span>
              <span class="pf-contact-label">Téléphone</span>
              <span class="pf-contact-value">{{ profile.phone }}</span>
            </a>
            <a v-if="profile.email"    :href="`mailto:${profile.email}`"   class="pf-contact-card">
              <span class="pf-contact-icon">✉</span>
              <span class="pf-contact-label">Email</span>
              <span class="pf-contact-value">{{ profile.email }}</span>
            </a>
            <a v-if="profile.linkedin" :href="profile.linkedin" target="_blank" rel="noopener" class="pf-contact-card">
              <span class="pf-contact-icon">in</span>
              <span class="pf-contact-label">LinkedIn</span>
              <span class="pf-contact-value">Voir le profil</span>
            </a>
            <a v-if="profile.github"   :href="profile.github"  target="_blank" rel="noopener" class="pf-contact-card">
              <span class="pf-contact-icon">⌥</span>
              <span class="pf-contact-label">GitHub</span>
              <span class="pf-contact-value">Voir les projets</span>
            </a>
          </div>
        </section>
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

const showTemplateModal = ref(false);
const templates = ref<Array<{ id_modele: number; nom: string }>>([]);
const currentTemplate = ref<number>(3);

type SectionId = "about"|"skills"|"journey"|"projects"|"experience"|"certifications"|"contact";
type SkillGroup     = { title: string; items: string[] };
type DiplomaItem    = { title: string; school: string; period: string; description: string };
type Project        = { id: number; icon: string; title: string; type: string; description: string; details: string; tech: string[]; github: string; images: string[] };
type ExperienceItem = { role: string; company: string; period: string; location: string; mode: string; description: string };
type CertificationItem = { name: string; organization: string; date: string; strength: number; link: string };

const route  = useRoute();
const router = useRouter();

const sections: Array<{ id: SectionId; label: string }> = [
  { id: "about",          label: "À propos"      },
  { id: "skills",         label: "Compétences"   },
  { id: "journey",        label: "Parcours"      },
  { id: "experience",     label: "Expérience"    },
  { id: "projects",       label: "Projets"       },
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
    const r = await portfolioService.getTemplates();
    templates.value = Array.isArray(r) ? r : (r?.data ?? []);
  } catch (e) { console.error(e); }
};

const selectTemplate = async (id_modele: number) => {
  try {
    const sid = profileStudentId.value;
    if (!sid) throw new Error("Étudiant introuvable.");
    await portfolioService.changeTemplate(Number(id_modele));
    showTemplateModal.value = false;
    const routes: Record<number, string> = {
      1: `/portfolio/${sid}`,
      2: `/portfolio-creative/${sid}`,
      3: `/portfolio-professional/${sid}`,
    };
    await router.push(routes[id_modele] ?? `/portfolio/${sid}`);
  } catch (e) { console.error(e); }
};

const profileStudentId = computed(() => {
  const id = Number(route.params.id);
  if (Number.isFinite(id) && id > 0) return id;
  return getCurrentUserIdFromStorage();
});

const fromQuery = computed(() => {
  const f = typeof route.query.from === "string" ? route.query.from : "";
  return f === "prof" || f === "pro" || f === "student" ? f : "student";
});

const profileLink = computed(() =>
  profileStudentId.value ? `/profile/student/${profileStudentId.value}?from=${fromQuery.value}` : "/profile"
);

const loading           = ref(false);
const error             = ref<string | null>(null);
const activeSectionId   = ref<SectionId>("about");
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
  return String(name||"").split(" ").filter(Boolean).map(p=>p[0]).join("").slice(0,2).toUpperCase();
}
function avatarColorClass(name: string) {
  const c = ["av-blue","av-amber","av-green","av-purple","av-rose","av-teal","av-orange","av-slate"];
  const s = String(name||"").split("").reduce((t,c)=>t+c.charCodeAt(0),0);
  return c[s % c.length];
}
function scrollToSection(id: SectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior:"smooth", block:"start" });
}
function resolveBackendAsset(path: string|null|undefined) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = import.meta.env.VITE_API_BASE_URL || "/api";
  return `${base.replace(/\/api\/?$/,"")}${path}`;
}
function inferGithubUrl(...sources: Array<string|null|undefined>) {
  for (const s of sources) {
    const m = String(s||"").match(githubPattern);
    if (m?.[1]) return m[1].startsWith("http") ? m[1] : `https://${m[1]}`;
  }
  return "";
}
function parseStructuredContent(content: string) {
  try { const p = JSON.parse(content); return typeof p==="object"&&p?p:null; } catch { return null; }
}
function categoryLabel(category: string) {
  const n = String(category||"").toUpperCase();
  if (n.includes("COMPORT")) return "Soft Skills";
  if (n.includes("OUTIL")||n.includes("DEVOPS")) return "Outils & DevOps";
  return "Développement";
}
function formatYearRange(endYear?: number|string|null) {
  if (!endYear) return "Année non précisée";
  const e = Number(endYear);
  return Number.isFinite(e) ? `${e-2} – ${e}` : String(endYear);
}
function formatStagePeriod(start?: string|null, end?: string|null) {
  const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR",{month:"short",year:"numeric"});
  return `${start?fmt(start):"Début"} – ${end?fmt(end):"Présent"}`;
}

function mapProfileData(bp: any, pd: any) {
  const raw = bp?.raw||{};
  const up  = raw?.profil||{};
  const st  = raw?.etudiant||{};
  const fn  = String(bp?.name||"Nom Prenom").trim().split(/\s+/);
  profile.value = {
    firstName: fn[0]||"Nom",
    lastName:  fn.slice(1).join(" ")||"Prenom",
    title:    pd?.objectif_pro||bp?.title||st?.filiere||"Profil étudiant",
    school:   bp?.school||up?.adresse||"Établissement non renseigné",
    recos:    bp?.recos||"0+",
    avatar:   resolveBackendAsset(bp?.avatar||up?.photo_profil),
    phone:    up?.telephone||"",
    email:    bp?.email||"",
    linkedin: bp?.linkedin||up?.linkedin_url||"",
    github:   inferGithubUrl(pd?.titre,pd?.objectif_pro,bp?.website,up?.bio),
    bio:      up?.bio||pd?.objectif_pro||"Aucune description disponible pour le moment.",
  };
  const grouped = (st?.competences||[]).reduce((g: Record<string,string[]>, item: any) => {
    const label = categoryLabel(item?.competence?.categorie);
    const nom   = item?.competence?.nom;
    if (!nom) return g;
    if (!g[label]) g[label]=[];
    if (!g[label].includes(nom)) g[label].push(nom);
    return g;
  },{});
  skills.value = Object.entries(grouped).map(([title,items])=>({title,items:items as string[]}));
  diplomas.value = (st?.diplomes||[]).map((d: any)=>({
    title: d?.titre_diplome||"Diplôme",
    school: d?.etablissement||"Établissement non renseigné",
    period: formatYearRange(d?.annee_fin),
    description: `Formation obtenue à ${d?.etablissement||"l'établissement concerné"}.`,
  }));
  experiences.value = (st?.stages||[]).map((s: any,i: number)=>({
    role: s?.poste||`Stage ${i+1}`,
    company: s?.entreprise||"Entreprise",
    period: formatStagePeriod(s?.date_debut,s?.date_fin),
    location: s?.lieu||up?.adresse||"Maroc",
    mode: s?.mode||"Non précisé",
    description: s?.description||s?.missions||"Expérience de stage.",
  }));
  certifications.value = [];
}

function mapRecommendations(items: any[]) {
  recosPreview.value = items.slice(0,4).map(item=>({
    name: [item?.auteur?.prenom,item?.auteur?.nom].filter(Boolean).join(" ")||"Recommandation",
  }));
  profile.value.recos = `${items.length}+`;
}

function projectTechnologies(project: any) {
  const relations = Array.isArray(project?.technologies) ? project.technologies : [];
  const relationNames = relations
    .map((item: any) => item?.technologie?.nom || item?.nom)
    .filter(Boolean);
  if (relationNames.length) return relationNames;
  if (Array.isArray(project?.tech)) return project.tech.filter(Boolean);
  return [];
}

function isValidatedProject(project: any) {
  const status = String(project?.statut || project?.status || "").toUpperCase();
  return ["VALIDE", "ACCEPTE", "APPROUVE"].includes(status);
}

function mapBackendProject(project: any, i: number) {
  return {
    id: Number(project?.id_projet ?? project?.id ?? i + 1),
    icon: i % 3 === 0 ? "PR" : i % 3 === 1 ? "UX" : "AI",
    title: project?.titre || project?.title || `Projet ${i + 1}`,
    type: project?.type || project?.statut || "Projet",
    description: project?.description || "Aucune description.",
    details:
      project?.resultats ||
      project?.appreciation_professeur ||
      project?.description ||
      "Aucun detail supplementaire.",
    tech: projectTechnologies(project),
    github: inferGithubUrl(project?.lien_github, project?.description, project?.resultats),
    images: Array.isArray(project?.captures)
      ? project.captures.map(resolveBackendAsset).filter(Boolean)
      : [],
  };
}

function mapProjects(items: any[]) {
  projects.value = items.map((post: any,i: number)=>{
    const s = parseStructuredContent(post?.contenu||"");
    return {
      id:    Number(post?.id_poste??i+1),
      icon:  i%3===0?"📚":i%3===1?"💼":"📊",
      title: s?.projectTitle||(String(post?.contenu||"Projet").split("\n")[0]??"Projet").slice(0,70),
      type:  post?.visibilite||"Projet",
      description: s?.description||post?.contenu||"Aucune description.",
      details: s?.details||s?.description||post?.contenu||"Aucun détail supplémentaire.",
      tech:   Array.isArray(s?.technologies)?s.technologies.filter(Boolean):[],
      github: inferGithubUrl(s?.github,post?.contenu),
      images: post?.image_url?[resolveBackendAsset(post.image_url)]:[],
    };
  });
}

async function loadPortfolio() {
  if (!profileStudentId.value) return;
  loading.value=true; error.value=null;
  try {
    const [att,port,prof,posts,recos] = await Promise.all([
      attestationService.getAttestations({etudiantId:profileStudentId.value,statut:"VALIDE"}),
      portfolioService.getPortfolio(profileStudentId.value),
      profileService.getProfile(profileStudentId.value),
      postService.getPosts(),
      recommendationService.getRecommendations({id_etudiant_cible:profileStudentId.value,statut:"VALIDE"}),
    ]);
    mapProfileData(prof,port?.data??{});
    currentTemplate.value = port?.data?.modele?.id_modele||port?.data?.id_modele||3;
    if (currentTemplate.value===1&&!route.path.includes("/portfolio-professional")) { router.replace(`/portfolio/${profileStudentId.value}`); return; }
    if (currentTemplate.value===2&&!route.path.includes("/portfolio-professional")) { router.replace(`/portfolio-creative/${profileStudentId.value}`); return; }
    const validatedProjects = Array.isArray(prof?.projectsData)
      ? prof.projectsData.filter((project: any) => isValidatedProject(project))
      : [];
    const p = Array.isArray(posts?.data?.data)
      ? posts.data.data.filter((p: any)=>Number(p?.auteur?.id_utilisateur??p?.id_auteur??0)===Number(profileStudentId.value))
      : [];
    if (validatedProjects.length) {
      projects.value = validatedProjects.map(mapBackendProject);
    } else {
      mapProjects(p);
    }
    mapRecommendations(Array.isArray(recos?.data?.data)?recos.data.data:[]);
    const a = Array.isArray(att?.data?.data)?att.data.data:[];
    certifications.value = a.map((x: any,i: number)=>({
      name: x?.titre||x?.type||`Certification ${i+1}`,
      organization: x?.organisme||"Organisme non renseigné",
      date: x?.date?new Date(x.date).toLocaleDateString("fr-FR",{month:"short",year:"numeric"}):"Date non précisée",
      strength: Math.max(40,100-i*10),
      link: "",
    }));
  } catch(e: any) {
    error.value = e?.response?.data?.message||"Impossible de charger ce portfolio.";
  } finally { loading.value=false; }
}

function downloadPdf()  { if (profileStudentId.value) window.open(portfolioService.getPortfolioExportPdfUrl(profileStudentId.value),"_blank"); }
function downloadHtml() { if (profileStudentId.value) window.open(portfolioService.getPortfolioExportHtmlUrl(profileStudentId.value),"_blank"); }

function initSectionObserver() {
  observer?.disconnect();
  const els = document.querySelectorAll<HTMLElement>("[data-section-id]");
  observer = new IntersectionObserver(entries=>{
    const vis = entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    const id  = (vis?.target as HTMLElement|undefined)?.dataset.sectionId;
    if (id) activeSectionId.value = id as SectionId;
  },{root:null,threshold:[0.25,0.4,0.6],rootMargin:"-120px 0px -45% 0px"});
  els.forEach(el=>observer?.observe(el));
}

onMounted(async()=>{ await loadPortfolio(); loadTemplates(); initSectionObserver(); });
watch(profileStudentId, loadPortfolio);
onBeforeUnmount(()=>observer?.disconnect());
</script>

<style scoped>
.pf * { box-sizing: border-box; }

.pf {
  min-height: 100vh;
  background: #F4F6F9 !important;
  color: #1A2332 !important;
  font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif !important;
  font-size: 15px;
}

/* ─── HEADER ─────────────────────────────────────── */
.pf .pf-header {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  height: 58px; padding: 0 32px;
  background: #FFFFFF !important;
  border-bottom: 1px solid #DDE3EC !important;
  box-shadow: 0 1px 4px rgba(26,35,50,.06);
}
.pf .pf-logo {
  display: flex; align-items: center; gap: 9px;
  text-decoration: none !important;
  font-weight: 700; font-size: 0.92rem;
  color: #1A2332 !important; letter-spacing: .01em;
}
.pf .pf-logo img { width: 22px; height: 22px; opacity: .85; }
.pf .pf-nav { display: flex; gap: 0; }
.pf .pf-nav-btn {
  height: 58px; padding: 0 13px;
  border: none !important; background: transparent !important;
  color: #6B7A90 !important;
  font-size: 0.71rem; font-weight: 600;
  letter-spacing: .09em; text-transform: uppercase;
  cursor: pointer;
  border-bottom: 2px solid transparent !important;
  margin-bottom: -1px;
  transition: color .15s, border-color .15s;
}
.pf .pf-nav-btn:hover { color: #1A2332 !important; }
.pf .pf-nav-btn.is-active { color: #1A2332 !important; border-bottom-color: #2563EB !important; }
.pf .pf-actions { display: flex; align-items: center; gap: 6px; }
.pf .pf-btn-ghost {
  padding: 6px 13px;
  border: 1px solid #DDE3EC !important; border-radius: 5px;
  background: transparent !important; color: #6B7A90 !important;
  font-size: 0.7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  cursor: pointer; transition: all .15s;
}
.pf .pf-btn-ghost:hover { border-color: #2563EB !important; color: #2563EB !important; }
.pf .pf-btn-solid {
  padding: 6px 14px;
  border: 1px solid #2563EB !important; border-radius: 5px;
  background: #2563EB !important; color: #FFFFFF !important;
  font-size: 0.7rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  cursor: pointer; transition: background .15s;
}
.pf .pf-btn-solid:hover { background: #1D4ED8 !important; border-color: #1D4ED8 !important; }

/* ─── HERO ───────────────────────────────────────── */
.pf .pf-hero {
  display: grid; grid-template-columns: 1fr 340px;
  min-height: 480px;
  background: #FFFFFF !important;
  border-bottom: 1px solid #DDE3EC;
  max-width: 1440px; margin: 0 auto;
}
.pf .pf-hero-text {
  padding: 56px 56px 48px;
  display: flex; flex-direction: column; gap: 22px;
  border-right: 1px solid #DDE3EC;
}
.pf .pf-hero-school {
  margin: 0 !important;
  font-size: 0.7rem; font-weight: 700;
  letter-spacing: .16em; text-transform: uppercase;
  color: #2563EB !important;
}
.pf .pf-hero-name {
  margin: 0 !important;
  font-size: clamp(44px, 5.5vw, 76px) !important;
  font-weight: 800 !important; line-height: 1.0 !important;
  letter-spacing: -.025em !important; color: #1A2332 !important;
}
.pf .pf-hero-name-last { color: #2563EB !important; }
.pf .pf-hero-divider { width: 48px; height: 3px; background: #2563EB; border-radius: 2px; flex-shrink: 0; }
.pf .pf-hero-role {
  margin: 0 !important;
  font-size: 0.8rem !important; font-weight: 700 !important;
  letter-spacing: .1em !important; text-transform: uppercase !important;
  color: #44546A !important;
}
.pf .pf-hero-bio {
  margin: 0 !important;
  font-size: 0.95rem !important; line-height: 1.75 !important;
  color: #44546A !important; max-width: 540px;
}
.pf .pf-hero-links { display: flex; flex-wrap: wrap; gap: 8px; }
.pf .pf-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px;
  border: 1px solid #DDE3EC !important; border-radius: 20px;
  font-size: 0.75rem; font-weight: 600;
  color: #44546A !important; text-decoration: none !important;
  background: #F4F6F9 !important; transition: all .15s;
}
.pf .pf-chip:hover { border-color: #2563EB !important; color: #2563EB !important; background: #EFF4FF !important; }
.pf .pf-hero-recos { display: flex; align-items: center; gap: 12px; }
.pf .pf-reco-faces { display: flex; }
.pf .pf-face {
  width: 30px; height: 30px; border-radius: 50%;
  border: 2px solid #FFFFFF; margin-left: -8px;
  font-size: 0.58rem; font-weight: 800; color: #fff !important;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.pf .pf-face:first-child { margin-left: 0; }
.pf .pf-reco-count { font-size: 0.75rem; font-weight: 600; color: #6B7A90 !important; }
.pf .pf-hero-photo-col { background: #EBF0F8 !important; display: flex; flex-direction: column; overflow: hidden; }
.pf .pf-hero-photo { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; min-height: 280px; }
.pf .pf-hero-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }
.pf .pf-hero-initials { font-size: 5rem; font-weight: 900; color: #2563EB !important; letter-spacing: -.04em; }

/* ─── SKILLS BAND — version claire, cohérente ────── */
.pf .pf-skills-band {
  background: #F4F6F9 !important;
}
.pf .pf-skills-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 36px 48px;
  background: #fdfdfd !important;
  border-left: 1px solid #2378f8;
  border-right: 1px solid #0c61df;
  border-bottom: 1px solid #256bd3;
}
.pf .pf-band-title {
  margin: 0 0 28px !important;
  font-size: 0.68rem !important; font-weight: 800 !important;
  letter-spacing: .2em !important; text-transform: uppercase !important;
  color: #2563EB !important;
  padding-bottom: 14px !important;
  border-bottom: 1px solid #DDE3EC !important;
}
.pf .pf-skills-groups { display: flex; flex-wrap: wrap; gap: 40px; }
.pf .pf-skill-cat {
  margin: 0 0 10px !important;
  font-size: 0.65rem !important; font-weight: 700 !important;
  letter-spacing: .12em !important; text-transform: uppercase !important;
  color: #44546A !important;
}
.pf .pf-skill-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.pf .pf-pill {
  padding: 5px 13px;
  border-radius: 5px;
  background: #F4F6F9 !important;
  color: #1A2332 !important;
  font-size: 0.78rem; font-weight: 600;
  border: 1px solid #DDE3EC !important;
  transition: all .15s;
}
.pf .pf-pill:hover {
  background: #EFF4FF !important;
  border-color: #2563EB !important;
  color: #2563EB !important;
}

/* ─── TWO COL ────────────────────────────────────── */
.pf .pf-two-col {
  display: grid; grid-template-columns: 1fr 1fr;
  max-width: 1440px; margin: 0 auto;
  border-bottom: 1px solid #DDE3EC;
}
.pf .pf-col-section { padding: 44px 48px; background: #FFFFFF !important; }
.pf .pf-col-section--right { border-left: 1px solid #DDE3EC; background: #F9FAFC !important; }
.pf .pf-col-title {
  margin: 0 0 28px !important;
  font-size: 0.68rem !important; font-weight: 800 !important;
  letter-spacing: .2em !important; text-transform: uppercase !important;
  color: #2563EB !important;
  padding-bottom: 12px !important; border-bottom: 1px solid #DDE3EC !important;
}

/* Timeline */
.pf .pf-timeline { display: flex; flex-direction: column; }
.pf .pf-tl-entry { display: grid; grid-template-columns: 20px 1fr; gap: 0 16px; }
.pf .pf-tl-marker { display: flex; flex-direction: column; align-items: center; }
.pf .pf-tl-dot { width: 12px; height: 12px; border-radius: 50%; background: #2563EB !important; box-shadow: 0 0 0 3px #EFF4FF; flex-shrink: 0; margin-top: 4px; }
.pf .pf-tl-line { flex: 1; width: 2px; background: #DDE3EC !important; margin: 6px 0; }
.pf .pf-tl-content { padding-bottom: 28px; }
.pf .pf-tl-period { display: block; font-size: 0.68rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #6B7A90 !important; margin-bottom: 4px; }
.pf .pf-tl-title { margin: 0 0 3px !important; font-size: 0.97rem !important; font-weight: 700 !important; color: #1A2332 !important; }
.pf .pf-tl-school { margin: 0 0 6px !important; font-size: 0.78rem !important; font-weight: 600 !important; color: #2563EB !important; }
.pf .pf-tl-desc { margin: 0 !important; font-size: 0.84rem !important; color: #44546A !important; line-height: 1.65 !important; }

/* Experience */
.pf .pf-exp-list { display: flex; flex-direction: column; gap: 0; }
.pf .pf-exp-card { padding: 20px 0; border-bottom: 1px solid #EBF0F8; }
.pf .pf-exp-card:last-child { border-bottom: none; padding-bottom: 0; }
.pf .pf-exp-top { display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: start; margin-bottom: 8px; }
.pf .pf-exp-role { margin: 0 0 3px !important; font-size: 0.95rem !important; font-weight: 700 !important; color: #1A2332 !important; }
.pf .pf-exp-company { font-size: 0.8rem; font-weight: 600; color: #2563EB !important; }
.pf .pf-exp-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.pf .pf-exp-period { font-size: 0.7rem; font-weight: 700; color: #6B7A90 !important; }
.pf .pf-exp-loc { font-size: 0.68rem; color: #93AABF !important; }
.pf .pf-exp-mode { font-size: 0.62rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; padding: 2px 8px; border: 1px solid #DDE3EC !important; border-radius: 3px; color: #44546A !important; background: transparent !important; }
.pf .pf-exp-desc { margin: 0 !important; font-size: 0.84rem !important; color: #44546A !important; line-height: 1.65 !important; }

/* ─── PROJECTS ───────────────────────────────────── */
.pf .pf-projects-section { max-width: 1440px; margin: 0 auto; padding: 44px 48px; border-bottom: 1px solid #DDE3EC; }
.pf .pf-projects-header { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 1px solid #DDE3EC; }
.pf .pf-section-title { margin: 0 !important; font-size: 0.68rem !important; font-weight: 800 !important; letter-spacing: .2em !important; text-transform: uppercase !important; color: #2563EB !important; }
.pf .pf-section-count { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: #2563EB !important; color: #fff !important; font-size: 0.65rem; font-weight: 800; }
.pf .pf-projects-grid { display: flex; flex-direction: column; gap: 0; }
.pf .pf-project-card { border: 1px solid #DDE3EC !important; border-radius: 8px; margin-bottom: 10px; background: #FFFFFF !important; cursor: pointer; transition: box-shadow .15s; overflow: hidden; }
.pf .pf-project-card:hover { box-shadow: 0 4px 16px rgba(37,99,235,.1); }
.pf .pf-project-card--open { border-color: #2563EB !important; box-shadow: 0 4px 16px rgba(37,99,235,.12); }
.pf .pf-project-top { display: grid; grid-template-columns: 44px 1fr auto auto; align-items: center; gap: 16px; padding: 16px 20px; }
.pf .pf-project-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.pf .pf-icon-1 { background: #FEF3C7 !important; }
.pf .pf-icon-2 { background: #DBEAFE !important; }
.pf .pf-icon-3 { background: #D1FAE5 !important; }
.pf .pf-project-title { margin: 0 0 3px !important; font-size: 0.92rem !important; font-weight: 700 !important; color: #1A2332 !important; }
.pf .pf-project-type { margin: 0 !important; font-size: 0.65rem !important; font-weight: 600 !important; letter-spacing: .08em !important; text-transform: uppercase !important; color: #6B7A90 !important; }
.pf .pf-project-tags { display: flex; gap: 5px; flex-wrap: wrap; justify-content: flex-end; }
.pf .pf-tag { font-size: 0.65rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: #EFF4FF !important; color: #2563EB !important; letter-spacing: .04em; }
.pf .pf-project-toggle { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #DDE3EC !important; background: transparent !important; color: #6B7A90 !important; font-size: 1rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; transition: all .15s; }
.pf .pf-project-card--open .pf-project-toggle { background: #2563EB !important; border-color: #2563EB !important; color: #FFFFFF !important; }
.pf .pf-project-body { padding: 0 20px 20px 76px; border-top: 1px solid #EBF0F8; }
.pf .pf-project-body p { margin: 16px 0 12px !important; font-size: 0.86rem !important; color: #44546A !important; line-height: 1.7 !important; }
.pf .pf-project-footer { display: flex; flex-direction: column; gap: 12px; }
.pf .pf-project-link { font-size: 0.8rem; font-weight: 700; color: #2563EB !important; text-decoration: none; }
.pf .pf-project-link:hover { text-decoration: underline; }
.pf .pf-project-imgs { display: flex; gap: 10px; flex-wrap: wrap; }
.pf .pf-thumb { width: 160px; height: 100px; border-radius: 5px; overflow: hidden; background: #EBF0F8 !important; }
.pf .pf-thumb img { width: 100%; height: 100%; object-fit: cover; }

/* ─── BOTTOM ROW ─────────────────────────────────── */
.pf .pf-bottom-row { display: grid; grid-template-columns: 1fr 1fr; max-width: 1440px; margin: 0 auto; }
.pf .pf-bottom-panel { padding: 44px 48px; background: #FFFFFF !important; border-top: 1px solid #DDE3EC; }
.pf .pf-bottom-panel + .pf-bottom-panel { border-left: 1px solid #DDE3EC; }
.pf .pf-bottom-title { margin: 0 0 24px !important; font-size: 0.68rem !important; font-weight: 800 !important; letter-spacing: .2em !important; text-transform: uppercase !important; color: #2563EB !important; padding-bottom: 12px !important; border-bottom: 1px solid #DDE3EC !important; }
.pf .pf-cert-list { display: flex; flex-direction: column; }
.pf .pf-cert-item { padding: 14px 0; border-bottom: 1px solid #EBF0F8; }
.pf .pf-cert-item:last-child { border-bottom: none; }
.pf .pf-cert-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
.pf .pf-cert-name { font-size: 0.85rem; font-weight: 700; color: #1A2332 !important; }
.pf .pf-cert-link { font-size: 0.9rem; font-weight: 700; color: #2563EB !important; text-decoration: none; }
.pf .pf-cert-org { display: block; font-size: 0.7rem; color: #6B7A90 !important; margin-bottom: 8px; }
.pf .pf-cert-bar { height: 3px; background: #EBF0F8 !important; border-radius: 2px; overflow: hidden; }
.pf .pf-cert-fill { height: 100%; background: linear-gradient(90deg, #2563EB, #60A5FA); border-radius: 2px; }
.pf .pf-contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.pf .pf-contact-card { display: flex; flex-direction: column; gap: 3px; padding: 16px; border: 1px solid #DDE3EC !important; border-radius: 8px; text-decoration: none !important; background: #F4F6F9 !important; transition: all .15s; }
.pf .pf-contact-card:hover { border-color: #2563EB !important; background: #EFF4FF !important; }
.pf .pf-contact-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 7px; background: #DBEAFE !important; color: #2563EB !important; font-size: 0.75rem; font-weight: 700; margin-bottom: 4px; }
.pf .pf-contact-label { font-size: 0.65rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #6B7A90 !important; }
.pf .pf-contact-value { font-size: 0.8rem; font-weight: 600; color: #1A2332 !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ─── MODAL ──────────────────────────────────────── */
.pf .pf-modal-mask { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; background: rgba(26,35,50,.55); backdrop-filter: blur(4px); }
.pf .pf-modal { background: #FFFFFF !important; border: 1px solid #DDE3EC !important; border-radius: 12px; padding: 32px; min-width: 340px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 24px 64px rgba(26,35,50,.18); }
.pf .pf-modal h3 { margin: 0 0 8px !important; font-size: 1.1rem !important; font-weight: 800 !important; color: #1A2332 !important; }
.pf .pf-modal-list { display: flex; flex-direction: column; gap: 6px; }
.pf .pf-modal-item { display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; border: 1px solid #DDE3EC !important; border-radius: 7px; cursor: pointer; font-size: 0.88rem; font-weight: 600; color: #1A2332 !important; transition: all .15s; background: transparent !important; }
.pf .pf-modal-item:hover { border-color: #2563EB !important; background: #EFF4FF !important; color: #2563EB !important; }
.pf .pf-modal-arrow { font-size: 0.9rem; color: #2563EB !important; }
.pf .pf-modal-close { padding: 10px; border: 1px solid #DDE3EC !important; border-radius: 7px; background: transparent !important; color: #6B7A90 !important; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all .15s; }
.pf .pf-modal-close:hover { border-color: #93AABF !important; color: #1A2332 !important; }

/* ─── STATES ─────────────────────────────────────── */
.pf .pf-state { padding: 80px 32px; text-align: center; color: #6B7A90 !important; }
.pf .pf-state-err { color: #DC2626 !important; }
.pf .pf-empty { font-size: 0.85rem !important; color: #93AABF !important; font-style: italic !important; margin: 0 !important; }

/* ─── AVATAR COLORS ──────────────────────────────── */
.pf .av-blue   { background: #2563EB !important; }
.pf .av-amber  { background: #D97706 !important; }
.pf .av-green  { background: #059669 !important; }
.pf .av-purple { background: #7C3AED !important; }
.pf .av-rose   { background: #E11D48 !important; }
.pf .av-teal   { background: #0891B2 !important; }
.pf .av-orange { background: #EA580C !important; }
.pf .av-slate  { background: #475569 !important; }

/* ─── RESPONSIVE ─────────────────────────────────── */
@media (max-width: 1100px) {
  .pf .pf-header { flex-wrap: wrap; height: auto; padding: 12px 20px; gap: 8px; }
  .pf .pf-hero { grid-template-columns: 1fr; }
  .pf .pf-hero-text { border-right: none; border-bottom: 1px solid #DDE3EC; padding: 36px 24px; }
  .pf .pf-hero-photo-col { min-height: 260px; }
  .pf .pf-two-col { grid-template-columns: 1fr; }
  .pf .pf-col-section--right { border-left: none; border-top: 1px solid #DDE3EC; }
  .pf .pf-skills-inner { padding: 28px 24px; border-left: none; border-right: none; }
  .pf .pf-bottom-row { grid-template-columns: 1fr; }
  .pf .pf-bottom-panel + .pf-bottom-panel { border-left: none; border-top: 1px solid #DDE3EC; }
}
@media (max-width: 640px) {
  .pf .pf-hero-text,
  .pf .pf-col-section,
  .pf .pf-projects-section,
  .pf .pf-bottom-panel { padding: 28px 16px; }
  .pf .pf-skills-inner { padding: 24px 16px; border-left: none; border-right: none; }
  .pf .pf-project-top { grid-template-columns: 44px 1fr auto; }
  .pf .pf-project-tags { display: none; }
  .pf .pf-project-body { padding-left: 16px; }
  .pf .pf-contact-grid { grid-template-columns: 1fr; }
}
</style>
