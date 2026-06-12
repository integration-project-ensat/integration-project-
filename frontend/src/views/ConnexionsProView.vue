<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import SidebarPro from "../components/explorePro/SidebarPro.vue";
import SidebarStudent from "../components/exploreStudent/Sidebar.vue";
import SkillBadges from "../components/exploreStudent/SkillBadges.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import { connexionService } from "../services/connexion.service";
import { resolveProfileBadges } from "../utils/profileBadges";

const router = useRouter();
const route = useRoute();
const sidebarOpen = ref(true);
const activeTab = ref<"pending" | "accepted">("pending");
const isLoading = ref(false);
const error = ref<string | null>(null);

type ProConnectionStatus = "pending" | "sent" | "accepted";

interface ProConnectionRequest {
  id: string;
  initials: string;
  name: string;
  avatar?: string;
  school: string;
  field: string;
  badges: string[];
  message: string;
  time: string;
  status: ProConnectionStatus;
  profilePath: string;
  canAccept?: boolean;
  canCancel?: boolean;
  canRemove?: boolean;
}

const pendingRequests = ref<ProConnectionRequest[]>([]);
const acceptedRequests = ref<ProConnectionRequest[]>([]);
const rawConnexionData = ref<any>(null);

const tabs = [
  { key: "pending", label: "Demandes" },
  { key: "accepted", label: "Mes connexions" },
] as const;

const currentRole = computed(() => {
  if (route.path.startsWith("/prof")) return "prof";
  if (route.path.startsWith("/student")) return "student";
  return "pro";
});

const syncActiveTabFromRoute = () => {
  const tab = String(route.query.tab || "").toLowerCase();
  activeTab.value = tab === "accepted" ? "accepted" : "pending";
};

const profileContextQuery = computed(() => {
  if (currentRole.value === "prof") return "?from=prof";
  if (currentRole.value === "pro") return "?from=pro";
  return "?from=student";
});

const visibleRequests = computed(() =>
  activeTab.value === "accepted"
    ? acceptedRequests.value
    : pendingRequests.value,
);

const emptyStateMessage = computed(() =>
  activeTab.value === "accepted"
    ? "Aucune connexion acceptée pour le moment."
    : "Aucune demande dans cette catégorie.",
);

const hasAcceptedConnections = computed(() => acceptedRequests.value.length > 0);

const formatRelativeDate = (dateValue?: string | null) => {
  if (!dateValue) return "Récemment";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Récemment";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `Il y a ${diffHours} h`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "Hier";
  return `Il y a ${diffDays} jours`;
};

const pickBadges = (user: any, field: string, school: string) =>
  resolveProfileBadges({
    badges: user?.etudiant?.badges,
    filiere: field,
    school,
    field,
  });

const toInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getCurrentUserId = () => {
  const rawUser = localStorage.getItem("user");
  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser);
    const id = user?.id ?? user?.id_utilisateur;
    return id == null ? null : String(id);
  } catch {
    return null;
  }
};

const getFieldLabel = (user: any) =>
  user?.etudiant?.filiere || user?.role || "Étudiant";

const getSchoolLabel = (user: any) => user?.profil?.adresse || "Étudiant";

const resolveAvatar = (path?: string | null) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || String(path).startsWith("data:")) return path;
  if (String(path).startsWith("/")) return String(path);
  if (String(path).startsWith("uploads/")) return `/${path}`;
  return "";
};

const mapPendingRequest = (
  connexion: any,
  currentUserId: string | null,
): ProConnectionRequest => {
  const demandeurId = String(connexion.demandeur?.id_utilisateur ?? "");
  const isSentByCurrentUser = Boolean(currentUserId && demandeurId === currentUserId);
  const sourceUser = isSentByCurrentUser ? connexion.destinataire ?? {} : connexion.demandeur ?? {};
  const name =
    [sourceUser.prenom, sourceUser.nom].filter(Boolean).join(" ").trim() ||
    "Connexion";

  return {
    id: String(connexion.id_connexion),
    initials: toInitials(name),
    name,
    avatar: resolveAvatar(sourceUser?.profil?.photo_profil),
    school: getSchoolLabel(sourceUser),
    field: getFieldLabel(sourceUser),
    badges: pickBadges(sourceUser, getFieldLabel(sourceUser), getSchoolLabel(sourceUser)),
    message: isSentByCurrentUser ? "Demande envoyée" : "Demande de connexion étudiant",
    time: formatRelativeDate(connexion.date_demande),
    status: isSentByCurrentUser ? "sent" : "pending",
    canAccept: !isSentByCurrentUser,
    canCancel: true,
    profilePath: `/profile/student/${sourceUser.id_utilisateur}${profileContextQuery.value}`,
  };
};

