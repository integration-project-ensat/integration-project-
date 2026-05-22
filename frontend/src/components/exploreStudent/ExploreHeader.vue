<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  Bell,
  ChevronDown,
  Search,
} from "lucide-vue-next";

type UserType = "student" | "professeur" | "professionnel";
type NotificationCategory = "Tout" | "Commentaires" | "Recommandations" | "Projets";

interface NotificationItem {
  id: number;
  category: Exclude<NotificationCategory, "Tout">;
  person: string;
  action: string;
  relatedTitle: string;
  time: string;
  initials: string;
  profilePath: string;
  targetPath: string;
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

const router = useRouter();
const notificationRef = ref<HTMLElement | null>(null);
const languageRef = ref<HTMLElement | null>(null);
const isNotificationOpen = ref(false);
const isLanguageOpen = ref(false);
const selectedLanguage = ref("FR");
const selectedNotificationFilter = ref<NotificationCategory>("Tout");

const languages = ["FR", "EN", "AR"];
const notificationFilters: NotificationCategory[] = [
  "Tout",
  "Commentaires",
  "Recommandations",
  "Projets",
];

const notificationsByUser: Record<UserType, NotificationItem[]> = {
  student: [
    {
      id: 1,
      category: "Projets",
      person: "Nom Prof",
      action: "a confirme votre projet",
      relatedTitle: "Portfolio Web",
      time: "Il y a 5 min",
      initials: "NP",
      profilePath: "/profile/prof-1",
      targetPath: "/projects/portfolio-web",
      unread: true,
    },
    {
      id: 2,
      category: "Commentaires",
      person: "Nom Professionnel",
      action: "a commente votre post sur",
      relatedTitle: "DevOps",
      time: "Il y a 18 min",
      initials: "NP",
      profilePath: "/profile/professional-1",
      targetPath: "/posts/devops",
      unread: true,
    },
    {
      id: 3,
      category: "Recommandations",
      person: "Nom Prof",
      action: "a ecrit une lettre de recommandation pour vous",
      relatedTitle: "Stage PFE",
      time: "Hier",
      initials: "NP",
      profilePath: "/profile/prof-1",
      targetPath: "/recommendations/stage-pfe",
    },
    {
      id: 4,
      category: "Recommandations",
      person: "Nom Etudiant",
      action: "a recommande votre profil",
      relatedTitle: "Profil ENSA",
      time: "Il y a 2 j",
      initials: "NE",
      profilePath: "/profile/student-1",
      targetPath: "/profile/student-1",
    },
  ],
  professeur: [
    {
      id: 1,
      category: "Projets",
      person: "Nom Etudiant",
      action: "demande la confirmation du projet",
      relatedTitle: "Portfolio Web",
      time: "Il y a 12 min",
      initials: "NE",
      profilePath: "/profile/student-1",
      targetPath: "/projects/portfolio-web",
      unread: true,
    },
    {
      id: 2,
      category: "Recommandations",
      person: "Nom Etudiant",
      action: "a recu votre lettre de recommandation pour",
      relatedTitle: "Candidature Master",
      time: "Hier",
      initials: "NE",
      profilePath: "/profile/student-1",
      targetPath: "/recommendations/candidature-master",
    },
    {
      id: 3,
      category: "Commentaires",
      person: "Nom Professionnel",
      action: "a commente votre avis sur",
      relatedTitle: "Projet DevOps",
      time: "Il y a 3 j",
      initials: "NP",
      profilePath: "/profile/professional-1",
      targetPath: "/posts/projet-devops",
    },
  ],
  professionnel: [
    {
      id: 1,
      category: "Recommandations",
      person: "Nom Etudiant",
      action: "a recommande votre profil",
      relatedTitle: "Expert DevOps",
      time: "Il y a 8 min",
      initials: "NE",
      profilePath: "/profile/student-1",
      targetPath: "/profile/student-1",
      unread: true,
    },
    {
      id: 2,
      category: "Commentaires",
      person: "Nom Etudiant",
      action: "a commente votre post sur",
      relatedTitle: "Automatisation CI/CD",
      time: "Il y a 22 min",
      initials: "NE",
      profilePath: "/profile/student-1",
      targetPath: "/posts/ci-cd",
      unread: true,
    },
    {
      id: 3,
      category: "Projets",
      person: "Nom Professionnel",
      action: "a consulte votre portfolio",
      relatedTitle: "Portfolio Cloud",
      time: "Aujourd'hui",
      initials: "NP",
      profilePath: "/profile/professional-1",
      targetPath: "/projects/portfolio-cloud",
    },
    {
      id: 4,
      category: "Projets",
      person: "Nom Prof",
      action: "a partage une interaction sur",
      relatedTitle: "Projet Infrastructure",
      time: "Il y a 2 j",
      initials: "NP",
      profilePath: "/profile/prof-1",
      targetPath: "/projects/infrastructure",
    },
  ],
};

const searchQuery = computed({
  get: () => props.modelValue,
  set: (value: string) => emit("update:modelValue", value),
});

const notifications = computed(() => notificationsByUser[props.userType] ?? []);
const filteredNotifications = computed(() => {
  if (selectedNotificationFilter.value === "Tout") return notifications.value;

  return notifications.value.filter(
    (notification) => notification.category === selectedNotificationFilter.value,
  );
});
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

const navigateToNotificationTarget = (path: string) => {
  isNotificationOpen.value = false;
  router.push(path);
};

const navigateToProfile = (path: string) => {
  isNotificationOpen.value = false;
  router.push(path);
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

          <div class="explore-notif-tabs">
            <button
              v-for="filter in notificationFilters"
              :key="filter"
              type="button"
              class="explore-notif-tab"
              :class="{ 'is-active': selectedNotificationFilter === filter }"
              @click="selectedNotificationFilter = filter"
            >
              {{ filter }}
            </button>
          </div>

          <div v-if="filteredNotifications.length" class="explore-notif-list">
            <div
              v-for="notification in filteredNotifications"
              :key="notification.id"
              class="explore-notif-item"
              :class="{ 'is-unread': notification.unread }"
              role="button"
              tabindex="0"
              @click="navigateToNotificationTarget(notification.targetPath)"
              @keydown.enter="navigateToNotificationTarget(notification.targetPath)"
              @keydown.space.prevent="navigateToNotificationTarget(notification.targetPath)"
            >
              <button
                type="button"
                class="explore-avatar"
                :aria-label="`Voir le profil de ${notification.person}`"
                @click.stop="navigateToProfile(notification.profilePath)"
              >
                {{ notification.initials }}
              </button>

              <span class="explore-notif-copy">
                <span class="explore-notif-text">
                  <button
                    type="button"
                    class="explore-person-link"
                    @click.stop="navigateToProfile(notification.profilePath)"
                  >
                    {{ notification.person }}
                  </button>
                  {{ notification.action }}
                  <span class="explore-related">{{ notification.relatedTitle }}</span>
                </span>
                <span class="explore-notif-meta">
                  {{ notification.time }}
                </span>
              </span>

              <span v-if="notification.unread" class="explore-item-dot" />
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
  padding: 18px 18px 10px;
  font-size: 18px;
  font-weight: 800;
  color: rgb(15 23 42);
}

.explore-notif-menu {
  right: -8px;
  width: 520px;
  max-width: calc(100vw - 40px);
  overflow-x: hidden;
  overflow-y: visible;
}

.explore-notif-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow: hidden;
  padding: 0 16px 12px;
  border-bottom: 1px solid rgb(226 232 240);
}

