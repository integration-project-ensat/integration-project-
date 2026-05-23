<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Bell, ChevronDown, Search } from "lucide-vue-next";

type UserType = "student" | "professeur" | "professionnel";
type NotificationCategory =
  | "Tout"
  | "Commentaires"
  | "Recommandations"
  | "Projets"
  | "Connexions"
  | "Stages"
  | "Attestations";

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
const selectedNotificationId = ref<number | null>(null);
const isHeaderHidden = ref(false);
let lastScrollTop = 0;
let isScrollTicking = false;

const languages = ["FR", "EN", "AR"];
const notificationFilters: NotificationCategory[] =
  props.userType === "professeur"
    ? ["Tout", "Stages", "Projets", "Attestations", "Recommandations"]
    : props.userType === "professionnel"
      ? ["Tout", "Connexions", "Commentaires"]
    : ["Tout", "Commentaires", "Recommandations", "Projets"];

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
    {
      id: 5,
      category: "Commentaires",
      person: "Nom Professionnel",
      action: "a repondu a votre commentaire sur",
      relatedTitle: "Docker Compose",
      time: "Il y a 3 j",
      initials: "NP",
      profilePath: "/profile/professional-2",
      targetPath: "/posts/docker-compose",
    },
    {
      id: 6,
      category: "Projets",
      person: "Nom Prof",
      action: "a ajoute une remarque sur votre projet",
      relatedTitle: "Application Portfolio",
      time: "Il y a 4 j",
      initials: "NP",
      profilePath: "/profile/prof-2",
      targetPath: "/projects/application-portfolio",
    },
    {
      id: 7,
      category: "Recommandations",
      person: "Nom Professionnel",
      action: "a recommande votre competence",
      relatedTitle: "DevOps",
      time: "Il y a 5 j",
      initials: "NP",
      profilePath: "/profile/professional-3",
      targetPath: "/recommendations/devops",
    },
    {
      id: 8,
      category: "Commentaires",
      person: "Nom Etudiant",
      action: "a mentionne votre profil dans",
      relatedTitle: "Projet Cloud",
      time: "Il y a 1 sem",
      initials: "NE",
      profilePath: "/profile/student-2",
      targetPath: "/posts/projet-cloud",
    },
  ],
  professeur: [
    {
      id: 1,
      category: "Stages",
      person: "Nom Étudiant",
      action: "vous a envoyé une demande de validation de stage",
      relatedTitle: "PFE",
      time: "Il y a 3 min",
      initials: "NE",
      profilePath: "/profile/student-1",
      targetPath: "/validations/stage-pfe",
      unread: true,
    },
    {
      id: 2,
      category: "Projets",
      person: "Nom Étudiant",
      action: "vous demande de valider le projet",
      relatedTitle: "Portfolio Web",
      time: "Il y a 10 min",
      initials: "NE",
      profilePath: "/profile/student-2",
      targetPath: "/validations/projet-portfolio-web",
      unread: true,
    },
    {
      id: 3,
      category: "Attestations",
      person: "Nom Étudiant",
      action: "a demandé la validation d’une attestation de stage",
      relatedTitle: "Stage DevOps",
      time: "Il y a 1 h",
      initials: "NE",
      profilePath: "/profile/student-3",
      targetPath: "/validations/attestation-stage-devops",
    },
    {
      id: 4,
      category: "Recommandations",
      person: "Nom Étudiant",
      action: "vous a demandé d’écrire une lettre de recommandation",
      relatedTitle: "Lettre de recommandation",
      time: "Hier",
      initials: "NE",
      profilePath: "/profile/student-4",
      targetPath: "/validations/recommandation-lettre",
    },
    {
      id: 5,
      category: "Stages",
      person: "Nom Étudiant",
      action: "vous a envoyé une demande de validation de stage",
      relatedTitle: "Stage été",
      time: "Il y a 2 j",
      initials: "NE",
      profilePath: "/profile/student-5",
      targetPath: "/validations/stage-ete",
    },
    {
      id: 6,
      category: "Projets",
      person: "Nom Étudiant",
      action: "vous demande de valider le projet",
      relatedTitle: "Application Mobile",
      time: "Il y a 3 j",
      initials: "NE",
      profilePath: "/profile/student-6",
      targetPath: "/validations/projet-application-mobile",
    },
    {
      id: 7,
      category: "Attestations",
      person: "Nom Étudiant",
      action: "a demandé la validation d’une attestation de stage",
      relatedTitle: "Stage Cloud",
      time: "Il y a 1 sem",
      initials: "NE",
      profilePath: "/profile/student-7",
      targetPath: "/validations/attestation-stage-cloud",
    },
    {
      id: 8,
      category: "Recommandations",
      person: "Nom Étudiant",
      action: "vous a demandé d’écrire une lettre de recommandation",
      relatedTitle: "Lettre de recommandation",
      time: "Il y a 2 sem",
      initials: "NE",
      profilePath: "/profile/student-8",
      targetPath: "/validations/recommandation-lettre-2",
    },
  ],
  professionnel: [
    {
      id: 1,
      category: "Connexions",
      person: "Nom Etudiant",
      action: "a demande une connexion avec vous",
      relatedTitle: "Profil ENSA",
      time: "Il y a 2 min",
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
      profilePath: "/profile/student-3",
      targetPath: "/posts/ci-cd",
      unread: true,
    },
    {
      id: 3,
      category: "Commentaires",
      person: "Nom Etudiant",
      action: "a repondu a votre conseil sur",
      relatedTitle: "Tests Automatises",
      time: "Il y a 3 j",
      initials: "NE",
      profilePath: "/profile/student-4",
      targetPath: "/posts/tests-automatises",
    },
    {
      id: 4,
      category: "Connexions",
      person: "Nom Prof",
      action: "souhaite entrer en contact avec vous",
      relatedTitle: "Collaboration DevOps",
      time: "Il y a 4 j",
      initials: "NP",
      profilePath: "/profile/prof-2",
      targetPath: "/profile/prof-2",
    },
    {
      id: 5,
      category: "Commentaires",
      person: "Nom Professionnel",
      action: "a mentionne votre profil dans",
      relatedTitle: "Discussion Cloud",
      time: "Il y a 1 sem",
      initials: "NP",
      profilePath: "/profile/professional-2",
      targetPath: "/posts/discussion-cloud",
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
    (notification) =>
      notification.category === selectedNotificationFilter.value,
  );
});
const hasUnreadNotifications = computed(() =>
  notifications.value.some((notification) => notification.unread),
);

