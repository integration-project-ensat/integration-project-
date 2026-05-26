<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { SlidersHorizontal } from "lucide-vue-next";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import SkillBadges from "../components/exploreStudent/SkillBadges.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";

type RequestStatus = "En attente" | "Validée" | "Refusée" | "Aucun";
type RequestType =
  | "Projet"
  | "Stage"
  | "Attestation"
  | "Lettre de recommandation"
  | "Aucune demande";

interface ProfStudent {
  id: string;
  initials: string;
  name: string;
  school: string;
  field: string;
  city: string;
  score: number;
  recommendations: number;
  portfolioPath: string;
  requestType: RequestType;
  requestTitle: string;
  requestDescription: string;
  requestDate: string;
  status: RequestStatus;
}

const router = useRouter();
const sidebarOpen = ref(true);
const selectedStudent = ref<ProfStudent | null>(null);
const showFilters = ref(false);

const professorScope = {
  schools: ["ENSA", "FST"],
  fields: ["GINF", "GSEA", "DevOps"],
};

const students = reactive<ProfStudent[]>([
  {
    id: "kb",
    initials: "KB",
    name: "Khadija Bennani",
    school: "ENSA",
    field: "GINF",
    city: "Tanger",
    score: 92,
    recommendations: 540,
    portfolioPath: "/projects/portfolio-web",
    requestType: "Projet",
    requestTitle: "Portfolio Web",
    requestDescription: "Validation du projet final avec lien GitHub et démonstration.",
    requestDate: "Aujourd'hui, 10:20",
    status: "En attente",
  },
  {
    id: "ye",
    initials: "YE",
    name: "Yassine El Amrani",
    school: "ENSA",
    field: "DevOps",
    city: "Tanger",
    score: 85,
    recommendations: 310,
    portfolioPath: "/projects/stage-pfe-devops",
    requestType: "Stage",
    requestTitle: "Stage PFE DevOps",
    requestDescription: "Demande de validation du stage et des missions réalisées.",
    requestDate: "Il y a 35 min",
    status: "En attente",
  },
  {
    id: "sa",
    initials: "SA",
    name: "Sara Alaoui",
    school: "FST",
    field: "GSEA",
    city: "Fès",
    score: 95,
    recommendations: 680,
    portfolioPath: "/projects/attestation-cloud",
    requestType: "Attestation",
    requestTitle: "Attestation de stage Cloud",
    requestDescription: "Attestation demandée après validation du stage cloud.",
    requestDate: "Hier, 16:45",
    status: "Validée",
  },
  {
    id: "al",
    initials: "AL",
    name: "Amine Lahlou",
    school: "ENSA",
    field: "GINF",
    city: "Tanger",
    score: 78,
    recommendations: 190,
    portfolioPath: "/projects/suivi-pfe",
    requestType: "Projet",
    requestTitle: "Plateforme de suivi PFE",
    requestDescription: "Validation de la version finale de la plateforme.",
    requestDate: "Aujourd'hui, 09:05",
    status: "En attente",
  },
  {
    id: "nt",
    initials: "NT",
    name: "Nora Tazi",
    school: "ENSA",
    field: "GINF",
    city: "Tanger",
    score: 88,
    recommendations: 260,
    portfolioPath: "/projects/mobile-ensa",
    requestType: "Projet",
    requestTitle: "Application Mobile ENSA",
    requestDescription: "Demande refusée à cause de documents manquants.",
    requestDate: "Il y a 3 j",
    status: "Refusée",
  },
  {
    id: "mb",
    initials: "MB",
    name: "Mehdi Berrada",
    school: "ENSA",
    field: "GINF",
    city: "Tanger",
    score: 81,
    recommendations: 140,
    portfolioPath: "/projects/cybersecurity-lab",
    requestType: "Lettre de recommandation",
    requestTitle: "Recommandation concours cybersécurité",
    requestDescription: "Demande de lettre pour un concours technique.",
    requestDate: "Il y a 3 j",
    status: "En attente",
  },
  {
    id: "rh",
    initials: "RH",
    name: "Rania Haddad",
    school: "FST",
    field: "GSEA",
    city: "Fès",
    score: 74,
    recommendations: 95,
    portfolioPath: "/projects/embedded-sensors",
    requestType: "Aucune demande",
    requestTitle: "Aucune demande active",
    requestDescription: "Aucune demande de validation pour le moment.",
    requestDate: "-",
    status: "Aucun",
  },
]);

