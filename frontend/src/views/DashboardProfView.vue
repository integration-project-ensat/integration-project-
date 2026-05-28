<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import profApi from "@/services/profApi";

export type ValidationStatus = "En attente" | "Validé" | "Refusé";
export type RecommendationStatus = "En attente" | "Acceptée" | "Refusée";

export interface ValidationRequest {
  id: string;
  studentId: string;
  studentName: string;
  initials: string;
  type: string;
  title: string;
  description: string;
  date: string;
  status: ValidationStatus;
}

export interface RecommendationRequest {
  id: string;
  studentId: string;
  studentName: string;
  initials: string;
  profileInfo: string;
  title: string;
  message: string;
  date: string;
  status: RecommendationStatus;
  writtenLetter?: string;
}

const router = useRouter();
const sidebarOpen = ref(true);
const selectedRequest = ref<ValidationRequest | null>(null);
const selectedRecommendation = ref<RecommendationRequest | null>(null);
const writingRecommendation = ref<RecommendationRequest | null>(null);
const letterDraft = ref("");
const stats = ref({ total: 0, pending: 0, validated: 0, refused: 0 });
const requests = ref<ValidationRequest[]>([]);
const recommendations = ref<RecommendationRequest[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const statusSections: Array<{
  key: "pending" | "validated" | "refused";
  title: ValidationStatus;
}> = [
  { key: "pending", title: "En attente" },
  { key: "validated", title: "Validé" },
  { key: "refused", title: "Refusé" },
];

const statCards = [
  { label: "Total demandes", key: "total" },
  { label: "En attente", key: "pending" },
  { label: "Validées", key: "validated" },
  { label: "Refusées", key: "refused" },
] as const;

const recommendationStatCards = [
  { label: "Total lettres", key: "total" },
  { label: "En attente", key: "pending" },
  { label: "Acceptées", key: "accepted" },
  { label: "Refusées", key: "refused" },
] as const;

const recommendationSections: Array<{
  key: "pending" | "accepted" | "refused";
  title: RecommendationStatus;
}> = [
  { key: "pending", title: "En attente" },
  { key: "accepted", title: "Acceptée" },
  { key: "refused", title: "Refusée" },
];

const groupedRequests = computed(() => ({
  pending: requests.value.filter((request) => request.status === "En attente"),
  validated: requests.value.filter((request) => request.status === "Validé"),
  refused: requests.value.filter((request) => request.status === "Refusé"),
}));

const groupedRecommendations = computed(() => ({
  pending: recommendations.value.filter((request) => request.status === "En attente"),
  accepted: recommendations.value.filter((request) => request.status === "Acceptée"),
  refused: recommendations.value.filter((request) => request.status === "Refusée"),
}));

const recommendationStats = computed(() => ({
  total: recommendations.value.length,
  pending: groupedRecommendations.value.pending.length,
  accepted: groupedRecommendations.value.accepted.length,
  refused: groupedRecommendations.value.refused.length,
}));

const statusClass = (status: ValidationStatus) => ({
  "is-pending": status === "En attente",
  "is-valid": status === "Validé",
  "is-refused": status === "Refusé",
});

const recommendationStatusClass = (status: RecommendationStatus) => ({
  "is-pending": status === "En attente",
  "is-valid": status === "Acceptée",
  "is-refused": status === "Refusée",
});

const openDetailsModal = (request: ValidationRequest) => {
  selectedRequest.value = request;
};

const closeDetailsModal = () => {
  selectedRequest.value = null;
};

const openRecommendationDetails = (request: RecommendationRequest) => {
  selectedRecommendation.value = request;
};

const closeRecommendationDetails = () => {
  selectedRecommendation.value = null;
};

const updateSelectedStatus = (status: ValidationStatus) => {
  if (!selectedRequest.value) return;
  const request = requests.value.find((item) => item.id === selectedRequest.value?.id);
  if (request) request.status = status;
  closeDetailsModal();
};

const openWriteRecommendationModal = (request: RecommendationRequest) => {
  selectedRecommendation.value = null;
  writingRecommendation.value = request;
  letterDraft.value = request.writtenLetter ?? "";
};

const closeWriteRecommendationModal = () => {
  writingRecommendation.value = null;
  letterDraft.value = "";
};

const sendRecommendationLetter = () => {
  if (writingRecommendation.value) {
    const request = recommendations.value.find((item) => item.id === writingRecommendation.value?.id);
    if (request) {
      request.status = "Acceptée";
      request.writtenLetter = letterDraft.value.trim();
    }
  }
  closeWriteRecommendationModal();
};

const refuseSelectedRecommendation = () => {
  if (selectedRecommendation.value) {
    const request = recommendations.value.find((item) => item.id === selectedRecommendation.value?.id);
    if (request) request.status = "Refusée";
  }
  closeRecommendationDetails();
};

const openStudentProfile = (request: ValidationRequest | RecommendationRequest) => {
  router.push(`/profile/student/${request.studentId}`);
};

const loadDashboard = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await profApi.getProfDashboard();
    if (response.data?.success) {
      const data = response.data.data;
      stats.value = data.stats ?? stats.value;
      requests.value = Array.isArray(data.validationRequests) ? data.validationRequests : [];
      recommendations.value = Array.isArray(data.recommendationRequests) ? data.recommendationRequests : [];
    } else {
      error.value = response.data?.message || "Impossible de charger le dashboard";
    }
  } catch (err: any) {
    console.error(err);
    error.value = err?.response?.data?.message || "Erreur lors du chargement du dashboard";
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadDashboard();
});
</script>

