<template>
  <aside class="sidebar" :class="{ collapsed: !open }">
 
    <!-- Navigation principale -->
    <nav class="nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
      >
        <component :is="item.icon" :size="18" />
        <span class="nav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
 
    <!-- Spacer — pousse le bas vers le bas -->
    <div class="spacer"></div>
 
    <!-- Bas fixé -->
    <div class="sidebar-bottom">
      <RouterLink to="/admin/parametres" class="nav-item" :class="{ active: isActive('/admin/parametres') }">
        <Settings :size="18" />
        <span class="nav-label">Paramètres</span>
      </RouterLink>
      <button class="nav-item logout" @click="handleLogout">
        <LogOut :size="18" />
        <span class="nav-label">Déconnexion</span>
      </button>
    </div>
 
  </aside>
</template>
 
<script setup>
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderOpen,
  Activity,
  Award,
  Settings,
  LogOut,
} from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import authService from '@/services/auth.service.js'
 
defineProps({
  open: { type: Boolean, default: true },
})
 
const route = useRoute()
const router = useRouter()
 
const navItems = [
  { label: 'Dashboard',      to: '/admin',                icon: LayoutDashboard },
  { label: 'Profils',        to: '/admin/profils',        icon: Users },
  { label: 'Portfolios',     to: '/admin/portfolios',     icon: Briefcase },
  { label: 'Projets',        to: '/admin/projets',        icon: FolderOpen },
  { label: 'Activités',      to: '/admin/activites',      icon: Activity },
  { label: 'Certifications', to: '/admin/certifications', icon: Award },
]
 
const isActive = (path) => {
  // Correspondance exacte pour éviter que /admin matche /admin/portfolios etc.
  if (path === '/admin') return route.path === '/admin'
  return route.path === path || route.path.startsWith(path + '/')
}
 
const handleLogout = async () => {
  await authService.logout()
  router.push('/login')
}
</script>
 
<style scoped>
/* ── Sidebar shell ──────────────────────────────── */
.sidebar {
  /* Commence sous la navbar fixe de 50px */
  position: fixed;
  top: 50px;
  left: 0;
  bottom: 0;
  width: 220px;
 
  background: #fff;
  border-right: 1px solid #e8eaf0;
  box-shadow: 2px 0 12px rgba(0,0,0,0.04);
  /*
    Flex column : nav pousse vers le haut,
    spacer prend tout l'espace libre,
    sidebar-bottom reste collé en bas.
  */
  display: flex;
  flex-direction: column;
 
  padding: 16px 0px;
  z-index: 100;
  overflow-y: auto;
 
  transition: transform 0.25s ease;
}
 
.sidebar.collapsed {
  transform: translateX(-100%);
}
 
/* ── Navigation ─────────────────────────────────── */
.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  /* NE PAS mettre flex:1 ici */
}
 
/* CLEF : le spacer absorbe tout l'espace vide */
.spacer {
  flex: 1;
  min-height: 20px;
}
 
/* ── Bottom section ─────────────────────────────── */
.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  /* flex-shrink: 0 garantit qu'il ne sera jamais compressé */
  flex-shrink: 0;
}
 
/* ── Nav items ──────────────────────────────────── */
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 0px;
  font-size: 13.5px;
  font-weight: 600;
  color: #64748b;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  white-space: nowrap;
}
 
.nav-item:hover {
  background: #f1f5f9;
  color: #1e293b;
}
 
.nav-item.active {
  background: #ede9fe;
  color: #6366f1;
  font-weight: 600;
  border-radius: 0;                        /* supprimer le border-radius */
  border-left: 3px solid #6366f1;         /* barre violette à gauche */
  padding-left: 8px;  
}
 
.nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
}
 
/* ── Logout ─────────────────────────────────────── */
.logout { color: #ef4444; }
.logout:hover { background: #fef2f2; color: #dc2626; }
</style>
 