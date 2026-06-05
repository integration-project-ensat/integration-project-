import { computed, ref, onMounted } from "vue";
import {
  getMesSauvegardes,
  sauvegarderProfil,
  supprimerSauvegarde,
} from "../services/profilApi";

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
const STORAGE_KEY = "proSavedProfiles";

const readLocalSavedProfiles = (): SavedProfile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocalSavedProfiles = (profiles: SavedProfile[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
};

const mergeSavedProfiles = (remote: SavedProfile[], local: SavedProfile[]) => {
  const byId = new Map<string, SavedProfile>();
  local.forEach((profile) => byId.set(profile.id, profile));
  remote.forEach((profile) => byId.set(profile.id, profile));
  return Array.from(byId.values());
};

const mapSavedProfile = (saved: any): SavedProfile | null => {
  const student = saved?.etudiant ?? saved;
  const studentInfo = student?.etudiant ?? {};
  const id = String(student?.id_utilisateur ?? "");

  if (!id) return null;

  return {
    id,
    name: `${student?.prenom ?? ""} ${student?.nom ?? ""}`.trim() || "Profil",
    school: studentInfo?.diplomes?.[0]?.etablissement ?? studentInfo?.filiere ?? "Etudiant",
    field: studentInfo?.filiere ?? "",
    city: student?.profil?.adresse ?? "",
    score: Number(studentInfo?.score_credibilite?.score_total ?? 0),
    recommendations: student?.nb_recommandations ?? saved?.nb_recommandations ?? 0,
    badges: (studentInfo?.badges ?? [])
      .map((b: any) => b.badge?.nom ?? b.nom)
      .filter(Boolean),
    hasPortfolio: Boolean(studentInfo?.score_credibilite),
    savedAt: saved?.date_sauvegarde
      ? new Date(saved.date_sauvegarde).toLocaleDateString("fr-FR")
      : "A l'instant",
    profilePath: `/profile/student/${id}`,
    portfolioPath: `/profile/student/${id}`,
  };
};

export const useProSavedProfiles = () => {
  const totalSaved = computed(() => savedProfiles.value.length);

  const loadSavedProfiles = async () => {
    const localProfiles = readLocalSavedProfiles();

    try {
      const saved = await getMesSauvegardes();
      const remoteProfiles = saved
        .map(mapSavedProfile)
        .filter((profile): profile is SavedProfile => Boolean(profile));
      savedProfiles.value = mergeSavedProfiles(remoteProfiles, localProfiles);
      writeLocalSavedProfiles(savedProfiles.value);
    } catch {
      savedProfiles.value = localProfiles;
    }
  };

  onMounted(loadSavedProfiles);

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

  const saveProfile = async (profile: Omit<SavedProfile, "savedAt">) => {
    if (isSaved(profile.id)) {
      if (/^\d+$/.test(profile.id)) {
        await supprimerSauvegarde(profile.id);
        await loadSavedProfiles();
      } else {
        savedProfiles.value = savedProfiles.value.filter(
          (savedProfile) => savedProfile.id !== profile.id,
        );
        writeLocalSavedProfiles(savedProfiles.value);
      }
      return false;
    }

    if (/^\d+$/.test(profile.id)) {
      await sauvegarderProfil(profile.id);
      await loadSavedProfiles();
    } else {
      savedProfiles.value = [
        ...savedProfiles.value,
        {
          ...profile,
          savedAt: "A l'instant",
        },
      ];
      writeLocalSavedProfiles(savedProfiles.value);
    }

    return true;
  };

  const removeProfile = async (id: string) => {
    if (/^\d+$/.test(id)) {
      await supprimerSauvegarde(id);
    }
    savedProfiles.value = savedProfiles.value.filter(
      (profile) => profile.id !== id,
    );
    writeLocalSavedProfiles(savedProfiles.value);
  };

  return {
    savedProfiles,
    totalSaved,
    averageScore,
    totalRecommendations,
    profilesWithPortfolio,
    loadSavedProfiles,
    isSaved,
    saveProfile,
    removeProfile,
  };
};