const schoolFilter = ref("Toutes");
const fieldFilter = ref("Toutes");
const cityFilter = ref("Toutes");
const statusFilter = ref("Toutes");

const scopedStudents = computed(() =>
  students.filter(
    (student) =>
      professorScope.schools.includes(student.school) &&
      professorScope.fields.includes(student.field),
  ),
);

const schools = computed(() => [
  "Toutes",
  ...new Set(scopedStudents.value.map((student) => student.school)),
]);
const fields = computed(() => [
  "Toutes",
  ...new Set(scopedStudents.value.map((student) => student.field)),
]);
const cities = computed(() => [
  "Toutes",
  ...new Set(scopedStudents.value.map((student) => student.city)),
]);
const statuses = ["Toutes", "En attente", "Validées", "Refusées", "Aucune demande"];

const filteredStudents = computed(() =>
  scopedStudents.value.filter((student) => {
    const matchesSchool =
      schoolFilter.value === "Toutes" || student.school === schoolFilter.value;
    const matchesField =
      fieldFilter.value === "Toutes" || student.field === fieldFilter.value;
    const matchesCity =
      cityFilter.value === "Toutes" || student.city === cityFilter.value;
    const matchesStatus =
      statusFilter.value === "Toutes" ||
      (statusFilter.value === "Validées" && student.status === "Validée") ||
      (statusFilter.value === "Refusées" && student.status === "Refusée") ||
      (statusFilter.value === "Aucune demande" && student.status === "Aucun") ||
      student.status === statusFilter.value;

    return matchesSchool && matchesField && matchesCity && matchesStatus;
  }),
);

const stats = computed(() => ({
  total: scopedStudents.value.length,
  pending: scopedStudents.value.filter((student) => student.status === "En attente")
    .length,
  accepted: scopedStudents.value.filter((student) => student.status === "Validée")
    .length,
  refused: scopedStudents.value.filter((student) => student.status === "Refusée")
    .length,
}));

const statCards = computed(() => [
  { label: "Total étudiants", value: stats.value.total },
  { label: "Demandes en attente", value: stats.value.pending },
  { label: "Validations acceptées", value: stats.value.accepted },
  { label: "Validations refusées", value: stats.value.refused },
]);

const statusClass = (status: RequestStatus) => ({
  "is-pending": status === "En attente",
  "is-valid": status === "Validée",
  "is-refused": status === "Refusée",
  "is-empty": status === "Aucun",
});

const updateStatus = (student: ProfStudent, status: "Validée" | "Refusée") => {
  student.status = status;
  if (selectedStudent.value?.id === student.id) selectedStudent.value.status = status;
};

const openStudentProfile = (student: ProfStudent) => {
  router.push(`/profile/student/${student.id}`);
};

const openPortfolio = (student: ProfStudent) => {
  router.push(student.portfolioPath);
};

const studentBadges = (student: ProfStudent) => {
  const field = student.field.toLowerCase();
  if (field.includes("devops")) return ["🌊 DevOps", "🔐 Security Aware"];
  if (field.includes("gsea")) return ["🧠 AI / Data", "🌐 Web Developer"];
  if (field.includes("ginf")) return ["🌐 Web Developer", "🏆 Hackathon Participant"];
  return ["🌐 Web Developer"];
};
</script>

