import { computed, ref } from "vue";

export type ProConnectionStatus = "pending" | "accepted" | "refused";

export interface ProConnectionRequest {
  id: string;
  initials: string;
  name: string;
  school: string;
  field: string;
  message: string;
  time: string;
  status: ProConnectionStatus;
  profilePath: string;
}

const connectionRequests = ref<ProConnectionRequest[]>([
  {
    id: "khadija-bennani",
    initials: "KB",
    name: "Khadija Bennani",
    school: "ENSA Tanger",
    field: "GINF",
    message: "Je souhaite échanger sur une opportunité de stage DevOps.",
    time: "Il y a 8 min",
    status: "pending",
    profilePath: "/profile/student/khadija-bennani",
  },
  {
    id: "amine-lahlou",
    initials: "AL",
    name: "Amine Lahlou",
    school: "ENSAM Rabat",
    field: "Data Science",
    message: "Votre entreprise m'intéresse pour un projet PFE.",
    time: "Il y a 42 min",
    status: "pending",
    profilePath: "/profile/student/amine-lahlou",
  },
  {
    id: "mehdi-berrada",
    initials: "MB",
    name: "Mehdi Berrada",
    school: "INPT",
    field: "Cybersecurity",
    message: "Je cherche un mentor professionnel en cybersécurité.",
    time: "Hier",
    status: "accepted",
    profilePath: "/profile/student/mehdi-berrada",
  },
]);

export const useProConnections = () => {
  const pendingRequests = computed(() =>
    connectionRequests.value.filter((request) => request.status === "pending"),
  );
  const acceptedRequests = computed(() =>
    connectionRequests.value.filter((request) => request.status === "accepted"),
  );
  const refusedRequests = computed(() =>
    connectionRequests.value.filter((request) => request.status === "refused"),
  );

  const updateRequest = (id: string, status: ProConnectionStatus) => {
    const request = connectionRequests.value.find((item) => item.id === id);
    if (request) request.status = status;
  };

  return {
    connectionRequests,
    pendingRequests,
    acceptedRequests,
    refusedRequests,
    updateRequest,
  };
};
