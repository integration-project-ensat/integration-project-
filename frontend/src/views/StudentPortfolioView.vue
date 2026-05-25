<template>
  <main class="portfolio-page">
    <nav class="portfolio-nav">
      <RouterLink to="/profile" class="brand">
        <img src="@/assets/PheraCoreLogo.svg" alt="PheraCore" />
        <span>heraCore</span>
      </RouterLink>

      <div class="nav-links">
        <a href="#accueil">Accueil</a>
        <a href="#projets">Projets</a>
        <a href="#stages">Stages</a>
        <a href="#certifications">Certifications</a>
      </div>

      <div class="download-actions">
        <button type="button" class="download-btn" @click="downloadHtml">
          Télécharger en HTML
        </button>

        <button type="button" class="download-btn secondary" @click="downloadPdf">
          Télécharger en PDF
        </button>
      </div>
    </nav>

    <section id="accueil" class="hero-section">
      <div class="shape shape-one"></div>
      <div class="shape shape-two"></div>

      <div class="hero-content">
        <div class="left-content">
          <div class="hero-dot"></div>

          <div class="recos-pill">
            <div>
              <strong>{{ profile.recos }}</strong>
              <span>Tot recos</span>
            </div>

            <div class="mini-avatars">
              <span
                v-for="person in recosPreview"
                :key="person.name"
                class="mini-avatar"
                :class="avatarColorClass(person.name)"
              >
                {{ getInitials(person.name) }}
              </span>
            </div>
          </div>

          <h1>{{ profile.firstName }}<br />{{ profile.lastName }}</h1>

          <p class="headline">{{ profile.title }}</p>
          <p class="school">{{ profile.school }}</p>

          <section class="about-block">
            <h2>A propos</h2>
            <p>{{ profile.bio }}</p>
          </section>
        </div>

        <div class="right-content">
          <div class="github-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
          </div>

          <div class="profile-image">
            <img v-if="profile.avatar" :src="profile.avatar" alt="Profile" />
            <span v-else>{{ initials }}</span>
          </div>

          <div class="social-icon reddit">r</div>
          <div class="social-icon discord">d</div>
        </div>
      </div>
    </section>

    <section id="projets" class="section-block">
      <h2>Projets</h2>

      <div class="cards-grid">
        <article v-for="project in projects" :key="project.title" class="info-card">
          <h3>{{ project.title }}</h3>
          <p>{{ project.description }}</p>
          <div class="tags">
            <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
          </div>
        </article>
      </div>
    </section>

    <section id="stages" class="section-block">
      <h2>Stages</h2>

      <div class="cards-grid">
        <article v-for="stage in stages" :key="stage.company" class="info-card">
          <h3>{{ stage.role }}</h3>
          <p class="muted">{{ stage.company }} • {{ stage.period }}</p>
          <p>{{ stage.description }}</p>
        </article>
      </div>
    </section>

    <section id="certifications" class="section-block">
      <h2>Certifications</h2>

      <div class="cards-grid">
        <article v-for="certification in certifications" :key="certification.name" class="info-card">
          <h3>{{ certification.name }}</h3>
          <p class="muted">{{ certification.organization }}</p>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";

const profile = {
  firstName: "Nom",
  lastName: "Prenom",
  title: "Ex Developpement Operation & Support Etudiant",
  school: "Ex Dassault Université de Bretagne Occidentale",
  recos: "500+",
  avatar: "",
  bio:
    "Ex Je suis étudiante en ingénierie avec une spécialisation en informatique, passionnée par le développement et le support opérationnel. J’ai un fort intérêt pour la résolution de problèmes techniques, l’optimisation des systèmes et l’accompagnement des utilisateurs dans leur expérience digitale. Au cours de mon parcours académique, j’ai acquis des compétences en développement logiciel, en gestion des environnements techniques et en support applicatif. J’aime comprendre en profondeur le fonctionnement des systèmes afin d’assurer leur stabilité, leur performance et leur amélioration continue. Curieuse, rigoureuse et motivée, je cherche à développer mes compétences dans des projets concrets, tout en apportant des solutions efficaces et adaptées aux besoins des utilisateurs et des entreprises.",
};

const recosPreview = [
  { name: "Mme Professeur Nom" },
  { name: "Mr Professionnel Nom" },
  { name: "Nom Étudiant Exemple" },
  { name: "Mme Encadrante Nom" },
];

