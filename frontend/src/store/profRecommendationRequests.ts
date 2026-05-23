import { computed, ref } from "vue";

export type RecommendationStatus = "En attente" | "Acceptée" | "Refusée";

export interface RecommendationRequest {
  id: number;
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

const recommendations = ref<RecommendationRequest[]>([
  {
    id: 1,
    studentId: "khadija-bennani",
    studentName: "Khadija Bennani",
    initials: "KB",
    profileInfo: "GINF · ENSA Tanger · 4ème année",
    title: "Lettre pour candidature master IA",
    message:
      "Je souhaite postuler à un master en intelligence artificielle et j'aimerais une lettre qui met en avant mon sérieux et mon projet Portfolio Web.",
    date: "Aujourd'hui, 12:15",
    status: "En attente",
  },
  {
    id: 2,
    studentId: "yassine-el-amrani",
    studentName: "Yassine El Amrani",
    initials: "YE",
    profileInfo: "DevOps · ENSA Tanger · PFE",
    title: "Recommandation pour stage DevOps",
    message:
      "J'ai besoin d'une recommandation pour appuyer ma candidature à un stage DevOps orienté CI/CD et Docker.",
    date: "Il y a 1 h",
    status: "En attente",
  },
  {
    id: 3,
    studentId: "sara-alaoui",
    studentName: "Sara Alaoui",
    initials: "SA",
    profileInfo: "Cloud · ENSA Tanger · 5ème année",
    title: "Lettre pour bourse d'excellence",
    message:
      "Je prépare un dossier de bourse et j'aimerais une lettre mentionnant mon travail sur le cloud et mon engagement.",
    date: "Hier, 15:40",
    status: "Acceptée",
    writtenLetter:
      "Sara a démontré une grande rigueur académique et une excellente capacité à mener des projets cloud avec autonomie et professionnalisme.",
  },
  {
    id: 4,
    studentId: "mehdi-berrada",
    studentName: "Mehdi Berrada",
    initials: "MB",
    profileInfo: "Cybersecurity · ENSA Tanger · 3ème année",
    title: "Recommandation pour concours",
    message:
      "Je souhaite participer à un concours cybersécurité et j'aimerais une recommandation courte sur mes compétences techniques.",
    date: "Il y a 3 j",
    status: "Refusée",
  },
]);

const recommendationStats = computed(() => ({
  total: recommendations.value.length,
  pending: recommendations.value.filter(
    (request) => request.status === "En attente",
  ).length,
  accepted: recommendations.value.filter(
    (request) => request.status === "Acceptée",
  ).length,
  refused: recommendations.value.filter(
    (request) => request.status === "Refusée",
  ).length,
}));

const groupedRecommendations = computed(() => ({
  pending: recommendations.value.filter(
    (request) => request.status === "En attente",
  ),
  accepted: recommendations.value.filter(
    (request) => request.status === "Acceptée",
  ),
  refused: recommendations.value.filter(
    (request) => request.status === "Refusée",
  ),
}));

const updateRecommendationStatus = (
  requestId: number,
  status: RecommendationStatus,
  writtenLetter?: string,
) => {
  const request = recommendations.value.find((item) => item.id === requestId);
  if (!request) return;

  request.status = status;
  if (writtenLetter !== undefined) request.writtenLetter = writtenLetter;
};

export const useProfRecommendationRequests = () => ({
  recommendations,
  recommendationStats,
  groupedRecommendations,
  updateRecommendationStatus,
});
