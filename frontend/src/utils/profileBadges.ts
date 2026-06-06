type BadgeSource = {
  badges?: Array<{ badge?: { nom?: string | null } | null }> | string[];
  competences?: Array<{ competence?: { nom?: string | null } | null }> | string[];
  filiere?: string | null;
  bio?: string | null;
  school?: string | null;
  field?: string | null;
};

const normalizeBadge = (value: string) => value.trim().toLowerCase();

export const toStyledBadge = (value: string) => {
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

  return "";
};

const uniqueOrdered = (badges: string[]) => {
  const order = [
    "🌊 DevOps",
    "🧠 AI / Data",
    "🌐 Web Developer",
    "🔐 Security Aware",
    "🏆 Hackathon Participant",
  ];

  return [...new Set(badges)].sort(
    (left, right) => order.indexOf(left) - order.indexOf(right),
  );
};

export const resolveProfileBadges = (source: BadgeSource) => {
  const apiBadges = (source.badges ?? [])
    .map((item: any) =>
      typeof item === "string" ? toStyledBadge(item) : toStyledBadge(item?.badge?.nom || ""),
    )
    .filter(Boolean);

  if (apiBadges.length) {
    return uniqueOrdered(apiBadges).slice(0, 3);
  }

  const skillBadges = (source.competences ?? [])
    .map((item: any) =>
      typeof item === "string" ? toStyledBadge(item) : toStyledBadge(item?.competence?.nom || ""),
    )
    .filter(Boolean);

  if (skillBadges.length) {
    return uniqueOrdered(skillBadges).slice(0, 3);
  }

  const fallbackText = [
    source.filiere || "",
    source.field || "",
    source.school || "",
    source.bio || "",
  ]
    .join(" ")
    .toLowerCase();

  if (fallbackText.includes("devops")) {
    return ["🌊 DevOps", "🔐 Security Aware"];
  }
  if (fallbackText.includes("data") || fallbackText.includes("ai")) {
    return ["🧠 AI / Data"];
  }
  if (fallbackText.includes("cyber") || fallbackText.includes("security")) {
    return ["🔐 Security Aware"];
  }
  if (fallbackText.includes("mobile")) {
    return ["🌐 Web Developer", "🏆 Hackathon Participant"];
  }
  if (fallbackText.includes("cloud") || fallbackText.includes("web")) {
    return ["🌐 Web Developer"];
  }

  return ["🌐 Web Developer"];
};
