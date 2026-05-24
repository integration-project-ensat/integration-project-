// src/services/diplome.service.js
const prisma = require('../../prisma/client');
const { recalculerScore } = require('./score.service');


// Récupérer un diplôme par ID (usage interne)
// idEtudiant optionnel : vérifie l'ownership si fourni
const getDiplomeParId = async (idDiplome, idEtudiant = null) => {
  const diplome = await prisma.diplome.findUnique({
    where: { id_diplome: BigInt(idDiplome) }
  });

  if (!diplome) {
    const err = new Error('Diplôme introuvable');
    err.status = 404;
    throw err;
  }

  if (idEtudiant && diplome.id_etudiant.toString() !== BigInt(idEtudiant).toString()) {
    const err = new Error('Accès refusé : ce diplôme ne vous appartient pas');
    err.status = 403;
    throw err;
  }

  return diplome;
};

// Créer un diplôme pour l'étudiant connecté
const creerDiplome = async (idEtudiant, donnees) => {
  const { titre_diplome, domaine, etablissement, annee_debut, annee_fin } = donnees;

  const diplome = await prisma.diplome.create({
    data: {
      id_etudiant:   BigInt(idEtudiant),
      titre_diplome,
      domaine:       domaine       ?? null,
      etablissement: etablissement ?? null,
      annee_debut:   annee_debut   ?? null,
      annee_fin:     annee_fin     ?? null
    }
  });

  await recalculerScore(idEtudiant);

  return diplome;
};

// Lister tous les diplômes d'un étudiant
const getDiplomesEtudiant = async (idEtudiant) => {
  const diplomes = await prisma.diplome.findMany({
    where: { id_etudiant: BigInt(idEtudiant) },
    orderBy: [
      { annee_fin:   'desc' },
      { annee_debut: 'desc' }
    ]
  });

  return diplomes;
};

// Mettre à jour un diplôme
const mettreAJourDiplome = async (idDiplome, idEtudiant, donnees) => {
  await getDiplomeParId(idDiplome, idEtudiant); // vérifie existence + ownership

  const { titre_diplome, domaine, etablissement, annee_debut, annee_fin } = donnees;

  return prisma.diplome.update({
    where: { id_diplome: BigInt(idDiplome) },
    data: {
      ...(titre_diplome  !== undefined && { titre_diplome }),
      ...(domaine        !== undefined && { domaine }),
      ...(etablissement  !== undefined && { etablissement }),
      ...(annee_debut    !== undefined && { annee_debut }),
      ...(annee_fin      !== undefined && { annee_fin })
    }
  });
};

// Supprimer un diplôme
const supprimerDiplome = async (idDiplome, idEtudiant) => {
  await getDiplomeParId(idDiplome, idEtudiant); // vérifie existence + ownership

  await prisma.diplome.delete({
    where: { id_diplome: BigInt(idDiplome) }
  });

  await recalculerScore(idEtudiant);

  return { message: 'Diplôme supprimé avec succès' };
};

module.exports = {
  creerDiplome,
  getDiplomesEtudiant,
  getDiplomeParId,
  mettreAJourDiplome,
  supprimerDiplome
};