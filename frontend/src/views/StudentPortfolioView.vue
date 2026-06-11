<template>
  <main class="portfolio-page">
    <div class="glow glow-one"></div>
    <div class="glow glow-two"></div>

    <div class="shape shape-one"></div>
    <div class="shape shape-two"></div>

    <header class="portfolio-header">
      <RouterLink to="/profile" class="brand">
        <img src="@/assets/PheraCoreLogo.svg" alt="PheraCore" />
        <span>heraCore</span>
      </RouterLink>

      <nav class="nav-links" aria-label="Sections du portfolio">
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
          :class="{ active: activeSectionId === section.id }"
          :aria-current="activeSectionId === section.id ? 'page' : undefined"
          @click="scrollToSection(section.id)"
        >
          {{ section.label }}
        </button>
      </nav>

      <div class="download-actions">
        <button type="button" class="download-btn" @click="downloadHtml">
          Télécharger HTML
        </button>

        <button type="button" class="download-btn ghost" @click="downloadPdf">
          Télécharger PDF
        </button>
      </div>
    </header>

    <section
      id="about"
      class="portfolio-section hero-section"
      data-section-id="about"
    >
      <div class="hero-left">
        <div class="hero-dot"></div>

        <div class="recos-pill">
          <div>
            <strong>{{ profile.recos }}</strong>
            <span>Tot recos</span>
          </div>

          <div class="recos-avatars">
            <span
              v-for="person in recosPreview"
              :key="person.name"
              class="recos-avatar"
              :class="avatarColorClass(person.name)"
            >
              {{ getInitials(person.name) }}
            </span>
          </div>
        </div>

        <h1>{{ profile.firstName }}<br />{{ profile.lastName }}</h1>

        <p class="hero-title">{{ profile.title }}</p>
        <p class="hero-school">{{ profile.school }}</p>

        <div class="about-text">
          <h2>À propos</h2>
          <p>{{ profile.bio }}</p>
        </div>
      </div>

      <div class="hero-right">
        <a
          class="floating-icon github"
          :href="profile.github"
          target="_blank"
          rel="noopener"
          aria-label="GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        </a>

        <div class="profile-photo">
          <img v-if="profile.avatar" :src="profile.avatar" alt="Profile" />
          <span v-else>{{ profileInitials }}</span>
        </div>

        <a
          class="floating-icon linkedin"
          :href="profile.linkedin"
          target="_blank"
          rel="noopener"
          aria-label="LinkedIn"
        >
          in
        </a>

        <a
          class="floating-icon mail"
          :href="'mailto:' + profile.email"
          aria-label="Email"
        >
          @
        </a>
      </div>
    </section>

    <section
      id="skills"
      class="portfolio-section"
      data-section-id="skills"
    >
      <div class="section-head">
        <h2>Compétences</h2>
        <p>Compétences techniques et comportementales liées au profil.</p>
      </div>

      <div class="skills-grid">
        <article
          v-for="group in skills"
          :key="group.title"
          class="portfolio-card"
        >
          <h3>{{ group.title }}</h3>

          <div class="skill-list">
            <span v-for="skill in group.items" :key="skill">
              {{ skill }}
            </span>
          </div>
        </article>
      </div>
    </section>

    <section
      id="journey"
      class="portfolio-section"
      data-section-id="journey"
    >
      <div class="section-head">
        <h2>Parcours</h2>
        <p>Diplômes obtenus et étapes principales du parcours académique.</p>
      </div>

      <div class="timeline">
        <article
          v-for="diploma in diplomas"
          :key="diploma.title"
          class="timeline-card"
        >
          <div class="timeline-dot"></div>

          <div>
            <h3>{{ diploma.title }}</h3>
            <p class="muted">{{ diploma.school }}</p>
            <p>{{ diploma.description }}</p>
          </div>

          <span>{{ diploma.period }}</span>
        </article>
      </div>
    </section>

    <section
      id="projects"
      class="portfolio-section"
      data-section-id="projects"
    >
      <div class="section-head">
        <h2>Projets</h2>
        <p>Projets académiques, personnels et stages avec technologies utilisées.</p>
      </div>

      <div class="projects-grid">
        <article
          v-for="project in projects"
          :key="project.id"
          class="portfolio-card project-card"
        >
          <div class="project-top">
            <span class="project-icon">{{ project.icon }}</span>

            <div>
              <h3>{{ project.title }}</h3>
              <p class="project-type">{{ project.type }}</p>
            </div>
          </div>

          <p>{{ project.description }}</p>

          <div class="tags">
            <span v-for="tech in project.tech" :key="tech">
              {{ tech }}
            </span>
          </div>

          <div class="project-actions">
            <button type="button" @click="selectedProjectId = project.id">
              Détails
            </button>

            <a :href="project.github" target="_blank" rel="noopener">
              Code
            </a>
          </div>
        </article>
      </div>

      <article v-if="selectedProject" class="project-details">
        <div class="details-head">
          <div>
            <h3>Détails - {{ selectedProject.title }}</h3>
            <p>{{ selectedProject.type }}</p>
          </div>

          <button type="button" @click="selectedProjectId = null">
            Fermer
          </button>
        </div>

        <p>{{ selectedProject.details }}</p>

        <div class="details-media">
          <div
            v-for="image in selectedProject.images"
            :key="image"
            class="media-placeholder"
          >
            <img v-if="image" :src="image" alt="Project detail" />
          </div>
        </div>
      </article>
    </section>

    <section
      id="experience"
      class="portfolio-section"
      data-section-id="experience"
    >
      <div class="section-head">
        <h2>Expérience</h2>
        <p>Stages et expériences professionnelles liés au profil.</p>
      </div>

      <div class="experience-list">
        <article
          v-for="experience in experiences"
          :key="experience.company"
          class="experience-card"
        >
          <div>
            <h3>{{ experience.role }}</h3>
            <strong>{{ experience.company }}</strong>
            <p>{{ experience.description }}</p>
          </div>

          <div class="experience-meta">
            <span>{{ experience.period }}</span>
            <span>{{ experience.location }}</span>
            <span>{{ experience.mode }}</span>
          </div>
        </article>
      </div>
    </section>

    <section
      id="certifications"
      class="portfolio-section"
      data-section-id="certifications"
    >
      <div class="section-head">
        <h2>Certifications</h2>
        <p>Certifications triées par force décroissante.</p>
      </div>

      <div class="certification-grid">
        <article
          v-for="certification in sortedCertifications"
          :key="certification.name"
          class="portfolio-card certification-card"
        >
          <div>
            <h3>{{ certification.name }}</h3>
            <p>{{ certification.organization }}</p>
            <span>{{ certification.date }}</span>
          </div>

          <a :href="certification.link" target="_blank" rel="noopener">
            Voir
          </a>
        </article>
      </div>
    </section>

    <section
      id="contact"
      class="portfolio-section contact-section"
      data-section-id="contact"
    >
      <div class="section-head">
        <h2>Contact</h2>
        <p>Coordonnées et réseaux sociaux.</p>
      </div>

      <div class="contact-grid">
        <a :href="'tel:' + profile.phone" class="contact-card">
          <span>Téléphone</span>
          <strong>{{ profile.phone }}</strong>
        </a>

        <a :href="'mailto:' + profile.email" class="contact-card">
          <span>Email</span>
          <strong>{{ profile.email }}</strong>
        </a>

        <a :href="profile.linkedin" target="_blank" rel="noopener" class="contact-card">
          <span>LinkedIn</span>
          <strong>Profil LinkedIn</strong>
        </a>

        <a :href="profile.github" target="_blank" rel="noopener" class="contact-card">
          <span>GitHub</span>
          <strong>Dépôts GitHub</strong>
        </a>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

