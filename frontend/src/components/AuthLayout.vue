<template>
  <div class="auth-wrapper">
    <div class="auth-card">

      <!-- ── PANNEAU GAUCHE ── -->
      <div class="left">
        <div class="logo">
          <!-- remplace par ton vrai logo : <img src="@/assets/Logo.png" alt="PheraCore" /> -->
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" fill="rgba(255,255,255,.12)" stroke="white" stroke-width="1.5"/>
            <path d="M9 10l5 4-5 4M15 14h4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>PheraCore</span>
        </div>

        <div class="slide-area">
          <button class="arrow" @click="prev">←</button>
          <div class="slide-text">
            <h2>{{ current.title }}</h2>
            <p>{{ current.desc }}</p>
          </div>
          <button class="arrow" @click="next">→</button>
        </div>

        <div class="dots">
          <span v-for="(_, i) in slides" :key="i"
                class="dot" :class="{ active: i === idx }"
                @click="idx = i" />
        </div>

        <!-- cercles décoratifs -->
        <div class="circle c1" />
        <div class="circle c2" />
      </div>

      <!-- ── PANNEAU DROIT (formulaire injecté ici) ── -->
      <div class="right">
        <slot />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const slides = [
  { title: 'Grow',    desc: 'First portfolio platform in North Morocco connecting student with real-world opportunities.' },
  { title: 'Connect', desc: 'Link with mentors, companies and peers who share your ambitions and vision.' },
  { title: 'Achieve', desc: 'Showcase your projects and skills to unlock internships and real job offers.' }
] as const

const idx = ref<number>(0)
const current = computed(() => slides[idx.value] ?? slides[0]) // ou bien "noUncheckedIndexedAccess": false,
const prev = () => idx.value = (idx.value - 1 + slides.length) % slides.length
const next = () => idx.value = (idx.value + 1) % slides.length
</script>

<style scoped>
/* ── wrapper page ── */
.auth-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: 24px;
}

/* ── carte centrale ── */
.auth-card {
  display: flex;
  width: 100%;
  max-width: 960px;
  min-height: 580px;
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(0,0,0,.28);
}

/* ════════ GAUCHE ════════ */
.left {
  position: relative;
  width: 44%;
  background: linear-gradient(160deg, #0f1e30, #1b2f47 60%, #0d1b2a);
  display: flex;
  flex-direction: column;
  padding: 36px 32px;
  overflow: hidden;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-head);
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  z-index: 1;
}

.slide-area {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 1;
  margin-top: 32px;
}

.slide-text h2 {
  font-family: var(--font-head);
  font-size: 1.7rem;
  font-weight: 700;
  color: white;
  margin-bottom: 10px;
}

.slide-text p {
  font-size: .88rem;
  color: rgba(255,255,255,.6);
  line-height: 1.6;
}

.arrow {
  background: transparent;
  color: rgba(255,255,255,.55);
  font-size: 1rem;
  flex-shrink: 0;
  transition: color .2s;
}
.arrow:hover { color: white; }

.dots {
  display: flex;
  gap: 10px;
  z-index: 1;
  margin-bottom: 4px;
}
.dot {
  width: 30px; height: 3px;
  border-radius: 2px;
  background: rgba(255,255,255,.25);
  cursor: pointer;
  transition: background .3s;
}
.dot.active { background: rgba(255,255,255,.85); }

/* cercles déco */
.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,.04);
  pointer-events: none;
}
.c1 { width: 220px; height: 220px; bottom: -65px; left: -65px; }
.c2 { width: 140px; height: 140px; bottom:  20px; left:  80px; }

/* ════════ DROITE ════════ */
.right {
  flex: 1;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 52px 56px;
}

/* ── responsive ── */
@media (max-width: 680px) {
  .auth-card { flex-direction: column; }
  .left { width: 100%; min-height: 190px; padding: 28px 24px; }
  .right { padding: 36px 28px; }
}
</style>