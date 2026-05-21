// src/services/score.service.js

const prisma = require('../../prisma/client');

// ─── Helpers de calcul par critère ───────────

const calculerScoreCompletude = (profil, etudiant) => {
  const criteres = [
    !!profil?.photo_profil,
    !!profil?.telephone,
    !!profil?.bio,
    !!profil?.linkedin_url,
    !!profil?.email_professionnel,
    !!profil?.adresse,
    !!etudiant?.filiere,
    !!etudiant?.annee_universitaire,
    !!(etudiant?.competences?.length > 0),
    !!(etudiant?.diplomes?.length > 0),
  ];
  const remplis = criteres.filter(Boolean).length;
  return Math.round((remplis / criteres.length) * 100 * 0.15);
};

const calculerScoreProjets = (projetsValides) => {
  const nb = projetsValides.length;
  if (nb === 0) return 0;
  if (nb === 1) return 5;
  if (nb === 2) return 10;
  if (nb === 3) return 15;
  return 20;
};

const calculerScoreStages = (stagesValides) => {
  const nb = stagesValides.length;
  if (nb === 0) return 0;
  if (nb === 1) return 10;
  return 20;
};

const calculerScoreRecommandations = (recommandations) => {
  const nb = recommandations.length;
  if (nb === 0) return 0;
  if (nb === 1) return 5;
  if (nb === 2) return 10;
  return 15;
};

const calculerScoreGithub = (github) => {
  if (!github?.est_actif) return 0;
  const commits = github.depots?.reduce((acc, d) => acc + (d.nb_commits ?? 0), 0) ?? 0;
  if (commits === 0) return 0;
  if (commits < 20) return 5;
  if (commits < 50) return 10;
  return 15;
};

const calculerScoreCertifications = (attestations) => {
  const nb = attestations.length;
  if (nb === 0) return 0;
  if (nb === 1) return 5;
  if (nb === 2) return 10;
  return 15;
};

const determinerNiveau = (scoreTotal) => {
  if (scoreTotal < 25) return 'DEBUTANT';
  if (scoreTotal < 50) return 'INTERMEDIAIRE';
  if (scoreTotal < 75) return 'AVANCE';
  return 'EXPERT';
};

// ─── Recalcul complet et persistance ─────────

const recalculerScore = async (idEtudiant) => {
  const donnees = await prisma.etudiant.findUnique({
    where: { id_utilisateur: BigInt(idEtudiant) },
    include: {
      utilisateur: { include: { profil: true } },
      competences: true,
      diplomes: true,
      projets:  { where: { statut: 'VALIDE' } },
      stages:   { where: { statut: 'VALIDE' } },
      recommandations_recues: { where: { statut: 'VALIDE' } },
      github_integration: { include: { depots: true } },
      activites: true
    }
  });

  if (!donnees) return null;

  // Attestations validées liées aux activités de l'étudiant
  const attestations = await prisma.elementValidable.findMany({
    where: {
      statut:       'VALIDE',
      type:         'ATTESTATION',
      reference_id: { in: donnees.activites.map(a => a.id_activite) }
    }
  });

  const scoreCompletude      = calculerScoreCompletude(donnees.utilisateur.profil, donnees);
  const scoreProjets         = calculerScoreProjets(donnees.projets);
  const scoreStages          = calculerScoreStages(donnees.stages);
  const scoreRecommandations = calculerScoreRecommandations(donnees.recommandations_recues);
  const scoreGithub          = calculerScoreGithub(donnees.github_integration);
  const scoreCertifications  = calculerScoreCertifications(attestations);

  const scoreTotal =
    scoreCompletude +
    scoreProjets +
    scoreStages +
    scoreRecommandations +
    scoreGithub +
    scoreCertifications;

  const niveau = determinerNiveau(scoreTotal);

  await prisma.scoreCredibilite.upsert({
    where:  { id_etudiant: BigInt(idEtudiant) },
    update: {
      score_total:           scoreTotal,
      score_projets:         scoreProjets,
      score_github:          scoreGithub,
      score_stages:          scoreStages,
      score_recommandations: scoreRecommandations,
      score_certifications:  scoreCertifications,
      score_completude:      scoreCompletude,
      niveau
    },
    create: {
      id_etudiant:           BigInt(idEtudiant),
      score_total:           scoreTotal,
      score_projets:         scoreProjets,
      score_github:          scoreGithub,
      score_stages:          scoreStages,
      score_recommandations: scoreRecommandations,
      score_certifications:  scoreCertifications,
      score_completude:      scoreCompletude,
      niveau
    }
  });

  return { scoreTotal, niveau };
};

module.exports = { recalculerScore };