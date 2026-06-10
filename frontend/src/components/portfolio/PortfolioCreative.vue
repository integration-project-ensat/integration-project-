<template>
    
      <!-- ABOUT -->
      <section
        id="about"
        class="portfolio-section hero-section"
        data-section-id="about"
      >
        <div class="hero-content">
          <div class="hero-meta">
            <div class="recos-pill">
              <span class="recos-count">{{ profile.recos }}</span>
              <span class="recos-label">recommandations</span>
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
          </div>

          <div class="hero-name-block">
            <h1>
              <span class="name-first">{{ profile.firstName }}</span>
              <span class="name-last">{{ profile.lastName }}</span>
            </h1>
            <div class="hero-divider"></div>
            <p class="hero-title">{{ profile.title }}</p>
            <p class="hero-school">{{ profile.school }}</p>
          </div>

          <div class="about-text">
            <p>{{ profile.bio }}</p>
          </div>

          <div class="hero-links">
            <a
              v-if="profile.github"
              class="hero-link"
              :href="profile.github"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </a>
            <a
              v-if="profile.linkedin"
              class="hero-link"
              :href="profile.linkedin"
              target="_blank"
              rel="noopener"
            >
              LinkedIn
            </a>
            <a
              v-if="profile.email"
              class="hero-link"
              :href="`mailto:${profile.email}`"
            >
              Email
            </a>
          </div>
        </div>

        <div class="hero-photo-col">
          <div class="profile-photo-wrap">
            <div class="profile-photo">
              <img v-if="profile.avatar" :src="profile.avatar" alt="Profile" />
              <span v-else>{{ profileInitials }}</span>
            </div>
            <div class="photo-accent"></div>
          </div>
        </div>
      </section>

      <!-- SKILLS -->
      <section id="skills" class="portfolio-section" data-section-id="skills">
        <div class="section-head">
          <span class="section-label">Compétences</span>
          <h2>Savoir-faire &amp; outils</h2>
        </div>

        <div v-if="skills.length" class="skills-grid">
          <article
            v-for="group in skills"
            :key="group.title"
            class="skill-group"
          >
            <h3>{{ group.title }}</h3>
            <div class="skill-list">
              <span v-for="skill in group.items" :key="skill">{{ skill }}</span>
            </div>
          </article>
        </div>
        <div v-else class="section-empty">
          Aucune compétence renseignée pour le moment.
        </div>
      </section>

      <!-- JOURNEY -->
      <section id="journey" class="portfolio-section" data-section-id="journey">
        <div class="section-head">
          <span class="section-label">Parcours</span>
          <h2>Formation académique</h2>
        </div>

        <div v-if="diplomas.length" class="timeline">
          <article
            v-for="diploma in diplomas"
            :key="`${diploma.title}-${diploma.period}`"
            class="timeline-card"
          >
            <span class="timeline-period">{{ diploma.period }}</span>
            <div class="timeline-body">
              <h3>{{ diploma.title }}</h3>
              <p class="timeline-school">{{ diploma.school }}</p>
              <p>{{ diploma.description }}</p>
            </div>
          </article>
        </div>
        <div v-else class="section-empty">
          Aucun diplôme renseigné pour le moment.
        </div>
      </section>

      <!-- PROJECTS -->
      <section
        id="projects"
        class="portfolio-section"
        data-section-id="projects"
      >
        <div class="section-head">
          <span class="section-label">Projets</span>
          <h2>Réalisations &amp; publications</h2>
        </div>

        <div v-if="projects.length" class="projects-grid">
          <article
            v-for="project in projects"
            :key="project.id"
            class="project-card"
          >
            <div class="project-header">
              <span class="project-icon">{{ project.icon }}</span>
              <span class="project-type">{{ project.type }}</span>
            </div>
            <h3>{{ project.title }}</h3>
            <p>{{ project.description }}</p>
            <div class="tags">
              <span v-for="tech in project.tech" :key="tech">{{ tech }}</span>
            </div>
            <div class="project-actions">
              <button type="button" @click="selectedProjectId = project.id">
                Voir les détails
              </button>
              <a
                v-if="project.github"
                :href="project.github"
                target="_blank"
                rel="noopener"
              >
                Code source
              </a>
            </div>
          </article>
        </div>
        <div v-else class="section-empty">
          Aucun projet valide pour le moment.
        </div>

        <article v-if="selectedProject" class="project-details">
          <div class="details-head">
            <div>
              <h3>{{ selectedProject.title }}</h3>
              <span class="project-type">{{ selectedProject.type }}</span>
            </div>
            <button type="button" class="close-btn" @click="selectedProjectId = null">
              ✕ Fermer
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

      <!-- EXPERIENCE -->
      <section
        id="experience"
        class="portfolio-section"
        data-section-id="experience"
      >
        <div class="section-head">
          <span class="section-label">Expérience</span>
          <h2>Stages &amp; missions</h2>
        </div>

        <div v-if="experiences.length" class="experience-list">
          <article
            v-for="experience in experiences"
            :key="`${experience.role}-${experience.company}`"
            class="experience-card"
          >
            <div class="experience-left">
              <strong class="experience-company">{{ experience.company }}</strong>
              <h3>{{ experience.role }}</h3>
              <p>{{ experience.description }}</p>
            </div>
            <div class="experience-meta">
              <span class="exp-period">{{ experience.period }}</span>
              <span>{{ experience.location }}</span>
              <span class="exp-mode">{{ experience.mode }}</span>
            </div>
          </article>
        </div>
        <div v-else class="section-empty">
          Aucune expérience validée pour le moment.
        </div>
      </section>

      <!-- CERTIFICATIONS -->
      <section
        id="certifications"
        class="portfolio-section"
        data-section-id="certifications"
      >
        <div class="section-head">
          <span class="section-label">Certifications</span>
          <h2>Attestations &amp; badges</h2>
        </div>

        <div v-if="sortedCertifications.length" class="certification-grid">
          <article
            v-for="certification in sortedCertifications"
            :key="certification.name"
            class="certification-card"
          >
            <div class="cert-body">
              <h3>{{ certification.name }}</h3>
              <p>{{ certification.organization }}</p>
              <span class="cert-date">{{ certification.date }}</span>
            </div>
            <a
              v-if="certification.link"
              :href="certification.link"
              target="_blank"
              rel="noopener"
              class="cert-link"
            >
              Voir →
            </a>
          </article>
        </div>
        <div v-else class="section-empty">
          Aucune certification reliée pour le moment.
        </div>
      </section>

      <!-- CONTACT -->
      <section id="contact" class="portfolio-section" data-section-id="contact">
        <div class="section-head">
          <span class="section-label">Contact</span>
          <h2>Prenons contact</h2>
        </div>

        <div class="contact-grid">
          <a
            v-if="profile.phone"
            :href="`tel:${profile.phone}`"
            class="contact-card"
          >
            <span class="contact-icon">📞</span>
            <span class="contact-label">Téléphone</span>
            <strong>{{ profile.phone }}</strong>
          </a>
          <a
            v-if="profile.email"
            :href="`mailto:${profile.email}`"
            class="contact-card"
          >
            <span class="contact-icon">✉️</span>
            <span class="contact-label">Email</span>
            <strong>{{ profile.email }}</strong>
          </a>
          <a
            v-if="profile.linkedin"
            :href="profile.linkedin"
            target="_blank"
            rel="noopener"
            class="contact-card"
          >
            <span class="contact-icon">💼</span>
            <span class="contact-label">LinkedIn</span>
            <strong>Profil LinkedIn</strong>
          </a>
          <a
            v-if="profile.github"
            :href="profile.github"
            target="_blank"
            rel="noopener"
            class="contact-card"
          >
            <span class="contact-icon">⌨️</span>
            <span class="contact-label">GitHub</span>
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
  const first = profile.value.firstName?.[0] || ""
  const last = profile.value.lastName?.[0] || ""
  return `${first}${last}`.toUpperCase() || "NP"
})

