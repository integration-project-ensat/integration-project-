<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  Bell,
  ChevronDown,
  FileCheck,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Star,
  Users,
} from "lucide-vue-next";

type UserType = "student" | "professeur" | "professionnel";

interface NotificationItem {
  id: number;
  text: string;
  time: string;
  icon: typeof Bell;
  unread?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    userType?: UserType;
  }>(),
  {
    userType: "student",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const notificationRef = ref<HTMLElement | null>(null);
const languageRef = ref<HTMLElement | null>(null);
const isNotificationOpen = ref(false);
const isLanguageOpen = ref(false);
const selectedLanguage = ref("FR");

const languages = ["FR", "EN", "AR"];

const notificationsByUser: Record<UserType, NotificationItem[]> = {
  student: [
    {
      id: 1,
      text: "Nouvelles recommandations recues",
      time: "Il y a 5 min",
      icon: Sparkles,
      unread: true,
    },
    {
      id: 2,
      text: "Nouveaux commentaires recus",
      time: "Il y a 18 min",
      icon: MessageCircle,
      unread: true,
    },
  ],
  professeur: [
    {
      id: 1,
      text: "Demandes de confirmation de projet",
      time: "Il y a 12 min",
      icon: FileCheck,
      unread: true,
    },
    {
      id: 2,
      text: "Lettres de recommandation envoyees",
      time: "Hier",
      icon: Send,
    },
  ],
  professionnel: [
    {
      id: 1,
      text: "Nouvelles recommandations",
      time: "Il y a 8 min",
      icon: Star,
      unread: true,
    },
    {
      id: 2,
      text: "Nouveaux commentaires",
      time: "Il y a 22 min",
      icon: MessageCircle,
      unread: true,
    },
    {
      id: 3,
      text: "Interactions sur profil et projets",
      time: "Aujourd'hui",
      icon: Users,
    },
  ],
};

const searchQuery = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});

const notifications = computed(() => notificationsByUser[props.userType] ?? []);
const hasUnreadNotifications = computed(() =>
  notifications.value.some((notification) => notification.unread),
);

const toggleNotifications = () => {
  isNotificationOpen.value = !isNotificationOpen.value;
  isLanguageOpen.value = false;
};

const toggleLanguage = () => {
  isLanguageOpen.value = !isLanguageOpen.value;
  isNotificationOpen.value = false;
};

