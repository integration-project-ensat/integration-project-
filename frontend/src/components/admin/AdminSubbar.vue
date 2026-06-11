<template>
  <div class="subbar" :class="{ 'sidebar-open': sidebarOpen }">
 
    <!-- Titre de page -->
    <h2 class="page-title">{{ title }}</h2>
 
    <!-- Droite : recherche + cloche + avatar -->
    <div class="right">
 
      <!-- <div class="search-box">
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
      </div> -->
 
      <!-- Cloche -->
      <!-- <button class="icon-btn notif-btn" title="Notifications">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span v-if="unreadCount > 0" class="notif-dot"></span>
      </button> -->
 
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
import { notificationService } from '@/services/notification.service'
 
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

const unreadCount = ref(0)

const loadUnreadNotifications = async () => {
  try {
    unreadCount.value = await notificationService.getUnreadCount()
  } catch (error) {
    unreadCount.value = 0
  }
}

onMounted(() => {
  loadUnreadNotifications()
})
</script>

<style scoped>
.subbar {
  position: fixed;
  top: 50px;          /* juste sous AdminNavbar (50px) */
  left: 0px;
  right: 26px;
  height: 56px;
  background: var(--white);
  border-bottom: 1px solid var(--border-admin);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 8px 20px 43px; 
  z-index: 10;
  transition: left 0.25s ease;
  gap: 16px;
  box-shadow: 0 2px 8px var(--overlay-black-04);
}
 
/* Se décale quand la sidebar est ouverte */
.subbar.sidebar-open { left: 185px;box-shadow: 0 1px 0 var(--border-admin), 0 2px 8px var(--overlay-black-04); }
 
/* ── Title ── */
.page-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-heading);
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
  background: #ebebeb;
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 7px 14px;
  width: 290px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05) inset;
  transition: width 0.25s, border-color 0.15s, box-shadow 0.15s;
}
.search-box:focus-within {
  width: 290px;
  border-color: var(--indigo);
  /*background: var(--white);*/
  box-shadow: 0 0 0 3px rgba(99,102,241,0.10);
}
.si       { color: var(--text-light); flex-shrink: 0; }
.si-input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--text-body);
  width: 100%;
}
.si-input::placeholder { color: var(--text-light); }
.si-input::-webkit-search-cancel-button { display: none; }
 
/* Icon btn */
.icon-btn {
  position: relative;
  display: inline-flex;
  height: 36px;
  width: 36px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 9999px;
  background: var(--purple);
  color: var(--white);
  box-shadow: 0 8px 18px var(--text-gray);
  cursor: pointer;
  transition: background 0.15s ease;
}
.icon-btn svg {
  stroke: var(--white);
}
.icon-btn:hover { background: var(--surface-muted);
  border-radius: 8px;}
 
.notif-dot {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  background: var(--danger-light);
  border: 2px solid var(--white);
  border-radius: 50%;
}
 
/* Avatar */
.avatar-wrapper { position: relative; cursor: pointer; }
 
.avatar {
  position: relative;
  display: inline-flex;
  height: 36px;
  width: 36px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 9999px;
  background: var(--purple);
  color: var(--white);
  box-shadow: 0 8px 18px var(--text-gray);
  cursor: pointer;
  transition: background 0.15s ease;
}
.avatar-wrapper:hover .avatar { border-color: var(--indigo); }
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
  background: var(--white);
  border: 1px solid var(--border-light);
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
.dd-name { font-size: 13px; font-weight: 700; color: var(--text-strong); margin: 0 0 2px; }
.dd-role { font-size: 11px; color: var(--text-light); margin: 0; }
 
.dd-sep { border: none; border-top: 1px solid var(--surface-muted); margin: 3px 0; }
 
.dd-item {
  display: flex; align-items: center; gap: 9px;
  width: 100%; background: none; border: none;
  padding: 9px 10px; border-radius: 8px;
  font-size: 13px; color: var(--text-muted);
  cursor: pointer; text-align: left;
  transition: background 0.12s, color 0.12s;
}
.dd-item:hover { background: var(--surface-subtle); color: var(--text-heading); }
.dd-item.danger { color: var(--danger-light); }
.dd-item.danger:hover { background: var(--danger-bg); color: var(--danger); }
</style>
 