<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import SkillBadges from "../components/exploreStudent/SkillBadges.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import profApi from "@/services/profApi";
import { resolveProfileBadges } from "../utils/profileBadges";
import type {
  RecommendationRequest,
  RecommendationStatus,
} from "./DashboardProfView.vue";

type RecommendationTab = "Tout" | "En attente" | "Acceptées" | "Refusées";

const router = useRouter();
const sidebarOpen = ref(true);
const activeTab = ref<RecommendationTab>("Tout");
const selectedRequest = ref<RecommendationRequest | null>(null);
const writingRequest = ref<RecommendationRequest | null>(null);
const letterDraft = ref("");
const recommendations = ref<RecommendationRequest[]>([]);
const acceptedStatus = "Acceptée" as RecommendationStatus;
const refusedStatus = "Refusée" as RecommendationStatus;
const error = ref<string | null>(null);

const tabs: RecommendationTab[] = ["Tout", "En attente", "Acceptées", "Refusées"];

const filteredRequests = computed(() => {
  if (activeTab.value === "Tout") {
    return recommendations.value;
  }
  if (activeTab.value === "Acceptées") {
    return recommendations.value.filter(
      (request) => request.status === acceptedStatus,
    );
  }
  if (activeTab.value === "Refusées") {
    return recommendations.value.filter(
      (request) => request.status === refusedStatus,
    );
  }

  return recommendations.value.filter(
    (request) => request.status === "En attente",
  );
});

const normalizeRecommendationStatus = (
  status: string,
): RecommendationStatus => {
  if (status === "Acceptée" || status === "AcceptÃ©e" || status === "AcceptÃƒÂ©e") return "Acceptée";
  if (status === "Refusée" || status === "RefusÃ©e" || status === "RefusÃƒÂ©e") return "Refusée";
  return "En attente";
};

const statusClass = (status: RecommendationStatus) => ({
  "is-pending": status === "En attente",
  "is-valid": status === acceptedStatus,
  "is-refused": status === refusedStatus,
});

const resolveAvatar = (path?: string | null) => {
  const value = String(path || "").trim();
  if (!value) return "";
  if (/^https?:\/\//.test(value) || value.startsWith("data:")) return value;
  if (value.startsWith("/")) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
    const backendBase = apiBase.replace(/\/api\/?$/, "");
    return `${backendBase}${value}`;
  }
  if (value.startsWith("uploads/")) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";
    const backendBase = apiBase.replace(/\/api\/?$/, "");
    return `${backendBase}/${value}`;
  }
  return "";
};

const loadRecommendations = async () => {
  error.value = null;
  try {
    const response = await profApi.getProfDashboard();
    recommendations.value = Array.isArray(
      response.data?.data?.recommendationRequests,
    )
      ? response.data.data.recommendationRequests.map((request: any) => ({
          ...request,
          avatar: resolveAvatar(request.avatar),
          status: normalizeRecommendationStatus(request.status),
        }))
      : [];
  } catch (err: any) {
    error.value =
      err?.response?.data?.message ||
      "Impossible de charger les demandes de lettres.";
  }
};

const ensureStudentAttached = async (studentId: string) => {
  try {
    const response = await profApi.getAttachedStudentStatus(studentId);
    if (response?.data?.data?.attached) return true;
    error.value =
      "Ajoutez d'abord cet étudiant à votre liste pour pouvoir traiter sa demande.";
    return false;
  } catch (err: any) {
    error.value =
      err?.response?.data?.message ||
      "Impossible de vérifier si cet étudiant est dans votre liste.";
    return false;
  }
};

const openStudentProfile = (request: RecommendationRequest) => {
  router.push(`/profile/student/${request.studentId}?from=prof`);
};

const openDetailsModal = (request: RecommendationRequest) => {
  selectedRequest.value = request;
};

const closeDetailsModal = () => {
  selectedRequest.value = null;
};

const openWriteModal = (request: RecommendationRequest) => {
  writingRequest.value = request;
  letterDraft.value = request.writtenLetter ?? "";
};

