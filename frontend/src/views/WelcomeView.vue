<template>
  <main class="welcome-page">
    <div class="ambient ambient-one"></div>
    <div class="ambient ambient-two"></div>
    <div class="ambient ambient-three"></div>

    <header class="topbar">
      <RouterLink to="/" class="brand" aria-label="Accueil PheraCore">
        <img src="@/assets/PheraCoreLogo.svg" alt="" />
        <span>PheraCore</span>
      </RouterLink>

      <nav class="nav-links" aria-label="Navigation principale">
        <a href="#accueil">Accueil</a>
        <a href="#plateforme">Plateforme</a>
        <a href="#partenaires">Partenaires</a>
        <a href="#liens">Liens utiles</a>
      </nav>

      <RouterLink to="/login" class="login-link">Se connecter</RouterLink>
    </header>

    <section id="accueil" class="hero-section">
      <div class="hero-copy">
        <span class="hero-dot"></span>
        <p class="eyebrow">Portfolio academique et professionnel</p>
        <h1>La vitrine moderne des talents etudiants au Maroc.</h1>
        <p class="hero-text">
          PheraCore connecte les etudiants, les enseignants et les professionnels
          autour de portfolios fiables, de recommandations qualifiees et
          d'opportunites concretes.
        </p>

        <div class="hero-actions">
          <RouterLink to="/signup" class="primary-action">Commencer</RouterLink>
          <RouterLink to="/login" class="secondary-action">Inscription</RouterLink>
        </div>

        <div class="connect-list" aria-label="Types de profils connectes">
          <strong>Connecter entre :</strong>
          <span>Etudiant</span>
          <span>Professeur</span>
          <span>Professionnel</span>
        </div>
      </div>

      <div class="hero-visual">
        <div class="visual-pill pill-left"></div>
        <div class="visual-pill pill-center"></div>
        <div class="visual-pill pill-right"></div>

        <img
          v-for="photo in studentPhotos"
          :key="photo.alt"
          :src="photo.src"
          :alt="photo.alt"
          :class="['student-photo', photo.className]"
          loading="lazy"
        />

        <span class="spark spark-cyan"></span>
        <span class="spark spark-orange"></span>
        <span class="spark spark-green"></span>
      </div>
    </section>

    <section class="stats-section" aria-label="Chiffres cles">
      <article v-for="stat in stats" :key="stat.label" class="stat-card">
        <strong>{{ stat.value }}</strong>
        <span>{{ stat.label }}</span>
      </article>
    </section>

    <section id="plateforme" class="content-section platform-section">
      <div class="section-heading">
        <span>Details de la plateforme</span>
        <h2>Un espace clair pour valoriser les parcours.</h2>
        <p>
          La page d'accueil presente les benefices essentiels de la plateforme
          avec une lecture rapide, un style professionnel et des actions simples.
        </p>
      </div>

      <div class="feature-grid">
        <article v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-icon">{{ feature.icon }}</div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </article>
      </div>
    </section>

    <section id="partenaires" class="content-section partners-section">
      <div class="section-heading compact">
        <span>Partenaires marocains</span>
        <h2>Des acteurs nationaux mis en avant.</h2>
      </div>

      <div class="partners-grid">
        <a
          v-for="partner in partners"
          :key="partner.name"
          :href="partner.href"
          class="partner-logo"
          target="_blank"
          rel="noopener"
        >
          <span>{{ partner.logo }}</span>
          <small>{{ partner.name }}</small>
        </a>
      </div>
    </section>

    <section id="liens" class="content-section links-section">
      <div class="links-panel">
        <div>
          <span class="section-kicker">Liens utiles</span>
          <h2>Retrouvez PheraCore et sa communaute.</h2>
          <p>
            Tous les points d'entree essentiels sont regroupes ici : comptes
            officiels, espaces communaute et contact direct.
          </p>

          <div class="phone-card">
            <span>Telephone</span>
            <a href="tel:+212600000000">+212 600 000 000</a>
          </div>
        </div>

        <div class="links-grid">
          <article class="links-group">
            <h3>Nos comptes</h3>
            <a v-for="link in accountLinks" :key="link.label" :href="link.href" target="_blank" rel="noopener">
              {{ link.label }}
            </a>
            <a href="mailto:contact@pheracore.ma">contact@pheracore.ma</a>
          </article>

          <article class="links-group">
            <h3>Communaute</h3>
            <a v-for="link in communityLinks" :key="link.label" :href="link.href" target="_blank" rel="noopener">
              {{ link.label }}
            </a>
          </article>

          <article class="links-group">
            <h3>Acces rapides</h3>
            <RouterLink to="/signup">Creer un compte</RouterLink>
            <RouterLink to="/login">Se connecter</RouterLink>
            <RouterLink to="/explore">Explorer les profils</RouterLink>
          </article>
        </div>
      </div>
    </section>

    <footer class="welcome-footer">
      <div class="footer-brand">
        <img src="@/assets/PheraCoreLogo.svg" alt="" />
        <span>PheraCore</span>
      </div>

      <p>© {{ currentYear }} PheraCore. Tous droits reserves.</p>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