const selectedProjectId = ref<number | null>(null)
const selectedProject = computed<any>(() =>
  projects.value.find((p: any) => p.id === selectedProjectId.value) || null
)

const recosPreview = ref<Array<{ name: string }>>([])

const avatarColorClass = (name: string) => ""

const getInitials = (name: string) =>
  name?.split(" ").map((p) => p[0]).join("").toUpperCase() || ""
</script>

<style scoped>
/* ── Palette ── */
:root {
  --c-bg: #f7f6f3;
  --c-surface: #ffffff;
  --c-border: #e4e2db;
  --c-text: #1a1916;
  --c-muted: #6b6860;
  --c-accent: #5b3fd4;
  --c-accent-light: #ede9fb;
}

/* ── Layout ── */
.portfolio-section {
  width: min(1160px, 100%);
  margin: 0 auto;
  padding: 88px 32px;
}

/* ── Hero ── */
.hero-section {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 64px;
  align-items: center;
  min-height: calc(100vh - 72px);
  padding-top: 48px;
}

.hero-meta {
  margin-bottom: 32px;
}

.recos-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  font-size: 0.82rem;
  color: var(--c-muted);
}

.recos-count {
  font-weight: 700;
  color: var(--c-accent);
  font-size: 0.95rem;
}

.recos-avatars {
  display: flex;
}

