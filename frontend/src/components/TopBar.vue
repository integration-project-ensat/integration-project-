<template>
  <header class="topbar">
    <div class="left">
      <button class="burger-btn" @click="$emit('toggleSidebar')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div class="logo">
        <img src="@/assets/PheraCoreLogo.svg" alt="PheraCore" />
        <span>heraCore</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  width: 100%;
  height: 50px;
  background: #0d1b2a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  position: fixed;
}

.left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  font-family: var(--font-head);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--white);
}

.logo img {
  height: 32px;
  width: auto;
  object-fit: contain;
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
.burger-btn:hover { background: rgba(255,255,255,.1); }

</style>
