<template>
  <main class="auth-wrapper">
    <section class="auth-card">
      <aside class="left">
        <div class="glow"></div>

        <div class="logo">
          <img src="@/assets/PheraCoreLogo.svg" alt="PheraCore" />
          <span>heraCore</span>
        </div>

        <div class="slide-area">
          <button type="button" class="arrow" @click="prev" aria-label="Previous slide">
            <svg width="36" height="27" viewBox="0 0 36 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_316_2331)">
                <path d="M0.772509 15.0334C-0.0932789 14.1824 -0.10525 12.7883 0.745795 11.9225L11.6392 0.840423C12.4902 -0.0253668 13.8843 -0.0373376 14.7501 0.813709C15.6159 1.66475 15.6279 3.05883 14.7768 3.92462L7.60078 11.2249L33.058 11.0063C34.2735 10.9959 35.264 11.9695 35.2744 13.185C35.2849 14.4005 34.3113 15.391 33.0958 15.4014L7.63852 15.62L14.9389 22.7961C15.8046 23.6471 15.8166 25.0412 14.9656 25.907C14.1145 26.7728 12.7205 26.7847 11.8547 25.9337L0.772568 15.0403L0.772509 15.0334Z" fill="white"/>
              </g>
              <defs>
                <clipPath id="clip0_316_2331">
                  <rect width="26.3716" height="35.1621" fill="white" transform="matrix(-0.00858664 -0.999963 -0.999963 0.00858664 35.3877 26.3706)"/>
                </clipPath>
              </defs>
            </svg>
          </button>

          <div class="slide-text">
            <h2>{{ current.title }}</h2>
            <p>{{ current.desc }}</p>
          </div>

          <button type="button" class="arrow" @click="next" aria-label="Next slide">
            <svg width="36" height="27" viewBox="0 0 36 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_316_2323)">
                <path d="M34.6152 15.0334C35.481 14.1824 35.4929 12.7883 34.6419 11.9225L23.7485 0.840423C22.8975 -0.0253668 21.5034 -0.0373376 20.6376 0.813709C19.7718 1.66475 19.7598 3.05883 20.6109 3.92462L27.7869 11.2249L2.32968 11.0063C1.11417 10.9959 0.123703 11.9695 0.113266 13.185C0.102828 14.4005 1.07643 15.391 2.29194 15.4014L27.7492 15.62L20.4488 22.7961C19.5831 23.6471 19.5711 25.0412 20.4221 25.907C21.2732 26.7728 22.6672 26.7847 23.533 25.9337L34.6151 15.0403L34.6152 15.0334Z" fill="white"/>
              </g>
              <defs>
                <clipPath id="clip0_316_2323">
                  <rect width="26.3716" height="35.1621" fill="white" transform="translate(0 26.3706) rotate(-89.508)"/>
                </clipPath>
              </defs>
            </svg>
          </button>
        </div>

        <div class="dots">
          <button
            v-for="(_, i) in slides"
            :key="i"
            type="button"
            class="dot"
            :class="{ active: i === idx }"
            @click="idx = i"
            :aria-label="`Slide ${i + 1}`"
          />
        </div>

        <div class="shapes">
          <div class="shape shape-one"></div>
          <div class="shape shape-two"></div>
        </div>
      </aside>

      <section class="right">
        <slot />
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Slide = {
  title: string
  desc: string
}

const slides: Slide[] = [
  {
    title: 'Grow',
    desc: 'First portfolio platform in North Morocco connecting student with real-world opportunities.'
  },
  {
    title: 'Connect',
    desc: 'Link with mentors, companies and peers who share your ambitions and vision.'
  },
  {
    title: 'Achieve',
    desc: 'Showcase your projects and skills to unlock internships and real job offers.'
  }
]

const idx = ref(0)

const current = computed<Slide>(() => {
  return slides[idx.value] ?? slides[0]!
})

function prev() {
  idx.value = (idx.value - 1 + slides.length) % slides.length
}

function next() {
  idx.value = (idx.value + 1) % slides.length
}
</script>