<template>
  <div class="dashboard-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarProf :isOpen="sidebarOpen" />

    <main
      class="dashboard-shell"
      :class="{ 'dashboard-shellShift': sidebarOpen }"
    >
      <section class="dashboard-panel">
        <div class="dashboard-header">
          <div>
            <p class="dashboard-kicker">Espace professeur</p>
            <h1>Dashboard</h1>
          </div>
        </div>

        <div class="stats-grid">
          <article v-for="card in statCards" :key="card.key" class="stat-card">
            <span>{{ card.label }}</span>
            <strong>{{ stats[card.key] }}</strong>
          </article>
        </div>

        <div class="status-grid">
          <section
            v-for="section in statusSections"
            :key="section.key"
            class="status-panel"
          >
            <div class="status-title">
              <h2>{{ section.title }}</h2>
              <span>{{ groupedRequests[section.key].length }}</span>
            </div>

            <div class="request-list">
              <article
                v-for="request in groupedRequests[section.key]"
                :key="request.id"
                class="request-row"
                @click="openDetailsModal(request)"
              >
                <button
                  type="button"
                  class="student-avatar"
                  :aria-label="`Voir le profil de ${request.studentName}`"
                  @click.stop="openStudentProfile(request)"
                >
                  {{ request.initials }}
                </button>

                <div class="request-content">
                  <button
                    type="button"
                    class="student-name-btn"
                    @click.stop="openStudentProfile(request)"
                  >
                    {{ request.studentName }}
                  </button>
                  <p>{{ request.type }} · {{ request.title }}</p>
                  <span>{{ request.date }}</span>
                </div>

                <span class="status-badge" :class="statusClass(request.status)">
                  {{ request.status }}
                </span>
              </article>

              <p
                v-if="!groupedRequests[section.key].length"
                class="empty-state"
              >
                Aucune demande
              </p>
            </div>
          </section>
        </div>

        <div class="dashboard-sectionHeader">
          <div>
            <p class="dashboard-kicker">Demandes de lettres</p>
            <h2>Lettres de recommandation</h2>
          </div>
        </div>

        <div class="stats-grid">
          <article
            v-for="card in recommendationStatCards"
            :key="card.key"
            class="stat-card"
          >
            <span>{{ card.label }}</span>
            <strong>{{ recommendationStats[card.key] }}</strong>
          </article>
        </div>

        <div class="status-grid">
          <section
            v-for="section in recommendationSections"
            :key="section.key"
            class="status-panel"
          >
            <div class="status-title">
              <h2>{{ section.title }}</h2>
              <span>{{ groupedRecommendations[section.key].length }}</span>
            </div>

            <div class="request-list">
              <article
                v-for="request in groupedRecommendations[section.key]"
                :key="request.id"
                class="request-row"
                @click="openRecommendationDetails(request)"
              >
                <button
                  type="button"
                  class="student-avatar"
                  :aria-label="`Voir le profil de ${request.studentName}`"
                  @click.stop="openStudentProfile(request)"
                >
                  {{ request.initials }}
                </button>

                <div class="request-content">
                  <button
                    type="button"
                    class="student-name-btn"
                    @click.stop="openStudentProfile(request)"
                  >
                    {{ request.studentName }}
                  </button>
                  <p>Lettre · {{ request.title }}</p>
                  <span>{{ request.date }}</span>
                </div>

                <span
                  class="status-badge"
                  :class="recommendationStatusClass(request.status)"
                >
                  {{ request.status }}
                </span>
              </article>

              <p
                v-if="!groupedRecommendations[section.key].length"
                class="empty-state"
              >
                Aucune demande
              </p>
            </div>
          </section>
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
              v-for="attachment in selectedRequest.attachments"
              :key="attachment"
              href="#"
              @click.prevent
            >
              {{ attachment }}
            </a>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="action-btn muted" @click="closeDetailsModal">
            Fermer
          </button>
          <button
            type="button"
            class="action-btn primary"
            @click="updateSelectedStatus('Validé')"
          >
            Valider
          </button>
          <button
            type="button"
            class="action-btn danger"
            @click="updateSelectedStatus('Refusé')"
          >
            Refuser
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="selectedRecommendation"
      class="modal-backdrop"
      @click.self="closeRecommendationDetails"
    >
      <section class="details-modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <p>Détails de la lettre</p>
            <button
              type="button"
              class="modal-student-link"
              @click="openStudentProfile(selectedRecommendation)"
            >
              {{ selectedRecommendation.studentName }}
            </button>
          </div>
          <button
            type="button"
            class="modal-close"
            @click="closeRecommendationDetails"
          >
            ×
          </button>
        </div>

        <div class="details-grid">
          <div>
            <span>Profil</span>
            <strong>{{ selectedRecommendation.profileInfo }}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{{ selectedRecommendation.date }}</strong>
          </div>
          <div>
            <span>Statut</span>
            <strong>{{ selectedRecommendation.status }}</strong>
          </div>
        </div>

        <div class="details-section">
          <span>Titre</span>
          <h3>{{ selectedRecommendation.title }}</h3>
        </div>

        <div class="details-section">
          <span>Message étudiant</span>
          <p>{{ selectedRecommendation.message }}</p>
        </div>

        <div v-if="selectedRecommendation.writtenLetter" class="details-section">
          <span>Lettre écrite</span>
          <p>{{ selectedRecommendation.writtenLetter }}</p>
        </div>

        <div class="modal-actions">
          <button
            type="button"
            class="action-btn muted"
            @click="closeRecommendationDetails"
          >
            Fermer
          </button>
          <button
            type="button"
            class="action-btn primary"
            @click="openWriteRecommendationModal(selectedRecommendation)"
          >
            Accepter
          </button>
          <button
            type="button"
            class="action-btn danger"
            @click="refuseSelectedRecommendation"
          >
            Refuser
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="writingRecommendation"
      class="modal-backdrop"
      @click.self="closeWriteRecommendationModal"
    >
      <section class="details-modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div>
            <p>Écrire la lettre</p>
            <button
              type="button"
              class="modal-student-link"
              @click="openStudentProfile(writingRecommendation)"
            >
              {{ writingRecommendation.studentName }}
            </button>
          </div>
          <button
            type="button"
            class="modal-close"
            @click="closeWriteRecommendationModal"
          >
            ×
          </button>
        </div>

        <div class="details-section">
          <span>Demande</span>
          <h3>{{ writingRecommendation.title }}</h3>
          <p>{{ writingRecommendation.message }}</p>
        </div>

        <label class="letter-field">
          <span>Lettre de recommandation</span>
          <textarea
            v-model="letterDraft"
            rows="8"
            placeholder="Écrivez la lettre de recommandation ici..."
          />
        </label>

        <div class="modal-actions">
          <button
            type="button"
            class="action-btn muted"
            @click="closeWriteRecommendationModal"
          >
            Annuler
          </button>
          <button
            type="button"
            class="action-btn primary"
            @click="sendRecommendationLetter"
          >
            Envoyer
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  width: 100vw;
  background: #eef1fb;
  color: var(--text-dark);
  font-family: var(--font-body);
  padding-top: 50px;
  overflow: hidden;
}

