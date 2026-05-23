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
    id: 4,
    studentId: "amine-lahlou",
    studentName: "Amine Lahlou",
    initials: "AL",
    type: "Projets",
    title: "Plateforme de suivi PFE",
    description: "Demande de validation du prototype et du cahier des charges.",
    date: "Aujourd'hui, 09:05",
    status: "En attente",
    attachments: ["Prototype-pfe.fig", "Cahier-des-charges.pdf"],
  },
  {
    id: 5,
    studentId: "hajar-mansouri",
    studentName: "Hajar Mansouri",
    initials: "HM",
    type: "Stages",
    title: "Stage Cloud AWS",
    description: "Validation des objectifs du stage et du rapport intermédiaire.",
    date: "Hier, 11:30",
    status: "En attente",
    attachments: ["Rapport-intermediaire.pdf", "Attestation-presence.pdf"],
  },
  {
    id: 6,
    studentId: "mehdi-berrada",
    studentName: "Mehdi Berrada",
    initials: "MB",
    type: "Attestations",
    title: "Attestation de participation",
    description: "Demande de validation pour une participation à un hackathon.",
    date: "Il y a 2 j",
    status: "En attente",
    attachments: ["Justificatif-hackathon.pdf"],
  },
  {
    id: 7,
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