<template>
  <div class="students-page">
    <Topbar @toggleSidebar="sidebarOpen = !sidebarOpen" />
    <SidebarProf :isOpen="sidebarOpen" />

    <main class="students-shell" :class="{ shifted: sidebarOpen }">
      <section class="students-panel">
        <div class="page-heading">
          <div>
            <p>Espace professeur</p>
            <h1>Mes étudiants</h1>
            <span>Liste des étudiants liés à vos filières et écoles.</span>
          </div>
        </div>

        <div class="stats-grid">
          <article v-for="card in statCards" :key="card.label" class="stat-card">
            <span>{{ card.label }}</span>
            <strong>{{ card.value }}</strong>
          </article>
        </div>

        <div class="students-table-card">
          <div class="table-title">
            <div>
              <h2>Étudiants liés</h2>
              <span>{{ filteredStudents.length }} étudiants affichés</span>
            </div>

            <button
              type="button"
              class="filter-toggle"
              :class="{ active: showFilters }"
              @click="showFilters = !showFilters"
            >
              <SlidersHorizontal class="filter-icon" />
              Filtrer
            </button>
          </div>

          <div v-if="showFilters" class="filters-panel">
            <label>
              École / Faculté
              <select v-model="schoolFilter">
                <option v-for="school in schools" :key="school">{{ school }}</option>
              </select>
            </label>
            <label>
              Filière
              <select v-model="fieldFilter">
                <option v-for="field in fields" :key="field">{{ field }}</option>
              </select>
            </label>
            <label>
              Ville
              <select v-model="cityFilter">
                <option v-for="city in cities" :key="city">{{ city }}</option>
              </select>
            </label>
            <label>
              Statut demande
              <select v-model="statusFilter">
                <option v-for="status in statuses" :key="status">{{ status }}</option>
              </select>
            </label>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>École / Faculté</th>
                  <th>Filière</th>
                  <th>Ville</th>
                  <th>Score</th>
                  <th>Recommandations</th>
                  <th>Portfolio</th>
                  <th>Demande</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in filteredStudents" :key="student.id">
                  <td>
                    <button
                      type="button"
                      class="profile-cell"
                      @click="openStudentProfile(student)"
                    >
                      <span>{{ student.initials }}</span>
                      <div>
                        <strong>{{ student.name }}</strong>
                        <SkillBadges :badges="studentBadges(student)" compact />
                      </div>
                    </button>
                  </td>
                  <td>{{ student.school }}</td>
                  <td>{{ student.field }}</td>
                  <td>{{ student.city }}</td>
                  <td><span class="score-pill">{{ student.score }}+</span></td>
                  <td>{{ student.recommendations }}+</td>
                  <td>
                    <button type="button" class="table-btn" @click="openPortfolio(student)">
                      Portfolio
                    </button>
                  </td>
                  <td>{{ student.requestType }}</td>
                  <td>
                    <span class="status-badge" :class="statusClass(student.status)">
                      {{ student.status }}
                    </span>
                  </td>
                  <td>
                    <div class="action-row">
                      <button type="button" @click="openPortfolio(student)">
                        Voir portfolio
                      </button>
                      <button
                        type="button"
                        :disabled="student.status === 'Aucun'"
                        @click="selectedStudent = student"
                      >
                        Voir demande
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>

    <div v-if="selectedStudent" class="modal-backdrop" @click.self="selectedStudent = null">
      <section class="details-modal">
        <button type="button" class="modal-close" @click="selectedStudent = null">
          ×
        </button>
        <p>Détails de la demande</p>
        <h2>{{ selectedStudent.name }}</h2>

        <div class="details-grid">
          <article>
            <span>Type</span>
            <strong>{{ selectedStudent.requestType }}</strong>
          </article>
          <article>
            <span>Date</span>
            <strong>{{ selectedStudent.requestDate }}</strong>
          </article>
          <article>
            <span>Statut</span>
            <strong>{{ selectedStudent.status }}</strong>
          </article>
        </div>

        <div class="details-block">
          <span>Titre</span>
          <strong>{{ selectedStudent.requestTitle }}</strong>
        </div>
        <div class="details-block">
          <span>Description</span>
          <strong>{{ selectedStudent.requestDescription }}</strong>
        </div>

        <div class="modal-actions">
          <button type="button" class="outline-btn" @click="selectedStudent = null">
            Fermer
          </button>
          <button
            v-if="selectedStudent.status === 'En attente'"
            type="button"
            class="primary-btn"
            @click="updateStatus(selectedStudent, 'Validée')"
          >
            Valider
          </button>
          <button
            v-if="selectedStudent.status === 'En attente'"
            type="button"
            class="danger-btn"
            @click="updateStatus(selectedStudent, 'Refusée')"
          >
            Refuser
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.students-page {
  min-height: 100vh;
  width: 100vw;
  background: #eef1fb;
  color: var(--text-dark);
  font-family: var(--font-body);
  padding-top: 50px;
}

.students-shell {
  height: calc(100vh - 50px);
  overflow-y: auto;
  padding: 14px;
  transition: padding-left 0.3s ease;
}

.students-shell.shifted {
  padding-left: 234px;
}

.students-panel {
  display: grid;
  gap: 16px;
}

.page-heading,
.stat-card,
.students-table-card,
.details-modal {
  background: white;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: var(--radius-card);
  box-shadow: 0 14px 32px rgba(17, 24, 39, 0.08);
}

.page-heading {
  padding: 24px;
}