const mapAcceptedRequest = (
  connexion: any,
  currentUserId: string | null,
): ProConnectionRequest => {
  const demandeurId = String(connexion.demandeur?.id_utilisateur ?? "");
  const otherUser =
    currentUserId && demandeurId === currentUserId
      ? connexion.destinataire
      : connexion.demandeur;

  const name =
    [otherUser?.prenom, otherUser?.nom].filter(Boolean).join(" ").trim() ||
    "Connexion";

  return {
    id: String(connexion.id_connexion),
    initials: toInitials(name),
    name,
    avatar: resolveAvatar(otherUser?.profil?.photo_profil),
    school: getSchoolLabel(otherUser),
    field: getFieldLabel(otherUser),
    badges: pickBadges(otherUser, getFieldLabel(otherUser), getSchoolLabel(otherUser)),
    message: "Connexion acceptée",
    time: formatRelativeDate(connexion.date_reponse || connexion.date_demande),
    status: "accepted",
    canRemove: true,
    profilePath: `/profile/student/${otherUser?.id_utilisateur}${profileContextQuery.value}`,
  };
};

const normalizeStatus = (status: string) =>
  String(status || "")
    .trim()
    .toUpperCase();

const loadConnections = async () => {
  if (!localStorage.getItem("token")) {
    pendingRequests.value = [];
    acceptedRequests.value = [];
    error.value = "Connectez-vous pour gérer les connexions réelles.";
    rawConnexionData.value = null;
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const currentUserId = getCurrentUserId();
    const response = await connexionService.getConnexions();
    rawConnexionData.value = response.data;
    let data = Array.isArray(response.data?.data) ? response.data.data : [];

    if (!data.length) {
      const [receivedResponse, sentResponse, acceptedResponse] =
        await Promise.all([
          connexionService.getDemandesRecues(),
          connexionService.getMesDemandes(),
          connexionService.getMesConnexions(),
        ]);

      rawConnexionData.value = {
        received: receivedResponse.data,
        sent: sentResponse.data,
        accepted: acceptedResponse.data,
      };

      const receivedPending = Array.isArray(receivedResponse.data?.data)
        ? receivedResponse.data.data.map((connexion: any) =>
            mapPendingRequest(connexion, null),
          )
        : [];

      const sentPending = Array.isArray(sentResponse.data?.data)
        ? sentResponse.data.data.map((connexion: any) =>
            mapPendingRequest(connexion, currentUserId),
          )
        : [];

      pendingRequests.value = [...receivedPending, ...sentPending];

      acceptedRequests.value = Array.isArray(acceptedResponse.data?.data)
        ? acceptedResponse.data.data.map((connexion: any) =>
            mapAcceptedRequest(connexion, currentUserId),
          )
        : [];

      return;
    }

    pendingRequests.value = data
      .filter((connexion: any) => normalizeStatus(connexion.statut) === "EN_ATTENTE")
      .map((connexion: any) => mapPendingRequest(connexion, currentUserId));

    acceptedRequests.value = data
      .filter(
        (connexion: any) => normalizeStatus(connexion.statut) === "ACCEPTEE",
      )
      .map((connexion: any) => mapAcceptedRequest(connexion, currentUserId));

  } catch (err: any) {
    if (err?.response?.status === 401) {
      error.value =
        err?.response?.data?.message ||
        "Impossible de charger les connexions pour cette session.";
      rawConnexionData.value = err?.response?.data ?? null;
      return;
    }
    error.value =
      err?.response?.data?.message ||
      "Erreur lors du chargement des connexions";
    rawConnexionData.value = err?.response?.data ?? null;
  } finally {
    isLoading.value = false;
  }
};

const acceptRequest = async (id: string) => {
  await connexionService.accepterConnexion(id);
  await loadConnections();
  setActiveTab("accepted");
};

const removeRequest = async (request: ProConnectionRequest) => {
  if (request.status === "sent") {
    await connexionService.supprimerConnexion(request.id);
  } else {
    await connexionService.refuserConnexion(request.id);
  }
  await loadConnections();
};

const removeConnection = async (id: string) => {
  await connexionService.supprimerConnexion(id);
  await loadConnections();
};

const setActiveTab = (tab: "pending" | "accepted") => {
  activeTab.value = tab;
  router.replace({
    path: route.path,
    query: { ...route.query, tab },
  });
};

onMounted(() => {
  syncActiveTabFromRoute();
  loadConnections();
});

watch(() => route.query.tab, syncActiveTabFromRoute);
</script>

