<script setup lang="ts">
import {
  LayoutDashboard,
  Navigation2,
  FolderOpen,
  Briefcase,
  Award,
  Activity,
  FileText,
  Github,
  Award as ThumbsUp,
  MessageCircle,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-vue-next";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Explorer", icon: Navigation2, active: true },
  { label: "Projets", icon: FolderOpen },
  { label: "Stages", icon: Briefcase },
  { label: "Certifications", icon: Award },
  { label: "Activités", icon: Activity },
  { label: "My Portfolio", icon: FileText },
  { label: "GitHub", icon: Github },
  { label: "Mes Recos", icon: ThumbsUp },
  { label: "Commentaires", icon: MessageCircle },
  { label: "Paramètres", icon: Settings },
  { label: "Déconnexion", icon: LogOut },
];

const userProfile = {
  avatar: "NP",
  name: "Nom Prenom",
  email: "nom.prenom@gmail.com",
};
</script>

<template>
  <aside class="w-64 bg-[#0f1729] border-r border-slate-700/50 flex flex-col">
    <!-- Logo -->
    <div class="p-6 border-b border-slate-700/50">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg"
        >
          P
        </div>
        <span class="font-semibold text-slate-100 text-lg">PheraCore</span>
      </div>
    </div>

    <!-- User Profile Mini -->
    <div class="p-4 border-b border-slate-700/50">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm"
        >
          {{ userProfile.avatar }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-100 truncate">
            {{ userProfile.name }}
          </p>
          <p class="text-xs text-slate-400 truncate">{{ userProfile.email }}</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-4 space-y-1">
      <template v-for="item in navItems" :key="item.label">
        <a
          href="#"
          :class="[
            'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
            item.active
              ? 'bg-purple-600/20 text-purple-200'
              : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100',
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <span>{{ item.label }}</span>
        </a>
      </template>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-slate-700/50">
      <div class="bg-slate-800/50 rounded-lg p-3">
        <p class="text-xs font-semibold text-slate-200 mb-1">Upgrade Plan</p>
        <p class="text-xs text-slate-400">Get premium features</p>
      </div>
    </div>
  </aside>
</template>