.page-heading p,
.page-heading span,
.stat-card span,
.details-modal p,
.details-block span,
.details-grid span {
  color: var(--text-gray);
  font-weight: 800;
}

.page-heading h1 {
  color: var(--text-dark);
  font-size: 34px;
  font-weight: 900;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(160px, 1fr));
  gap: 14px;
}

.stat-card {
  padding: 18px;
}

.stat-card strong {
  display: block;
  margin-top: 12px;
  color: var(--purple);
  font-size: 32px;
  font-weight: 900;
}

.students-table-card {
  overflow: hidden;
}

.table-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border-bottom: 1px solid var(--input-bg);
}

.table-title h2 {
  color: var(--text-dark);
  font-size: 22px;
  font-weight: 900;
}

.table-title span {
  color: var(--text-gray);
  font-weight: 800;
}

.filter-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  border-radius: 100px 180px 0px 100px;
  border: 1px solid rgba(17, 24, 39, 0.35);
  background: white;
  color: var(--navy-mid);
  padding: 0 14px;
  font-weight: 900;
}

.filter-toggle.active {
  background: var(--purple);
  border-color: var(--purple);
  color: white;
}

.filter-icon {
  width: 17px;
  height: 17px;
}

.filters-panel {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--input-bg);
  background: rgba(229, 231, 235, 0.45);
}

.filters-panel label {
  display: grid;
  gap: 7px;
  color: var(--text-gray);
  font-size: 12px;
  font-weight: 900;
}

.filters-panel select {
  height: 36px;
  border: 0;
  border-radius: var(--radius-pill);
  background: white;
  color: var(--text-dark);
  padding: 0 14px;
  font-weight: 800;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid var(--input-bg);
  color: var(--navy-mid);
  font-weight: 800;
  white-space: nowrap;
}

th {
  color: var(--text-gray);
  font-size: 12px;
  text-transform: uppercase;
}

.profile-cell {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 0;
  background: transparent;
  color: var(--text-dark);
  font-weight: 900;
}

.profile-cell span {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--input-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.score-pill,
.status-badge {
  border-radius: var(--radius-pill);
  padding: 7px 12px;
}

.score-pill {
  background: rgba(79, 70, 229, 0.12);
  color: var(--purple);
}

.status-badge.is-pending {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}

.status-badge.is-valid {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.status-badge.is-refused {
  background: rgba(239, 68, 68, 0.12);
  color: var(--error);
}

.status-badge.is-empty {
  background: var(--input-bg);
  color: var(--text-gray);
}

.table-btn,
.primary-btn,
.outline-btn,
.danger-btn,
.action-row button {
  border-radius: 100px 180px 0 100px;
  border: 1px solid rgba(17, 24, 39, 0.35);
  background: white;
  color: var(--navy-mid);
  padding: 8px 12px;
  font-weight: 800;
  cursor: pointer;
}

.primary-btn {
  border: 1px solid var(--purple);
  background: var(--purple);
  color: white;
}

.outline-btn {
  background: white;
  color: var(--text-navy);
}

.danger-btn {
  border: 1px solid rgba(239, 68, 68, 0.2);
  background: rgba(239, 68, 68, 0.08);
  color: var(--error);
}

.primary-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.action-row {
  display: flex;
  gap: 8px;
}

.action-row button:hover,
.table-btn:hover,
.filter-toggle:hover {
  background: rgba(79, 70, 229, 0.12);
}

.action-row button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.42);
}

.details-modal {
  position: relative;
  width: min(760px, 100%);
  padding: 30px;
}

.modal-close {
  position: absolute;
  top: 22px;
  right: 22px;
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 50%;
  background: var(--input-bg);
  color: var(--text-dark);
  font-size: 26px;
  font-weight: 900;
}

.details-modal h2 {
  margin: 6px 0 22px;
  font-family: var(--font-heading);
  font-size: 34px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.details-grid article,
.details-block {
  border: 1px solid rgba(122, 127, 136, 0.22);
  border-radius: var(--radius-md);
  background: rgba(248, 250, 252, 0.8);
  padding: 16px;
  display: grid;
  gap: 8px;
}

.details-block {
  margin-top: 14px;
}

.modal-actions {
  margin-top: 20px;
}

@media (max-width: 1100px) {
  .students-shell.shifted {
    padding-left: 14px;
  }

  .stats-grid,
  .filters-panel {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }
}

@media (max-width: 680px) {
  .stats-grid,
  .filters-card,
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
