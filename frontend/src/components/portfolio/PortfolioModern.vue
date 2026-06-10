<template>
    
      <section
        id="about"
        class="portfolio-section hero-section"
        data-section-id="about"
      >
        <div class="hero-left">
          <div class="recos-pill">
            <div>
              <strong>{{ profile.recos }}</strong>
              <span>Total recos</span>
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
            v-if="profile.github"
            class="floating-icon github"
            :href="profile.github"
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
          >
            GH
          </a>

          <div class="profile-photo">
            <img v-if="profile.avatar" :src="profile.avatar" alt="Profile" />
            <span v-else>{{ profileInitials }}</span>
          </div>

          <a
            v-if="profile.linkedin"
            class="floating-icon linkedin"
            :href="profile.linkedin"
            target="_blank"
            rel="noopener"
            aria-label="LinkedIn"
          >
            in
          </a>

          <a
            v-if="profile.email"
            class="floating-icon mail"
            :href="`mailto:${profile.email}`"
            aria-label="Email"
          >
            @
          </a>
        </div>
      </section>

      <section id="skills" class="portfolio-section" data-section-id="skills">
        <div class="section-head">
          <h2>Compétences</h2>
          <p>Compétences techniques et comportementales liées au profil.</p>
        </div>

        <div v-if="skills.length" class="skills-grid">
          <article
            v-for="group in skills"
            :key="group.title"
            class="portfolio-card"
          >
            <h3>{{ group.title }}</h3>
            <div class="skill-list">
              <span v-for="skill in group.items" :key="skill">{{ skill }}</span>
            </div>
          </article>
        </div>
        <div v-else class="section-empty">
          Aucune competence renseignee pour le moment.
        </div>
      </section>

      <section id="journey" class="portfolio-section" data-section-id="journey">
        <div class="section-head">
          <h2>Parcours</h2>
          <p>Diplômes et étapes académiques récupérés du backend.</p>
        </div>

        <div v-if="diplomas.length" class="timeline">
          <article
            v-for="diploma in diplomas"
            :key="`${diploma.title}-${diploma.period}`"
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
        <div v-else class="section-empty">
          Aucun diplome renseigne pour le moment.
        </div>
      </section>

      <section
        id="projects"
        class="portfolio-section"
        data-section-id="projects"
      >
        <div class="section-head">
          <h2>Projets</h2>
          <p>Publications et projets de l’étudiant reliés au backend.</p>
        </div>

        <div v-if="projects.length" class="projects-grid">
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
              <span v-for="tech in project.tech" :key="tech">{{ tech }}</span>
            </div>

            <div class="project-actions">
              <button type="button" @click="selectedProjectId = project.id">
                Détails
              </button>
              <a
                v-if="project.github"
                :href="project.github"
                target="_blank"
                rel="noopener"
                >Code</a
              >
            </div>
          </article>
        </div>
        <div v-else class="section-empty">
          Aucun projet valide pour le moment.
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
              v-for="(image, index) in selectedProject.images"
              :key="`${selectedProject.id}-${index}`"
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
          <p>Stages et expériences professionnelles liés au parcours.</p>
        </div>

        <div v-if="experiences.length" class="experience-list">
          <article
            v-for="experience in experiences"
            :key="`${experience.role}-${experience.company}`"
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
        <div v-else class="section-empty">
          Aucune experience validee pour le moment.
        </div>
      </section>

      <section
        id="certifications"
        class="portfolio-section"
        data-section-id="certifications"
      >
        <div class="section-head">
          <h2>Certifications</h2>
          <p>
            Attestations et certifications validées récupérées depuis le
            backend.
          </p>
        </div>

        <div v-if="sortedCertifications.length" class="certification-grid">
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

            <a
              v-if="certification.link"
              :href="certification.link"
              target="_blank"
              rel="noopener"
              >Voir</a
            >
          </article>
        </div>
        <div v-else class="page-state">
          Aucune certification reliée pour le moment.
        </div>
      </section>

      <section id="contact" class="portfolio-section" data-section-id="contact">
        <div class="section-head">
          <h2>Contact</h2>
          <p>Coordonnées du profil.</p>
        </div>

        <div class="contact-grid">
          <a
            v-if="profile.phone"
            :href="`tel:${profile.phone}`"
            class="contact-card"
          >
            <span>Téléphone</span>
            <strong>{{ profile.phone }}</strong>
          </a>
          <a
            v-if="profile.email"
            :href="`mailto:${profile.email}`"
            class="contact-card"
          >
            <span>Email</span>
            <strong>{{ profile.email }}</strong>
          </a>
          <a
            v-if="profile.linkedin"
            :href="profile.linkedin"
            target="_blank"
            rel="noopener"
            class="contact-card"
          >
            <span>LinkedIn</span>
            <strong>Profil LinkedIn</strong>
          </a>
          <a
            v-if="profile.github"
            :href="profile.github"
            target="_blank"
            rel="noopener"
            class="contact-card"
          >
            <span>GitHub</span>
            <strong>Dépôts GitHub</strong>
          </a>
        </div>
      </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    profile: any
    skills: any[]
    diplomas: any[]
    projects: any[]
    experiences: any[]
    sortedCertifications: any[]
  }>(),
  {
    profile: () => ({}),
    skills: () => [],
    diplomas: () => [],
    projects: () => [],
    experiences: () => [],
    sortedCertifications: () => []
  }
)

