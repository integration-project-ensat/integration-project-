<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { SlidersHorizontal } from "../lib/icons";
import SidebarProf from "../components/exploreProf/SidebarProf.vue";
import SkillBadges from "../components/exploreStudent/SkillBadges.vue";
import Topbar from "../components/exploreStudent/Topbar.vue";
import profApi from "@/services/profApi";
import { resolveProfileBadges } from "../utils/profileBadges";

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
  email: string;
  apogee: string;
  school: string;
  field: string;
  city: string;
  score: number;
  recommendations: number;
  badges: string[];
  source: string;
  attachedAt: string;
  profilePath: string;
  portfolioPath: string;
  requestType: RequestType;
  requestTitle: string;
  requestDescription: string;
  requestDate: string;
  status: RequestStatus;
}

const router = useRouter();
const sidebarOpen = ref(true);
const showFilters = ref(false);
const loading = ref(false);
const error = ref("");
const success = ref("");

// FIX 1: Single declaration of `students` using ref (removed duplicate reactive)
const students = ref<ProfStudent[]>([
  {
    id: "kb",
    initials: "KB",
    name: "Khadija Bennani",
    email: "k.bennani@ensa.ma",
    apogee: "ETU001",
    school: "ENSA",
    field: "GINF",
    city: "Tanger",
    score: 92,
    recommendations: 540,
    badges: [],
    source: "Manuel",
    attachedAt: "2024-09-01",
    profilePath: "/students/kb",
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
    email: "y.elamrani@ensa.ma",
    apogee: "ETU002",
    school: "ENSA",
    field: "DevOps",
    city: "Tanger",
    score: 85,
    recommendations: 310,
    badges: [],
    source: "Manuel",
    attachedAt: "2024-09-02",
    profilePath: "/students/ye",
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
    email: "s.alaoui@fst.ma",
    apogee: "ETU003",
    school: "FST",
    field: "GSEA",
    city: "Fès",
    score: 95,
    recommendations: 680,
    badges: [],
    source: "CSV",
    attachedAt: "2024-08-15",
    profilePath: "/students/sa",
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
    email: "a.lahlou@ensa.ma",
    apogee: "ETU004",
    school: "ENSA",
    field: "GINF",
    city: "Tanger",
    score: 78,
    recommendations: 190,
    badges: [],
    source: "Manuel",
    attachedAt: "2024-09-10",
    profilePath: "/students/al",
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
    email: "n.tazi@ensa.ma",
    apogee: "ETU005",
    school: "ENSA",
    field: "GINF",
    city: "Tanger",
    score: 88,
    recommendations: 260,
    badges: [],
    source: "CSV",
    attachedAt: "2024-07-20",
    profilePath: "/students/nt",
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
    email: "m.berrada@ensa.ma",
    apogee: "ETU006",
    school: "ENSA",
    field: "GINF",
    city: "Tanger",
    score: 81,
    recommendations: 140,
    badges: [],
    source: "Manuel",
    attachedAt: "2024-09-05",
    profilePath: "/students/mb",
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
    email: "r.haddad@fst.ma",
    apogee: "ETU007",
    school: "FST",
    field: "GSEA",
    city: "Fès",
    score: 74,
    recommendations: 95,
    badges: [],
    source: "CSV",
    attachedAt: "2024-08-30",
    profilePath: "/students/rh",
    portfolioPath: "/projects/embedded-sensors",
    requestType: "Aucune demande",
    requestTitle: "Aucune demande active",
    requestDescription: "Aucune demande de validation pour le moment.",
    requestDate: "-",
    status: "Aucun",
  },
]);

const showAddModal = ref(false);
const apogeeInput = ref("");
const addingStudent = ref(false);
const importingCsv = ref(false);
const importSummary = ref<null | {
  totalRows: number;
  added: ProfStudent[];
  alreadyLinked: string[];
  missing: string[];
}>(null);

// FIX 2: Added missing `selectedStudent` ref
const selectedStudent = ref<ProfStudent | null>(null);

const schoolFilter = ref("Toutes");
const fieldFilter = ref("Toutes");
const cityFilter = ref("Toutes");
const sourceFilter = ref("Toutes");
// FIX 3: Added missing `statusFilter` ref
const statusFilter = ref("Toutes");

const withResolvedBadges = (student: ProfStudent) => ({
  ...student,
  badges: resolveProfileBadges({
    badges: student.badges,
    filiere: student.field,
    school: student.school,
    field: student.field,
  }),
});

const sourceLabel = (value: string) => (value === "CSV" ? "CSV" : "Manuel");
const formatDate = (value: string) =>
  value ? new Date(value).toLocaleDateString("fr-FR") : "—";