const toggleNotifications = () => {
  isHeaderHidden.value = false;
  isNotificationOpen.value = !isNotificationOpen.value;
  isLanguageOpen.value = false;
};

const toggleLanguage = () => {
  isHeaderHidden.value = false;
  isLanguageOpen.value = !isLanguageOpen.value;
  isNotificationOpen.value = false;
};

const selectLanguage = (language: string) => {
  selectedLanguage.value = language;
  isLanguageOpen.value = false;
};

const navigateAfterSelection = (
  notification: NotificationItem,
  path: string,
) => {
  selectedNotificationId.value = notification.id;
  window.setTimeout(() => {
    isNotificationOpen.value = false;
    router.push(path);
  }, 180);
};

const navigateToNotificationTarget = (notification: NotificationItem) => {
  navigateAfterSelection(notification, notification.targetPath);
};

const navigateToProfile = (notification: NotificationItem) => {
  navigateAfterSelection(notification, notification.profilePath);
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

const updateHeaderVisibility = (scrollTop: number) => {
  const scrollDelta = scrollTop - lastScrollTop;

  // Always show header immediately when scrolling up, even a little
  if (
    scrollTop <= 16 ||
    scrollDelta < 0 ||
    isNotificationOpen.value ||
    isLanguageOpen.value
  ) {
    isHeaderHidden.value = false;
  } else if (scrollDelta > 0 && scrollTop > 56) {
    isHeaderHidden.value = true;
  }

  lastScrollTop = scrollTop;
};

const handleExploreScroll = (event: Event) => {
  const target = event.target;
  if (
    !(target instanceof HTMLElement) ||
    !target.classList.contains("explore-middle")
  )
    return;

  const scrollTop = target.scrollTop;
  if (isScrollTicking) return;
  isScrollTicking = true;

  window.requestAnimationFrame(() => {
    updateHeaderVisibility(scrollTop);
    isScrollTicking = false;
  });
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("scroll", handleExploreScroll, {
    passive: true,
    capture: true,
  });
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("scroll", handleExploreScroll, true);
});
</script>

