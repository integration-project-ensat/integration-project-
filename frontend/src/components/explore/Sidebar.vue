<script setup lang="ts">
import { RouterLink } from "vue-router";
import {
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  Compass,
  Github,
  GraduationCap,
  LogOut,
  MessageCircle,
  Newspaper,
  Settings,
  SlidersHorizontal,
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

<template>
  <aside class="sb-shell">
    <div class="sb-profile">
      <div class="sb-avatar" aria-hidden="true"></div>
      <div class="sb-profileText">
        <p class="sb-name">Nom Prenom</p>
        <p class="sb-email">Exemple.exemple@univ.etu.ac.ma</p>
      </div>
    </div>

    <nav class="sb-nav">
      <RouterLink
        v-for="item in menuItems"
        :key="item.label"
        :to="item.to"
        class="sb-item"
        :class="{ 'sb-itemActive': item.active }"
      >
        <component :is="item.icon" class="sb-icon" />
        <span class="sb-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
.sb-shell {
  height: 100%;
  width: 280px;
  background: #ffffff;
  border-right: 1px solid rgb(226 232 240);
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
}

.sb-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 8px 14px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  margin-bottom: 10px;
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
  gap: 6px;
  padding: 10px 2px 6px;
  overflow: hidden;
}

.sb-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  color: rgb(71 85 105);
  font-size: 13px;
  font-weight: 900;
  text-decoration: none;
  transition: background 0.12s ease;
}

.sb-item:hover {
  background: rgba(148, 163, 184, 0.18);
}

.sb-itemActive {
  background: #e9e7ff;
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
  height: 18px;
  width: 18px;
  color: rgb(2 6 23);
  opacity: 0.9;
}

.sb-item:not(.sb-itemActive) .sb-icon {
  color: rgb(15 23 42);
  opacity: 0.75;
}

.sb-label {
  line-height: 1;
}
</style>

