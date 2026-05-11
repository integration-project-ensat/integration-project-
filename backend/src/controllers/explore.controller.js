const profiles = [
  {
    id: 1,
    year: 2026,
    name: "Nom Prenom",
    role: "Ex Developer Operation & Support",
    school: "ENSA",
    field: "GINF",
    city: "Tanger",
    score: 90,
    recommendations: 500,
    skills: ["DevOps", "KiCad"],
    recos: [
      {
        name: "Nom Prof",
        role: "Excellent travailleur des Sciences Appliquées",
      },
      {
        name: "Nom Professionnelle",
        role: "Ex commentaire de recommandation.",
      },
    ],
  },
  {
    id: 2,
    year: 2025,
    name: "Nom Prenom",
    role: "Ex Developer Operation & Support",
    school: "ENSAM",
    field: "GSEA",
    city: "Rabat",
    score: 85,
    recommendations: 400,
    skills: ["Sec."],
    recos: [],
  },
  {
    id: 3,
    year: 2024,
    name: "Nom Prenom",
    role: "Ex Developer Operation & Support",
    school: "FST",
    field: "GSR",
    city: "Fes",
    score: 80,
    recommendations: 100,
    skills: ["KiCad"],
    recos: [],
  },
];

const filters = {
  years: [2026, 2025, 2024],
  schools: ["ENSA", "ENSAM", "FST"],
  fields: ["GSR", "GINF", "GSEA"],
  cities: ["Tanger", "Rabat", "Fes"],
  scores: ["90+", "80+", "70+"],
  skills: ["KiCad", "Sec.", "DevOps"],
  recommendations: ["500+", "100+", "50+"],
};

function parseThreshold(value) {
  if (typeof value !== "string") return null;
  const sanitized = value.replace("+", "").trim();
  const parsed = Number(sanitized);
  return Number.isNaN(parsed) ? null : parsed;
}

function profileMatches(profile, query) {
  if (query.search) {
    const search = String(query.search).toLowerCase();
    const fields = [
      profile.name,
      profile.role,
      profile.school,
      profile.field,
      profile.city,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!fields.includes(search)) {
      return false;
    }
  }

  if (query.year && Number(query.year) !== profile.year) {
    return false;
  }

  if (query.school && profile.school !== query.school) {
    return false;
  }

  if (query.field && profile.field !== query.field) {
    return false;
  }

  if (query.city && profile.city !== query.city) {
    return false;
  }

  if (query.score) {
    const threshold = parseThreshold(String(query.score));
    if (threshold !== null && profile.score < threshold) {
      return false;
    }
  }

  if (query.recommendations) {
    const threshold = parseThreshold(String(query.recommendations));
    if (threshold !== null && profile.recommendations < threshold) {
      return false;
    }
  }

  if (query.skills) {
    const selected = String(query.skills)
      .split(",")
      .map((skill) => skill.trim());
    if (!selected.every((skill) => profile.skills.includes(skill))) {
      return false;
    }
  }

  return true;
}

exports.getProfiles = (req, res) => {
  const filtered = profiles.filter((profile) =>
    profileMatches(profile, req.query),
  );
  res.json({ data: filtered, count: filtered.length });
};

exports.getProfileById = (req, res) => {
  const id = Number(req.params.id);
  const profile = profiles.find((item) => item.id === id);

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  res.json(profile);
};

exports.getFilters = (_req, res) => {
  res.json(filters);
};