const selectLanguage = (language: string) => {
  selectedLanguage.value = language;
  isLanguageOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node;

  if (notificationRef.value && !notificationRef.value.contains(target)) {
    isNotificationOpen.value = false;
  }

  if (languageRef.value && !languageRef.value.contains(target)) {
    isLanguageOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <section class="explore-header">
    <h1 class="explore-title">Explore</h1>

    <div class="explore-actions">
      <div class="explore-search">
        <input v-model="searchQuery" type="text" />
        <Search class="explore-search-icon" />
      </div>

      <div ref="notificationRef" class="explore-dropdown-wrap">
        <button
          type="button"
          class="explore-notif"
          aria-label="Notifications"
          @click="toggleNotifications"
        >
          <span v-if="hasUnreadNotifications" class="explore-notif-dot" />
          <Bell class="h-4 w-4" />
        </button>

        <div v-if="isNotificationOpen" class="explore-menu explore-notif-menu">
          <div class="explore-menu-title">Notifications</div>

          <div v-if="notifications.length" class="explore-notif-list">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="explore-notif-item"
            >
              <span class="explore-notif-icon">
                <component :is="notification.icon" class="h-4 w-4" />
              </span>
              <span class="explore-notif-copy">
                <span>{{ notification.text }}</span>
                <small>{{ notification.time }}</small>
              </span>
            </div>
          </div>

          <p v-else class="explore-empty">Aucune notification</p>
        </div>
      </div>

      <div ref="languageRef" class="explore-dropdown-wrap">
        <button
          type="button"
          class="explore-profile"
          aria-label="Changer la langue"
          @click="toggleLanguage"
        >
          <span class="explore-flag">{{ selectedLanguage }}</span>
          <ChevronDown class="h-4 w-4" />
        </button>

        <div v-if="isLanguageOpen" class="explore-menu explore-language-menu">
          <button
            v-for="language in languages"
            :key="language"
            type="button"
            class="explore-language-option"
            :class="{ 'is-selected': selectedLanguage === language }"
            @click="selectLanguage(language)"
          >
            {{ language }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.explore-header {
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.explore-title {
  font-size: 28px;
  line-height: 1;
  font-weight: 650;
  color: rgb(2 6 23);
}

.explore-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.explore-search {
  position: relative;
  width: 340px;
}

.explore-search input {
  height: 36px;
  width: 100%;
  border-radius: 9999px;
  border: 1px solid rgb(226 232 240);
  background: #eef0f6;
  padding: 0 40px 0 14px;
  font-size: 12px;
  font-weight: 600;
  color: rgb(51 65 85);
  outline: none;
}

.explore-search input:focus {
  border-color: #6c5ce7;
  box-shadow: 0 0 0 4px rgba(108, 92, 231, 0.12);
}

.explore-search-icon {
  pointer-events: none;
  position: absolute;
  right: 14px;
  top: 50%;
  height: 16px;
  width: 16px;
  transform: translateY(-50%);
  color: rgb(148 163 184);
}

.explore-dropdown-wrap {
  position: relative;
  display: inline-flex;
}

.explore-notif {
  position: relative;
  display: inline-flex;
  height: 36px;
  width: 36px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 9999px;
  background: #4f46e5;
  color: white;
  box-shadow: 0 8px 18px rgba(79, 70, 229, 0.25);
  cursor: pointer;
  transition: background 0.15s ease;
}

.explore-notif:hover {
  background: #4338ca;
}

.explore-notif-dot {
  position: absolute;
  right: -2px;
  top: -2px;
  height: 10px;
  width: 10px;
  border-radius: 9999px;
  background: rgb(244 63 94);
  box-shadow: 0 0 0 2px #ffffff;
}

.explore-profile {
  display: inline-flex;
  height: 36px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 9999px;
  background: #0ea5b7;
  color: white;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(14, 165, 183, 0.25);
  cursor: pointer;
  transition: background 0.15s ease;
}

.explore-profile:hover {
  background: #0b93a3;
}

.explore-flag {
  display: inline-flex;
  min-width: 22px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.22);
  font-size: 10px;
  font-weight: 800;
}

.explore-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 20;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow: 0 18px 38px rgba(15, 23, 42, 0.18);
}

.explore-menu-title {
  padding: 14px 14px 8px;
  font-size: 13px;
  font-weight: 800;
  color: rgb(15 23 42);
}

.explore-notif-menu {
  width: 286px;
}

.explore-notif-list {
  display: flex;
  flex-direction: column;
  padding: 4px 8px 8px;
}

.explore-notif-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  border-radius: 10px;
  padding: 10px 8px;
  color: rgb(51 65 85);
}

.explore-notif-item:hover {
  background: #f8fafc;
}

.explore-notif-icon {
  display: inline-flex;
  height: 28px;
  width: 28px;
  flex: 0 0 28px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: #eef2ff;
  color: #4f46e5;
}

.explore-notif-copy {
  display: grid;
  gap: 3px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.25;
}

.explore-notif-copy small {
  font-size: 11px;
  font-weight: 600;
  color: rgb(148 163 184);
}

.explore-empty {
  margin: 0;
  padding: 10px 14px 16px;
  font-size: 12px;
  font-weight: 700;
  color: rgb(100 116 139);
}

.explore-language-menu {
  min-width: 96px;
  padding: 6px;
}

.explore-language-option {
  width: 100%;
  border: 0;
  border-radius: 9px;
  background: transparent;
  padding: 8px 12px;
  color: rgb(51 65 85);
  font-size: 12px;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.explore-language-option:hover,
.explore-language-option.is-selected {
  background: #eef2ff;
  color: #4f46e5;
}

@media (max-width: 860px) {
  .explore-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .explore-actions,
  .explore-search {
    width: 100%;
  }
}
</style>