.recos-avatar {
  width: 26px;
  height: 26px;
  margin-left: -6px;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  color: white;
  background: var(--c-accent);
}

.recos-avatar:first-child {
  margin-left: 0;
}

.hero-name-block {
  margin-bottom: 24px;
}

h1 {
  margin: 0 0 16px;
  line-height: 1;
  letter-spacing: -0.04em;
}

.name-first {
  display: block;
  font-size: clamp(48px, 6vw, 80px);
  font-weight: 300;
  color: var(--c-text);
}

.name-last {
  display: block;
  font-size: clamp(48px, 6vw, 80px);
  font-weight: 800;
  color: var(--c-text);
}

.hero-divider {
  width: 48px;
  height: 3px;
  background: var(--c-accent);
  border-radius: 2px;
  margin: 18px 0;
}

.hero-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--c-text);
  margin: 0 0 4px;
}

.hero-school {
  font-size: 0.9rem;
  color: var(--c-muted);
  margin: 0;
}

.about-text {
  max-width: 520px;
  margin-bottom: 32px;
}

.about-text p {
  color: var(--c-muted);
  line-height: 1.7;
  margin: 0;
}

.hero-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-link {
  display: inline-block;
  padding: 9px 20px;
  border-radius: 999px;
  border: 1.5px solid var(--c-border);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--c-text);
  text-decoration: none;
  background: var(--c-surface);
  transition: border-color 0.15s, background 0.15s;
}

.hero-link:hover {
  border-color: var(--c-accent);
  background: var(--c-accent-light);
  color: var(--c-accent);
}

/* ── Photo ── */
.hero-photo-col {
  display: flex;
  justify-content: center;
}

.profile-photo-wrap {
  position: relative;
  width: 340px;
  height: 340px;
}

.profile-photo {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  background: var(--c-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--c-muted);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.profile-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-accent {
  position: absolute;
  bottom: -12px;
  right: -12px;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  border: 2px solid var(--c-accent);
  z-index: 0;
}

/* ── Section head ── */
.section-head {
  margin-bottom: 48px;
}

.section-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--c-accent);
  margin-bottom: 8px;
}

.section-head h2 {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 800;
  color: var(--c-text);
  letter-spacing: -0.03em;
  margin: 0;
}

/* ── Skills ── */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.skill-group {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 24px;
}

.skill-group h3 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 16px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-list span {
  padding: 5px 12px;
  background: var(--c-accent-light);
  color: var(--c-accent);
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 500;
}

/* ── Timeline ── */
.timeline {
  display: grid;
  gap: 0;
  max-width: 760px;
}

.timeline-card {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 32px;
  padding: 28px 0;
  border-bottom: 1px solid var(--c-border);
}

.timeline-card:last-child {
  border-bottom: none;
}

.timeline-period {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--c-muted);
  padding-top: 4px;
  text-align: right;
}

.timeline-body h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 4px;
}

.timeline-school {
  font-size: 0.85rem;
  color: var(--c-accent);
  font-weight: 600;
  margin: 0 0 8px;
}

.timeline-body p:last-child {
  color: var(--c-muted);
  font-size: 0.9rem;
  margin: 0;
}

/* ── Projects ── */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.project-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: box-shadow 0.15s;
}

.project-card:hover {
  box-shadow: 0 8px 32px rgba(91, 63, 212, 0.08);
}

.project-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-icon {
  font-size: 1.6rem;
  line-height: 1;
}

.project-type {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
  background: var(--c-accent-light);
  padding: 3px 10px;
  border-radius: 999px;
}

.project-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0;
}