const currentYear = new Date().getFullYear();

const stats = [
  { value: "3", label: "profils connectes" },
  { value: "500+", label: "recommandations valorisees" },
  { value: "24/7", label: "portfolio consultable" },
];

const features = [
  {
    icon: "01",
    title: "Portfolio vivant",
    description:
      "Centralisez les projets, stages, certifications et competences dans une interface lisible et moderne.",
  },
  {
    icon: "02",
    title: "Recommandations fiables",
    description:
      "Donnez de la valeur au profil grace aux retours des professeurs, encadrants et professionnels.",
  },
  {
    icon: "03",
    title: "Passerelle entreprise",
    description:
      "Facilitez la rencontre entre les talents et les organisations qui recrutent ou accompagnent les jeunes profils.",
  },
];

const studentPhotos = [
  {
    alt: "Etudiante souriante tenant un cahier",
    className: "photo-top",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=420&q=85",
  },
  {
    alt: "Etudiante lisant avec ses camarades",
    className: "photo-left",
    src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=420&q=85",
  },
  {
    alt: "Etudiant souriant avec un livre",
    className: "photo-right",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=420&q=85",
  },
];

const partners = [
  { logo: "OCP", name: "OCP Group", href: "https://www.ocpgroup.ma" },
  { logo: "Maroc Telecom", name: "Maroc Telecom", href: "https://www.iam.ma" },
  { logo: "Attijariwafa bank", name: "Attijariwafa bank", href: "https://www.attijariwafabank.com" },
  { logo: "Royal Air Maroc", name: "Royal Air Maroc", href: "https://www.royalairmaroc.com" },
  { logo: "inwi", name: "Inwi", href: "https://www.inwi.ma" },
  { logo: "Bank of Africa", name: "Bank of Africa", href: "https://www.bankofafrica.ma" },
];

const accountLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com" },
  { label: "Instagram", href: "https://www.instagram.com" },
  { label: "GitHub", href: "https://github.com" },
];

const communityLinks = [
  { label: "Forum etudiants", href: "https://community.pheraCore.ma" },
  { label: "Espace professeurs", href: "https://community.pheraCore.ma/professeurs" },
  { label: "Club partenaires", href: "https://community.pheraCore.ma/partenaires" },
];
</script>

<style scoped>
.welcome-page {
  --bg: #0d1526;
  --bg-soft: #162340;
  --blue: #06b6d4;
  --purple: #5548f3;
  --purple-soft: #6c63ff;
  --orange: #e28b20;
  --green: #4e9a75;
  --text: #ffffff;
  --muted: #cbd5e1;
  --line: rgba(255, 255, 255, .13);

  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at 16% 12%, rgba(6, 182, 212, .08), transparent 28%),
    linear-gradient(135deg, #111c32 0%, var(--bg) 48%, #111827 100%);
  color: var(--text);
  font-family: var(--font-body), system-ui, sans-serif;
}

