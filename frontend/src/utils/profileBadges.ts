type BadgeSource = {
  badges?: Array<{ badge?: { nom?: string | null } | null }> | string[];
  competences?: Array<{ competence?: { nom?: string | null } | null }> | string[];
  filiere?: string | null;
  bio?: string | null;
  school?: string | null;
  field?: string | null;
};

const normalizeBadge = (value: string) => value.trim().toLowerCase();

const toDisplayBadge = (value: string) => {
  const normalized = normalizeBadge(value);

  if (normalized.includes("devops")) return "🌊 DevOps";
  if (
    normalized.includes("ai") ||
    normalized.includes("data") ||
    normalized.includes("machine learning")
  ) {
    return "🧠 AI / Data";
  }
  if (
    normalized.includes("cloud") ||
    normalized.includes("web") ||
    normalized.includes("frontend") ||
    normalized.includes("full stack") ||
    normalized.includes("backend") ||
    normalized.includes("mobile")
  ) {
    return "🌐 Web Developer";
  }
  if (
    normalized.includes("cyber") ||
    normalized.includes("security") ||
    normalized.includes("securite")
  ) {
    return "🔐 Security Aware";
  }
  if (normalized.includes("hackathon")) return "🏆 Hackathon Participant";

  return value.trim();
};

const uniqueOrdered = (badges: string[]) => [...new Set(badges)];

export const resolveProfileBadges = (source: BadgeSource) => {
  const apiBadges = (source.badges ?? [])
    .map((item: any) =>
      typeof item === "string"
        ? toDisplayBadge(item)
        : toDisplayBadge(item?.badge?.nom || ""),
    )
    .filter(Boolean);

  return apiBadges.length ? uniqueOrdered(apiBadges).slice(0, 3) : [];
};