const projects = [
  {
    title: "Application de gestion de bibliothèque",
    description:
      "Application web permettant de gérer les livres, les emprunts et les utilisateurs.",
    tags: ["Vue.js", "Node.js", "MongoDB"],
  },
  {
    title: "Portfolio académique",
    description:
      "Plateforme pour présenter les projets, stages, certifications et recommandations.",
    tags: ["Vue.js", "TypeScript", "CSS"],
  },
  {
    title: "Dashboard étudiant",
    description:
      "Interface statistique pour suivre les performances, recommandations et opportunités.",
    tags: ["UI", "Analytics", "Frontend"],
  },
];

const stages = [
  {
    role: "Developpement Operation & Support",
    company: "Entreprise Exemple",
    period: "2026",
    description:
      "Support applicatif, suivi technique et amélioration des processus internes.",
  },
];

const certifications = [
  {
    name: "Certification Vue.js",
    organization: "Plateforme Exemple",
  },
  {
    name: "Certification Docker",
    organization: "Plateforme Exemple",
  },
  {
    name: "Certification AWS",
    organization: "Plateforme Exemple",
  },
];

const initials = computed(() => {
  return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
});

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
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Portfolio ${profile.firstName} ${profile.lastName}</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #111827;
      color: white;
      line-height: 1.6;
      padding: 40px;
    }

    h1 {
      font-size: 56px;
      margin: 0 0 12px;
    }

    h2 {
      margin-top: 36px;
      color: #ffffff;
    }

    .muted {
      color: #b7bdc8;
    }

    .card {
      border: 1px solid rgba(255,255,255,.2);
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 14px;
    }

    .tag {
      display: inline-block;
      margin: 6px 6px 0 0;
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

  <h2>A propos</h2>
  <p>${profile.bio}</p>

  <h2>Projets</h2>
  ${projects
    .map(
      (project) => `
      <div class="card">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        ${project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
    `,
    )
    .join("")}

  <h2>Stages</h2>
  ${stages
    .map(
      (stage) => `
      <div class="card">
        <h3>${stage.role}</h3>
        <p class="muted">${stage.company} • ${stage.period}</p>
        <p>${stage.description}</p>
      </div>
    `,
    )
    .join("")}

  <h2>Certifications</h2>
  ${certifications
    .map(
      (certification) => `
      <div class="card">
        <h3>${certification.name}</h3>
        <p class="muted">${certification.organization}</p>
      </div>
    `,
    )
    .join("")}
</body>
</html>
`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `portfolio-${profile.firstName}-${profile.lastName}.html`;
  link.click();

  URL.revokeObjectURL(url);
}
</script>

<style scoped>
.portfolio-page {
  min-height: 100vh;
  background: #111827;
  color: #ffffff;
  font-family: var(--font-body);
  overflow-x: hidden;
}

.portfolio-nav {
  height: 78px;
  padding: 0 28px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 34px;
  position: relative;
  z-index: 5;
}

.brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #ffffff;
}

.brand img {
  height: 44px;
}

.brand span {
  font-family: var(--font-head);
  font-size: 1.7rem;
  font-weight: 800;
  margin-left: -2px;
}

.nav-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
}

.nav-links a {
  color: #ffffff;
  font-family: var(--font-head);
  font-size: .95rem;
  font-weight: 600;
}

.nav-links a:first-child {
  color: #06b6d4;
}

.download-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.download-btn {
  min-height: 40px;
  padding: 0 20px;
  border-radius: 100px 180px 0 100px;
  background: var(--purple);
  color: #ffffff;
  font-family: var(--font-head);
  font-weight: 800;
  white-space: nowrap;
}

.download-btn.secondary {
  background: transparent;
  border: 2px solid var(--purple);
}

.hero-section {
  position: relative;
  min-height: calc(100vh - 78px);
  padding: 30px 90px 72px;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
  align-items: center;
}

.left-content {
  position: relative;
  padding-top: 38px;
}

.hero-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #06b6d4;
  margin-bottom: 14px;
}

.recos-pill {
  position: absolute;
  top: 26px;
  left: 148px;
  min-width: 178px;
  height: 50px;
  border: 1.5px solid #06b6d4;
  border-radius: 36px 36px 0 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 0 22px;
}

.recos-pill strong {
  display: block;
  color: #06b6d4;
  font-size: .88rem;
  line-height: 1;
}

.recos-pill span {
  font-size: .65rem;
  color: #d1d5db;
}

.mini-avatars {
  display: flex;
  align-items: center;
}

.mini-avatar {
  width: 34px;
  height: 34px;
  margin-left: -8px;
  border-radius: 50%;
  background: var(--avatar-bg, #039be5);
  color: #ffffff;
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head);
  font-size: .68rem;
  font-weight: 800;
}

.mini-avatar:first-child {
  margin-left: 0;
}

h1 {
  font-family: var(--font-head);
  font-size: clamp(56px, 6vw, 86px);
  line-height: .98;
  font-weight: 800;
  margin: 0 0 10px;
  letter-spacing: 0;
}

.headline {
  font-size: 1.18rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.school {
  font-size: .78rem;
  color: #9ca3af;
}

.about-block {
  margin-top: 36px;
  max-width: 520px;
}

.about-block h2,
.section-block h2 {
  font-family: var(--font-head);
  font-size: 1.25rem;
  margin-bottom: 22px;
}

.about-block p {
  font-size: .9rem;
  line-height: 1.55;
  color: #ffffff;
}

.right-content {
  position: relative;
  min-height: 520px;
}

.profile-image {
  width: min(400px, 34vw);
  height: min(400px, 34vw);
  min-width: 300px;
  min-height: 300px;
  border-radius: 50%;
  background: repeating-conic-gradient(#e0e0e0 0% 25%, #f5f5f5 0% 50%) 0 0 / 32px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-family: var(--font-head);
  font-size: 4rem;
  font-weight: 800;
  overflow: hidden;
  margin: 34px auto 0;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.github-icon,
.social-icon {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #ffffff;
  color: #111827;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head);
  font-weight: 800;
  font-size: .75rem;
}

.github-icon {
  top: 0;
  left: 50%;
}

.social-icon.reddit {
  left: 12%;
  bottom: 150px;
}

.social-icon.discord {
  right: 6%;
  bottom: 142px;
}

.shape {
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
  background: rgba(90, 137, 237, .25);
  transform: rotate(-30deg);
}

.shape-one {
  width: 130px;
  height: 420px;
  left: -48px;
  bottom: -160px;
}

.shape-two {
  width: 150px;
  height: 430px;
  left: 120px;
  bottom: -205px;
}

.hero-section::after {
  content: "";
  position: absolute;
  left: 90px;
  right: 90px;
  bottom: 72px;
  height: 1px;
  background: rgba(255, 255, 255, .7);
}

.section-block {
  position: relative;
  z-index: 2;
  padding: 64px 90px;
  background: #111827;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.info-card {
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 8px;
  padding: 22px;
  background: rgba(255, 255, 255, .03);
}

.info-card h3 {
  font-family: var(--font-head);
  font-size: 1rem;
  margin-bottom: 10px;
}

.info-card p {
  font-size: .86rem;
  line-height: 1.5;
  color: #e5e7eb;
}

.info-card .muted {
  color: #9ca3af;
  margin-bottom: 8px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.tags span {
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--purple);
  color: white;
  font-size: .72rem;
  font-weight: 700;
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
  .portfolio-nav,
  .download-actions {
    display: none;
  }

  .portfolio-page {
    background: #ffffff;
    color: #111827;
  }

  .hero-section,
  .section-block {
    background: #ffffff;
    color: #111827;
    padding: 32px;
  }

  .about-block p,
  .info-card p,
  .headline {
    color: #111827;
  }

  .school,
  .info-card .muted {
    color: #555555;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .profile-image,
  .shape,
  .github-icon,
  .social-icon,
  .hero-section::after {
    display: none;
  }
}

@media (max-width: 980px) {
  .portfolio-nav {
    height: auto;
    grid-template-columns: 1fr;
    padding: 22px;
  }

  .nav-links {
    justify-content: flex-start;
    gap: 22px;
    overflow-x: auto;
  }

  .download-actions {
    flex-wrap: wrap;
  }

  .hero-section {
    padding: 32px 24px 70px;
  }

  .hero-content {
    grid-template-columns: 1fr;
  }

  .recos-pill {
    position: static;
    margin-bottom: 24px;
  }

  .right-content {
    min-height: auto;
  }

  .profile-image {
    width: 280px;
    height: 280px;
    min-width: 280px;
    min-height: 280px;
  }

  .section-block {
    padding: 42px 24px;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .hero-section::after {
    left: 24px;
    right: 24px;
  }
}
</style>