.explore-notif-tab {
  flex: 0 1 auto;
  border: 0;
  border-radius: 9999px;
  background: #f1f5f9;
  color: rgb(71 85 105);
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  padding: 8px 12px;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.explore-notif-tab:hover,
.explore-notif-tab.is-active {
  background: #e0f2fe;
  color: #0369a1;
}

.explore-notif-list {
  display: flex;
  flex-direction: column;
  height: min(360px, calc(100vh - 220px));
  max-height: 360px;
  min-height: 260px;
  overflow-x: hidden;
  overflow-y: scroll;
  padding: 10px 8px 10px 10px;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: #aeb5c3 #e7ebf5;
}

.explore-notif-list::-webkit-scrollbar {
  width: 14px;
}

.explore-notif-list::-webkit-scrollbar-track {
  background: #e7ebf5;
  border-radius: 9999px;
}

.explore-notif-list::-webkit-scrollbar-thumb {
  background: #aeb5c3;
  border: 4px solid #e7ebf5;
  border-radius: 9999px;
}

.explore-notif-list::-webkit-scrollbar-thumb:hover {
  background: #949cae;
}

.explore-notif-item {
  display: flex;
  position: relative;
  gap: 12px;
  align-items: flex-start;
  border-radius: 12px;
  padding: 12px 34px 12px 10px;
  color: rgb(51 65 85);
  cursor: pointer;
  transition: background 0.15s ease;
}

.explore-notif-item:hover {
  background: #f8fafc;
}

.explore-notif-item:focus-visible {
  outline: 2px solid #0a66c2;
  outline-offset: 2px;
}

.explore-notif-item.is-unread {
  background: #f8fbff;
}

.explore-notif-item.is-unread:hover {
  background: #eef6ff;
}

.explore-avatar {
  display: inline-flex;
  height: 44px;
  width: 44px;
  flex: 0 0 44px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: linear-gradient(135deg, #dbeafe, #e0f2fe);
  border: 0;
  color: #075985;
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  padding: 0;
  transition: transform 0.15s ease;
}

.explore-avatar:hover {
  transform: scale(1.04);
}

.explore-notif-copy {
  display: grid;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  font-size: 13px;
  line-height: 1.35;
}

.explore-notif-text {
  color: rgb(30 41 59);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.explore-person-link {
  background: transparent;
  border: 0;
  color: rgb(15 23 42);
  cursor: pointer;
  font: inherit;
  font-weight: 900;
  padding: 0;
}

.explore-person-link:hover {
  color: #0a66c2;
  text-decoration: underline;
}

.explore-related {
  color: #0f766e;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.explore-notif-meta {
  font-size: 12px;
  font-weight: 700;
  color: rgb(148 163 184);
}

.explore-item-dot {
  position: absolute;
  right: 14px;
  top: 20px;
  height: 9px;
  width: 9px;
  border-radius: 9999px;
  background: #0a66c2;
}

.explore-empty {
  margin: 0;
  padding: 28px 18px 32px;
  text-align: center;
  font-size: 13px;
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