.dashboard-shell {
  height: calc(100vh - 50px);
  overflow-y: auto;
  padding: 16px;
  transition: padding-left 0.3s ease;
}

.dashboard-shellShift {
  padding-left: 264px;
}

.dashboard-panel {
  max-width: none;
  margin: 0;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.dashboard-kicker {
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 6px;
}

.dashboard-header h1 {
  color: var(--text-dark);
  font-family: var(--font-body);
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
}

.dashboard-sectionHeader {
  margin: 22px 0 14px;
}

.dashboard-sectionHeader h2 {
  color: var(--text-dark);
  font-family: var(--font-body);
  font-size: 26px;
  font-weight: 800;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.stat-card,
.status-panel,
.request-row,
.details-modal {
  background: white;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.08);
}

.stat-card {
  border-radius: var(--radius-card);
  padding: 18px;
}

.stat-card span {
  color: var(--text-gray);
  font-size: 13px;
  font-weight: 800;
}

.stat-card strong {
  display: block;
  color: var(--purple);
  font-family: var(--font-body);
  font-size: 34px;
  font-weight: 800;
  margin-top: 8px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.status-panel {
  border-radius: var(--radius-card);
  overflow: hidden;
}

.status-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  padding: 16px;
}

.status-title h2 {
  color: var(--text-dark);
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 800;
}

.status-title span {
  border-radius: var(--radius-pill);
  background: #eeecff;
  color: var(--purple);
  padding: 6px 11px;
  font-weight: 800;
}

.request-list {
  display: grid;
  gap: 10px;
  max-height: 360px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 14px;
}

.request-list::-webkit-scrollbar {
  width: 8px;
}

.request-list::-webkit-scrollbar-track {
  background: rgba(2, 6, 23, 0.04);
  border-radius: 9999px;
}

.request-list::-webkit-scrollbar-thumb {
  background: rgba(2, 6, 23, 0.18);
  border-radius: 9999px;
}

.request-row {
  display: grid;
  grid-template-columns: 42px 1fr auto;
  align-items: center;
  gap: 12px;
  border-radius: 16px;
  padding: 12px;
  cursor: pointer;
  transition: var(--ease);
}

.request-row:hover {
  background: #f7f7ff;
  transform: translateY(-1px);
}

.student-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--input-bg);
  color: var(--text-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-body);
  font-weight: 800;
}