<style scoped>
.auth-wrapper {
  width: 100%;
  min-height: 100svh;
  background: var(--white);
  overflow: hidden;
}

.auth-card {
  width: 100%;
  min-height: 100svh;
  display: grid;
  grid-template-columns: 43.5% 56.5%;
}

.left {
  position: relative;
  overflow: hidden;
  background: var(--navy);
  color: var(--white);
  padding: clamp(30px, 4vw, 70px);
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.logo {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.logo img {
  height: clamp(34px, 4vw, 52px);
}

.logo span {
  font-family: Inter, Arial, sans-serif;
  font-size: clamp(24px, 2.3vw, 36px);
  font-weight: 800;
  color: var(--white);
}

.slide-area {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) 54px;
  align-items: center;
  gap: clamp(18px, 2.6vw, 44px);
}

.slide-text {
  max-width: 390px;
}

.slide-text h2 {
  margin: 0 0 32px;
  font-family: Inter, Arial, sans-serif;
  font-size: clamp(24px, 2.3vw, 36px);
  font-weight: 800;
  line-height: 1;
}

.slide-text p {
  margin: 0;
  font-family: Inter, Arial, sans-serif;
  font-size: clamp(17px, 1.35vw, 24px);
  line-height: 1.45;
  color: var(--white);
}

.arrow {
  width: 54px;
  height: 54px;
  border: 0;
  background: transparent;
  color: var(--white);
  font-size: clamp(42px, 4vw, 62px);
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dots {
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(18px, 2.6vw, 34px);
  padding-bottom: clamp(28px, 5vw, 70px);
}

.dot {
  width: clamp(58px, 5vw, 90px);
  height: 3px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.65);
  cursor: pointer;
}

.dot.active {
  height: 4px;
  background: var(--white);
}

.shapes {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.shape {
  position: absolute;
  background: rgba(90, 137, 237, 0.25);
  border-radius: 999px;
  will-change: transform;
}

.shape-one {
  width: 150px;
  height: 470px;
  left: -70px;
  bottom: -170px;
  z-index: 1;
  animation: shapeOneMove 6s ease-in-out infinite;
}

.shape-two {
  width: 150px;
  height: 430px;
  left: 175px;
  bottom: -200px;
  z-index: 2;
  animation: shapeTwoMove 6s ease-in-out infinite;
  animation-delay: -3s;
}

@keyframes shapeOneMove {
  0%,
  100% {
    transform: rotate(-30deg) translateY(0);
  }

  50% {
    transform: rotate(-30deg) translateY(-55px);
  }
}

@keyframes shapeTwoMove {
  0%,
  100% {
    transform: rotate(-30deg) translateY(0);
  }

  50% {
    transform: rotate(-30deg) translateY(-45px);
  }
}

.glow {
  position: absolute;
  z-index: 0;
  width: 900px;
  height: 900px;
  left: -455px;
  top: -380px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(60, 91, 150, 0.82) 0%,
    rgba(47, 68, 112, 0.52) 38%,
    rgba(31, 46, 77, 0.3) 58%,
    rgba(17, 24, 39, 0) 72%
  );
  opacity: 0.45;
  transform: scale(0.96);
  animation: glowPulse 7s ease-in-out infinite;
  pointer-events: none;
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.35;
    transform: scale(0.94);
  }

  50% {
    opacity: 0.9;
    transform: scale(1.04);
  }
}

.right {
  position: relative;
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(36px, 5vw, 90px);
}

@media (max-width: 900px) {
  .auth-card {
    grid-template-columns: 1fr;
  }

  .left {
    min-height: 380px;
    padding: 28px 24px;
  }

  .slide-area {
    grid-template-columns: 42px minmax(0, 1fr) 42px;
  }

  .right {
    min-height: auto;
    padding: 52px 24px;
  }
}

@media (max-width: 520px) {
  .left {
    min-height: 330px;
  }

  .logo {
    justify-content: flex-start;
  }

  .slide-text h2 {
    margin-bottom: 18px;
  }

  .dots {
    padding-bottom: 18px;
  }
}
</style>
