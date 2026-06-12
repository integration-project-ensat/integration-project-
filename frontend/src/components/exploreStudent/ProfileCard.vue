<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from 'vue-router'

import { ChevronUp } from "lucide-vue-next";
import SkillBadges from "./SkillBadges.vue";


interface Profile {
  id: number | string;
  name: string;
  avatar?: string;
  role: string;
  school: string;
  city: string;
  score: number;
  recommendations: number;
  badges?: string[];
  recos?: Array<{ name: string; role: string; comment?: string }>;
  profilePath?: string;
  portfolioPath?: string;
}

const props = defineProps<{ profile: Profile; defaultExpanded?: boolean }>();
const router = useRouter()
const showDetails = ref(Boolean(props.defaultExpanded));

const handlePortfolio = () => {
  router.push(props.profile.portfolioPath ?? `/portfolio/${props.profile.id}`)
};

const handleViewProfile = () => {
  router.push(props.profile.profilePath ?? `/profile/student/${props.profile.id}`)
};

const handleContact = () => {
  handleViewProfile();
};

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

</script>

<template>
  <article class="pc-card">
    <div class="pc-top">
      <div class="pc-avatar" aria-hidden="true">
        <img v-if="profile.avatar" :src="profile.avatar" :alt="profile.name" />
        <span v-else>
          {{
            profile.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          }}
        </span>
      </div>

      <div class="pc-info">
        <div class="pc-nameRow">
          <h3 class="pc-name">{{ profile.name }}</h3>
          <span class="pc-score"
            ><span class="pc-scoreStar">*</span>{{ profile.score }}+</span
          >
        </div>

        <p class="pc-role">{{ profile.role }}</p>
        <SkillBadges :badges="profile.badges" compact />
        <p class="pc-school">{{ profile.school }}</p>
        <p class="pc-city">
          {{ profile.city }}
          <span class="pc-dot">&bull;</span>
          <span class="pc-dot">?</span>
          <a href="#" class="pc-contact" @click.prevent="handleContact"
            >Contact info</a
          >
        </p>

        <p class="pc-recos">{{ profile.recommendations }}+ recos</p>

        <div class="pc-actions">
          <button
            type="button"
            class="pc-btn pc-btnPrimary"
            @click="handlePortfolio"
          >
            Portfolio
          </button>
          <button
            type="button"
            class="pc-btn pc-btnOutline"
            @click="handleViewProfile"
          >
            Voir Profile
          </button>
        </div>
      </div>
    </div>

    <button type="button" class="pc-detailsToggle" @click="toggleDetails">
      <span>Details recos</span>
      <ChevronUp
        class="pc-chevron"
        :class="{ 'pc-chevronClosed': !showDetails }"
      />
    </button>

    <div v-if="showDetails" class="pc-details">
      <div
        v-if="profile.recos && profile.recos.length > 0"
        class="pc-recosList"
      >
        <div v-for="(reco, idx) in profile.recos" :key="idx" class="pc-recoCard">
          <div class="pc-recoAvatar" aria-hidden="true"></div>
          <div class="pc-recoBody">
            <p class="pc-recoName">{{ reco.name }}</p>
            <p class="pc-recoRole">{{ reco.role }}</p>
            <p class="pc-recoComment">
              {{ reco.comment || "Ex commentaire de recommandation." }}
            </p>
          </div>
        </div>
      </div>

      <p v-else class="pc-empty">Aucune recommandation disponible.</p>
    </div>
  </article>
</template>

<style scoped>
.pc-card {
  border: 1px solid rgba(222, 226, 238, 0.95);
  border-radius: 22px;
  background: var(--white);
  box-shadow: 0 16px 38px rgba(20, 27, 52, 0.08);
  overflow: hidden;
}