const loadStudents = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await profApi.getAttachedStudents();
    students.value = Array.isArray(response.data?.data)
      ? response.data.data.map(withResolvedBadges)
      : [];
  } catch (err: any) {
    error.value =
      err?.response?.data?.message || "Impossible de charger vos étudiants.";
  } finally {
    loading.value = false;
  }
};

const schools = computed(() => [
  "Toutes",
  ...new Set(students.value.map((s) => s.school).filter(Boolean)),
]);
const fields = computed(() => [
  "Toutes",
  ...new Set(students.value.map((s) => s.field).filter(Boolean)),
]);
const cities = computed(() => [
  "Toutes",
  ...new Set(students.value.map((s) => s.city).filter(Boolean)),
]);
const sources = ["Toutes", "Manuel", "CSV"];
const statuses = ["Toutes", "En attente", "Validées", "Refusées", "Aucune demande"];

const filteredStudents = computed(() =>
  students.value.filter((student) => {
    const matchesSchool =
      schoolFilter.value === "Toutes" || student.school === schoolFilter.value;
    const matchesField =
      fieldFilter.value === "Toutes" || student.field === fieldFilter.value;
    const matchesCity =
      cityFilter.value === "Toutes" || student.city === cityFilter.value;
    const matchesSource =
      sourceFilter.value === "Toutes" ||
      sourceLabel(student.source) === sourceFilter.value;
    // FIX 4: matchesStatus is now included in the return
    const matchesStatus =
      statusFilter.value === "Toutes" ||
      (statusFilter.value === "Validées" && student.status === "Validée") ||
      (statusFilter.value === "Refusées" && student.status === "Refusée") ||
      (statusFilter.value === "Aucune demande" && student.status === "Aucun") ||
      student.status === statusFilter.value;

    return matchesSchool && matchesField && matchesCity && matchesSource && matchesStatus;
  }),
);

// FIX 5: Single `stats` computed (removed duplicate), replaced `scopedStudents` with `students`
const stats = computed(() => ({
  total: students.value.length,
  manual: students.value.filter((s) => s.source !== "CSV").length,
  csv: students.value.filter((s) => s.source === "CSV").length,
  averageScore: students.value.length
    ? Math.round(
        students.value.reduce((sum, s) => sum + s.score, 0) / students.value.length,
      )
    : 0,
  pending: students.value.filter((s) => s.status === "En attente").length,
  accepted: students.value.filter((s) => s.status === "Validée").length,
  refused: students.value.filter((s) => s.status === "Refusée").length,
}));

// FIX 6: `statCards` is now a clean single computed without stray code fragments
const statCards = computed(() => [
  { label: "Total étudiants", value: stats.value.total },
  { label: "Ajouts manuels", value: stats.value.manual },
  { label: "Ajouts CSV", value: stats.value.csv },
  { label: "Score moyen", value: `${stats.value.averageScore}+` },
  { label: "Demandes en attente", value: stats.value.pending },
  { label: "Validations acceptées", value: stats.value.accepted },
  { label: "Validations refusées", value: stats.value.refused },
]);

// FIX 7: `clearFlash` body is now correct (no stray array elements)
const clearFlash = () => {
  success.value = "";
  error.value = "";
};

const statusClass = (status: RequestStatus) => ({
  "is-pending": status === "En attente",
  "is-valid": status === "Validée",
  "is-refused": status === "Refusée",
  "is-empty": status === "Aucun",
});

const updateStatus = (student: ProfStudent, status: "Validée" | "Refusée") => {
  student.status = status;
  if (selectedStudent.value?.id === student.id) {
    selectedStudent.value.status = status;
  }
};

const openStudentProfile = (student: ProfStudent) => {
  router.push(student.profilePath);
};

const openPortfolio = (student: ProfStudent) => {
  router.push(student.portfolioPath);
};

const addStudentByApogee = async () => {
  const numeroEtudiant = apogeeInput.value.trim();
  if (!numeroEtudiant) return;

  clearFlash();
  addingStudent.value = true;

  try {
    const response = await profApi.attachStudent({ numero_etudiant: numeroEtudiant });
    const attachedStudent = response.data?.data;

    if (attachedStudent && !students.value.some((s) => s.id === attachedStudent.id)) {
      students.value.unshift(withResolvedBadges(attachedStudent));
    }

    success.value = response.data?.created
      ? "Étudiant ajouté à votre liste."
      : "Cet étudiant est déjà dans votre liste.";
    apogeeInput.value = "";
    showAddModal.value = false;
  } catch (err: any) {
    error.value =
      err?.response?.data?.message || "Impossible d'ajouter cet étudiant.";
  } finally {
    addingStudent.value = false;
  }
};

const handleCsvSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  clearFlash();
  importingCsv.value = true;

  try {
    const response = await profApi.importStudentsCsv(file);
    importSummary.value = response.data?.data || null;
    await loadStudents();
    success.value = "Import CSV terminé.";
  } catch (err: any) {
    error.value =
      err?.response?.data?.message || "Impossible d'importer le fichier CSV.";
  } finally {
    importingCsv.value = false;
    input.value = "";
  }
};

const removeStudent = async (student: ProfStudent) => {
  clearFlash();
  try {
    await profApi.detachStudent(student.id);
    students.value = students.value.filter((item) => item.id !== student.id);
    success.value = `${student.name} a été retiré de votre liste.`;
  } catch (err: any) {
    error.value =
      err?.response?.data?.message || "Impossible de retirer cet étudiant.";
  }
};

onMounted(loadStudents);
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
            <span>Ajoutez des étudiants depuis leur profil ou via un fichier CSV d'APOGEE.</span>
          </div>

          <div class="heading-actions">
            <button type="button" class="primary-btn" @click="showAddModal = true">
              Ajouter un étudiant
            </button>
            <label class="outline-btn upload-btn">
              <input type="file" accept=".csv,text/csv" @change="handleCsvSelected" />
              {{ importingCsv ? "Import..." : "Attacher fichier CSV" }}
            </label>
            <span>Liste des étudiants liés à vos filières et écoles.</span>
          </div>
        </div>

        <p v-if="success" class="flash flash-success">{{ success }}</p>
        <p v-if="error" class="flash flash-error">{{ error }}</p>

        <div class="stats-grid">
          <article v-for="card in statCards" :key="card.label" class="stat-card">
            <span>{{ card.label }}</span>
            <strong>{{ card.value }}</strong>
          </article>
        </div>

        <div v-if="importSummary" class="import-card">
          <h3>Résultat import CSV</h3>
          <p>
            {{ importSummary.added.length }} ajoutés ·
            {{ importSummary.alreadyLinked.length }} déjà liés ·
            {{ importSummary.missing.length }} introuvables
          </p>
          <p v-if="importSummary.missing.length" class="import-note">
            Introuvables : {{ importSummary.missing.join(", ") }}
          </p>
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
              Source
              <select v-model="sourceFilter">
                <option v-for="source in sources" :key="source">{{ source }}</option>
              </select>
            </label>
            <!-- FIX 8: Added statusFilter select in filters panel -->
            <label>
              Statut
              <select v-model="statusFilter">
                <option v-for="status in statuses" :key="status">{{ status }}</option>
              </select>
            </label>
          </div>

          <div v-if="loading" class="table-empty">Chargement des étudiants...</div>
          <div v-else-if="!filteredStudents.length" class="table-empty">
            Aucun étudiant dans votre liste pour le moment.
          </div>
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Étudiant</th>
                  <th>APOGEE</th>
                  <th>École / Faculté</th>
                  <th>Filière</th>
                  <th>Ville</th>
                  <th>Score</th>
                  <th>Recommandations</th>
                  <th>Source</th>
                  <th>Ajouté le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in filteredStudents" :key="student.id">
                  <td>
                    <button type="button" class="profile-cell" @click="openStudentProfile(student)">
                      <span>{{ student.initials }}</span>
                      <div>
                        <strong>{{ student.name }}</strong>
                        <small>{{ student.email }}</small>
                        <SkillBadges :badges="student.badges" compact />
                      </div>
                    </button>
                  </td>
                  <td>{{ student.apogee || "—" }}</td>
                  <!-- FIX 9: Added missing `school` <td> to match the <th> -->
                  <td>{{ student.school }}</td>
                  <td>{{ student.field }}</td>
                  <td>{{ student.city }}</td>
                  <td><span class="score-pill">{{ student.score }}+</span></td>
                  <td>{{ student.recommendations }}</td>
                  <td><span class="source-pill">{{ sourceLabel(student.source) }}</span></td>
                  <td>{{ formatDate(student.attachedAt) }}</td>
                  <td>
                    <div class="action-row">
                      <button type="button" @click="openPortfolio(student)">Portfolio</button>
                      <button
                        type="button"
                        class="outline-btn"
                        @click="selectedStudent = student"
                      >
                        Détails
                      </button>
                      <button type="button" class="danger-btn" @click="removeStudent(student)">
                        Retirer
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

    <!-- FIX 10: Modal "Ajouter un étudiant" — cleaned up, removed mixed selectedStudent markup -->
    <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
      <section class="details-modal">
        <button type="button" class="modal-close" @click="showAddModal = false">×</button>
        <p>Ajout manuel</p>
        <h2>Ajouter un étudiant</h2>

        <div class="details-block">
          <span>Numéro APOGEE</span>
          <input v-model="apogeeInput" type="text" placeholder="Ex: ETU001" />
        </div>
        <div class="modal-actions">
          <button type="button" class="outline-btn" @click="showAddModal = false">
            Fermer
          </button>
          <button
            type="button"
            class="primary-btn"
            :disabled="addingStudent"
            @click="addStudentByApogee"
          >
            {{ addingStudent ? "Ajout..." : "Ajouter" }}
          </button>
        </div>
      </section>
    </div>

    <!-- FIX 11: Separate modal for selectedStudent details -->
    <div
      v-if="selectedStudent"
      class="modal-backdrop"
      @click.self="selectedStudent = null"
    >
      <section class="details-modal">
        <button type="button" class="modal-close" @click="selectedStudent = null">×</button>
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
            <strong :class="statusClass(selectedStudent.status)">
              {{ selectedStudent.status }}
            </strong>
          </article>
        </div>

        <div class="details-block">
          <span>Description</span>
          <p>{{ selectedStudent.requestDescription }}</p>
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
  background: var(--surface-page);
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
.details-modal,
.import-card {
  background: var(--white);
  border: 1px solid var(--overlay-navy-08);
  border-radius: var(--radius-card);
  box-shadow: 0 14px 32px var(--overlay-navy-08);
}