const closeWriteModal = () => {
  writingRequest.value = null;
  letterDraft.value = "";
};

const sendLetter = async () => {
  if (!writingRequest.value) return;
  error.value = null;
  if (!(await ensureStudentAttached(writingRequest.value.studentId))) return;
  try {
    await profApi.updateRecommendationStatus(
      writingRequest.value.id,
      acceptedStatus,
      {
        contenu: letterDraft.value.trim(),
      },
    );
    closeWriteModal();
    closeDetailsModal();
    await loadRecommendations();
  } catch (err: any) {
    error.value =
      err?.response?.data?.message ||
      "Impossible d'accepter et rédiger cette lettre.";
  }
};

const refuseRequest = async (request: RecommendationRequest) => {
  error.value = null;
  if (!(await ensureStudentAttached(request.studentId))) return;
  try {
    await profApi.updateRecommendationStatus(request.id, refusedStatus);
    closeDetailsModal();
    await loadRecommendations();
  } catch (err: any) {
    error.value =
      err?.response?.data?.message || "Impossible de refuser cette lettre.";
  }
};

const studentBadges = (request: RecommendationRequest) => {
  return resolveProfileBadges({
    filiere: request.profileInfo,
    field: request.title,
  });
};

onMounted(() => {
  loadRecommendations();
});
</script>

