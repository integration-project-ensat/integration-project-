<template>
  <aside
    class="flex min-h-screen w-[260px] flex-col border-r border-slate-200 bg-white text-slate-950"
  >
    <div class="px-5 py-6">
      <div class="flex items-center gap-3 pb-4">
        <div class="h-10 w-10 rounded-full bg-slate-100"></div>
        <div>
          <p class="text-sm font-semibold">Nom Prenom</p>
          <p class="text-[11px] text-slate-500">
            Exemple.exemple@univ.etu.ac.ma
          </p>
        </div>
      </div>
    </div>

    <nav class="flex-1 space-y-1 px-3 pb-5">
      <RouterLink
        v-for="item in menuItems"
        :key="item.label"
        :to="item.to"
        class="flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm font-semibold transition hover:bg-slate-100"
        :class="
          item.active
            ? 'border-l-4 border-[#6c5ce7] bg-[#f3efff] text-slate-950'
            : 'text-slate-700'
        "
      >
        <component
          :is="item.icon"
          class="h-5 w-5 stroke-[2.2] text-slate-700"
        />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
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
