const TECH_SKILL_TYPE = 'tech';
const SOFT_SKILL_TYPE = 'soft';

const TECHNIQUE = 'TECHNIQUE';
const COMPORTEMENTALE = 'COMPORTEMENTALE';

const SOFT_SKILLS_KEYWORDS = [
  'adaptabilite',
  'autonomie',
  'communication',
  'creativite',
  'empathie',
  'gestion du temps',
  'leadership',
  'organisation',
  'resolution de problemes',
  'teamwork',
  'travail en equipe',
];

const normalizeText = (value = '') =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const normalizeSkillType = (value) => {
  const normalized = normalizeText(value).replace(/[_\s-]+/g, '');

  if (['soft', 'comportementale', 'comportemental', 'behavioral'].includes(normalized)) {
    return SOFT_SKILL_TYPE;
  }

  if (['tech', 'technique', 'technical'].includes(normalized)) {
    return TECH_SKILL_TYPE;
  }

  return null;
};

/**
 * Determine le type fonctionnel d'une competence.
 * @param {string} nom
 * @returns {'tech' | 'soft'}
 */
function getSkillType(nom) {
  const lower = normalizeText(nom);
  const isSoft = SOFT_SKILLS_KEYWORDS.some((keyword) => lower.includes(keyword));

  return isSoft ? SOFT_SKILL_TYPE : TECH_SKILL_TYPE;
}

/**
 * Convertit un type fonctionnel en enum Prisma CategorieCompetence.
 * @param {'tech' | 'soft' | string} type
 * @returns {'TECHNIQUE' | 'COMPORTEMENTALE'}
 */
function skillTypeToPrismaCategory(type) {
  return normalizeSkillType(type) === SOFT_SKILL_TYPE ? COMPORTEMENTALE : TECHNIQUE;
}

/**
 * Normalise une categorie venant de l'API ou l'infere depuis le nom.
 * Accepte: tech, soft, TECHNIQUE, COMPORTEMENTALE, SOFT.
 */
function normalizeSkillCategory(categorie, nom = '') {
  const explicitType = normalizeSkillType(categorie);

  if (explicitType) {
    return skillTypeToPrismaCategory(explicitType);
  }

  if (categorie) {
    const error = new Error('Categorie de competence invalide');
    error.statusCode = 400;
    throw error;
  }

  return skillTypeToPrismaCategory(getSkillType(nom));
}

/**
 * Separe un tableau de competences en tech et soft.
 */
function separateSkills(competences = []) {
  return competences.reduce(
    (acc, competence) => {
      const rawType = competence.type || competence.categorie || competence.category;
      const type = normalizeSkillType(rawType) || getSkillType(competence.nom);

      acc[type === SOFT_SKILL_TYPE ? SOFT_SKILL_TYPE : TECH_SKILL_TYPE].push(competence);
      return acc;
    },
    { tech: [], soft: [] }
  );
}

module.exports = {
  COMPORTEMENTALE,
  SOFT_SKILLS_KEYWORDS,
  TECHNIQUE,
  getSkillType,
  normalizeSkillCategory,
  separateSkills,
  skillTypeToPrismaCategory,
};