.page-heading {
  padding: 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-heading p,
.page-heading span,
.stat-card span,
.details-modal p,
.details-block span {
  color: var(--text-gray);
  font-weight: 800;
}

.page-heading h1 {
  color: var(--text-dark);
  font-size: 34px;
  font-weight: 900;
}

.heading-actions,
.modal-actions,
.action-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.primary-btn,
.outline-btn,
.filter-toggle,
.action-row button {
  border-radius: 100px 180px 0 100px;
  padding: 10px 14px;
  font-weight: 800;
  cursor: pointer;
}

.primary-btn {
  border: 1px solid var(--purple);
  background: var(--purple);
  color: var(--white);
}

.outline-btn,
.filter-toggle,
.action-row button {
  border: 1px solid rgba(17, 24, 39, 0.35);
  background: var(--white);
  color: var(--navy-mid);
}

.upload-btn input {
  display: none;
}

.flash {
  margin: 0;
  padding: 12px 16px;
  border-radius: 14px;
  font-weight: 800;
}

.flash-success {
  background: rgba(16, 185, 129, 0.12);
  color: var(--success-dark);
}

.flash-error {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
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

.import-card {
  padding: 18px;
}

.import-card h3 {
  color: var(--text-dark);
  font-size: 20px;
  font-weight: 900;
}

.import-note {
  margin-top: 8px;
  color: var(--text-gray);
  font-weight: 700;
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
}

.filter-toggle.active {
  background: var(--purple);
  border-color: var(--purple);
  color: var(--white);
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

.filters-panel select,
.details-block input {
  height: 40px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: var(--radius-pill);
  background: var(--white);
  color: var(--text-dark);
  padding: 0 14px;
  font-weight: 800;
}

.table-wrap {
  overflow-x: auto;
}

.table-empty {
  padding: 32px 18px;
  color: var(--text-gray);
  font-weight: 800;
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
  text-align: left;
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

.profile-cell small {
  display: block;
  margin: 2px 0 6px;
  color: var(--text-gray);
}

.score-pill,
.source-pill {
  border-radius: var(--radius-pill);
  padding: 7px 12px;
}

.score-pill {
  background: var(--overlay-purple-12);
  color: var(--purple);
}

.source-pill {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.danger-btn {
  border-color: rgba(239, 68, 68, 0.3) !important;
  color: var(--danger) !important;
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
  width: min(520px, 100%);
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
  gap: 12px;
  margin-bottom: 16px;
}

.details-grid article {
  border: 1px solid rgba(122, 127, 136, 0.22);
  border-radius: var(--radius-md);
  background: rgba(248, 250, 252, 0.8);
  padding: 12px;
}

.details-block {
  display: grid;
  gap: 8px;
  border: 1px solid rgba(122, 127, 136, 0.22);
  border-radius: var(--radius-md);
  background: rgba(248, 250, 252, 0.8);
  padding: 16px;
  margin-bottom: 16px;
}

.is-pending { color: #d97706; }
.is-valid   { color: var(--success-dark); }
.is-refused { color: #b91c1c; }
.is-empty   { color: var(--text-gray); }

@media (max-width: 960px) {
  .page-heading,
  .stats-grid,
  .filters-panel {
    grid-template-columns: 1fr;
  }

  .page-heading {
    flex-direction: column;
  }
}
</style>