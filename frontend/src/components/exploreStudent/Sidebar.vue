<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <component
      :is="forceNavigation ? 'a' : RouterLink"
      :to="forceNavigation ? undefined : '/profile'"
      :href="forceNavigation ? '/profile' : undefined"
      class="sidebar-user"
      @click="handleNavigation('/profile', $event)"
    >
      <div class="avatar-sm">
        <img v-if="auth.user?.avatar" :src="auth.user.avatar" alt="avatar" />
        <span v-else>{{ initials }}</span>
      </div>
      <div class="user-info">
        <p class="user-name">{{ userName }}</p>
        <p class="user-email">{{ userEmail }}</p>
      </div>
    </component>

    <nav class="sidebar-nav">
      <component
        v-for="item in navItems"
        :key="item.path"
        :is="forceNavigation ? 'a' : RouterLink"
        :to="forceNavigation ? undefined : item.path"
        :href="forceNavigation ? item.path : undefined"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click="handleNavigation(item.path, $event)"
      >
        <span
          class="nav-icon"
          v-html="isActive(item.path) && item.activeIcon ? item.activeIcon : item.icon"
        />
        <span>{{ item.label }}</span>
      </component>
    </nav>

    <div class="sidebar-bottom">
      <component
        :is="forceNavigation ? 'a' : RouterLink"
        :to="forceNavigation ? undefined : '/student/settings'"
        :href="forceNavigation ? '/student/settings' : undefined"
        class="nav-item"
        @click="handleNavigation('/student/settings', $event)"
      >
        <span class="nav-icon" v-html="icons.settings" />
        <span>Paramètres</span>
      </component>
      <a href="/login" class="nav-item logout" @click="handleLogout">
        <span class="nav-icon" v-html="icons.logout" />
        <span>Déconnexion</span>
      </a>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth.js";
import authService from "@/services/auth.service.js";

const props = withDefaults(
  defineProps<{
    isOpen?: boolean;
    forceNavigation?: boolean;
  }>(),
  { isOpen: true, forceNavigation: false },
);

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const userName = computed(() => {
  const user = auth.user
  const fullName = user?.name || [user?.prenom, user?.nom].filter(Boolean).join(' ').trim()
  return fullName || 'Étudiant'
})

const userEmail = computed(() => auth.user?.email || '')

const initials = computed(() => {
  const words = userName.value.split(/\s+/).filter(Boolean)
  const letters = words.length > 1
    ? [words[0], words[words.length - 1]]
    : [words[0]]

  return letters
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2) || 'E'
})

function normalizedPath(path: string) {
  return path.split("?")[0];
}

function isActive(path: string) {
  const currentPath = normalizedPath(route.path);
  const targetPath = normalizedPath(path);

  if (targetPath === "/student/explore") {
    return currentPath === "/student/explore" || currentPath === "/explore";
  }

  return currentPath === targetPath;
}

function handleNavigation(path: string, event?: Event) {
  if (!props.forceNavigation) return;
  event?.preventDefault();
  window.location.assign(path);
}

async function handleLogout(event: Event) {
  event.preventDefault();
  await authService.logout();
  auth.logout();
  if (props.forceNavigation) {
    window.location.assign("/login");
    return;
  }
  router.push("/login");
}