.project-card p {
  font-size: 0.87rem;
  color: var(--c-muted);
  line-height: 1.6;
  margin: 0;
  flex: 1;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tags span {
  font-size: 0.75rem;
  padding: 3px 10px;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 999px;
  color: var(--c-muted);
}

.project-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.project-actions button,
.project-actions a {
  flex: 1;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.12s;
}

.project-actions button {
  background: var(--c-accent);
  color: white;
  border: none;
}

.project-actions button:hover {
  background: #4a31b8;
}

.project-actions a {
  background: transparent;
  color: var(--c-text);
  border: 1.5px solid var(--c-border);
}

.project-actions a:hover {
  border-color: var(--c-accent);
  color: var(--c-accent);
}

/* ── Project details ── */
.project-details {
  margin-top: 32px;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 20px;
  padding: 32px;
}

.details-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.details-head h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 6px;
}

.close-btn {
  padding: 7px 16px;
  border-radius: 999px;
  border: 1.5px solid var(--c-border);
  background: transparent;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--c-muted);
  cursor: pointer;
  white-space: nowrap;
}

.close-btn:hover {
  border-color: var(--c-text);
  color: var(--c-text);
}

.details-media {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.media-placeholder {
  height: 180px;
  border-radius: 12px;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  overflow: hidden;
}

.media-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── Experience ── */
.experience-list {
  display: grid;
  gap: 16px;
  max-width: 900px;
}

.experience-card {
  display: grid;
  grid-template-columns: 1fr 180px;
  gap: 24px;
  align-items: start;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 24px 28px;
}

.experience-company {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
  margin-bottom: 4px;
  display: block;
}

.experience-left h3 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 8px;
}

.experience-left p {
  color: var(--c-muted);
  font-size: 0.87rem;
  margin: 0;
  line-height: 1.6;
}

.experience-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: right;
  font-size: 0.82rem;
  color: var(--c-muted);
}

.exp-period {
  font-weight: 700;
  color: var(--c-text);
}

.exp-mode {
  display: inline-block;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  align-self: flex-end;
}

/* ── Certifications ── */
.certification-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.certification-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
}

.certification-card h3 {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--c-text);
  margin: 0 0 4px;
}

.certification-card p {
  color: var(--c-muted);
  font-size: 0.82rem;
  margin: 0;
}

.cert-date {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--c-accent);
  display: block;
  margin-top: 6px;
}

.cert-link {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--c-accent);
  text-decoration: none;
  align-self: flex-start;
}

.cert-link:hover {
  text-decoration: underline;
}

/* ── Contact ── */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.contact-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 24px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.contact-card:hover {
  border-color: var(--c-accent);
  box-shadow: 0 4px 20px rgba(91, 63, 212, 0.08);
}

.contact-icon {
  font-size: 1.4rem;
}

.contact-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-muted);
}

.contact-card strong {
  font-size: 0.88rem;
  color: var(--c-text);
  word-break: break-all;
}

/* ── Misc ── */
.section-empty {
  color: var(--c-muted);
  font-size: 0.9rem;
  padding: 32px 0;
}

/* ── Responsive ── */
@media (max-width: 1080px) {
  .hero-section {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .hero-photo-col {
    display: none;
  }

  .skills-grid,
  .projects-grid,
  .certification-grid {
    grid-template-columns: 1fr 1fr;
  }

  .contact-grid {
    grid-template-columns: 1fr 1fr;
  }

  .experience-card {
    grid-template-columns: 1fr;
  }

  .experience-meta {
    text-align: left;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .exp-mode {
    align-self: auto;
  }
}

@media (max-width: 640px) {
  .portfolio-section {
    padding: 56px 20px;
  }

  .skills-grid,
  .projects-grid,
  .certification-grid,
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .timeline-card {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .timeline-period {
    text-align: left;
  }

  .details-media {
    grid-template-columns: 1fr;
  }
}

/* ── Avatar color classes (kept from original) ── */
.avatar-blue { background: #039be5; }
.avatar-orange { background: #f57c00; }
.avatar-indigo { background: #5e6ad2; }
.avatar-green { background: #43a047; }
.avatar-deep-blue { background: #0277bd; }
.avatar-brown { background: #8d6e63; }
.avatar-purple { background: #5e35b1; }
.avatar-slate { background: #5c6bc0; }
</style>