<template>
  <div class="recommendation-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarProf :isOpen="sidebarOpen" />

    <main
      class="recommendation-shell"
      :class="{ 'recommendation-shellShift': sidebarOpen }"
    >
      <section class="recommendation-panel">
        <div class="recommendation-header">
          <div>
            <p class="recommendation-kicker">Espace professeur</p>
            <h1>Lettres de recommandation</h1>
          </div>
          <div class="recommendation-summary">
            <strong>{{ filteredRequests.length }}</strong>
            <span>demandes</span>
          </div>
        </div>

        <div class="recommendation-tabs" aria-label="Filtres recommandations">
          <button
            v-for="tab in tabs"
            :key="tab"
            type="button"
            class="recommendation-tab"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <p v-if="error" class="page-error">{{ error }}</p>

        <div class="recommendation-list">
          <article
            v-for="request in filteredRequests"
            :key="request.id"
            class="recommendation-card"
            @click="openDetailsModal(request)"
          >
            <button
              type="button"
              class="student-avatar"
              :aria-label="`Voir le profil de ${request.studentName}`"
              @click.stop="openStudentProfile(request)"
            >
              <img v-if="request.avatar" :src="request.avatar" :alt="request.studentName" />
              <span v-else>{{ request.initials }}</span>
            </button>

            <div class="recommendation-content">
              <div class="recommendation-cardTop">
                <div>
                  <button
                    type="button"
                    class="student-name-btn"
                    @click.stop="openStudentProfile(request)"
                  >
                    {{ request.studentName }}
                  </button>
                  <SkillBadges :badges="studentBadges(request)" compact />
                  <p class="profile-info">{{ request.profileInfo }}</p>
                </div>
                <span class="status-badge" :class="statusClass(request.status)">
                  {{ request.status }}
                </span>
              </div>

              <h3>{{ request.title }}</h3>
              <p class="recommendation-message">{{ request.message }}</p>
              <p class="recommendation-date">{{ request.date }}</p>

              <div class="recommendation-actions">
                <button
                  type="button"
                  class="action-btn muted"
                  @click.stop="openDetailsModal(request)"
                >
                  Voir détails
                </button>
                <button
                  v-if="request.status === 'En attente'"
                  type="button"
                  class="action-btn primary"
                  @click.stop="openWriteModal(request)"
                >
                  Accepter et écrire
                </button>
                <button
                  v-if="request.status === 'En attente'"
                  type="button"
                  class="action-btn danger"
                  @click.stop="refuseRequest(request)"
                >
                  Refuser
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <div
      v-if="selectedRequest"
      class="modal-backdrop"
      @click.self="closeDetailsModal"
    >
      <section class="details-modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <p>Détails de la demande</p>
            <button
              type="button"
              class="modal-student-link"
              @click="openStudentProfile(selectedRequest)"
            >
              {{ selectedRequest.studentName }}
            </button>
          </div>
          <button type="button" class="modal-close" @click="closeDetailsModal">
            Ã—
          </button>
        </div>

        <div class="details-grid">
          <div>
            <span>Profil</span>
            <strong>{{ selectedRequest.profileInfo }}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{{ selectedRequest.date }}</strong>
          </div>
          <div>
            <span>Statut</span>
            <strong>{{ selectedRequest.status }}</strong>
          </div>
        </div>

        <div class="details-section">
          <span>Titre</span>
          <h3>{{ selectedRequest.title }}</h3>
        </div>

        <div class="details-section">
          <span>Message étudiant</span>
          <p>{{ selectedRequest.message }}</p>
        </div>

        <div v-if="selectedRequest.writtenLetter" class="details-section">
          <span>Lettre écrite</span>
          <p>{{ selectedRequest.writtenLetter }}</p>
        </div>

        <p v-if="error" class="page-error">{{ error }}</p>

        <div class="modal-actions">
          <button
            type="button"
            class="action-btn muted"
            @click="closeDetailsModal"
          >
            Fermer
          </button>
          <button
            v-if="selectedRequest.status === 'En attente'"
            type="button"
            class="action-btn primary"
            @click="openWriteModal(selectedRequest)"
          >
            Accepter et écrire
          </button>
          <button
            v-if="selectedRequest.status === 'En attente'"
            type="button"
            class="action-btn danger"
            @click="refuseRequest(selectedRequest)"
          >
            Refuser
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="writingRequest"
      class="modal-backdrop"
      @click.self="closeWriteModal"
    >
      <section class="details-modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <p>Écrire la lettre</p>
            <h2>{{ writingRequest.studentName }}</h2>
          </div>
          <button type="button" class="modal-close" @click="closeWriteModal">
            Ã—
          </button>
        </div>

        <div class="details-section">
          <span>Demande</span>
          <h3>{{ writingRequest.title }}</h3>
          <p>{{ writingRequest.message }}</p>
        </div>

        <p v-if="error" class="page-error">{{ error }}</p>

        <label class="letter-field">
          <span>Lettre de recommandation</span>
          <textarea
            v-model="letterDraft"
            rows="8"
            placeholder="Écrivez la lettre de recommandation ici..."
          ></textarea>
        </label>

        <div class="modal-actions">
          <button
            type="button"
            class="action-btn muted"
            @click="closeWriteModal"
          >
            Annuler
          </button>
          <button type="button" class="action-btn primary" @click="sendLetter">
            Envoyer
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.recommendation-page {
  min-height: 100vh;
  width: 100vw;
  background: var(--surface-page);
  color: var(--text-dark);
  font-family: var(--font-body);
  padding-top: 50px;
  overflow: hidden;
}

.recommendation-shell {
  height: calc(100vh - 50px);
  overflow-y: auto;
  padding: 20px;
  transition: padding-left 0.3s ease;
}

.recommendation-shellShift {
  padding-left: 236px;
}

.recommendation-panel {
  max-width: none;
  margin: 0;
  background: var(--white);
  border: 1px solid var(--overlay-slate-06);
  border-radius: var(--radius-card);
  box-shadow: 0 18px 40px var(--overlay-slate-09);
  overflow: hidden;
}

.recommendation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 30px 22px;
  border-bottom: 1px solid var(--overlay-slate-border);
}

.recommendation-kicker {
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
}

.recommendation-header h1 {
  color: var(--text-dark);
  font-family: var(--font-head);
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
}

.recommendation-summary {
  display: flex;
  align-items: baseline;
  gap: 6px;
  border-radius: var(--radius-pill);
  background: var(--purple-soft);
  color: var(--purple);
  padding: 10px 16px;
  font-weight: 800;
}

