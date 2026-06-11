import { computed, ref } from "vue";
import api from "@/services/api.js";

export interface SavedProfile {
  id: string;
  name: string;
  school: string;
  field: string;
  city: string;
  score: number;
  recommendations: number;
  badges?: string[];
  hasPortfolio: boolean;
  savedAt: string;
  profilePath: string;
  portfolioPath: string;
}

const savedProfiles = ref<SavedProfile[]>([]);
const isLoadingSavedProfiles = ref(false);
const savedProfilesError = ref("");

const formatSavedDate = (value?: string) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("fr-FR");
};

const mapBackendSavedProfile = (saved: any): SavedProfile => {
  const student = saved.etudiant ?? {};
  const studentInfo = student.etudiant ?? {};
  const id = String(student.id_utilisateur ?? saved.id);
  const name = [student.prenom, student.nom].filter(Boolean).join(" ").trim();

  return {
    id,
    name: name || "Etudiant",
    school: studentInfo.etablissement || "Etablissement non renseigne",
    field: studentInfo.filiere || "-",
    city: student.profil?.adresse || "-",
    score: Number(studentInfo.score_credibilite?.score_total ?? 0),
    recommendations: Number(student.nb_recommandations ?? 0),
    badges: Array.isArray(studentInfo.badges)
      ? studentInfo.badges.map((item: any) => item.badge?.nom).filter(Boolean)
      : [],
    hasPortfolio: Boolean(studentInfo.score_credibilite),
    savedAt: formatSavedDate(saved.date_sauvegarde),
    profilePath: `/profile/student/${id}?from=pro`,
    portfolioPath: `/portfolio/${id}?from=pro`,
  };
};

export const useProSavedProfiles = () => {
  const totalSaved = computed(() => savedProfiles.value.length);
  const averageScore = computed(() => {
    if (!savedProfiles.value.length) return 0;
    const total = savedProfiles.value.reduce(
      (sum, profile) => sum + profile.score,
      0,
    );
    return Math.round(total / savedProfiles.value.length);
  });
  const totalRecommendations = computed(() =>
    savedProfiles.value.reduce(
      (sum, profile) => sum + profile.recommendations,
      0,
    ),
  );
  const profilesWithPortfolio = computed(
    () => savedProfiles.value.filter((profile) => profile.hasPortfolio).length,
  );

  const isSaved = (id: string) =>
    savedProfiles.value.some((profile) => profile.id === id);

  const loadSavedProfiles = async () => {
    isLoadingSavedProfiles.value = true;
    savedProfilesError.value = "";

    try {
      const { data } = await api.get("/profil/saved");
      savedProfiles.value = Array.isArray(data?.data)
        ? data.data.map(mapBackendSavedProfile)
        : [];
    } catch (err: any) {
      savedProfilesError.value =
        err.response?.data?.message ||
        "Impossible de charger les profils sauvegardes.";
    } finally {
      isLoadingSavedProfiles.value = false;
    }
  };

  const saveProfile = async (profile: Omit<SavedProfile, "savedAt">) => {
    if (isSaved(profile.id)) {
      await api.delete(`/profil/${profile.id}/save`);
      await loadSavedProfiles();
      return false;
    }

    await api.post(`/profil/${profile.id}/save`);
    await loadSavedProfiles();
    return true;
  };

  const removeProfile = async (id: string) => {
    await api.delete(`/profil/${id}/save`);
    await loadSavedProfiles();
  };

  return {
    savedProfiles,
    isLoadingSavedProfiles,
    savedProfilesError,
    totalSaved,
    averageScore,
    totalRecommendations,
    profilesWithPortfolio,
    isSaved,
    loadSavedProfiles,
    saveProfile,
    removeProfile,
  };
};
