import type { ProfilExplore } from "../services/profilApi";
import { resolveProfileBadges } from "./profileBadges";

type ExploreCardReco = {
  name: string;
  role: string;
  comment: string;
};

type ExploreCardProfile = {
  id: number | string;
  name: string;
  role: string;
  school: string;
  city: string;
  score: number;
  recommendations: number;
  badges: string[];
  profilePath: string;
  portfolioPath: string;
  recos: ExploreCardReco[];
};

const pickRole = (profile: ProfilExplore) =>
  profile.profil?.bio?.split(".")[0]?.trim() ||
  profile.etudiant?.diplomes?.[0]?.titre_diplome ||
  profile.etudiant?.filiere ||
  "Étudiant en développement";

const pickSchool = (profile: ProfilExplore) =>
  profile.etudiant?.diplomes?.[0]?.etablissement || "École Nationale des Sciences Appliquées";

const cityOptions = [
  "Tanger",
  "Rabat",
  "Fès",
  "Casablanca",
  "Marrakech",
  "Agadir",
  "Oujda",
  "Tetouan",
  "Kenitra",
  "Meknes",
  "El Jadida",
  "Safi",
  "Beni Mellal",
  "Nador",
  "Settat",
  "Taza",
  "Khouribga",
  "Mohammedia",
  "Laayoune",
  "Dakhla",
];

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const pickCity = (profile: ProfilExplore) => {
  const address = profile.profil?.adresse?.trim();
  if (address) return address;

  const sources = [
    profile.etudiant?.etablissement,
    profile.etudiant?.diplomes?.[0]?.etablissement,
  ].filter(Boolean) as string[];

  const source = normalizeText(sources.join(" "));
  const city = cityOptions.find((item) => source.includes(normalizeText(item)));

  return city ? `${city}, Maroc` : "Ville non renseignée";
};

const pickBadges = (profile: ProfilExplore) =>
  resolveProfileBadges({
    badges: profile.etudiant?.badges,
    competences: profile.etudiant?.competences,
    filiere: profile.etudiant?.filiere,
    bio: profile.profil?.bio,
    school: profile.etudiant?.diplomes?.[0]?.titre_diplome,
  });

const buildRecoFallback = (profile: ProfilExplore): ExploreCardReco[] => {
  const school = pickSchool(profile);

  if ((profile.nb_recommandations ?? 0) <= 0) return [];

  return [
    {
      name: "Nom Prof",
      role: `Ex ${school}`,
      comment: "Ex commentaire de recommandation.",
    },
    {
      name: "Nom Professionnelle",
      role: `Ex ${school}`,
      comment: "Ex commentaire de recommandation.",
    },
  ];
};

export const mapExploreProfileCard = (
  profile: ProfilExplore,
  context: "student" | "prof" | "pro",
): ExploreCardProfile => ({
  id: profile.id_utilisateur,
  name: `${profile.prenom} ${profile.nom}`,
  role: pickRole(profile),
  school: pickSchool(profile),
  city: pickCity(profile),
  score: profile.etudiant?.score_credibilite?.score_total ?? 0,
  recommendations: profile.nb_recommandations,
  badges: pickBadges(profile),
  profilePath: `/profile/student/${profile.id_utilisateur}?from=${context}`,
  portfolioPath: `/portfolio/${profile.id_utilisateur}?from=${context}`,
  recos: buildRecoFallback(profile),
});
