<script setup lang="ts">
import { RouterLink } from "vue-router";

const menuItems = [
  { label: "Dashboard", icon: "tune", to: "/dashboard" },
  { label: "Explorer", icon: "explore", to: "/explore", active: true },
  { label: "Projets", icon: "projects", to: "/projects" },
  { label: "Stages", icon: "stages", to: "/stages" },
  { label: "Certifications", icon: "certif", to: "/certifications" },
  { label: "Activites", icon: "activity", to: "/activities" },
  { label: "My Portfolio", icon: "portfolio", to: "/portfolio" },
  { label: "GitHub", icon: "github", to: "/github" },
  { label: "Mes Recos", icon: "medal", to: "/recommendations" },
  { label: "Commentaires", icon: "comment", to: "/comments" },
  { label: "Parametres", icon: "settings", to: "/settings", groupTop: true },
  { label: "Deconnexion", icon: "logout", to: "/login" },
];
</script>

<template>
  <aside class="sb-shell">
    <RouterLink to="/portfolio" class="sb-profileLink" aria-label="Open profile">
      <div class="sb-profile">
        <div class="sb-avatar" aria-hidden="true"></div>
        <div class="sb-profileText">
          <p class="sb-name">Nom Prenom</p>
          <p class="sb-email">Exemple.exemple@univ.etu.ac.ma</p>
        </div>
      </div>
    </RouterLink>

    <nav class="sb-nav" aria-label="Explore sidebar">
      <template v-for="item in menuItems" :key="item.label">
        <div v-if="item.groupTop" class="sb-divider" aria-hidden="true"></div>
        <RouterLink
          :to="item.to"
          class="sb-item"
          :class="{ 'sb-itemActive': item.active }"
        >
          <svg
            class="sb-icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
          <!-- Dashboard (tune / sliders) -->
          <template v-if="item.icon === 'tune'">
            <path
              d="M6 7h12M6 12h12M6 17h12"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            />
            <path
              d="M9 7a1.8 1.8 0 1 0-3.6 0A1.8 1.8 0 0 0 9 7Zm9 5a1.8 1.8 0 1 0-3.6 0A1.8 1.8 0 0 0 18 12Zm-6 5a1.8 1.8 0 1 0-3.6 0A1.8 1.8 0 0 0 12 17Z"
              stroke="currentColor"
              stroke-width="2.4"
            />
          </template>

          <!-- Explorer (compass in circle) -->
          <template v-else-if="item.icon === 'explore'">
            <path
              d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18Z"
              stroke="currentColor"
              stroke-width="2.4"
            />
            <path
              d="M15.2 8.8 13.2 13.2 8.8 15.2 10.8 10.8 15.2 8.8Z"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linejoin="round"
            />
            <path
              d="M12 12h.01"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
            />
          </template>

          <!-- Projets (document) -->
          <template v-else-if="item.icon === 'projects'">
            <path
              d="M7 3h8l3 3v15H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linejoin="round"
            />
            <path
              d="M15 3v4h4"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linejoin="round"
            />
            <path
              d="M9 12h8M9 16h8"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            />
          </template>

          <!-- Stages (briefcase) -->
          <template v-else-if="item.icon === 'stages'">
            <path
              d="M9 7V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            />
            <path
              d="M4 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Z"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linejoin="round"
            />
            <path
              d="M4 13h16"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            />
          </template>

          <!-- Certifications (award / burst) -->
          <template v-else-if="item.icon === 'certif'">
            <path
              d="M12 4.5 13 7l2.5 1-2.5 1L12 11.5 11 9 8.5 8 11 7l1-2.5Z"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linejoin="round"
            />
            <path
              d="M9 14v7l3-2 3 2v-7"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linejoin="round"
            />
          </template>

          <!-- Activites (calendar) -->
          <template v-else-if="item.icon === 'activity'">
            <path
              d="M7 3v3M17 3v3"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            />
            <path
              d="M5 6h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linejoin="round"
            />
            <path
              d="M3 10h18"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
            />
            <path
              d="M8 15l2 2 4-5"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </template>

          <!-- My Portfolio (grid) -->
          <template v-else-if="item.icon === 'portfolio'">
            <path
              d="M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linejoin="round"
            />
            <path
              d="M7.5 9.5h4v4h-4v-4Zm6 0h3v1.5h-3V9.5Zm0 3h3V14h-3v-1.5ZM7.5 15.5h9"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linejoin="round"
              stroke-linecap="round"
            />
          </template>

          <!-- GitHub (octocat-ish mark) -->
          <template v-else-if="item.icon === 'github'">
            <path
              d="M12 3a9 9 0 0 0-2.8 17.6c.4.1.6-.2.6-.4v-1.4c-2.5.6-3-1.1-3-1.1-.4-1-.9-1.3-.9-1.3-.7-.5 0-.5 0-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7.1-.5.3-.9.5-1.1-2-.2-4.1-1-4.1-4.6 0-1 .4-1.9 1-2.6-.1-.2-.4-1 .1-2.2 0 0 .8-.3 2.6 1a9 9 0 0 1 4.8 0c1.8-1.3 2.6-1 2.6-1 .5 1.2.2 2 .1 2.2.6.7 1 1.6 1 2.6 0 3.6-2.1 4.4-4.1 4.6.3.3.6.8.6 1.6v2.3c0 .2.2.5.6.4A9 9 0 0 0 12 3Z"
              stroke="currentColor"
              stroke-width="2.1"
              stroke-linejoin="round"
            />
          </template>

          <!-- Mes Recos (ribbon/medal) -->
          <template v-else-if="item.icon === 'medal'">
            <path
              d="M12 14a5 5 0 1 0 0-10a5 5 0 0 0 0 10Z"
              stroke="currentColor"
              stroke-width="2.4"
            />
            <path
              d="M9.5 13.5 8 21l4-2 4 2-1.5-7.5"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linejoin="round"
            />
          </template>

          <!-- Commentaires (chat bubble) -->
          <template v-else-if="item.icon === 'comment'">
            <path
              d="M5 6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H11l-4.5 3V16H8a3 3 0 0 1-3-3V6Z"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linejoin="round"
            />
          </template>

          <!-- Parametres (gear) -->
          <template v-else-if="item.icon === 'settings'">
            <path
              d="M12 15.5a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7Z"
              stroke="currentColor"
              stroke-width="2.4"
            />
            <path
              d="M19.4 13a7.8 7.8 0 0 0 .1-2l2-1.2-2-3.4-2.3.6a7.3 7.3 0 0 0-1.7-1l-.3-2.4H11l-.3 2.4a7.3 7.3 0 0 0-1.7 1L6.7 6.4l-2 3.4L6.7 11a7.8 7.8 0 0 0 .1 2l-2 1.2 2 3.4 2.3-.6c.5.4 1.1.7 1.7 1l.3 2.4h4.1l.3-2.4c.6-.3 1.2-.6 1.7-1l2.3.6 2-3.4-2-1.2Z"
              stroke="currentColor"
              stroke-width="2.1"
              stroke-linejoin="round"
            />
          </template>

          <!-- Deconnexion (logout) -->
          <template v-else-if="item.icon === 'logout'">
            <path
              d="M10 7V6a2 2 0 0 1 2-2h7v16h-7a2 2 0 0 1-2-2v-1"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linejoin="round"
            />
            <path
              d="M11 12H3m0 0 3-3M3 12l3 3"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </template>
          </svg>
          <span class="sb-label">{{ item.label }}</span>
        </RouterLink>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
