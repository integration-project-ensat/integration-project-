<template>
  <div class="auth-wrapper">
    <div class="auth-card">

      <!-- ── PANNEAU GAUCHE ── -->
      <div class="left">
        <div class="shape top-left">
          <svg width="776" height="784" viewBox="0 0 776 784" fill="none" xmlns="http://www.w3.org/2000/svg">
<g opacity="0.4" filter="url(#filter0_f_243_311)">
<ellipse cx="266" cy="275" rx="210" ry="209" fill="#5A89ED"/>
</g>
<defs>
<filter id="filter0_f_243_311" x="-244" y="-234" width="1020" height="1018" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feGaussianBlur stdDeviation="150" result="effect1_foregroundBlur_243_311"/>
</filter>
</defs>
</svg>
        </div>
        <div class="logo">
          <img src="@/assets/PheraCoreLogo.svg" alt="PheraCore" height="32" />
          <span>heraCore</span>
        </div>

        <div class="slide-area">
          <button class="arrow" @click="prev">
            <svg width="36" height="27" viewBox="0 0 36 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_316_2337)">
                <path d="M0.772509 15.0334C-0.0932789 14.1824 -0.10525 12.7883 0.745795 11.9225L11.6392 0.840423C12.4902 -0.0253668 13.8843 -0.0373376 14.7501 0.813709C15.6159 1.66475 15.6279 3.05883 14.7768 3.92462L7.60078 11.2249L33.058 11.0063C34.2735 10.9959 35.264 11.9695 35.2744 13.185C35.2849 14.4005 34.3113 15.391 33.0958 15.4014L7.63852 15.62L14.9389 22.7961C15.8046 23.6471 15.8166 25.0412 14.9656 25.907C14.1145 26.7728 12.7205 26.7847 11.8547 25.9337L0.772568 15.0403L0.772509 15.0334Z" fill="white"/>
              </g>
             <defs>
<clipPath id="clip0_316_2337">
<rect width="26.3716" height="35.1621" fill="white" transform="matrix(-0.00858664 -0.999963 -0.999963 0.00858664 35.3877 26.3706)"/>
</clipPath>
</defs>
</svg>
          </button>
          <div class="slide-text">
            <h2>{{ current.title }}</h2>
            <p>{{ current.desc }}</p>
          </div>
          <button class="arrow" @click="next">
            <svg width="36" height="27" viewBox="0 0 36 27" fill="none" xmlns="http://www.w3.org/2000/svg">
             <g clip-path="url(#clip0_316_2334)">
               <path d="M34.6152 15.0334C35.481 14.1824 35.4929 12.7883 34.6419 11.9225L23.7485 0.840423C22.8975 -0.0253668 21.5034 -0.0373376 20.6376 0.813709C19.7718 1.66475 19.7598 3.05883 20.6109 3.92462L27.7869 11.2249L2.32968 11.0063C1.11417 10.9959 0.123703 11.9695 0.113266 13.185C0.102828 14.4005 1.07643 15.391 2.29194 15.4014L27.7492 15.62L20.4488 22.7961C19.5831 23.6471 19.5711 25.0412 20.4221 25.907C21.2732 26.7728 22.6672 26.7847 23.533 25.9337L34.6151 15.0403L34.6152 15.0334Z" fill="white"/>
             </g>
             <defs>
               <clipPath id="clip0_316_2334">
                 <rect width="26.3716" height="35.1621" fill="white" transform="translate(0 26.3706) rotate(-89.508)"/>
               </clipPath>
             </defs>
            </svg>
          </button>
        </div>

        <div class="dots">
          <span v-for="(_, i) in slides" :key="i"
                class="dot" :class="{ active: i === idx }"
                @click="idx = i" />
        </div>

        <!-- cercles décoratifs -->
        <div class="shape s1">
           <svg width="283" height="391" viewBox="0 0 283 391" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="-24.6953" y="42.8047" width="135" height="430" rx="67.5" transform="rotate(-30 -24.6953 42.8047)" fill="#5A89ED" fill-opacity="0.25"/>
           </svg>
        </div>
        <div class="shape s2">
           <svg width="283" height="391" viewBox="0 0 283 391" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="-24.6953" y="42.8047" width="135" height="430" rx="67.5" transform="rotate(-30 -24.6953 42.8047)" fill="#5A89ED" fill-opacity="0.25"/>
           </svg>
        </div>
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
  padding: 0;
}

/* ── carte centrale ── */
.auth-card {
  display: flex;
  width: 100%;
  max-width: 100%;
  height: 100vh;
  border-radius: 0;
  overflow: hidden;
  box-shadow:none;
}

/* ════════ GAUCHE ════════ */
.left {
  position: relative;
  width: 38%;
  background: #111827;
  display: flex;
  flex-direction: column;
  padding: 36px 32px;
  overflow: hidden;
}

/* PheraCore */
.logo {
  padding-top: 38px;
  display: flex;
  align-items: center;
  gap: 0px;
  font-family: var(--font-head);
  font-size: 1.7rem;
  font-weight: 600;
  color: white;
  z-index: 1;
  justify-content: center;
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
  margin: 40px;

}

.slide-text p {
  font-size: 1.1rem;
  color: rgb(255, 255, 255);
  line-height: 1.6;
  margin: 40px;
  font-family: var(--font-head);
}

.arrow {
  background: transparent;
  color: rgb(255, 255, 255);
  font-size: 2rem;
  flex-shrink: 0;
  transition: color .2s;
  align-self: auto;
}
.arrow:hover { color: white; }

.dots {
  display: flex;
  justify-content: center;
  gap: 22px;
  z-index: 1;
  margin-bottom: 20px;
  align-items: center;
}
.dot {
  width: 70px; height: 2px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.67);
  cursor: pointer;
  transition: background .3s;
}
.dot.active { background: rgb(255, 255, 255);
              height: 3px;
              margin-bottom: 1px;

}

.top-left {
  position: absolate;
  z-index: 0;
  bottom: 300px;
  right: 100px;
}

/* shapes déco */
.shape {
  position: absolute;

  
}
.s1 { width: 220px; height: 220px; bottom: -65px; left: -65px; }
.s2 { width: 140px; height: 100px; bottom:  20px; left:  140px; }

/* ════════ DROITE ════════ */
.right {
  flex: 1;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 52px 56px;
}

.logo img {
  height: 50px;

}

.logo span {
  letter-spacing: 0px;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
}

/* ── responsive ── */
@media (max-width: 680px) {
  .auth-card { flex-direction: column; }
  .left { width: 100%; min-height: 190px; padding: 28px 24px; }
  .right { padding: 36px 28px; }
}
</style>