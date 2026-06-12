<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import SkillBadges from "../components/exploreStudent/SkillBadges.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import profApi from "@/services/profApi";
import { resolveProfileBadges } from "../utils/profileBadges";
import type {
  ValidationRequest,
  ValidationStatus,
} from "./DashboardProfView.vue";

type ValidationTab = "Tout" | "Projet" | "Stage";

const router = useRouter();
const requests = ref<ValidationRequest[]>([]);
const sidebarOpen = ref(true);
const activeTab = ref<ValidationTab>("Tout");
const selectedRequest = ref<ValidationRequest | null>(null);
const error = ref<string | null>(null);

const tabs: ValidationTab[] = ["Tout", "Projet", "Stage"];

const filteredRequests = computed(() => {
  const activeRequests =
    activeTab.value === "Tout"
      ? requests.value
      : requests.value.filter((request) => request.type === activeTab.value);

  return activeRequests;
});

const normalizeValidationStatus = (status: string): ValidationStatus => {
  if (status === "Validé" || status === "ValidÃ©" || status === "ValidÃƒÂ©") return "Validé";
  if (status === "Refusé" || status === "RefusÃ©" || status === "RefusÃƒÂ©") return "Refusé";
  return "En attente";
};

const statusClass = (status: ValidationStatus) => ({
  "is-pending": status === "En attente",
  "is-valid": status === "Validé",
  "is-refused": status === "Refusé",
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

const loadRequests = async () => {
  error.value = null;
  try {
    const response = await profApi.getProfDashboard();
    requests.value = Array.isArray(response.data?.data?.validationRequests)
      ? response.data.data.validationRequests.map(
          (request: ValidationRequest) => ({
            ...request,
            avatar: resolveAvatar((request as any).avatar),
            status: normalizeValidationStatus(request.status),
          }),
        )
      : [];
  } catch (err: any) {
    error.value =
      err?.response?.data?.message ||
      "Impossible de charger les demandes de validation.";
  }
};

const updateStatus = async (
  request: ValidationRequest,
  status: ValidationStatus,
) => {
  error.value = null;
  if (!(await ensureStudentAttached(request.studentId))) return;
  try {
    await profApi.updateValidationStatus(request, status);
    await loadRequests();
  } catch (err: any) {
    error.value =
      err?.response?.data?.message || "Impossible de mettre à jour ce statut.";
  }
};

const openDetailsModal = (request: ValidationRequest) => {
  selectedRequest.value = request;
};

const closeDetailsModal = () => {
  selectedRequest.value = null;
};

const updateSelectedStatus = async (status: ValidationStatus) => {
  if (selectedRequest.value) {
    await updateStatus(selectedRequest.value, status);
  }
  if (!error.value) {
    closeDetailsModal();
  }
};

const ensureStudentAttached = async (studentId: string) => {
  try {
    const response = await profApi.getAttachedStudentStatus(studentId);
    if (response?.data?.data?.attached) return true;
    error.value =
      "Ajoutez d'abord cet étudiant à votre liste pour pouvoir valider sa demande.";
    return false;
  } catch (err: any) {
    error.value =
      err?.response?.data?.message ||
      "Impossible de vérifier si cet étudiant est dans votre liste.";
    return false;
  }
};

const openStudentProfile = (request: ValidationRequest) => {
  router.push(`/profile/student/${request.studentId}?from=prof`);
};

const studentBadges = (request: ValidationRequest) => {
  return resolveProfileBadges({
    filiere: request.type,
    field: request.title,
    bio: request.description,
  });
};

onMounted(() => {
  loadRequests();
});
</script>

<template>
  <div class="validation-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarProf :isOpen="sidebarOpen" />

    <main
      class="validation-shell"
      :class="{ 'validation-shellShift': sidebarOpen }"
    >
      <section class="validation-panel">
        <div class="validation-header">
          <div>
            <p class="validation-kicker">Espace professeur</p>
            <h1>Validations</h1>
            <span class="validation-subtitle">
              Cette page affiche les validations de projets et de stages. Les
              demandes de lettres sont dans
              <button
                type="button"
                class="inline-link"
                @click="router.push('/prof/recommandations')"
              >
                Lettres de recommandation
              </button>
              .
            </span>
          </div>
          <div class="validation-summary">
            <strong>{{ filteredRequests.length }}</strong>
            <span>demandes</span>
          </div>
        </div>

        <div class="validation-tabs" aria-label="Filtres de validation">
          <button
            v-for="tab in tabs"
            :key="tab"
            type="button"
            class="validation-tab"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <p v-if="error" class="page-error">{{ error }}</p>

        <div class="validation-list">
          <article
            v-for="request in filteredRequests"
            :key="request.id"
            class="validation-card"
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

            <div class="validation-content">
              <div class="validation-cardTop">
                <div>
                  <button
                    type="button"
                    class="student-name-btn"
                    @click.stop="openStudentProfile(request)"
                  >
                    {{ request.studentName }}
                  </button>
                  <SkillBadges :badges="studentBadges(request)" compact />
                  <p class="validation-type">{{ request.type }}</p>
                </div>
                <span class="status-badge" :class="statusClass(request.status)">
                  {{ request.status }}
                </span>
              </div>

              <h3>{{ request.title }}</h3>
              <p class="validation-description">{{ request.description }}</p>
              <p class="validation-date">{{ request.date }}</p>

              <div class="validation-actions">
                <button
                  v-if="request.status === 'En attente'"
                  type="button"
                  class="action-btn primary"
                  @click.stop="updateStatus(request, 'Validé')"
                >
                  Valider
                </button>
                <button
                  v-if="request.status === 'En attente'"
                  type="button"
                  class="action-btn danger"
                  @click.stop="updateStatus(request, 'Refusé')"
                >
                  Refuser
                </button>
                <button
                  type="button"
                  class="action-btn muted"
                  @click.stop="openDetailsModal(request)"
                >
                  Voir détails
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
      <section class="letter-modal" role="dialog" aria-modal="true">
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
            ×
          </button>
        </div>

        <div class="details-grid">
          <div>
            <span>Type</span>
            <strong>{{ selectedRequest.type }}</strong>
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
          <span>Description</span>
          <p>{{ selectedRequest.description }}</p>
        </div>

        <div class="details-section">
          <span>Liens / fichiers joints</span>
          <div class="attachment-list">
            <a
              v-for="attachment in selectedRequest.attachments || []"
              :key="attachment"
              href="#"
              @click.prevent
            >
              {{ attachment }}
            </a>
          </div>
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
            @click="updateSelectedStatus('Validé')"
          >
            Valider
          </button>
          <button
            v-if="selectedRequest.status === 'En attente'"
            type="button"
            class="action-btn danger"
            @click="updateSelectedStatus('Refusé')"
          >
            Refuser
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.validation-page {
  min-height: 100vh;
  width: 100vw;
  background: var(--surface-page);
  color: var(--text-dark);
  font-family: var(--font-body);
  padding-top: 50px;
  overflow: hidden;
}

.validation-shell {
  height: calc(100vh - 50px);
  overflow-y: auto;
  padding: 20px;
  transition: padding-left 0.3s ease;
}

.validation-shellShift {
  padding-left: 236px;
}

.validation-panel {
  max-width: none;
  margin: 0;
  background: var(--white);
  border: 1px solid var(--overlay-slate-06);
  border-radius: var(--radius-card);
  box-shadow: 0 18px 40px var(--overlay-slate-09);
  overflow: hidden;
}

.validation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 30px 22px;
  border-bottom: 1px solid var(--overlay-slate-border);
}

.validation-kicker {
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
}

.validation-header h1 {
  color: var(--text-dark);
  font-family: var(--font-head);
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
}

.validation-subtitle {
  display: block;
  margin-top: 10px;
  color: var(--text-gray);
  font-size: 14px;
  font-weight: 600;
}

.inline-link {
  display: inline;
  background: transparent;
  color: var(--purple);
  font: inherit;
  font-weight: 800;
  text-decoration: underline;
}

.validation-summary {
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

.validation-summary span {
  color: var(--text-gray);
  font-size: 13px;
}

.validation-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px 30px;
  border-bottom: 1px solid var(--overlay-slate-border-soft);
}

.validation-tab {
  height: 40px;
  border: 1px solid rgba(15, 23, 42, 0.25);
  border-radius: 100px 180px 0px 100px;
  background: var(--white);
  color: var(--text-muted);
  padding: 0 22px;
  font-weight: 800;
  box-shadow: 0 2px 8px var(--overlay-slate-06);
}

.validation-tab.active {
  border: 2px solid #5b4dff;
  background: #f1f1f5;
  color: var(--navy);
}

.validation-list {
  display: grid;
  gap: 16px;
  max-height: 960px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 22px 30px 30px;
}

.validation-card {
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

.validation-content {
  min-width: 0;
}

.validation-cardTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 10px;
}

.student-name-btn {
  background: transparent;
  color: var(--text-dark);
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 800;
  text-align: left;
}

.validation-type,
.validation-date {
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 700;
}

.validation-card h3 {
  color: var(--purple);
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 6px;
}

.validation-description {
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

.validation-actions,
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

.letter-modal {
  width: min(640px, 100%);
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

.modal-header p {
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 800;
}

.modal-student-link {
  background: transparent;
  color: var(--text-dark);
  font-family: var(--font-head);
  font-size: 24px;
  font-weight: 800;
  text-align: left;
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

.details-grid span,
.details-section span {
  display: block;
  color: var(--text-gray);
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 6px;
}

.details-grid strong,
.details-section h3 {
  color: var(--text-dark);
  font-family: var(--font-head);
  font-size: 15px;
  font-weight: 800;
}

.details-section {
  margin-bottom: 14px;
}

.details-section p {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.55;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-list a {
  border-radius: var(--radius-pill);
  background: var(--purple-soft);
  color: var(--purple);
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 800;
}
</style>