.sb-profileLink {
  display: block;
  text-decoration: none;
  color: inherit;
}

.sb-profileLink:focus-visible {
  outline: none;
}

.sb-shell {
  height: 100%;
  width: 260px;
  background: #ffffff;
  border-right: 1px solid rgb(226 232 240);
  border-radius: 0;
  box-shadow: none;
  padding: 18px 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sb-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px 12px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  margin-bottom: 10px;
  border-radius: 12px;
  transition: background 0.12s ease;
}

.sb-profileLink:hover .sb-profile {
  background: rgba(148, 163, 184, 0.12);
}

.sb-profileLink:focus-visible .sb-profile {
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.25);
}

.sb-avatar {
  height: 44px;
  width: 44px;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.25);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.sb-name {
  font-size: 13px;
  font-weight: 900;
  color: rgb(2 6 23);
  line-height: 1.1;
}

.sb-email {
  margin-top: 2px;
  font-size: 10px;
  font-weight: 700;
  color: rgb(100 116 139);
}

.sb-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 6px 6px;
  overflow-y: auto;
  flex: 1;
}

.sb-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 12px;
  border-radius: 10px;
  color: rgb(2 6 23);
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
  transition: background 0.12s ease;
}

.sb-item:hover {
  background: rgba(148, 163, 184, 0.14);
}

.sb-itemActive {
  background: #d8d7ff;
  color: rgb(2 6 23);
}

.sb-itemActive::before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 4px;
  border-radius: 9999px;
  background: #6c5ce7;
}

.sb-icon {
  height: 20px;
  width: 20px;
  color: #000;
  opacity: 1;
  flex: none;
}

.sb-label {
  line-height: 1;
}

.sb-divider {
  height: 1px;
  background: rgba(148, 163, 184, 0.45);
  margin: 6px 10px 2px;
}

.sb-nav::-webkit-scrollbar {
  width: 8px;
}

.sb-nav::-webkit-scrollbar-track {
  background: rgba(2, 6, 23, 0.04);
  border-radius: 9999px;
}

.sb-nav::-webkit-scrollbar-thumb {
  background: rgba(2, 6, 23, 0.16);
  border-radius: 9999px;
}

.sb-nav {
  scrollbar-width: thin;
  scrollbar-color: rgba(2, 6, 23, 0.2) rgba(2, 6, 23, 0.05);
}
</style>
