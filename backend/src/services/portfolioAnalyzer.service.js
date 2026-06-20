const { prisma, toBigInt } = require("../models/prisma");

const analyzePortfolio = async (etudiantId) => {
  const id = toBigInt(etudiantId);

  const etudiant = await prisma.etudiant.findUnique({
    where: { id_utilisateur: id },
    include: {
      utilisateur: {
        include: {
          profil: true
        }
      },
      projets: true,
      stages: true,
      competences: true,
      github_integration: {
        include: {
          depots: true
        }
      }
    }
  });

  if (!etudiant) {
    const error = new Error("Etudiant introuvable");
    error.statusCode = 404;
    throw error;
  }

  let score = 0;

  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  // PROFIL
  const profil = etudiant.utilisateur?.profil;

  if (profil?.bio) {
    score += 5;
  } else {
    weaknesses.push("Bio absente");
    recommendations.push("Ajouter une bio professionnelle");
  }

  if (profil?.photo_profil) {
    score += 5;
  } else {
    weaknesses.push("Photo de profil absente");
  }

  if (profil?.linkedin_url) {
    score += 5;
  } else {
    weaknesses.push("Profil LinkedIn absent");
    recommendations.push("Ajouter un profil LinkedIn");
  }

  // PROJETS
  if (etudiant.projets.length > 0) {
    score += 20;
    strengths.push(`${etudiant.projets.length} projet(s) ajouté(s)`);
  } else {
    weaknesses.push("Aucun projet");
  }

  etudiant.projets.forEach((projet) => {
    if (!projet.description || projet.description.length < 100) {
      weaknesses.push(
        `Description courte pour le projet "${projet.titre}"`
      );
    }

    if (!projet.lien_github) {
      weaknesses.push(
        `Lien GitHub absent pour "${projet.titre}"`
      );
    }

    if (!projet.captures) {
      weaknesses.push(
        `Capture d'écran absente pour "${projet.titre}"`
      );
    }
  });

  // GITHUB
  if (etudiant.github_integration) {
    score += 20;
    strengths.push("GitHub connecté");
  } else {
    weaknesses.push("Compte GitHub non connecté");
  }

  // STAGES
  if (etudiant.stages.length > 0) {
    score += 15;
  } else {
    weaknesses.push("Aucun stage renseigné");
  }

  // COMPETENCES
  if (etudiant.competences.length >= 5) {
    score += 15;
  } else {
    weaknesses.push("Peu de compétences renseignées");
  }

  return {
    score,
    strengths,
    weaknesses,
    recommendations
  };

};


module.exports = {
  analyzePortfolio
};