type SectionId =
  | "about"
  | "skills"
  | "journey"
  | "projects"
  | "experience"
  | "certifications"
  | "contact";

type Project = {
  id: number;
  icon: string;
  title: string;
  type: string;
  description: string;
  details: string;
  tech: string[];
  github: string;
  images: string[];
};

const sections: Array<{ id: SectionId; label: string }> = [
  { id: "about", label: "À propos" },
  { id: "skills", label: "Compétences" },
  { id: "journey", label: "Parcours" },
  { id: "projects", label: "Projets" },
  { id: "experience", label: "Expérience" },
  { id: "certifications", label: "Certifications" },
  { id: "contact", label: "Contact" },
];

const activeSectionId = ref<SectionId>("about");
const selectedProjectId = ref<number | null>(1);

let observer: IntersectionObserver | null = null;

const profile = {
  firstName: "Nom",
  lastName: "Prenom",
  title: "Ex Developpement Operation & Support Etudiant",
  school: "Ex Dassault Université de Bretagne Occidentale",
  recos: "500+",
  avatar: "",
  phone: "+212 600 000 000",
  email: "exemple.exemple@univ.etu.ac.ma",
  linkedin: "https://linkedin.com/in/example",
  github: "https://github.com/example",
  bio:
    "Ex Je suis étudiante en ingénierie avec une spécialisation en informatique, passionnée par le développement et le support opérationnel. J’ai un fort intérêt pour la résolution de problèmes techniques, l’optimisation des systèmes et l’accompagnement des utilisateurs dans leur expérience digitale. Au cours de mon parcours académique, j’ai acquis des compétences en développement logiciel, en gestion des environnements techniques et en support applicatif. J’aime comprendre en profondeur le fonctionnement des systèmes afin d’assurer leur stabilité, leur performance et leur amélioration continue. Curieuse, rigoureuse et motivée, je cherche à développer mes compétences dans des projets concrets, tout en apportant des solutions efficaces et adaptées aux besoins des utilisateurs et des entreprises.",
};

