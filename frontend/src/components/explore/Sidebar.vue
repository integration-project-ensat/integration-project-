<template>
  <aside class="hidden lg:flex lg:w-72 xl:w-80 flex-col bg-[#0b1220] border-r border-slate-800 text-slate-300">
    <div class="px-6 py-7 border-b border-slate-800">
      <div class="flex items-center gap-3">
        <div class="grid h-12 w-12 place-items-center rounded-3xl bg-slate-900 text-cyan-300 text-2xl font-semibold">P</div>
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-slate-500">PheraCore</p>
          <h1 class="text-xl font-semibold text-slate-100">Explore</h1>
        </div>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-4 py-6 space-y-1">
      <template v-for="item in navItems" :key="item.label">
        <a
          :href="item.href"
          class="group flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition-colors duration-300 hover:bg-slate-900 hover:text-white"
          :class="item.active ? 'bg-cyan-500/10 text-cyan-300' : 'text-slate-400'"
        >
          <component :is="item.icon" class="h-5 w-5 transition-colors duration-300" />
          <span>{{ item.label }}</span>
        </a>
      </template>
    </nav>

    <div class="px-6 py-5 border-t border-slate-800">
      <div class="rounded-3xl bg-slate-900/80 p-4 text-sm text-slate-400">
        <p class="text-slate-200 font-semibold">Boost your portfolio</p>
        <p class="mt-2 leading-6">Explore curated profiles, certifications, et recommandations pour les prochaines collaborations.</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Activity, Award, Briefcase, Compass, Github, GraduationCap, LayoutGrid, Layers, LogOut, MessageCircle, Settings, ThumbsUp } from 'lucide-vue-next'

const navItems = [
  { label: 'Dashboard', icon: LayoutGrid, href: '#', active: false },
  { label: 'Explorer', icon: Compass, href: '#', active: true },
  { label: 'Projets', icon: Briefcase, href: '#', active: false },
  { label: 'Stages', icon: GraduationCap, href: '#', active: false },
  { label: 'Certifications', icon: Award, href: '#', active: false },
  { label: 'Activités', icon: Activity, href: '#', active: false },
  { label: 'Portfolio', icon: Layers, href: '#', active: false },
  { label: 'GitHub', icon: Github, href: '#', active: false },
  { label: 'Mes Recos', icon: ThumbsUp, href: '#', active: false },
  { label: 'Commentaires', icon: MessageCircle, href: '#', active: false },
  { label: 'Paramètres', icon: Settings, href: '#', active: false },
  { label: 'Déconnexion', icon: LogOut, href: '#', active: false }
]
</script>

<style scoped>
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.25); border-radius: 9999px; }
</style>
