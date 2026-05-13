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
        <img src="@/assets/PheraCoreLogo.svg" alt="PheraCore" height="32" />
        <span>heraCore</span>
      </div>
    </div>
    <button class="theme-btn" @click="$emit('toggleTheme')">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
       <path d="M7.01074 1.42676C3.87305 1.67578 1.40625 4.30078 1.40625 7.5C1.40625 10.8662 4.13379 13.5938 7.5 13.5938C8.47559 13.5938 9.39551 13.3652 10.2129 12.958C7.18359 12.2725 4.92188 9.56543 4.92188 6.32812C4.92188 4.40039 5.72461 2.66309 7.01074 1.42676ZM0 7.5C0 3.35742 3.35742 0 7.5 0C8.06836 0 8.625 0.0644531 9.16113 0.18457C9.45117 0.249023 9.66797 0.492187 9.70313 0.785156C9.73828 1.07812 9.58594 1.36523 9.31934 1.5C7.54395 2.38477 6.32813 4.21582 6.32813 6.32812C6.32813 9.30469 8.74219 11.7188 11.7188 11.7188C11.8652 11.7188 12.0088 11.7129 12.1523 11.7012C12.4482 11.6777 12.7266 11.8418 12.8496 12.1143C12.9727 12.3867 12.9082 12.7031 12.6943 12.9082C11.3467 14.2031 9.51563 15 7.5 15C3.35742 15 0 11.6426 0 7.5Z" fill="white"/>
      </svg>
    </button>
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
  color: white;
}

.burger-btn {
  background: transparent;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 6px;
  border-radius: 6px;
  transition: background 0.2s;
}
.burger-btn:hover { background: rgba(255,255,255,.1); }

.theme-btn {
  background: transparent;
  color: rgba(255,255,255,.6);
  border: none;
  cursor: pointer;
}
.theme-btn:hover { color: white; }
</style>