<template>
  <section
    class="explore-header"
    :class="{ 'explore-headerHidden': isHeaderHidden }"
  >
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
              :class="{
                'is-unread': notification.unread,
                'is-selected': selectedNotificationId === notification.id,
              }"
              role="button"
              tabindex="0"
              @click="navigateToNotificationTarget(notification)"
              @keydown.enter="navigateToNotificationTarget(notification)"
              @keydown.space.prevent="
                navigateToNotificationTarget(notification)
              "
            >
              <button
                type="button"
                class="explore-avatar"
                :aria-label="`Voir le profil de ${notification.person}`"
                @click.stop="navigateToProfile(notification)"
              >
                {{ notification.initials }}
              </button>

              <span class="explore-notif-copy">
                <span class="explore-notif-text">
                  <button
                    type="button"
                    class="explore-person-link"
                    @click.stop="navigateToProfile(notification)"
                  >
                    {{ notification.person }}
                  </button>
                  {{ notification.action }}
                  <span class="explore-related">{{
                    notification.relatedTitle
                  }}</span>
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
  position: sticky;
  top: 0;
  z-index: 30;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: white;
  border-bottom: 1px solid var(--input-bg);
  transform: translateY(0);
  transition:
    transform 0.24s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.18s ease;
  will-change: transform;
}

.explore-headerHidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(calc(-100% - 1px));
}

.explore-title {
  font-size: 28px;
  line-height: 1;
  font-weight: 650;
  color: var(--text-dark);
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
  border: 1px solid var(--input-bg);
  background: var(--input-bg);
  padding: 0 40px 0 14px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dark);
  outline: none;
}

.explore-search input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 4px var(--purple-light);
}

.explore-search-icon {
  pointer-events: none;
  position: absolute;
  right: 14px;
  top: 50%;
  height: 16px;
  width: 16px;
  transform: translateY(-50%);
  color: var(--text-gray);
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
  background: var(--purple);
  color: var(--input-bg);
  box-shadow: 0 8px 18px var(--text-gray);
  cursor: pointer;
  transition: background 0.15s ease;
}

.explore-notif:hover {
  background: var(--navy-mid);
}

.explore-notif-dot {
  position: absolute;
  right: -2px;
  top: -2px;
  height: 10px;
  width: 10px;
  border-radius: 9999px;
  background: var(--error);
  box-shadow: 0 0 0 2px var(--input-bg);
}

.explore-profile {
  display: inline-flex;
  height: 36px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: 9999px;
  background: var(--blue-w);
  color: var(--text-dark);
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 8px 18px var(--text-gray);
  cursor: pointer;
  transition: background 0.15s ease;
}

.explore-profile:hover {
  background: var(--navy-mid);
}

.explore-flag {
  display: inline-flex;
  min-width: 22px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--input-bg);
  font-size: 10px;
  font-weight: 800;
}

.explore-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 20;
  border-radius: 14px;
  background: var(--input-bg);
  border: 1px solid var(--input-bg);
  box-shadow: 0 18px 38px var(--text-gray);
}

.explore-menu-title {
  padding: 18px 18px 10px;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-dark);
}

.explore-notif-menu {
  right: -8px;
  width: 520px;
  max-width: calc(100vw - 40px);
  background: white;
  overflow-x: hidden;
  overflow-y: visible;
}

