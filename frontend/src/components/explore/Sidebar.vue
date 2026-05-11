<template>
  <aside
    class="flex min-h-screen w-[260px] flex-col border-r border-slate-200 bg-white text-slate-950"
  >
    <div class="px-5 py-8">
      <div class="flex items-center gap-3 border-b border-slate-200 pb-5">
        <div class="h-10 w-10 rounded-full bg-slate-100"></div>
        <div>
          <p class="text-sm font-bold">Nom Prenom</p>
          <p class="text-[11px] text-slate-500">
            Exemple.exemple@univ.etu.ac.ma
          </p>
        </div>
      </div>
    </div>

    <nav class="flex-1 space-y-3 px-3">
      <RouterLink
        v-for="item in menuItems"
        :key="item.label"
        :to="item.to"
        class="flex items-center gap-4 rounded-sm px-4 py-3 text-[15px] font-bold transition hover:bg-violet-100"
        :class="
          item.active
            ? 'border-l-4 border-violet-600 bg-violet-200 text-slate-950'
            : ''
        "
      >
        <component :is="item.icon" class="h-5 w-5 stroke-[3]" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import {
  SlidersHorizontal,
  Compass,
  BriefcaseBusiness,
  GraduationCap,
  Award,
  CalendarClock,
  Newspaper,
  Github,
  BadgeCheck,
  MessageCircle,
  Settings,
  LogOut,
} from "lucide-vue-next";

const menuItems = [
  { label: "Dashboard", icon: SlidersHorizontal, to: "/dashboard" },
  { label: "Explorer", icon: Compass, to: "/explore", active: true },
  { label: "Projets", icon: BriefcaseBusiness, to: "/projects" },
  { label: "Stages", icon: GraduationCap, to: "/stages" },
  { label: "Certifications", icon: Award, to: "/certifications" },
  { label: "Activites", icon: CalendarClock, to: "/activities" },
  { label: "My Portfolio", icon: Newspaper, to: "/portfolio" },
  { label: "GitHub", icon: Github, to: "/github" },
  { label: "Mes Recos", icon: BadgeCheck, to: "/recommendations" },
  { label: "Commentaires", icon: MessageCircle, to: "/comments" },
  { label: "Parametres", icon: Settings, to: "/settings" },
  { label: "Deconnexion", icon: LogOut, to: "/login" },
];
</script>