.page-error {
  margin: 16px 30px 0;
  color: var(--danger);
  font-weight: 700;
}

.recommendation-summary span {
  color: var(--text-gray);
  font-size: 13px;
}

.recommendation-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px 30px;
  border-bottom: 1px solid var(--overlay-slate-border-soft);
}

.recommendation-tab {
  height: 40px;
  border: 1px solid rgba(15, 23, 42, 0.25);
  border-radius: 100px 180px 0px 100px;
  background: var(--white);
  color: var(--text-muted);
  padding: 0 22px;
  font-weight: 800;
  box-shadow: 0 2px 8px var(--overlay-slate-06);
}

.recommendation-tab.active {
  border: 2px solid #5b4dff;
  background: #f1f1f5;
  color: var(--navy);
}

.recommendation-list {
  display: grid;
  gap: 16px;
  max-height: 820px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 22px 30px 30px;
}

.recommendation-card {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 16px;
  border: 1px solid var(--overlay-slate-border-soft);
  border-radius: 18px;
  background: var(--white);
  padding: 18px;
  box-shadow: 0 12px 28px var(--overlay-slate-06);
  cursor: pointer;
}

.student-avatar {
  border: 0;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: var(--input-bg);
  color: var(--text-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-head);
  font-weight: 800;
  overflow: hidden;
}

.student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.recommendation-cardTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 10px;
}

.student-name-btn,
.modal-student-link {
  background: transparent;
  color: var(--text-dark);
  font-family: var(--font-head);
  font-weight: 800;
  text-align: left;
}

.student-name-btn {
  font-size: 18px;
}

.profile-info,
.recommendation-date {
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 700;
}

.recommendation-card h3 {
  color: var(--purple);
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 6px;
}

.recommendation-message {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.55;
  margin-bottom: 10px;
}

.status-badge {
  flex-shrink: 0;
  border-radius: var(--radius-pill);
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 800;
}

.status-badge.is-pending {
  background: var(--warning-bg);
  color: #c2410c;
}

.status-badge.is-valid {
  background: var(--success-bg);
  color: var(--success-dark);
}

.status-badge.is-refused {
  background: var(--danger-bg);
  color: var(--danger);
}

.recommendation-actions,
.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.action-btn {
  height: 32px;
  min-width: 98px;
  padding: 0 18px;
  border-radius: 100px 180px 0px 100px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
}

.action-btn.primary {
  background: var(--purple);
  border: 0;
  color: var(--white);
}

.action-btn.danger {
  background: transparent;
  border: 1px solid var(--text-light);
  color: var(--danger);
}

.action-btn.muted {
  background: transparent;
  border: 1px solid var(--text-light);
  color: var(--text-muted);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(17, 24, 39, 0.42);
  padding: 20px;
}

.details-modal {
  width: min(680px, 100%);
  border-radius: 22px;
  background: var(--white);
  padding: 24px;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.modal-header p,
.details-grid span,
.details-section span,
.letter-field span {
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 800;
}

.modal-header h2,
.modal-student-link {
  color: var(--text-dark);
  font-family: var(--font-head);
  font-size: 24px;
  font-weight: 800;
}

.modal-close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--input-bg);
  color: var(--text-dark);
  font-size: 22px;
  line-height: 1;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.details-grid div,
.details-section {
  border: 1px solid var(--overlay-slate-border);
  border-radius: 16px;
  background: var(--surface-subtle);
  padding: 12px 14px;
}

.details-grid strong,
.details-section h3 {
  color: var(--text-dark);
  font-family: var(--font-head);
  font-size: 15px;
  font-weight: 800;
}

.details-section,
.letter-field {
  margin-bottom: 14px;
}

.details-section p {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.55;
}

.letter-field textarea {
  width: 100%;
  border-radius: 16px;
  background: var(--surface-subtle);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: var(--text-dark);
  padding: 12px 14px;
  font: inherit;
  resize: vertical;
  outline: none;
}
</style>