.pc-top {
  background: linear-gradient(180deg, #f2f4fb 0%, #eef1f8 100%);
  padding: 20px 18px 16px;
  display: grid;
  grid-template-columns: 102px 1fr;
  gap: 14px;
  align-items: start;
}

.pc-avatar {
  height: 100px;
  width: 100px;
  border-radius: 9999px;
  overflow: hidden;
  background-color: var(--input-bg);
  background-image:
    linear-gradient(45deg, rgba(255, 255, 255, 0.55) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255, 255, 255, 0.55) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.55) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.55) 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 9px, 9px -9px, -9px 0px;
  border: 1px solid rgba(15, 23, 42, 0.07);
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 1.3rem;
  font-weight: 900;
}

.pc-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pc-info {
  min-width: 0;
}

.pc-nameRow {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}

.pc-name {
  font-size: 17px;
  line-height: 1.2;
  font-weight: 900;
  color: rgb(2 6 23);
  letter-spacing: -0.01em;
}

.pc-score {
  font-size: 12px;
  font-weight: 900;
  color: #ff6b6b;
}

.pc-scoreStar {
  margin-right: 2px;
  font-size: 10px;
}

.pc-role,
.pc-school,
.pc-city {
  margin-top: 3px;
  font-size: 11px;
  line-height: 1.35;
  color: #65748b;
  font-weight: 700;
}

.pc-school {
  color: #7d8aa1;
}

.pc-city {
  color: #7d8aa1;
}

.pc-dot {
  margin: 0 8px;
  color: #8190aa;
}

.pc-contact {
  color: #5f57f6;
  font-weight: 900;
  text-decoration: none;
}

.pc-contact:hover {
  color: #4b43e8;
}

.pc-recos {
  margin-top: 10px;
  font-size: 11px;
  font-weight: 900;
  color: #564ff2;
}

.pc-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pc-btn {
  min-height: 34px;
  padding: 0 16px;
  border-radius: 100px 180px 0px 100px;
  font-size: 12px;
  font-weight: 800;
  font-family: var(--font-body);
}

.pc-btnPrimary {
  background: linear-gradient(135deg, #5f57f6 0%, var(--purple) 100%);
  color: var(--white);
  border-radius: 100px 180px 0px 100px;
  box-shadow: 0 8px 20px rgba(95, 87, 246, 0.24);
}

.pc-btnPrimary:hover {
  filter: brightness(0.95);
}

.pc-btnOutline {
  background: rgba(255, 255, 255, 0.78);
  color: #607089;
  border: 1px solid rgba(145, 156, 182, 0.55);
  box-shadow: 0 4px 14px var(--overlay-slate-06);
}

.pc-btnOutline:hover {
  border-color: var(--text-slate);
  color: var(--text-strong);
}

.pc-detailsToggle {
  width: 100%;
  padding: 10px 22px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #55657d;
  font-weight: 900;
  font-size: 12px;
  background: var(--white);
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

.pc-chevron {
  height: 16px;
  width: 16px;
  color: var(--text-light);
  transition: transform 0.15s ease;
}

.pc-chevronClosed {
  transform: rotate(180deg);
}

.pc-details {
  padding: 0 18px 16px;
  background: var(--white);
}

.pc-recosList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pc-recoCard {
  background: var(--white);
  border-radius: 14px;
  border: 1px solid rgba(226, 232, 240, 0.95);
  box-shadow: 0 10px 24px var(--overlay-slate-06);
  padding: 12px 14px;
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 12px;
  align-items: start;
}

.pc-recoAvatar {
  height: 32px;
  width: 32px;
  border-radius: 9999px;
  background: var(--overlay-slate-border);
}

.pc-recoName {
  font-size: 12px;
  font-weight: 900;
  color: rgb(2 6 23);
}

.pc-recoRole {
  margin-top: 1px;
  font-size: 11px;
  font-weight: 800;
  color: #7d8aa1;
}

.pc-recoComment {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #8693a8;
}

.pc-empty {
  padding-top: 8px;
  font-size: 12px;
  color: var(--text-slate);
  font-weight: 700;
}

@media (max-width: 720px) {
  .pc-top {
    grid-template-columns: 1fr;
  }

  .pc-avatar {
    height: 84px;
    width: 84px;
  }
}
</style>