.student-name-btn,
.modal-student-link {
  background: transparent;
  color: var(--text-dark);
  font-family: var(--font-body);
  font-weight: 800;
  text-align: left;
}

.request-content p {
  color: #475569;
  font-size: 13px;
  font-weight: 700;
  margin-top: 3px;
}

.request-content span,
.empty-state {
  color: var(--text-gray);
  font-size: 12px;
  font-weight: 700;
}

.status-badge {
  border-radius: var(--radius-pill);
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 800;
}

.status-badge.is-pending {
  background: #fff7ed;
  color: #c2410c;
}

.status-badge.is-valid {
  background: #ecfdf5;
  color: #047857;
}

.status-badge.is-refused {
  background: #fef2f2;
  color: #dc2626;
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
  width: min(640px, 100%);
  border-radius: 22px;
  padding: 24px;
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
  font-size: 24px;
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
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 16px;
  background: #f8fafc;
  padding: 12px 14px;
}

.details-grid span,
.details-section span,
.letter-field span {
  display: block;
  color: var(--text-gray);
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 6px;
}

.details-grid strong,
.details-section h3 {
  color: var(--text-dark);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 800;
}

.details-section {
  margin-bottom: 14px;
}

.letter-field {
  display: grid;
  gap: 8px;
  margin-bottom: 14px;
}

.details-section p {
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.55;
}

.letter-field textarea {
  width: 100%;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: var(--text-dark);
  padding: 12px 14px;
  font: inherit;
  resize: vertical;
  outline: none;
}

.letter-field textarea:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
}

.attachment-list,
.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-list a {
  border-radius: var(--radius-pill);
  background: #eeecff;
  color: var(--purple);
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 800;
}

.modal-actions {
  margin-top: 16px;
}

.action-btn {
  min-height: 36px;
  border-radius: var(--radius-pill);
  padding: 0 16px;
  font-size: 13px;
  font-weight: 800;
  transition: var(--ease);
}

.action-btn.primary {
  background: var(--purple);
  color: white;
}

.action-btn.danger {
  background: #fef2f2;
  color: #dc2626;
}

.action-btn.muted {
  background: var(--input-bg);
  color: var(--text-dark);
}

@media (max-width: 1100px) {
  .stats-grid,
  .status-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .dashboard-shell,
  .dashboard-shellShift {
    padding: 16px;
  }

  .stats-grid,
  .status-grid,
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>

