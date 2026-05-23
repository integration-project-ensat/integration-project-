<script setup lang="ts">
import { computed, ref } from "vue";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";

type ValidationTab =
  | "Tout"
  | "Projets"
  | "Stages"
  | "Attestations"
  | "Refusées";
type ValidationStatus = "En attente" | "Validé" | "Refusé";
type ValidationType = Exclude<ValidationTab, "Tout" | "Refusées">;

interface ValidationRequest {
  id: number;
  studentName: string;
  initials: string;
  type: ValidationType;
  title: string;
  description: string;
  date: string;
  status: ValidationStatus;
  attachments: string[];
}

const sidebarOpen = ref(true);
const activeTab = ref<ValidationTab>("Tout");
const selectedRequest = ref<ValidationRequest | null>(null);

const tabs: ValidationTab[] = [
  "Tout",
  "Projets",
  "Stages",
  "Attestations",
  "Refusées",
];

const requests = ref<ValidationRequest[]>([
  {
    id: 1,
    studentName: "Khadija Bennani",
    initials: "KB",
    type: "Projets",
    title: "Portfolio Web",
    description: "Validation du projet final avec lien GitHub et démonstration.",
    date: "Aujourd'hui, 10:20",
    status: "En attente",
    attachments: ["github.com/khadija/portfolio-web", "Rapport-projet.pdf"],
  },
  {
    id: 2,
    studentName: "Yassine El Amrani",
    initials: "YE",
    type: "Stages",
    title: "Stage PFE DevOps",
    description: "Demande de validation du stage et des missions réalisées.",
    date: "Il y a 35 min",
    status: "En attente",
    attachments: ["Convention-stage.pdf", "Fiche-evaluation.pdf"],
  },
  {
    id: 3,
    studentName: "Sara Alaoui",
    initials: "SA",
    type: "Attestations",
    title: "Attestation de stage Cloud",
    description: "Vérification des informations avant génération de l'attestation.",
    date: "Hier, 16:45",
    status: "Validé",
    attachments: ["Attestation-stage-cloud.pdf"],
  },
  {
    id: 5,
    studentName: "Nora Tazi",
    initials: "NT",
    type: "Projets",
    title: "Application Mobile ENSA",
    description: "Validation de projet mobile avec maquettes et rapport.",
    date: "Il y a 3 j",
    status: "Refusé",
    attachments: ["Maquettes-mobile.fig", "Rapport-mobile.pdf"],
  },
]);

const filteredRequests = computed(() => {
  if (activeTab.value === "Refusées") {
    return requests.value.filter((request) => request.status === "Refusé");
  }

  const activeRequests = requests.value.filter(
    (request) => request.status !== "Refusé",
  );

  if (activeTab.value === "Tout") return activeRequests;
  return activeRequests.filter((request) => request.type === activeTab.value);
});

const statusClass = (status: ValidationStatus) => ({
  "is-pending": status === "En attente",
  "is-valid": status === "Validé",
  "is-refused": status === "Refusé",
});

const updateStatus = (requestId: number, status: ValidationStatus) => {
  const request = requests.value.find((item) => item.id === requestId);
  if (request) request.status = status;
};

const openDetailsModal = (request: ValidationRequest) => {
  selectedRequest.value = request;
};

const closeDetailsModal = () => {
  selectedRequest.value = null;
};

const updateSelectedStatus = (status: ValidationStatus) => {
  if (selectedRequest.value) updateStatus(selectedRequest.value.id, status);
  closeDetailsModal();
};
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

        <div class="validation-list">
          <article
            v-for="request in filteredRequests"
            :key="request.id"
            class="validation-card"
          >
            <div class="student-avatar">{{ request.initials }}</div>

            <div class="validation-content">
              <div class="validation-cardTop">
                <div>
                  <h2>{{ request.studentName }}</h2>
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
                  type="button"
                  class="action-btn primary"
                  @click="updateStatus(request.id, 'Validé')"
                >
                  Valider
                </button>
                <button
                  type="button"
                  class="action-btn danger"
                  @click="updateStatus(request.id, 'Refusé')"
                >
                  Refuser
                </button>
                <button
                  type="button"
                  class="action-btn muted"
                  @click="openDetailsModal(request)"
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
            <h2>{{ selectedRequest.studentName }}</h2>
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
  </div>
</template>

<style scoped>
.validation-page {
  min-height: 100vh;
  width: 100vw;
  background: #eef1fb;
  color: var(--text-dark);
  padding-top: 50px;
  overflow: hidden;
}

.validation-shell {
  height: calc(100vh - 50px);
  overflow-y: auto;
  padding: 28px;
  transition: padding-left 0.3s ease;
}

.validation-shellShift {
  padding-left: 248px;
}

.validation-panel {
  max-width: 1160px;
  margin: 0 auto;
  background: white;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: var(--radius-card);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.09);
  overflow: hidden;
}

.validation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 28px 30px 22px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
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

.validation-summary {
  display: flex;
  align-items: baseline;
  gap: 6px;
  border-radius: var(--radius-pill);
  background: #eeecff;
  color: var(--purple);
  padding: 10px 16px;
  font-weight: 800;
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
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.validation-tab {
  min-height: 34px;
  border: 1px solid rgba(15, 23, 42, 0.25);
  border-radius: var(--radius-pill);
  background: white;
  color: var(--text-gray);
  padding: 0 18px;
  font-weight: 800;
  transition: var(--ease);
}

.validation-tab:hover,
.validation-tab.active {
  background: var(--purple);
  border-color: var(--purple);
  color: white;
  box-shadow: 0 10px 22px rgba(79, 70, 229, 0.22);
}

.validation-list {
  display: grid;
  gap: 16px;
  padding: 22px 30px 30px;
}

.validation-card {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 18px;
  background: white;
  padding: 18px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
  transition: var(--ease);
}

.validation-card:hover {
  background: #f7f7ff;
  transform: translateY(-2px);
}

.student-avatar {
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

.validation-card h2 {
  color: var(--text-dark);
  font-family: var(--font-head);
  font-size: 18px;
  font-weight: 800;
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
  color: #475569;
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

.validation-actions,
.modal-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.action-btn {
  min-height: 36px;
  border-radius: var(--radius-pill);
  padding: 0 16px;
  font-size: 13px;
  font-weight: 800;
  transition: var(--ease);
}

.action-btn.primary,
.action-btn.letter {
  background: var(--purple);
  color: white;
  box-shadow: 0 10px 22px rgba(79, 70, 229, 0.22);
}

.action-btn.danger {
  background: #fef2f2;
  color: #dc2626;
}

.action-btn.muted {
  background: var(--input-bg);
  color: var(--text-dark);
}

.action-btn:hover {
  transform: translateY(-1px);
  filter: brightness(0.98);
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
  background: white;
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

.modal-header h2 {
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

.modal-field {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--text-dark);
  font-weight: 800;
}

.modal-field input,
.modal-field textarea {
  width: 100%;
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: var(--text-dark);
  padding: 12px 14px;
  font: inherit;
  resize: vertical;
}

.modal-field textarea:focus,
.modal-field input:focus {
  border-color: var(--purple);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
  outline: none;
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
  color: #475569;
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
  background: #eeecff;
  color: var(--purple);
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 800;
}

@media (max-width: 860px) {
  .validation-shell,
  .validation-shellShift {
    padding: 16px;
  }

  .validation-header,
  .validation-cardTop {
    align-items: flex-start;
    flex-direction: column;
  }

  .validation-card {
    grid-template-columns: 1fr;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
