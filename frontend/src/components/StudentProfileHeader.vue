<template>
  <div class="profile-header">

    <!-- Cover + Avatar -->
    <div class="cover-section">
      <div class="cover-img" />
      <div class="avatar-wrap">
        <div class="avatar">
          <img v-if="profile.avatar" :src="profile.avatar" alt="avatar" />
          <span v-else>{{ initials }}</span>
        </div>
      </div>
    </div>

    <!-- Infos -->
    <div class="profile-info">
      <div class="name-row">
        <h1>{{ profile.name }}</h1>
        <span class="score">{{ profile.score }}+</span>
      </div>
      <p class="title">{{ profile.title }}</p>
      <p class="school">{{ profile.school }}</p>
      <p class="location">{{ profile.location }} • <span class="contact">Contact info</span></p>
      <p class="recos-count">{{ profile.recos }} recos</p>

      <!-- Tabs -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="tab"
          :class="{ active: modelValue === tab || (tab === 'Compétances' && showCompetances) }"
          @click="tab === 'Compétances' ? showCompetances = !showCompetances : $emit('update:modelValue', tab)">
          {{ tab }}
        </button>
      </div>

      <!-- Dropdown Compétances -->
      <div v-if="showCompetances" class="competances-dropdown">
        <div class="competances-section">
          <h3>Compétances Techniques</h3>
          <div class="skills-list">
            <span class="skill-tag">Vue.js</span>
            <span class="skill-tag">TypeScript</span>
            <span class="skill-tag">Python</span>
            <span class="skill-tag">Docker</span>
            <span class="skill-tag">Git</span>
          </div>
        </div>
        <div class="competances-section">
          <h3>Soft Skills</h3>
          <div class="skills-list">
            <span class="skill-tag soft">Travail en équipe</span>
            <span class="skill-tag soft">Communication</span>
            <span class="skill-tag soft">Adaptabilité</span>
            <span class="skill-tag soft">Résolution de problèmes</span>
          </div>
        </div>
      </div>

      <!-- Recos section dans la meme card blanche -->
      <div class="recos-section">
        <div class="reco-card">
          <p class="reco-label">Top recos de profs</p>
          <div class="reco-item">
            <span class="star">★</span>
            <span>Ex commentaire de recommendation.</span>
          </div>
        </div>
        <div class="reco-card">
          <p class="reco-label">Top recos de professionnels</p>
          <div class="reco-item">
            <span class="dot" />
            <span>Ex commentaire de recommendation.</span>
          </div>
        </div>
        <div class="reco-card empty" />
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const showCompetances = ref(false)

const props = defineProps<{
  profile: {
    name: string
    score: number
    title: string
    school: string
    location: string
    recos: string
    avatar?: string
  }
  modelValue: string
}>()

defineEmits(['update:modelValue'])

const tabs = ['Portfolio', 'Recommendation', 'Compétances', 'Partager']

const initials = computed(() => {
  return props.profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
})
</script>

<style scoped>
.profile-header {
  background: white;
  border-radius: 8px;
  margin-top: 35px;
  margin-bottom: 10px;
  overflow: hidden;
}

.cover-section {
  position: relative;
  margin-bottom: 50px;
}

.cover-img {
  width: 100%;
  height: 180px;
  background: repeating-conic-gradient(#e0e0e0 0% 25%, #f5f5f5 0% 50%) 0 0 / 24px 24px;
}

.avatar-wrap {
  position: absolute;
  bottom: -48px;
  left: 24px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: repeating-conic-gradient(#e0e0e0 0% 25%, #f5f5f5 0% 50%) 0 0 / 16px 16px;
  border: 4px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head);
  font-size: 1.5rem;
  font-weight: 700;
  color: #999;
  overflow: hidden;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }

.profile-info { padding: 0 24px 0; }

.name-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

h1 {
  font-family: var(--font-head);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-dark);
}

.score {
  color: var(--error);
  font-size: 1.1rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
  font-family: var(--font-head);
}

.title    { font-size: .88rem; color: var(--text-dark); margin-bottom: 3px; }
.school   { font-size: .82rem; color: var(--purple); margin-bottom: 3px; }
.location { font-size: .78rem; color: var(--text-muted); margin-bottom: 4px; }
.contact  { color: var(--purple); cursor: pointer; }
.recos-count { font-size: .82rem; font-weight: 600; color: var(--text-dark); margin-bottom: 12px; }

.tabs {
  display: flex;
  gap: 4px;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
  padding-bottom: 4px;
}

.tab {
  padding: 8px 18px;
  font-size: .85rem;
  font-family: var(--font-body);
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: var(--ease);
}
.tab:hover { background: #f5f5f5; color: var(--text-dark); }
.tab.active {
  background: var(--purple);
  color: white;
  font-weight: 600;
  border-radius: 100px 180px 0px 100px;
}

/* Compétances dropdown */
.competances-dropdown {
  border-top: 1px solid #f0f0f0;
  padding: 16px 0;
  display: flex;
  gap: 40px;
}

.competances-section h3 {
  font-size: .85rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 10px;
  font-family: var(--font-head);
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  background: #eeecff;
  color: var(--purple);
  font-size: .78rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.skill-tag.soft {
  background: #f0fdf4;
  color: #16a34a;
}

/* Recos */
.recos-section {
  display: flex;
  gap: 12px;
  padding: 16px 0 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

.reco-card {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 14px;
  min-height: 70px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
}
.reco-card.empty {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
}

.reco-label {
  font-size: .78rem;
  color: var(--text-muted);
  margin-bottom: 8px;
  font-weight: 600;
}

.reco-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: .82rem;
  color: var(--text-dark);
}

.star { color: #f59e0b; }
.dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #ccc;
  flex-shrink: 0;
  margin-top: 4px;
}
</style>