const recosPreview = [
  { name: "Mme Professeur Nom" },
  { name: "Mr Professionnel Nom" },
  { name: "Nom Étudiant Exemple" },
  { name: "Mme Encadrante Nom" },
];

const skills = [
  {
    title: "Développement",
    items: ["Vue.js", "TypeScript", "JavaScript", "Node.js", "Python"],
  },
  {
    title: "Outils & DevOps",
    items: ["Git", "GitHub", "Docker", "CI/CD", "Linux"],
  },
  {
    title: "Soft Skills",
    items: ["Communication", "Autonomie", "Travail en équipe", "Rigueur"],
  },
];

const diplomas = [
  {
    title: "Diplôme d’ingénierie informatique",
    school: "Ex École / Université",
    period: "2024 - 2026",
    description:
      "Formation orientée développement logiciel, architecture web et support applicatif.",
  },
  {
    title: "Licence professionnelle",
    school: "Ex Université",
    period: "2021 - 2024",
    description:
      "Bases solides en programmation, bases de données, réseaux et systèmes.",
  },
  {
    title: "Baccalauréat sciences mathématiques",
    school: "Ex Lycée",
    period: "2020 - 2021",
    description:
      "Formation scientifique avec spécialisation en mathématiques et logique.",
  },
];

const projects: Project[] = [
  {
    id: 1,
    icon: "📚",
    title: "Gestion de bibliothèque",
    type: "Projet académique",
    description:
      "Application web permettant de gérer les livres, les emprunts et les utilisateurs.",
    details:
      "Ce projet est lié au profil étudiant. Il contient une gestion complète des livres, rôles utilisateurs, emprunts, retours et tableau de bord administratif.",
    tech: ["Vue.js", "TypeScript", "Node.js", "MongoDB"],
    github: "https://github.com/example/library-management",
    images: ["", "", ""],
  },
  {
    id: 2,
    icon: "💼",
    title: "Portfolio académique",
    type: "Projet personnel",
    description:
      "Portfolio interactif pour afficher les projets, compétences, stages et certifications.",
    details:
      "Le portfolio est connecté aux informations du profil. Les sections sont générées depuis les données du profil étudiant.",
    tech: ["Vue.js", "CSS", "Vite"],
    github: "https://github.com/example/student-portfolio",
    images: ["", "", ""],
  },
  {
    id: 3,
    icon: "📊",
    title: "Dashboard étudiant",
    type: "Projet de stage",
    description:
      "Interface de statistiques pour suivre profil, recommandations et opportunités.",
    details:
      "Projet réalisé durant un stage avec filtres, statistiques dynamiques et visualisation des données principales.",
    tech: ["Vue.js", "TypeScript", "Charts", "API REST"],
    github: "https://github.com/example/student-dashboard",
    images: ["", "", ""],
  },
];

const experiences = [
  {
    role: "Software Support Intern",
    company: "Entreprise Exemple",
    period: "Mai 2026 - Août 2026",
    location: "Tanger, Maroc",
    mode: "Présentiel",
    description:
      "Support applicatif, analyse des incidents, documentation technique et amélioration des processus.",
  },
  {
    role: "Frontend Developer Intern",
    company: "Startup Exemple",
    period: "Novembre 2025 - Février 2026",
    location: "Remote",
    mode: "À distance",
    description:
      "Développement de composants Vue.js, intégration UI et correction de bugs frontend.",
  },
];

const certifications = [
  {
    name: "Google UX Design",
    organization: "Google",
    date: "2026",
    strength: 100,
    link: "https://example.com/google-certification",
  },
  {
    name: "Oracle Database Foundations",
    organization: "Oracle",
    date: "2025",
    strength: 90,
    link: "https://example.com/oracle-certification",
  },
  {
    name: "Cisco Networking Basics",
    organization: "Cisco",
    date: "2025",
    strength: 80,
    link: "https://example.com/cisco-certification",
  },
  {
    name: "Vue.js Fundamentals",
    organization: "Plateforme Exemple",
    date: "2024",
    strength: 60,
    link: "https://example.com/vue-certification",
  },
];

