import { computed, ref } from "vue";

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

const savedProfiles = ref<SavedProfile[]>([
  {
    id: "khadija-bennani",
    name: "Khadija Bennani",
    school: "ENSA Tanger",
    field: "GINF",
    city: "Tanger",
    score: 90,
    recommendations: 500,
    badges: ["🌐 Web Developer", "🔐 Security Aware"],
    hasPortfolio: true,
    savedAt: "Aujourd'hui",
    profilePath: "/profile/student/7?from=pro",
    portfolioPath: "/portfolio/7?from=pro",
  },
]);

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

  const saveProfile = (profile: Omit<SavedProfile, "savedAt">) => {
    if (isSaved(profile.id)) {
      savedProfiles.value = savedProfiles.value.filter(
        (savedProfile) => savedProfile.id !== profile.id,
      );
      return false;
    }

    savedProfiles.value = [
      ...savedProfiles.value,
      {
        ...profile,
        savedAt: "À l'instant",
      },
    ];
    return true;
  };

  const removeProfile = (id: string) => {
    savedProfiles.value = savedProfiles.value.filter(
      (profile) => profile.id !== id,
    );
  };

  return {
    savedProfiles,
    totalSaved,
    averageScore,
    totalRecommendations,
    profilesWithPortfolio,
    isSaved,
    saveProfile,
    removeProfile,
  };
};
