import { computed, ref } from "vue";

export type ValidationStatus = "En attente" | "Validé" | "Refusé";
export type ValidationType = "Projets" | "Stages" | "Attestations";

export interface ValidationRequest {
  id: number;
  studentId: string;
  studentName: string;
  initials: string;
  type: ValidationType;
  title: string;
  description: string;
  date: string;
  status: ValidationStatus;
  attachments: string[];
}

const requests = ref<ValidationRequest[]>([
  {
    id: 1,
    studentId: "khadija-bennani",
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
    studentId: "yassine-el-amrani",
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
    studentId: "sara-alaoui",
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
    studentId: "nora-tazi",
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

const stats = computed(() => ({
  total: requests.value.length,
  pending: requests.value.filter((request) => request.status === "En attente")
    .length,
  validated: requests.value.filter((request) => request.status === "Validé")
    .length,
  refused: requests.value.filter((request) => request.status === "Refusé")
    .length,
}));

const groupedRequests = computed(() => ({
  pending: requests.value.filter((request) => request.status === "En attente"),
  validated: requests.value.filter((request) => request.status === "Validé"),
  refused: requests.value.filter((request) => request.status === "Refusé"),
}));

const updateRequestStatus = (
  requestId: number,
  status: ValidationStatus,
) => {
  const request = requests.value.find((item) => item.id === requestId);
  if (request) request.status = status;
};

const findStudentRequests = (studentId: string) =>
  requests.value.filter((request) => request.studentId === studentId);

export const useProfValidationRequests = () => ({
  requests,
  stats,
  groupedRequests,
  updateRequestStatus,
  findStudentRequests,
});
