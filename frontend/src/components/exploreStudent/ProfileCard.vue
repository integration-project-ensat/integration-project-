<script setup lang="ts">
import { ref } from "vue";
import { ChevronUp } from "lucide-vue-next";

interface Profile {
  id: number;
  name: string;
  role: string;
  school: string;
  city: string;
  score: number;
  recommendations: number;
  recos?: Array<{ name: string; role: string }>;
}

const props = defineProps<{ profile: Profile; defaultExpanded?: boolean }>();
const showDetails = ref(Boolean(props.defaultExpanded));

const handlePortfolio = () => {
  alert("Portfolio clicked!");
};

const handleViewProfile = () => {
  alert("View Profile clicked!");
};

const handleContact = () => {
  alert("Contact info clicked!");
};

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};
</script>

<template>
  <article class="pc-card">
    <div class="pc-top">
      <div class="pc-avatar" aria-hidden="true"></div>

      <div class="pc-info">
        <div class="pc-nameRow">
          <h3 class="pc-name">{{ profile.name }}</h3>
          <span class="pc-score"
            ><span class="pc-scoreStar">*</span>{{ profile.score }}+</span
          >
        </div>

        <p class="pc-role">{{ profile.role }}</p>
        <p class="pc-school">{{ profile.school }}</p>
        <p class="pc-city">
          {{ profile.city }}
          <span class="pc-dot">•</span>
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
            <p class="pc-recoComment">Ex commentaire de recommandation.</p>
          </div>
        </div>
      </div>

      <p v-else class="pc-empty">Aucune recommandation disponible.</p>
    </div>
  </article>
</template>

<style scoped>
.pc-card {
  border: 1px solid rgb(226 232 240);
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.1);
  overflow: hidden;
}

.pc-top {
  background: #eef0f6;
  padding: 22px 22px 18px;
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 18px;
  align-items: start;
}

.pc-avatar {
  height: 120px;
  width: 120px;
  border-radius: 9999px;
  background-color: #e5e7eb;
  background-image:
    linear-gradient(45deg, rgba(255, 255, 255, 0.55) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255, 255, 255, 0.55) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.55) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.55) 75%);
  background-size: 18px 18px;
  background-position: 0 0, 0 9px, 9px -9px, -9px 0px;
  border: 1px solid rgba(15, 23, 42, 0.08);
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
  font-size: 22px;
  font-weight: 800;
  color: rgb(2 6 23);
  letter-spacing: -0.01em;
}

.pc-score {
  font-size: 14px;
  font-weight: 900;
  color: rgb(239 68 68);
}

.pc-scoreStar {
  position: relative;
  top: -3px;
  margin-right: 2px;
  font-size: 11px;
}

.pc-role,
.pc-school,
.pc-city {
  margin-top: 2px;
  font-size: 13px;
  color: rgb(71 85 105);
  font-weight: 600;
}

.pc-school {
  color: rgb(100 116 139);
}

.pc-city {
  color: rgb(100 116 139);
}

.pc-dot {
  margin: 0 6px;
  color: rgb(148 163 184);
}

.pc-contact {
  color: #4f46e5;
  font-weight: 800;
  text-decoration: none;
}

.pc-contact:hover {
  color: #4338ca;
}

.pc-recos {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 900;
  color: #4f46e5;
}

.pc-actions {
  margin-top: 12px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.pc-btn {
  height: 32px;
  padding: 0 18px;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: var(--font-body);
}

.pc-btnPrimary {
  background: var(--purple);
  color: #ffffff;
  border-radius: 100px 180px 0px 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pc-btnPrimary:hover {
  filter: brightness(0.95);
}

.pc-btnOutline {
  background: transparent;
  color: rgb(71 85 105);
  border: 1px solid rgb(148 163 184);
}

.pc-btnOutline:hover {
  border-color: rgb(100 116 139);
  color: rgb(15 23 42);
}

.pc-detailsToggle {
  width: 100%;
  padding: 14px 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgb(71 85 105);
  font-weight: 800;
  font-size: 12px;
  background: transparent;
}

.pc-chevron {
  height: 16px;
  width: 16px;
  color: rgb(148 163 184);
  transition: transform 0.15s ease;
}

.pc-chevronClosed {
  transform: rotate(180deg);
}

.pc-details {
  padding: 0 22px 18px;
}

.pc-recosList {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pc-recoCard {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
  padding: 14px;
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 12px;
  align-items: start;
}

.pc-recoAvatar {
  height: 32px;
  width: 32px;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.25);
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
  color: rgb(100 116 139);
}

.pc-recoComment {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 700;
  color: rgb(100 116 139);
}

.pc-empty {
  padding-top: 8px;
  font-size: 12px;
  color: rgb(100 116 139);
  font-weight: 700;
}
</style>