.topbar,
.hero-section,
.stats-section,
.content-section,
.welcome-footer {
  position: relative;
  z-index: 2;
}

.topbar {
  width: min(100%, 1180px);
  min-height: 76px;
  margin: 0 auto;
  padding: 18px 28px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 28px;
}

.brand,
.footer-brand {
  display: inline-flex;
  align-items: center;
  color: #ffffff;
  font-family: var(--font-head), system-ui, sans-serif;
  font-weight: 800;
  letter-spacing: 0;
}

.brand img,
.footer-brand img {
  width: 42px;
  height: 42px;
}

.brand span,
.footer-brand span {
  margin-left: -4px;
  font-size: 1.55rem;
}

.nav-links {
  display: flex;
  justify-content: center;
  gap: clamp(18px, 4vw, 42px);
}

.nav-links a {
  color: #ffffff;
  font-family: var(--font-head), system-ui, sans-serif;
  font-size: .94rem;
  font-weight: 700;
  transition: color .22s ease;
}

.nav-links a:hover,
.nav-links a:focus-visible {
  color: var(--blue);
  outline: none;
}

.login-link,
.primary-action,
.secondary-action {
  min-height: 42px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head), system-ui, sans-serif;
  font-weight: 800;
  transition: transform .22s ease, box-shadow .22s ease, background .22s ease;
}

.login-link {
  padding: 0 22px;
  color: #ffffff;
  background: var(--purple);
  box-shadow: 0 14px 28px rgba(85, 72, 243, .28);
}

.login-link:hover,
.primary-action:hover,
.secondary-action:hover {
  transform: translateY(-2px);
}

.hero-section {
  width: min(100%, 1180px);
  margin: 0 auto;
  min-height: calc(100vh - 76px);
  padding: 58px 28px 86px;
  display: grid;
  grid-template-columns: minmax(0, .95fr) minmax(380px, 1.05fr);
  align-items: center;
  gap: clamp(48px, 8vw, 96px);
}

.hero-copy {
  max-width: 590px;
}

.hero-dot {
  width: 12px;
  height: 12px;
  display: block;
  margin-bottom: 24px;
  border-radius: 50%;
  background: var(--blue);
  box-shadow: 0 0 0 8px rgba(6, 182, 212, .1);
}

.eyebrow,
.section-heading span,
.section-kicker {
  color: var(--blue);
  font-family: var(--font-head), system-ui, sans-serif;
  font-size: .82rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.hero-copy h1 {
  max-width: 620px;
  margin: 14px 0 24px;
  font-family: var(--font-head), Inter, sans-serif;
  font-size: clamp(52px, 6vw, 84px);
  font-weight: 800;
  line-height: .98;
  letter-spacing: 0;
  text-wrap: balance;
}

.hero-text {
  max-width: 520px;
  color: #edf3ff;
  font-size: 1.06rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin: 36px 0 74px;
}

.primary-action,
.secondary-action {
  min-width: 142px;
  padding: 0 24px;
  color: #ffffff;
}

.primary-action {
  background: var(--purple);
  box-shadow: 0 18px 34px rgba(85, 72, 243, .3);
}

.secondary-action {
  background: rgba(255, 255, 255, .22);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .1);
}

.connect-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 18px;
  color: #ffffff;
}

.connect-list strong {
  flex-basis: 100%;
  font-family: var(--font-head), system-ui, sans-serif;
  font-size: 1.05rem;
}

.connect-list span {
  font-size: .82rem;
  color: #eef2ff;
}

.hero-visual {
  position: relative;
  min-height: 590px;
}

.visual-pill {
  position: absolute;
  width: 112px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(90, 137, 237, .34), rgba(90, 137, 237, .18));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08);
  animation: pillarDrift 11s ease-in-out infinite;
}

.pill-left {
  left: 11%;
  top: 58px;
  height: 268px;
}

.pill-center {
  left: 42%;
  top: 232px;
  height: 266px;
  animation-name: pillarDriftReverse;
  animation-delay: -2.5s;
}