const profileInitials = computed(() => {
  return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
});

const activeSectionLabel = computed(() => {
  return sections.find((section) => section.id === activeSectionId.value)?.label || "À propos";
});

const selectedProject = computed(() => {
  return projects.find((project) => project.id === selectedProjectId.value) || null;
});

const sortedCertifications = computed(() => {
  return [...certifications].sort((a, b) => b.strength - a.strength);
});

function scrollToSection(id: SectionId) {
  const element = document.getElementById(id);

  if (!element) return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function avatarColorClass(name: string) {
  const colors = [
    "avatar-blue",
    "avatar-orange",
    "avatar-indigo",
    "avatar-green",
    "avatar-deep-blue",
    "avatar-brown",
    "avatar-purple",
    "avatar-slate",
  ];

  const sum = name
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return colors[sum % colors.length];
}

function downloadPdf() {
  window.print();
}

function downloadHtml() {
  const html = buildHtmlPortfolio();
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `portfolio-${profile.firstName}-${profile.lastName}.html`;
  link.click();

  URL.revokeObjectURL(url);
}

function buildHtmlPortfolio() {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Portfolio ${profile.firstName} ${profile.lastName}</title>
  <style>
    body {
      margin: 0;
      padding: 40px;
      font-family: Arial, sans-serif;
      background: #111827;
      color: white;
      line-height: 1.6;
    }

    h1 {
      font-size: 56px;
      margin-bottom: 6px;
    }

    h2 {
      margin-top: 40px;
    }

    .card {
      border: 1px solid rgba(255,255,255,.18);
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 14px;
    }

    .muted {
      color: #aab2bf;
    }

    .tag {
      display: inline-block;
      margin: 5px 5px 0 0;
      padding: 5px 10px;
      border-radius: 999px;
      background: #4f46e5;
      color: white;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>${profile.firstName} ${profile.lastName}</h1>
  <p>${profile.title}</p>
  <p class="muted">${profile.school}</p>

  <h2>À propos</h2>
  <p>${profile.bio}</p>

  <h2>Compétences</h2>
  ${skills
    .map(
      (group) => `
      <div class="card">
        <h3>${group.title}</h3>
        ${group.items.map((item) => `<span class="tag">${item}</span>`).join("")}
      </div>
    `,
    )
    .join("")}

  <h2>Parcours</h2>
  ${diplomas
    .map(
      (diploma) => `
      <div class="card">
        <h3>${diploma.title}</h3>
        <p class="muted">${diploma.school} • ${diploma.period}</p>
        <p>${diploma.description}</p>
      </div>
    `,
    )
    .join("")}

  <h2>Projets</h2>
  ${projects
    .map(
      (project) => `
      <div class="card">
        <h3>${project.title}</h3>
        <p class="muted">${project.type}</p>
        <p>${project.description}</p>
        ${project.tech.map((tech) => `<span class="tag">${tech}</span>`).join("")}
        <p><a href="${project.github}">Code GitHub</a></p>
      </div>
    `,
    )
    .join("")}

  <h2>Expérience</h2>
  ${experiences
    .map(
      (experience) => `
      <div class="card">
        <h3>${experience.role}</h3>
        <p class="muted">${experience.company} • ${experience.period} • ${experience.location} • ${experience.mode}</p>
        <p>${experience.description}</p>
      </div>
    `,
    )
    .join("")}

  <h2>Certifications</h2>
  ${sortedCertifications.value
    .map(
      (certification) => `
      <div class="card">
        <h3>${certification.name}</h3>
        <p class="muted">${certification.organization} • ${certification.date}</p>
        <p><a href="${certification.link}">Voir la certification</a></p>
      </div>
    `,
    )
    .join("")}

  <h2>Contact</h2>
  <p>Téléphone : ${profile.phone}</p>
  <p>Email : ${profile.email}</p>
  <p>LinkedIn : ${profile.linkedin}</p>
  <p>GitHub : ${profile.github}</p>
</body>
</html>
`;
}

onMounted(() => {
  const sectionElements = document.querySelectorAll<HTMLElement>("[data-section-id]");

  observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;

      const target = visibleEntry.target as HTMLElement;

      activeSectionId.value = target.dataset.sectionId as SectionId;
    },
    {
      root: null,
      threshold: [0.25, 0.4, 0.6],
      rootMargin: "-120px 0px -45% 0px",
    },
  );

  sectionElements.forEach((section) => observer?.observe(section));
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.portfolio-page {
  --page-bg: #0b1220;
  --page-bg-soft: #101a2d;
  --surface: rgba(255, 255, 255, .065);
  --surface-strong: rgba(255, 255, 255, .1);
  --line: rgba(255, 255, 255, .14);
  --line-strong: rgba(255, 255, 255, .24);
  --text: #f8fafc;
  --muted: #aab7c8;
  --cyan: #16c7ee;
  --blue: #5b8cff;
  --purple-accent: #6d5dfc;
  --rose: #d56b96;

  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 8%, rgba(22, 199, 238, .09), transparent 28%),
    linear-gradient(135deg, #0b1220 0%, #121b30 48%, #1f315c 100%);
  color: var(--text);
  font-family: var(--font-body), Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow-x: hidden;
  position: relative;
}

.portfolio-page button,
.portfolio-page a {
  -webkit-tap-highlight-color: transparent;
}

.portfolio-page button {
  cursor: pointer;
}

.portfolio-header {
  position: sticky;
  top: 0;
  z-index: 30;
  min-height: 78px;
  padding: 13px clamp(18px, 4vw, 34px);
  background: rgba(9, 15, 28, .8);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: clamp(16px, 3vw, 30px);
  border-bottom: 1px solid rgba(148, 163, 184, .16);
  box-shadow: 0 18px 44px rgba(0, 0, 0, .18);
}

.brand {
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
  min-width: max-content;
  transition: transform .22s ease, opacity .22s ease;
}

.brand:hover {
  transform: translateY(-1px);
}

.brand img {
  height: 42px;
  width: 42px;
}

.brand span {
  margin-left: -4px;
  font-family: var(--font-head), Inter, sans-serif;
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  font-weight: 800;
  letter-spacing: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 0;
  padding: 5px;
  border: 1px solid rgba(255, 255, 255, .1);
  border-radius: 999px;
  background: rgba(255, 255, 255, .045);
  overflow-x: auto;
  scrollbar-width: none;
}

.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-links button {
  background: transparent;
  color: #ffffff;
  font-family: var(--font-head), Inter, sans-serif;
  font-size: .92rem;
  font-weight: 750;
  border: 0;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  white-space: nowrap;
  transition:
    color .2s ease,
    background-color .2s ease,
    box-shadow .2s ease,
    transform .2s ease;
}

.nav-links button:hover,
.nav-links button:focus-visible {
  color: var(--cyan);
  background: rgba(22, 199, 238, .09);
  outline: 0;
}

.nav-links button:focus-visible {
  box-shadow: 0 0 0 3px rgba(22, 199, 238, .22);
}

.nav-links button.active {
  color: var(--cyan);
  background: rgba(22, 199, 238, .13);
  box-shadow: inset 0 0 0 1px rgba(22, 199, 238, .18);
}

.download-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.download-btn {
  min-height: 40px;
  padding: 0 17px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 999px;
  background: linear-gradient(135deg, var(--purple-accent), #5048e5);
  color: #ffffff;
  font-family: var(--font-head), Inter, sans-serif;
  font-size: .9rem;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 14px 30px rgba(79, 70, 229, .25);
  transition:
    transform .22s ease,
    box-shadow .22s ease,
    border-color .22s ease,
    background-color .22s ease;
}

.download-btn:hover,
.download-btn:focus-visible {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, .26);
  box-shadow: 0 18px 38px rgba(79, 70, 229, .34);
  outline: 0;
}

.download-btn.ghost {
  background: rgba(255, 255, 255, .055);
  color: #eef2ff;
  box-shadow: none;
}

.portfolio-section {
  position: relative;
  z-index: 2;
  width: min(100%, 1240px);
  margin: 0 auto;
  padding: 90px clamp(20px, 6vw, 100px);
  scroll-margin-top: 104px;
}

.hero-section {
  min-height: calc(100vh - 78px);
  display: grid;
  grid-template-columns: minmax(0, 1.04fr) minmax(310px, .96fr);
  gap: clamp(44px, 7vw, 88px);
  align-items: center;
  padding-top: 48px;
}

.hero-section::after {
  content: "";
  position: absolute;
  left: clamp(20px, 6vw, 100px);
  right: clamp(20px, 6vw, 100px);
  bottom: 48px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .5), transparent);
}

.hero-left {
  position: relative;
  max-width: 560px;
}

.hero-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--cyan);
  margin-bottom: 14px;
  box-shadow: 0 0 0 8px rgba(22, 199, 238, .1);
}

.recos-pill {
  position: absolute;
  top: -8px;
  left: min(16vw, 168px);
  width: 188px;
  min-height: 54px;
  padding: 7px 10px 7px 20px;
  border: 1px solid rgba(22, 199, 238, .72);
  border-radius: 999px;
  background: rgba(8, 17, 34, .58);
  box-shadow: 0 18px 34px rgba(0, 0, 0, .18);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.recos-pill strong {
  display: block;
  color: var(--cyan);
  font-family: var(--font-head), Inter, sans-serif;
  font-size: .95rem;
  line-height: 1;
}

.recos-pill span {
  color: var(--muted);
  font-size: .62rem;
}

.recos-avatars {
  display: flex;
  align-items: center;
}

.recos-avatar {
  width: 34px;
  height: 34px;
  margin-left: -8px;
  border-radius: 50%;
  background: var(--avatar-bg, #039be5);
  color: white;
  border: 2px solid rgba(255, 255, 255, .9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head), Inter, sans-serif;
  font-size: .65rem;
  font-weight: 800;
}

.recos-avatar:first-child {
  margin-left: 0;
}

h1 {
  margin: 0 0 8px;
  font-family: var(--font-head), Inter, sans-serif;
  font-size: clamp(52px, 6vw, 84px);
  font-weight: 800;
  line-height: .98;
  letter-spacing: 0;
  text-wrap: balance;
}

.hero-title {
  font-family: var(--font-head), Inter, sans-serif;
  font-size: 1.18rem;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.hero-school {
  font-size: .78rem;
  color: var(--muted);
}

.about-text {
  margin-top: 38px;
  padding-left: 18px;
  border-left: 2px solid rgba(22, 199, 238, .38);
}

.about-text h2,
.section-head h2 {
  font-family: var(--font-head), Inter, sans-serif;
  font-size: clamp(1.32rem, 2vw, 1.65rem);
  margin-bottom: 18px;
  letter-spacing: 0;
}

.about-text p {
  font-size: .92rem;
  line-height: 1.7;
  color: #edf4ff;
}

.hero-right {
  position: relative;
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-photo {
  width: min(420px, 35vw);
  height: min(420px, 35vw);
  min-width: 312px;
  min-height: 312px;
  border-radius: 50%;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, .16), rgba(255, 255, 255, .02)),
    repeating-conic-gradient(#e4e7eb 0% 25%, #f8fafc 0% 50%) 0 0 / 32px 32px;
  border: 10px solid rgba(255, 255, 255, .86);
  box-shadow:
    0 32px 80px rgba(0, 0, 0, .24),
    0 0 0 1px rgba(255, 255, 255, .18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-family: var(--font-head), Inter, sans-serif;
  font-size: 4rem;
  font-weight: 800;
  margin: 0 auto;
  overflow: hidden;
}

.profile-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.floating-icon {
  position: absolute;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .96);
  color: var(--page-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head), Inter, sans-serif;
  font-size: .82rem;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 14px 28px rgba(0, 0, 0, .18);
  transition: transform .22s ease, background-color .22s ease, color .22s ease;
}

.floating-icon:hover,
.floating-icon:focus-visible {
  transform: translateY(-3px);
  background: var(--cyan);
  color: #08111f;
  outline: 0;
}

.github {
  top: 56px;
  left: 18%;
}

.linkedin {
  left: 8%;
  bottom: 118px;
}

.mail {
  right: 8%;
  bottom: 128px;
}

.section-head {
  text-align: center;
  max-width: 660px;
  margin: 0 auto 34px;
}

.section-head p {
  color: var(--muted);
  font-size: .96rem;
  line-height: 1.65;
}

.skills-grid,
.projects-grid,
.certification-grid,
.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.portfolio-card,
.timeline-card,
.experience-card,
.contact-card,
.project-details {
  border: 1px solid var(--line);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .08), rgba(255, 255, 255, .045));
  box-shadow: 0 20px 46px rgba(0, 0, 0, .16);
  transition:
    transform .22s ease,
    border-color .22s ease,
    background-color .22s ease,
    box-shadow .22s ease;
}

.portfolio-card {
  padding: 22px;
}

.portfolio-card:hover,
.timeline-card:hover,
.experience-card:hover,
.contact-card:hover,
.project-details:hover {
  transform: translateY(-3px);
  border-color: rgba(22, 199, 238, .32);
  box-shadow: 0 24px 56px rgba(0, 0, 0, .2);
}

.portfolio-card h3,
.timeline-card h3,
.experience-card h3 {
  font-family: var(--font-head), Inter, sans-serif;
  font-size: 1.02rem;
  margin-bottom: 10px;
  color: #ffffff;
}

.portfolio-card p,
.timeline-card p,
.experience-card p {
  color: #dce6f5;
  font-size: .88rem;
  line-height: 1.65;
}

.skill-list,
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-list span,
.tags span {
  padding: 6px 11px;
  border-radius: 999px;
  background: rgba(91, 140, 255, .16);
  border: 1px solid rgba(91, 140, 255, .26);
  color: white;
  font-size: .72rem;
  font-weight: 800;
}

.timeline,
.experience-list {
  display: grid;
  gap: 18px;
  max-width: 920px;
  margin: 0 auto;
}

.timeline-card,
.experience-card {
  padding: 24px;
  display: grid;
  grid-template-columns: 16px 1fr auto;
  gap: 18px;
  align-items: start;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 0 7px rgba(22, 199, 238, .1);
}

.muted,
.project-type {
  color: var(--muted);
  font-size: .78rem;
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.project-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(22, 199, 238, .12);
  font-size: 1.45rem;
}

.project-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.project-actions button,
.project-actions a,
.certification-card a {
  min-height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: var(--rose);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head), Inter, sans-serif;
  font-size: .8rem;
  font-weight: 800;
  text-decoration: none;
  transition: transform .2s ease, background-color .2s ease, border-color .2s ease;
}

.project-actions button:hover,
.project-actions button:focus-visible,
.project-actions a:hover,
.project-actions a:focus-visible,
.certification-card a:hover,
.certification-card a:focus-visible,
.details-head button:hover,
.details-head button:focus-visible {
  transform: translateY(-2px);
  outline: 0;
}

.project-actions a,
.certification-card a {
  background: transparent;
  border-color: rgba(255, 255, 255, .28);
}

.project-details {
  max-width: 1080px;
  margin: 24px auto 0;
  padding: 24px;
}

.details-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.details-head h3 {
  font-family: var(--font-head), Inter, sans-serif;
  margin-bottom: 4px;
}

.details-head p,
.project-details p {
  color: #d7e2f0;
}

.details-head button {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, .12);
  background: var(--purple-accent);
  color: white;
  font-weight: 800;
  transition: transform .2s ease, border-color .2s ease;
}

.details-media {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 18px;
}

.media-placeholder {
  height: 190px;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, .1), rgba(255, 255, 255, 0)),
    repeating-conic-gradient(#e1e5ea 0% 25%, #f8fafc 0% 50%) 0 0 / 24px 24px;
  overflow: hidden;
}

.media-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.experience-card {
  grid-template-columns: 1fr auto;
}

.experience-card strong {
  display: block;
  margin-bottom: 12px;
  color: white;
}

.experience-meta {
  display: grid;
  gap: 8px;
  color: #d1d5db;
  font-size: .82rem;
  text-align: right;
}

.certification-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.certification-card span {
  display: block;
  color: var(--cyan);
  margin-top: 8px;
  font-size: .8rem;
}

.contact-card {
  padding: 22px;
  color: white;
  text-decoration: none;
  min-width: 0;
}

.contact-card span {
  display: block;
  color: var(--cyan);
  font-size: .78rem;
  margin-bottom: 8px;
}

.contact-card strong {
  display: block;
  font-family: var(--font-head), Inter, sans-serif;
  font-size: .95rem;
  overflow-wrap: anywhere;
}

.glow {
  position: fixed;
  z-index: 0;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(6px);
  background: radial-gradient(circle, rgba(68, 122, 226, .24), rgba(22, 199, 238, .08) 45%, rgba(90, 137, 237, 0) 72%);
  animation: glowPulse 9s ease-in-out infinite;
}

.glow-one {
  width: 500px;
  height: 500px;
  left: -210px;
  top: 80px;
}

.glow-two {
  width: 560px;
  height: 560px;
  right: -230px;
  bottom: -170px;
  animation-delay: -3s;
}

.shape {
  position: fixed;
  z-index: 1;
  pointer-events: none;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(91, 140, 255, .2), rgba(91, 140, 255, .08));
  transform: rotate(-31deg);
}

.shape-one {
  width: 136px;
  height: 460px;
  left: -92px;
  bottom: -245px;
  animation: shapeOneMove 8s ease-in-out infinite;
}

.shape-two {
  width: 118px;
  height: 390px;
  right: -96px;
  top: 360px;
  transform: rotate(35deg);
  animation: shapeTwoMove 10s ease-in-out infinite;
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: .18;
    transform: scale(.96);
  }

  50% {
    opacity: .46;
    transform: scale(1.03);
  }
}

@keyframes shapeOneMove {
  0%,
  100% {
    transform: rotate(-31deg) translateY(0);
  }

  50% {
    transform: rotate(-31deg) translateY(-34px);
  }
}

@keyframes shapeTwoMove {
  0%,
  100% {
    transform: rotate(35deg) translateY(0);
  }

  50% {
    transform: rotate(35deg) translateY(-28px);
  }
}

.avatar-blue {
  --avatar-bg: #039be5;
}

.avatar-orange {
  --avatar-bg: #f57c00;
}

.avatar-indigo {
  --avatar-bg: #5e6ad2;
}

.avatar-green {
  --avatar-bg: #43a047;
}

.avatar-deep-blue {
  --avatar-bg: #0277bd;
}

.avatar-brown {
  --avatar-bg: #8d6e63;
}

.avatar-purple {
  --avatar-bg: #5e35b1;
}

.avatar-slate {
  --avatar-bg: #5c6bc0;
}

@media print {
  .portfolio-header,
  .glow,
  .shape,
  .floating-icon {
    display: none;
  }

  .portfolio-page {
    background: white;
    color: #111827;
  }

  .portfolio-section {
    padding: 32px;
    page-break-inside: avoid;
  }

  .hero-section {
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .profile-photo {
    display: none;
  }

  .portfolio-card,
  .timeline-card,
  .experience-card,
  .contact-card,
  .project-details {
    border-color: #ddd;
    background: white;
    box-shadow: none;
  }

  .portfolio-card p,
  .timeline-card p,
  .experience-card p,
  .section-head p,
  .about-text p,
  .project-details p {
    color: #111827;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: .001ms !important;
  }
}

@media (max-width: 1180px) {
  .portfolio-header {
    height: auto;
    padding: 18px 24px;
    grid-template-columns: 1fr auto;
  }

  .nav-links {
    grid-column: 1 / -1;
    justify-content: flex-start;
    order: 3;
  }
}

@media (max-width: 1100px) {
  .nav-links {
    justify-content: flex-start;
    overflow-x: auto;
  }

  .download-actions {
    flex-wrap: wrap;
  }

  .portfolio-section {
    padding: 70px 24px;
  }

  .hero-section {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .recos-pill {
    position: static;
    margin-bottom: 24px;
  }

  .profile-photo {
    width: 300px;
    height: 300px;
    min-width: 300px;
    min-height: 300px;
  }

  .skills-grid,
  .projects-grid,
  .certification-grid,
  .contact-grid,
  .details-media {
    grid-template-columns: 1fr;
  }

  .timeline-card,
  .experience-card {
    grid-template-columns: 1fr;
  }

  .experience-meta {
    text-align: left;
  }

  .hero-section::after {
    left: 24px;
    right: 24px;
  }

  .hero-right {
    min-height: 390px;
  }
}

@media (max-width: 760px) {
  .portfolio-header {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .download-actions {
    width: 100%;
  }

  .download-btn {
    flex: 1 1 140px;
    padding-inline: 12px;
  }

  .portfolio-section {
    padding: 58px 18px;
    scroll-margin-top: 154px;
  }

  .hero-section {
    padding-top: 34px;
    gap: 32px;
  }

  h1 {
    font-size: clamp(42px, 14vw, 58px);
  }

  .about-text {
    padding-left: 14px;
  }

  .profile-photo {
    width: min(76vw, 300px);
    height: min(76vw, 300px);
    min-width: 240px;
    min-height: 240px;
    border-width: 8px;
  }

  .floating-icon {
    width: 34px;
    height: 34px;
  }

  .github {
    top: 26px;
    left: 10%;
  }

  .linkedin {
    left: 4%;
    bottom: 88px;
  }

  .mail {
    right: 4%;
    bottom: 96px;
  }

  .details-head,
  .certification-card {
    flex-direction: column;
    align-items: stretch;
  }

  .shape {
    opacity: .55;
  }

  .shape-two {
    display: none;
  }
}

@media (max-width: 460px) {
  .brand img {
    height: 36px;
    width: 36px;
  }

  .brand span {
    font-size: 1.28rem;
  }

  .nav-links button {
    min-height: 36px;
    padding: 0 12px;
    font-size: .86rem;
  }

  .download-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .download-btn {
    width: 100%;
  }

  .timeline-card,
  .experience-card,
  .project-details,
  .portfolio-card,
  .contact-card {
    padding: 18px;
  }
}
</style>
