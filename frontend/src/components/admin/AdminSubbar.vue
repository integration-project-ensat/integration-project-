<template>
  <div class="subbar" :class="{ 'sidebar-open': sidebarOpen }">
 
    <!-- Titre de page -->
    <h2 class="page-title">{{ title }}</h2>
 
    <!-- Droite : recherche + cloche + avatar -->
    <div class="right">
 
      <div class="search-box">
        <svg class="si" width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="localSearch"
          type="search"
          placeholder="Rechercher..."
          class="si-input"
        />
      </div>
 
      <!-- Cloche -->
      <button class="icon-btn notif-btn" title="Notifications">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="notif-dot"></span>
      </button>
 
      <!-- Avatar -->
      <div class="avatar-wrapper">
        <div class="avatar">
          <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="avatar-img" />
          <span v-else>{{ initials }}</span>
        </div>
      </div>
 
    </div>
  </div>
</template>
 
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
 
const props = defineProps({
  title:       { type: String, default: '' },
  searchQuery: { type: String, default: '' },
  sidebarOpen: { type: Boolean, default: true },
  avatarUrl:   { type: String, default: '' },
  userName:    { type: String, default: 'Admin Boss' },
  userRole:    { type: String, default: 'Responsable Admin' },
})
const emit = defineEmits(['update:searchQuery'])
 
const localSearch = computed({
  get: () => props.searchQuery,
  set: (v) => emit('update:searchQuery', v),
})
 
const initials = computed(() =>
  props.userName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
)
</script>
 
<style scoped>
.subbar {
  position: fixed;
  top: 50px;          /* juste sous AdminNavbar (50px) */
  left: 0;
  right: 0;
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e8eaf0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 150;
  transition: left 0.25s ease;
  gap: 16px;
}
 
/* Se décale quand la sidebar est ouverte */
.subbar.sidebar-open { left: 185px; }
 
/* ── Title ── */
.page-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
}
 
/* ── Right ── */
.right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
 
/* Search */
.search-box {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  padding: 6px 12px;
  width: 200px;
  transition: width 0.25s, border-color 0.15s, background 0.15s;
}
.search-box:focus-within {
  width: 260px;
  border-color: #6366f1;
  background: #fff;
}
.si       { color: #94a3b8; flex-shrink: 0; }
.si-input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: #334155;
  width: 100%;
}
.si-input::placeholder { color: #94a3b8; }
.si-input::-webkit-search-cancel-button { display: none; }
 
/* Icon btn */
.icon-btn {
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.15s;
}
.icon-btn:hover { background: #f1f5f9; }
 
.notif-dot {
  position: absolute;
  top: 6px; right: 6px;
  width: 7px; height: 7px;
  background: #ef4444;
  border-radius: 50%;
  border: 1.5px solid #fff;
}
 
/* Avatar */
.avatar-wrapper { position: relative; cursor: pointer; }
 
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: white;
  overflow: hidden;
  border: 2px solid transparent;
  transition: border-color 0.15s;
}
.avatar-wrapper:hover .avatar { border-color: #6366f1; }
.avatar.sm {
  width: 30px; height: 30px;
  font-size: 10px;
  border: none;
  flex-shrink: 0;
}
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
 
/* Dropdown */
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  padding: 8px;
  min-width: 196px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
  z-index: 300;
}
 
.dd-enter-active, .dd-leave-active { transition: opacity .14s, transform .14s; }
.dd-enter-from, .dd-leave-to       { opacity: 0; transform: translateY(-5px); }
 
.dd-header {
  display: flex; align-items: center; gap: 9px;
  padding: 5px 8px 10px;
}
.dd-name { font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }
.dd-role { font-size: 11px; color: #94a3b8; margin: 0; }
 
.dd-sep { border: none; border-top: 1px solid #f1f5f9; margin: 3px 0; }
 
.dd-item {
  display: flex; align-items: center; gap: 9px;
  width: 100%; background: none; border: none;
  padding: 9px 10px; border-radius: 8px;
  font-size: 13px; color: #475569;
  cursor: pointer; text-align: left;
  transition: background 0.12s, color 0.12s;
}
.dd-item:hover { background: #f8fafc; color: #1e293b; }
.dd-item.danger { color: #ef4444; }
.dd-item.danger:hover { background: #fef2f2; color: #dc2626; }
</style>
 