.pill-right {
  right: 11%;
  top: 58px;
  height: 268px;
  animation-delay: -4.5s;
}

.student-photo {
  position: absolute;
  z-index: 2;
  width: 112px;
  height: 210px;
  border-radius: 999px;
  object-fit: cover;
  display: block;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .1);
  box-shadow: 0 24px 50px rgba(0, 0, 0, .28);
  animation: photoFloat 10s ease-in-out infinite;
}

.photo-top {
  left: 29%;
  top: -34px;
  object-position: center top;
}

.photo-left {
  left: 11%;
  bottom: -12px;
  object-position: 44% center;
  animation-delay: -2.2s;
}

.photo-right {
  right: 11%;
  bottom: -12px;
  object-position: center;
  animation-delay: -4.4s;
}

.spark {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  animation: softBlink 5.5s ease-in-out infinite;
}

.spark-cyan {
  left: 4%;
  top: 20%;
  width: 13px;
  height: 13px;
  background: var(--blue);
}

.spark-orange {
  right: 10%;
  top: 7%;
  background: var(--orange);
  animation-delay: -1.6s;
}

.spark-green {
  right: 4%;
  bottom: 28%;
  background: var(--green);
  animation-delay: -3s;
}

.stats-section {
  width: min(1124px, calc(100% - 56px));
  margin: -34px auto 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card,
.feature-card,
.links-panel {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(255, 255, 255, .065);
  box-shadow: 0 20px 46px rgba(0, 0, 0, .16);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.stat-card {
  padding: 22px;
}

.stat-card strong {
  display: block;
  color: #ffffff;
  font-family: var(--font-head), system-ui, sans-serif;
  font-size: 1.8rem;
  margin-bottom: 4px;
}

.stat-card span {
  color: var(--muted);
}

.content-section {
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 108px 28px 0;
}

.section-heading {
  max-width: 720px;
  margin: 0 auto 34px;
  text-align: center;
}

.section-heading.compact {
  max-width: 560px;
}

.section-heading h2,
.links-panel h2 {
  margin: 12px 0 12px;
  font-family: var(--font-head), system-ui, sans-serif;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.12;
  letter-spacing: 0;
}

.section-heading p,
.links-panel p {
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.7;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.feature-card {
  padding: 26px;
  transition: transform .24s ease, border-color .24s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgba(6, 182, 212, .36);
}

.feature-icon {
  width: 46px;
  height: 46px;
  margin-bottom: 22px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: linear-gradient(135deg, var(--purple), #06b6d4);
  font-family: var(--font-head), system-ui, sans-serif;
  font-weight: 900;
}

.feature-card h3 {
  margin-bottom: 12px;
  font-family: var(--font-head), system-ui, sans-serif;
  font-size: 1.08rem;
}

.feature-card p {
  color: var(--muted);
  line-height: 1.65;
}

.partners-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 22px;
  align-items: center;
}

.partner-logo {
  min-height: 82px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  text-align: center;
  color: #ffffff;
  filter: drop-shadow(0 14px 22px rgba(0, 0, 0, .16));
  transition: transform .24s ease, opacity .24s ease;
}

.partner-logo:hover,
.partner-logo:focus-visible {
  transform: translateY(-4px);
  opacity: .92;
  outline: none;
}

.partner-logo span {
  font-family: var(--font-head), system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(1.04rem, 2vw, 1.55rem);
  line-height: 1;
  letter-spacing: 0;
}

.partner-logo small {
  color: rgba(226, 232, 240, .72);
  font-size: .74rem;
  font-weight: 700;
}

.links-section {
  padding-bottom: 84px;
}

.links-panel {
  padding: clamp(24px, 4vw, 42px);
  display: grid;
  grid-template-columns: .82fr 1.18fr;
  gap: 36px;
  align-items: start;
}

.phone-card {
  width: fit-content;
  margin-top: 26px;
  padding: 14px 18px;
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 8px;
  background: rgba(255, 255, 255, .065);
}

.phone-card span {
  display: block;
  color: var(--blue);
  font-size: .76rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.phone-card a {
  color: #ffffff;
  font-family: var(--font-head), system-ui, sans-serif;
  font-weight: 900;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.links-group {
  min-height: 190px;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 8px;
  background: rgba(255, 255, 255, .045);
  display: grid;
  align-content: start;
  gap: 12px;
}

.links-group h3 {
  color: #ffffff;
  font-family: var(--font-head), system-ui, sans-serif;
  font-size: 1rem;
  margin-bottom: 4px;
}

.links-group a {
  color: var(--muted);
  font-weight: 700;
  transition: color .2s ease, transform .2s ease;
}

.links-group a:hover,
.links-group a:focus-visible {
  color: var(--blue);
  transform: translateX(3px);
  outline: none;
}

.welcome-footer {
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 26px 28px 34px;
  border-top: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  color: var(--muted);
}

.footer-brand img {
  width: 34px;
  height: 34px;
}

.footer-brand span {
  font-size: 1.25rem;
}

.ambient {
  position: fixed;
  z-index: 0;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(8px);
  background: radial-gradient(circle, rgba(90, 137, 237, .28), rgba(6, 182, 212, .08) 48%, transparent 72%);
  animation: glowBlink 8.5s ease-in-out infinite;
}

.ambient-one {
  width: 460px;
  height: 460px;
  left: -170px;
  top: 80px;
}

.ambient-two {
  width: 560px;
  height: 560px;
  right: -210px;
  top: 260px;
  animation-delay: -2.6s;
}

.ambient-three {
  width: 420px;
  height: 420px;
  left: 22%;
  bottom: -230px;
  animation-delay: -5.2s;
}

@keyframes pillarDrift {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(30px);
  }
}

@keyframes pillarDriftReverse {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-28px);
  }
}

@keyframes photoFloat {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(18px);
  }
}

@keyframes softBlink {
  0%,
  100% {
    opacity: .5;
    transform: scale(.9);
  }

  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

@keyframes glowBlink {
  0%,
  100% {
    opacity: .18;
    transform: scale(.94);
  }

  50% {
    opacity: .48;
    transform: scale(1.04);
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

@media (max-width: 980px) {
  .topbar {
    grid-template-columns: 1fr auto;
  }

  .nav-links {
    grid-column: 1 / -1;
    order: 3;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 4px;
  }

  .hero-section {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-top: 36px;
  }

  .hero-visual {
    min-height: 510px;
    max-width: 620px;
    width: 100%;
    margin: 0 auto;
  }

  .stats-section,
  .feature-grid,
  .links-panel {
    grid-template-columns: 1fr;
  }

  .links-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .partners-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .topbar {
    padding: 16px 18px;
  }

  .brand img {
    width: 36px;
    height: 36px;
  }

  .brand span {
    font-size: 1.28rem;
  }

  .login-link {
    min-height: 38px;
    padding: 0 16px;
  }

  .hero-section,
  .content-section {
    padding-left: 18px;
    padding-right: 18px;
  }

  .hero-copy h1 {
    font-size: clamp(42px, 14vw, 58px);
  }

  .hero-actions {
    margin-bottom: 46px;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
  }

  .hero-visual {
    min-height: 390px;
  }

  .visual-pill {
    width: 76px;
  }

  .pill-left,
  .pill-right {
    height: 196px;
    top: 48px;
  }

  .pill-left,
  .photo-left {
    left: 5%;
  }

  .pill-right,
  .photo-right {
    right: 5%;
  }

  .pill-center {
    left: calc(50% - 38px);
    top: 170px;
    height: 178px;
  }

  .student-photo {
    width: 78px;
    height: 150px;
  }

  .photo-top {
    left: calc(50% - 39px);
    top: -18px;
  }

  .photo-left,
  .photo-right {
    bottom: 0;
  }

  .stats-section {
    width: calc(100% - 36px);
  }

  .links-grid,
  .partners-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .welcome-footer {
    flex-direction: column;
    align-items: flex-start;
    padding-inline: 18px;
  }
}
</style>
