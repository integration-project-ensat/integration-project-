<template>
  <header class="topbar">
    <div class="left">
      <button class="burger-btn" @click="$emit('toggleSidebar')">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div class="logo">
        <img src="@/assets/PheraCoreLogo.svg" alt="PheraCore" height="32" />
        <span>heraCore</span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  toggleSidebar: [];
}>();
</script>

<style scoped>
.topbar {
  width: 100%;
  height: 50px;
  background: #0d1b2a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  overflow: hidden;
}

.left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-head);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--white);
}

.logo img {
  height: 32px;
  width: auto;
  max-height: 32px;
  display: block;
}

.burger-btn {
  background: transparent;
  color: var(--white);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.2s;
}

.burger-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

</style>
