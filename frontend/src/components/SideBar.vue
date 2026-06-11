<template>
  <aside class="sidebar" :class="{ open: props.isOpen }">

    <!-- User info -->
    <div class="sidebar-user">
      <div class="avatar-sm">
        <img v-if="user.avatar" :src="user.avatar" alt="avatar" />
        <span v-else>{{ initials }}</span>
      </div>
      <div class="user-info">
        <p class="user-name">{{ user.name || 'Nom Prenom' }}</p>
        <p class="user-email">{{ user.email || 'exemple@univ.etu.ac.ma' }}</p>
      </div>
    </div>
 
    <!-- Navigation dynamique selon le rôle -->
    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: route.path === item.path }">
        <span class="nav-icon" v-html="item.icon" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
 
    <!-- Bottom -->
    <div class="sidebar-bottom">
      <RouterLink
        :to="settingsPath"
        class="nav-item"
        :class="{ active: route.path === settingsPath }"
      >
        <span class="nav-icon" v-html="icons.settings" />
        <span>Parametres</span>
      </RouterLink>
      <button class="nav-item logout" @click="logout">
        <span class="nav-icon" v-html="icons.logout" />
        <span>Deconnexion</span>
      </button>
    </div>

  </aside>
</template>
 
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import authService from '@/services/auth.service.js'
 
// ── Props ──
const props = withDefaults(defineProps<{
  role: 'student' | 'teacher' | 'professional'
  isOpen?: boolean        // ← ajoute cette ligne
  user?: {
    name: string
    email: string
    avatar?: string
  }
}>(), {
  isOpen: false,          // ← ajoute cette ligne
  user: () => ({
    name: 'Nom Prenom',
    email: 'exemple@univ.etu.ac.ma',
    avatar: ''
  })
})
 
const route  = useRoute()
const router = useRouter()
 
const initials = computed(() => {
  const name = props.user?.name || 'Nom Prenom'
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
})
 
// ── Icons ──
const icons = {
  dashboard:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  explore:        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  feed:           `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/></svg>`,
  projets:        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
  stages:         `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>`,
  certifications: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  activites:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  portfolio:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>`,
  github:         `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>`,
  recos:          `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  commentaires:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  etudiants:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  offres:         `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  settings:       `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  logout:         `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
}
 
// ── Nav items selon le rôle ──
const navByRole = {
  student: [
    { path: '/dashboard',      label: 'Dashboard',      icon: icons.dashboard },
    { path: '/explore',        label: 'Explorer',       icon: icons.explore },
    { path: '/student/feed',   label: 'Fil d’actualité', icon: icons.feed },
    { path: '/projets',        label: 'Projets',        icon: icons.projets },
    { path: '/stages',         label: 'Stages',         icon: icons.stages },
    { path: '/certifications', label: 'Certifications', icon: icons.certifications },
    { path: '/activites',      label: 'Activites',      icon: icons.activites },
    { path: '/portfolio',      label: 'My Portfolio',   icon: icons.portfolio },
    { path: '/github',         label: 'GitHub',         icon: icons.github },
  ],
  teacher: [
    { path: '/dashboard',      label: 'Dashboard',      icon: icons.dashboard },
    { path: '/explore',        label: 'Explorer',       icon: icons.explore },
    { path: '/etudiants',      label: 'Mes Etudiants',  icon: icons.etudiants },
    { path: '/certifications', label: 'Certifications', icon: icons.certifications },
    { path: '/recos',          label: 'Mes Recos',      icon: icons.recos },
    { path: '/commentaires',   label: 'Commentaires',   icon: icons.commentaires },
  ],
  professional: [
    { path: '/dashboard',      label: 'Dashboard',      icon: icons.dashboard },
    { path: '/explore',        label: 'Explorer',       icon: icons.explore },
    { path: '/offres',         label: 'Offres',         icon: icons.offres },
    { path: '/recos',          label: 'Mes Recos',      icon: icons.recos },
    { path: '/commentaires',   label: 'Commentaires',   icon: icons.commentaires },
  ]
}
 
const navItems = computed(() => navByRole[props.role] ?? navByRole.student)
const settingsPath = computed(() => {
  if (props.role === 'teacher') return '/prof/settings'
  if (props.role === 'professional') return '/pro/settings'
  return '/student/settings'
})

async function logout() {
  await authService.logout()
  router.push('/login')
}
</script>
 
<style scoped>

.sidebar {
  width: 220px;
  background: var(--white);
  display: flex;
  flex-direction: column;
  position: fixed;
  min-height: calc(100vh - 80px);
  left: 0;
  top: 50px;
  bottom: 0;
  z-index: 99;
  box-shadow: 2px 0 12px rgba(0,0,0,.06);
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
  font-size: .8rem;
  font-weight: 600;
  flex-shrink: 0;
  overflow: hidden;
}
.avatar-sm img { width: 100%; height: 100%; object-fit: cover; }
 
.user-info { overflow: hidden; }
.user-name  {
  font-size: .82rem;
  font-weight: 600;
  color: var(--text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-email {
  font-size: .65rem;
  color: var(--text-muted);
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
  color: var(--text-muted);
  font-size: .88rem;
  font-family: var(--font-body);
  text-decoration: none;
  transition: var(--ease);
  cursor: pointer;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
}
.nav-item:hover { color: var(--text-dark); background: #f5f5ff; }
.nav-item.active {
  color: var(--purple);
  background: var(--purple-soft);
  border-left: 3px solid var(--purple);
  font-weight: 600;
}
 
.nav-icon { display: flex; align-items: center; flex-shrink: 0; }
 
.sidebar-bottom {
  padding: 8px 0;
  border-top: 1px solid var(--border-neutral);
}
 
.logout { color: #e53e3e; }
.logout:hover { color: #c53030; background: #fff5f5; }
</style>
