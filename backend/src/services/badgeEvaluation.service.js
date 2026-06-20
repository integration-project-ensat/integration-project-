const prisma = require('../../prisma/client');

const compterProjetsValides = async (etudiantId, technologies = []) => {
  return prisma.projet.count({
    where: {
      id_etudiant: BigInt(etudiantId),
      statut: 'VALIDE',

      ...(technologies.length > 0 && {
        technologies: {
          some: {
            technologie: {
              nom: {
                in: technologies
              }
            }
          }
        }
      })
    }
  });
};

const compterStagesValides = async (etudiantId) => {
  return prisma.stage.count({
    where: {
      id_etudiant: BigInt(etudiantId),
      statut: 'VALIDE'
    }
  });
};

const compterRecommandationsValides = async (etudiantId) => {
  return prisma.recommandation.count({
    where: {
      id_etudiant_cible: BigInt(etudiantId),
      statut: 'VALIDE'
    }
  });
};

const compterHackathons = async (etudiantId) => {
  const projets = await prisma.projet.count({
    where: {
      id_etudiant: BigInt(etudiantId),
      type: 'HACKATHON',
      statut: 'VALIDE'
    }
  });

  const activites = await prisma.activiteParascolaire.count({
    where: {
      id_etudiant: BigInt(etudiantId),
      type: 'HACKATHON'
    }
  });

  return projets + activites;
};

const verifierRegleBadge = async (etudiantId, criteres = {}) => {
  if (criteres.min_projets_valides) {
    const total = await compterProjetsValides(
      etudiantId,
      criteres.technologies || []
    );

    if (total < criteres.min_projets_valides) return false;
  }

  if (criteres.min_stages_valides) {
    const total = await compterStagesValides(etudiantId);

    if (total < criteres.min_stages_valides) return false;
  }

  if (criteres.min_recommandations_valides) {
    const total = await compterRecommandationsValides(etudiantId);

    if (total < criteres.min_recommandations_valides) return false;
  }

  if (criteres.min_hackathons) {
    const total = await compterHackathons(etudiantId);

    if (total < criteres.min_hackathons) return false;
  }

  return true;
};

module.exports = {
  verifierRegleBadge
};