const profile = computed(() => props.profile)
const skills = computed(() => props.skills)
const diplomas = computed(() => props.diplomas)
const projects = computed(() => props.projects)
const experiences = computed(() => props.experiences)
const sortedCertifications = computed(() => props.sortedCertifications)
const profileInitials = computed(() => {
  const first = profile.value.firstName?.[0] || "";
  const last = profile.value.lastName?.[0] || "";
  return `${first}${last}`.toUpperCase() || "NP";
});
const selectedProject = computed<any>(() => {
  return projects.value.find(
    (project: any) => project.id === selectedProjectId.value
  ) || null
})
const selectedProjectId = ref<number | null>(null);
const recosPreview = computed(() => {
  return (profile.value?.recommendations || []).slice(0, 3).map((r: any) => ({
    name: r.author || 'User'
  }))
})
const avatarClasses = [
  'avatar-blue',
  'avatar-orange',
  'avatar-indigo',
  'avatar-green',
  'avatar-deep-blue',
  'avatar-brown',
  'avatar-purple',
  'avatar-slate'
]

const avatarColorClass = (name: string) => {
  const index =
    name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) %
    avatarClasses.length

  return avatarClasses[index]
}
const getInitials = (name: string) => {
  return name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "";
};

</script>
<style scoped>
.portfolio-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0b1220 0%, #121b30 48%, #1f315c 100%);
  color: #f8fafc;
}

.portfolio-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 18px;
  padding: 14px 24px;
  background: rgba(9, 15, 28, 0.86);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.brand {
  display: flex;
  align-items: center;
  color: white;
  text-decoration: none;
}

.brand img {
  width: 40px;
  height: 40px;
}

.brand span {
  margin-left: -3px;
  font-size: 1.7rem;
  font-weight: 800;
}

.nav-links {
  display: flex;
  gap: 6px;
  justify-content: center;
  overflow-x: auto;
}

.nav-links button,
.download-btn,
.project-actions button,
.project-actions a,
.details-head button {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: white;
  padding: 10px 16px;
  font-weight: 700;
}

.nav-links button.active,
.download-btn {
  background: #5b3fd4;
}

.download-actions {
  display: flex;
  gap: 10px;
}

.download-btn.ghost {
  background: rgba(255, 255, 255, 0.06);
}

.portfolio-section {
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: 72px 24px;
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
  gap: 48px;
  align-items: center;
  min-height: calc(100vh - 80px);
}

.hero-left {
  max-width: 620px;
}

.recos-pill {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  border: 1px solid rgba(22, 199, 238, 0.7);
  border-radius: 999px;
  background: rgba(8, 17, 34, 0.58);
  margin-bottom: 24px;
}

.recos-pill strong {
  display: block;
  color: #16c7ee;
}

.recos-pill span {
  font-size: 0.75rem;
  color: #aab7c8;
}

