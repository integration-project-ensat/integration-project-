<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <component
      :is="forceNavigation ? 'a' : RouterLink"
      :to="forceNavigation ? undefined : profileLink"
      :href="forceNavigation ? profileLink : undefined"
      class="sidebar-user"
      @click="handleNavigation(profileLink, $event)"
    >
      <div class="avatar-sm">
        <img v-if="currentUser.avatar" :src="currentUser.avatar" alt="avatar" />
        <span v-else>{{ initials }}</span>
      </div>
      <div class="user-info">
        <p class="user-name">{{ currentUser.name }}</p>
        <p class="user-email">{{ currentUser.email }}</p>
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
        <span class="nav-icon" v-html="item.icon" />
        <span>{{ item.label }}</span>
      </component>
    </nav>

    <div class="sidebar-bottom">
      <component
        :is="forceNavigation ? 'a' : RouterLink"
        :to="forceNavigation ? undefined : '/pro/settings'"
        :href="forceNavigation ? '/pro/settings' : undefined"
        class="nav-item"
        :class="{ active: isActive('/pro/settings') }"
        @click="handleNavigation('/pro/settings', $event)"
      >
        <span class="nav-icon" v-html="icons.settings" />
        <span>Parametres</span>
      </component>
      <button type="button" class="nav-item logout logout-btn" @click="handleLogout">
        <span class="nav-icon" v-html="icons.logout" />
        <span>Deconnexion</span>
      </button>
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

const currentUser = computed(() => ({
  name: auth.user?.name || "Nom Prenom",
  email: auth.user?.email || "exemple@exemple.pro",
  avatar: auth.user?.avatar || "",
}));

const initials = computed(() => {
  const name = currentUser.value.name || "Nom Prenom";
  return name
    .split(" ")
    .map((part: string) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

const profileLink = computed(() => "/pro/profile");

function normalizedPath(path: string) {
  return path.split("?")[0];
}

function isActive(path: string) {
  return route.path === normalizedPath(path);
}

function handleNavigation(path: string, event?: Event) {
  if (!props.forceNavigation) return;
  event?.preventDefault();
  window.location.assign(path);
}

async function handleLogout() {
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
  explore: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  feed: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/></svg>`,
  topProfiles: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  connexions: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>`,
  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  logout: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
};

const navItems = [
  { path: "/pro/dashboard", label: "Tableau de bord", icon: icons.dashboard },
  { path: "/explore-pro", label: "Explorer", icon: icons.explore },
  { path: "/pro/feed", label: "Fil d'actualite", icon: icons.feed },
  { path: "/pro/connexions?tab=pending", label: "Connexions", icon: icons.connexions },
  { path: "/pro/top-profiles", label: "Meilleurs profils", icon: icons.topProfiles },
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

.avatar-sm img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  color: var(--dark-text);
  font-size: 0.88rem;
  text-decoration: none;
  transition: 0.2s ease;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  color: var(--text-strong);
  background: #f5f5ff;
}

.nav-item.active {
  color: var(--violet);
  background: var(--purple-soft);
  border-left: 6px solid var(--violet);
  font-weight: 600;
  border-radius: 5px 0 0 5px;
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

.logout-btn {
  width: 100%;
}
</style>