<template>
  <div class="connexions-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarStudent v-if="currentRole === 'student'" :isOpen="sidebarOpen" />
    <SidebarProf v-else-if="currentRole === 'prof'" :isOpen="sidebarOpen" />
    <SidebarPro v-else :isOpen="sidebarOpen" />

    <main class="connexions-shell" :class="{ shifted: sidebarOpen }">
      <section class="connexions-panel">
        <div class="page-heading">
          <p>Espace professionnel</p>
          <h1>Connexions</h1>
          <span>Gérez les demandes de connexion des étudiants.</span>
        </div>

        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            :class="{ active: activeTab === tab.key }"
            @click="setActiveTab(tab.key)"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="requests-grid">
          <p v-if="isLoading" class="empty-state">Chargement...</p>
          <p v-else-if="error" class="empty-state">{{ error }}</p>

          <article
            v-for="request in !isLoading && !error ? visibleRequests : []"
            :key="request.id"
            class="request-card"
          >
            <button
              type="button"
              class="avatar"
              @click="router.push(request.profilePath)"
            >
              <img v-if="request.avatar" :src="request.avatar" :alt="request.name" />
              <span v-else>{{ request.initials }}</span>
            </button>
            <div class="request-body">
              <button
                type="button"
                class="name-button"
                @click="router.push(request.profilePath)"
              >
                {{ request.name }}
              </button>
              <p>{{ request.school }} · {{ request.field }}</p>
              <SkillBadges :badges="request.badges" compact />
              <span>{{ request.message }}</span>
              <small>{{ request.time }}</small>

              <div class="request-actions">
                <button
                  v-if="request.canAccept"
                  type="button"
                  @click="acceptRequest(request.id)"
                >
                  Accepter
                </button>
                <button
                  v-if="request.canCancel"
                  type="button"
                  class="soft-danger"
                  @click="removeRequest(request)"
                >
                  {{ request.status === 'sent' ? 'Annuler la demande' : 'Refuser' }}
                </button>
                <button
                  v-if="request.canRemove"
                  type="button"
                  class="soft-danger"
                  @click="removeConnection(request.id)"
                >
                  Retirer
                </button>
                <button type="button" @click="router.push(request.profilePath)">
                  Voir profil
                </button>
              </div>
            </div>
          </article>

          <div
            v-if="!isLoading && !error && !visibleRequests.length"
            class="empty-state"
          >
            <p>{{ emptyStateMessage }}</p>
            <button
              v-if="activeTab === 'pending' && hasAcceptedConnections"
              type="button"
              class="empty-link"
              @click="setActiveTab('accepted')"
            >
              Voir mes connexions
            </button>
            <div
              v-if="rawConnexionData && error"
              class="debug-output"
            >
              <p><strong>Données brutes reçues :</strong></p>
              <pre class="debug-json"
                >{{ JSON.stringify(rawConnexionData, null, 2) }}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.connexions-page {
  min-height: 100vh;
  width: 100vw;
  background: var(--surface-page);
  color: var(--text-dark);
  font-family: var(--font-body);
  padding-top: 50px;
}

.connexions-shell {
  height: calc(100vh - 50px);
  overflow-y: auto;
  padding: 14px;
  transition: padding-left 0.3s ease;
}

.connexions-shell.shifted {
  padding-left: 234px;
}

.connexions-panel,
.page-heading,
.request-card {
  background: var(--white);
  border: 1px solid var(--overlay-navy-08);
  border-radius: var(--radius-card);
  box-shadow: 0 14px 32px var(--overlay-navy-08);
}

.connexions-panel {
  overflow: hidden;
}

.page-heading {
  box-shadow: none;
  border-radius: 0;
  border-width: 0 0 1px;
  padding: 24px;
}

.page-heading p,
.page-heading span,
.request-body p,
.request-body small {
  color: var(--text-gray);
  font-weight: 800;
}

.page-heading h1 {
  color: var(--text-dark);
  font-size: 34px;
  font-weight: 900;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--input-bg);
}

.tabs button,
.request-actions button {
  border-radius: 100px 180px 0px 100px;
  border: 1px solid rgba(17, 24, 39, 0.35);
  background: var(--white);
  color: var(--navy-mid);
  padding: 8px 14px;
  font-weight: 900;
}

.tabs button.active,
.request-actions button:first-child {
  background: var(--purple);
  border-color: var(--purple);
  color: var(--white);
}

.requests-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 14px;
  padding: 18px;
}

.request-card {
  display: flex;
  gap: 14px;
  padding: 16px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--input-bg);
  color: var(--text-dark);
  font-weight: 900;
  flex-shrink: 0;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.request-body {
  display: grid;
  gap: 6px;
}

.name-button {
  justify-self: start;
  background: transparent;
  color: var(--text-dark);
  font-weight: 900;
  padding: 0;
}

.request-body span {
  color: var(--navy-mid);
  font-weight: 800;
}

.request-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.request-actions .soft-danger {
  background: rgba(223, 30, 33, 0.08);
  border-color: rgba(223, 30, 33, 0.2);
  color: var(--error);
}

.empty-state {
  color: var(--text-gray);
  font-weight: 800;
  padding: 16px;
}

.empty-link {
  margin-top: 12px;
  border-radius: 999px;
  border: 1px solid rgba(17, 24, 39, 0.18);
  background: var(--white);
  color: var(--navy-mid);
  padding: 8px 14px;
  font-weight: 900;
}

@media (max-width: 900px) {
  .requests-grid {
    grid-template-columns: 1fr;
  }
}
</style>