.recos-avatars {
  display: flex;
}

.recos-avatar {
  width: 34px;
  height: 34px;
  margin-left: -8px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 800;
  color: white;
}

.recos-avatar:first-child {
  margin-left: 0;
}

h1 {
  margin: 0 0 12px;
  font-size: clamp(52px, 7vw, 84px);
  line-height: 0.98;
}

.hero-title {
  font-size: 1.2rem;
  font-weight: 700;
}

.hero-school,
.section-head p,
.about-text p,
.timeline-card p,
.experience-card p,
.portfolio-card p {
  color: #dce6f5;
}

.about-text {
  margin-top: 36px;
  padding-left: 18px;
  border-left: 2px solid rgba(22, 199, 238, 0.38);
}

.hero-right {
  position: relative;
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-photo {
  width: min(380px, 70vw);
  height: min(380px, 70vw);
  border-radius: 50%;
  border: 10px solid rgba(255, 255, 255, 0.86);
  background: repeating-conic-gradient(#e4e7eb 0% 25%, #f8fafc 0% 50%) 0 0 /
    32px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 4rem;
  font-weight: 800;
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
  background: rgba(255, 255, 255, 0.96);
  color: #08111f;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-weight: 800;
}

.github {
  top: 40px;
  left: 24px;
}

.linkedin {
  left: 10px;
  bottom: 100px;
}

.mail {
  right: 10px;
  bottom: 110px;
}

.section-head {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 32px;
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
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 14px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.045)
  );
  box-shadow: 0 20px 46px rgba(0, 0, 0, 0.16);
}

.portfolio-card,
.contact-card,
.project-details {
  padding: 22px;
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
  background: rgba(91, 140, 255, 0.16);
  border: 1px solid rgba(91, 140, 255, 0.26);
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
  gap: 18px;
}

.timeline-card {
  grid-template-columns: 16px 1fr auto;
}

.experience-card {
  grid-template-columns: 1fr auto;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  margin-top: 6px;
  border-radius: 50%;
  background: #16c7ee;
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.project-top {
  display: flex;
  gap: 12px;
  align-items: center;
}

.project-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(22, 199, 238, 0.12);
  font-size: 1.45rem;
}

.project-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.project-actions a {
  text-decoration: none;
}

.details-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.details-media {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 18px;
}

.media-placeholder {
  height: 180px;
  border-radius: 12px;
  background: repeating-conic-gradient(#e1e5ea 0% 25%, #f8fafc 0% 50%) 0 0 /
    24px 24px;
  overflow: hidden;
}

.media-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.experience-meta {
  display: grid;
  gap: 8px;
  color: #d1d5db;
  text-align: right;
}

.contact-card {
  color: white;
  text-decoration: none;
}

.contact-card span {
  display: block;
  color: #16c7ee;
  margin-bottom: 8px;
}

.page-state {
  width: min(1240px, 100%);
  margin: 0 auto;
  padding: 40px 24px;
  color: #dce6f5;
  text-align: center;
}

.page-state--error {
  color: #fca5a5;
}

.avatar-blue {
  background: #039be5;
}
.avatar-orange {
  background: #f57c00;
}
.avatar-indigo {
  background: #5e6ad2;
}
.avatar-green {
  background: #43a047;
}
.avatar-deep-blue {
  background: #0277bd;
}
.avatar-brown {
  background: #8d6e63;
}
.avatar-purple {
  background: #5e35b1;
}
.avatar-slate {
  background: #5c6bc0;
}

@media (max-width: 1100px) {
  .portfolio-header {
    grid-template-columns: 1fr;
  }

  .nav-links {
    justify-content: flex-start;
  }

  .hero-section {
    grid-template-columns: 1fr;
    min-height: auto;
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
}

@media (max-width: 760px) {
  .portfolio-section {
    padding: 56px 18px;
  }

  .download-actions {
    flex-direction: column;
  }
}
.template-selector {
  padding: 50px;
  text-align: center;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.template-card {
  background: white;
  color: black;
  border-radius: 12px;
  padding: 20px;
}

.template-card button {
  margin-top: 15px;
  padding: 10px 20px;
  cursor: pointer;
}
</style>