const icons = {
  dashboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  dashboardFill: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`,

  explore: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  exploreFill: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10.8 3a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6Z"/><path d="M16.5 16.5a1.2 1.2 0 0 1 1.7 0l3.1 3.1a1.2 1.2 0 1 1-1.7 1.7l-3.1-3.1a1.2 1.2 0 0 1 0-1.7Z"/></svg>`,

  feed: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/></svg>`,
  feedFill: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="5" width="16" height="2" rx="1"/><rect x="4" y="11" width="16" height="2" rx="1"/><rect x="4" y="17" width="10" height="2" rx="1"/></svg>`,

  connexions: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11h-6"/><path d="M19 8v6"/></svg>`,
  connexionsFill: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0H2Zm18-6h-6a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2Zm-3-3a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1Z"/></svg>`,

  ai: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v1H8a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h1v1a3 3 0 0 0 6 0v-1h1a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-1V5a3 3 0 0 0-3-3z"/><circle cx="10" cy="11" r="1"/><circle cx="14" cy="11" r="1"/><path d="M9 15c1 .8 5 .8 6 0"/></svg>`,
  aiFill: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a3 3 0 0 0-3 3v1H8a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h1v1a3 3 0 0 0 6 0v-1h1a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-1V5a3 3 0 0 0-3-3z"/></svg>`,

  projets: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  projetsFill: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2 6a3 3 0 0 1 3-3h4.2a2 2 0 0 1 1.6.8L12.5 6H19a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6Z"/></svg>`,

  stages: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`,
  stagesFill: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3h6a3 3 0 0 1 3 3v1h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h1V6a3 3 0 0 1 3-3Zm1 4h4V6h-4v1Z"/></svg>`,

  certifications: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  certificationsFill: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,

  activites: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  activitesFill: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2a1.2 1.2 0 0 1 1.14.82L15 17.42l1.86-5.58A1.2 1.2 0 0 1 18 11h4a1 1 0 1 1 0 2h-3.28l-2.58 7.74a1.2 1.2 0 0 1-2.28 0L9 6.18l-1.86 5.58A1.2 1.2 0 0 1 6 12.6H2a1 1 0 1 1 0-2h3.28L7.86 2.82A1.2 1.2 0 0 1 9 2Z"/></svg>`,

  portfolio: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
  portfolioFill: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10.5 2.4a3 3 0 0 1 3 0l6 3.45A3 3 0 0 1 21 8.45v7.1a3 3 0 0 1-1.5 2.6l-6 3.45a3 3 0 0 1-3 0l-6-3.45A3 3 0 0 1 3 15.55v-7.1a3 3 0 0 1 1.5-2.6l6-3.45Z"/></svg>`,

  letter: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h6"/></svg>`,
  letterFill: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V9h-6a1 1 0 0 1-1-1V2Z"/><path d="M16 2.5V7h4.5L16 2.5Z"/><path fill="#ffffff" d="M8 13h8v1.7H8z"/><path fill="#ffffff" d="M8 17h6v1.7H8z"/></svg>`,

  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
};

const navItems = [
  {
    path: "/student/dashboard",
    label: "Tableau de bord",
    icon: icons.dashboard,
    activeIcon: icons.dashboardFill,
  },
  {
    path: "/student/explore",
    label: "Explorer",
    icon: icons.explore,
    activeIcon: icons.exploreFill,
  },
  {
    path: "/student/feed",
    label: "Fil d'actualité",
    icon: icons.feed,
    activeIcon: icons.feedFill,
  },
  {
    path: "/student/connexions?tab=pending",
    label: "Connexions",
    icon: icons.connexions,
    activeIcon: icons.connexionsFill,
  },
  {
    path: "/student/ai-recommendation",
    label: "Recommandation IA",
    icon: icons.ai,
    activeIcon: icons.aiFill,
  },
  {
    path: "/projets",
    label: "Projets",
    icon: icons.projets,
    activeIcon: icons.projetsFill,
  },
  {
    path: "/stages",
    label: "Stages",
    icon: icons.stages,
    activeIcon: icons.stagesFill,
  },
  {
    path: "/certifications",
    label: "Diplômes & Certifications",
    icon: icons.certifications,
    activeIcon: icons.certificationsFill,
  },
  {
    path: "/activites",
    label: "Activités parascolaires",
    icon: icons.activites,
    activeIcon: icons.activitesFill,
  },
  {
    path: "/portfolio",
    label: "Mon portfolio",
    icon: icons.portfolio,
    activeIcon: icons.portfolioFill,
  },
  {
    path: "/ai-analyzer",
    label: "Portfolio IA",
    icon: icons.ai,
    activeIcon: icons.aiFill,
  },
  {
    path: "/lettres",
    label: "Lettres de recommandation",
    icon: icons.letter,
    activeIcon: icons.letterFill,
  },
];
</script>

<style scoped>
.sidebar {
  width: 220px;
  background: var(--white);
  display: flex;
  flex-direction: column;
  position: fixed;
  min-height: calc(100vh - 50px);
  left: 0;
  top: 50px;
  bottom: 0;
  z-index: 99;
  box-shadow: 2px 0 12px var(--overlay-black-06);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 14px;
  border-bottom: 1px solid var(--border-neutral);
  text-decoration: none;
  color: inherit;
}

.avatar-sm {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--surface-neutral-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
  overflow: hidden;
}

.user-info {
  overflow: hidden;
}

.user-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.65rem;
  color: var(--text-slate);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-nav {
  flex: 1;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: var(--text-slate);
  font-size: 0.88rem;
  text-decoration: none;
  transition: 0.2s ease;
  cursor: pointer;
}

.nav-item:hover {
  color: var(--text-strong);
  background: #f5f5ff;
}

.nav-item.active {
  color: var(--violet);
  background: var(--purple-soft);
  border-left: 3px solid var(--violet);
  font-weight: 600;
}

.nav-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.sidebar-bottom {
  padding: 8px 0;
  border-top: 1px solid var(--border-neutral);
}

.logout {
  color: #e53e3e;
}

.logout:hover {
  background: #fff5f5;
  color: #e53e3e;
}
</style>