.explore-notif-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 12px;
  overflow: hidden;
  padding: 0 18px 14px;
  border-bottom: 1px solid var(--input-bg);
}

.explore-notif-tab {
  flex: 0 1 auto;
  height: 24px;
  border: 1px solid var(--text-gray);
  border-radius: 100px 180px 0px 100px;
  background: transparent;
  color: var(--text-gray);
  cursor: pointer;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  padding: 0 14px;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--text-dark) 8%, transparent);
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.explore-notif-tab:hover {
  border-color: var(--text-dark);
  color: var(--text-dark);
}

.explore-notif-tab.is-active {
  border: 2px solid var(--purple);
  background: color-mix(in srgb, var(--input-bg) 90%, var(--text-dark));
  color: var(--text-dark);
  font-weight: 900;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--text-dark) 10%, transparent);
}

.explore-notif-tab.is-active:hover {
  background: color-mix(in srgb, var(--input-bg) 84%, var(--text-dark));
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
  scrollbar-color: var(--text-gray) var(--input-bg);
}

.explore-notif-list::-webkit-scrollbar {
  width: 14px;
}

.explore-notif-list::-webkit-scrollbar-track {
  background: var(--input-bg);
  border-radius: 9999px;
}

.explore-notif-list::-webkit-scrollbar-thumb {
  background: var(--text-gray);
  border: 4px solid var(--input-bg);
  border-radius: 9999px;
}

.explore-notif-list::-webkit-scrollbar-thumb:hover {
  background: var(--navy-mid);
}

.explore-notif-item {
  display: flex;
  position: relative;
  gap: 12px;
  align-items: flex-start;
  border-radius: 12px;
  padding: 12px 34px 12px 10px;
  color: var(--text-dark);
  cursor: pointer;
  transition: background 0.15s ease;
}

.explore-notif-item:hover {
  background: #eeecff;
}

.explore-notif-item:focus-visible {
  outline: 2px solid var(--purple);
  outline-offset: 2px;
}

.explore-notif-item.is-unread {
  background: white;
}

.explore-notif-item.is-unread:hover {
  background: #eeecff;
}

.explore-notif-item:active,
.explore-notif-item.is-selected,
.explore-notif-item.is-unread.is-selected {
  background: color-mix(in srgb, var(--purple) 14%, var(--input-bg));
}

.explore-notif-item.is-selected .explore-person-link,
.explore-notif-item.is-selected .explore-related {
  color: var(--purple);
}

.explore-avatar {
  display: inline-flex;
  height: 44px;
  width: 44px;
  flex: 0 0 44px;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: var(--input-bg);
  border: 0;
  color: var(--text-dark);
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
  color: var(--text-dark);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.explore-person-link {
  background: transparent;
  border: 0;
  color: var(--text-dark);
  cursor: pointer;
  font: inherit;
  font-weight: 900;
  padding: 0;
}

.explore-person-link:hover {
  color: var(--purple);
  text-decoration: underline;
}

.explore-related {
  color: var(--purple);
  font-weight: 800;
  overflow-wrap: anywhere;
}

.explore-notif-meta {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-gray);
}

.explore-item-dot {
  position: absolute;
  right: 14px;
  top: 20px;
  height: 9px;
  width: 9px;
  border-radius: 9999px;
  background: var(--purple);
}

.explore-empty {
  margin: 0;
  padding: 28px 18px 32px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-gray);
}

.explore-language-menu {
  background: white;
  min-width: 96px;
  padding: 6px;
}

.explore-language-option {
  width: 100%;
  border: 0;
  border-radius: 9px;
  background: transparent;
  padding: 8px 12px;
  color: var(--text-dark);
  font-size: 12px;
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.explore-language-option:hover {
  background: #eeecff;
  color: var(--text-dark);
}

.explore-language-option.is-selected {
  background: #eeecff;
  color: var(--text-dark);
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
