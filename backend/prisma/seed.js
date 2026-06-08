const prisma = require("./client");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

const PASSWORDS = {
  admin: process.env.ADMIN_PASSWORD || "Admin1234!",
  professeur: "Prof1234!",
  etudiant: "Etudiant1234!",
  professionnel: "Pro1234!",
};

const toDate = (value) => new Date(value);

async function upsertUtilisateur(data) {
  return prisma.utilisateur.upsert({
    where: { email: data.email },
    update: {
      nom: data.nom,
      prenom: data.prenom,
      role: data.role,
      est_actif: data.est_actif,
      est_valide: data.est_valide,
      email_verifie: data.email_verifie,
    },
    create: data,
  });
}

async function upsertByFirst(model, where, data, idField) {
  const existing = await model.findFirst({ where });

  return existing
    ? model.update({ where: { [idField]: existing[idField] }, data })
    : model.create({ data });
}

async function seedAdministrateurs(hashAdmin) {
  const admins = [
    {
      email: process.env.ADMIN_EMAIL || "admin1@plateforme.ma",
      nom: "Admin",
      prenom: "Principal",
      niveau_acces: "SUPER_ADMIN",
      droits_admin: {
        utilisateurs: true,
        validations: true,
        parametrage: true,
      },
    },
    {
      email: "admin2@plateforme.ma",
      nom: "Admin",
      prenom: "Secondaire",
      niveau_acces: "STANDARD",
      droits_admin: {
        utilisateurs: true,
        validations: true,
        parametrage: false,
      },
    },
  ];

  const result = [];

  for (const admin of admins) {
    const utilisateur = await upsertUtilisateur({
      email: admin.email,
      mot_de_passe_hashe: hashAdmin,
      nom: admin.nom,
      prenom: admin.prenom,
      role: "ADMINISTRATEUR",
      est_actif: true,
      est_valide: true,
      email_verifie: true,
    });

    await prisma.profil.upsert({
      where: { id_utilisateur: utilisateur.id_utilisateur },
      update: { adresse: "Maroc", visibilite: "PRIVE" },
      create: {
        id_utilisateur: utilisateur.id_utilisateur,
        adresse: "Maroc",
        visibilite: "PRIVE",
      },
    });

    await prisma.administrateur.upsert({
      where: { id_utilisateur: utilisateur.id_utilisateur },
      update: {
        droits_admin: admin.droits_admin,
        niveau_acces: admin.niveau_acces,
        date_validation: new Date(),
      },
      create: {
        id_utilisateur: utilisateur.id_utilisateur,
        droits_admin: admin.droits_admin,
        niveau_acces: admin.niveau_acces,
        date_validation: new Date(),
      },
    });

    result.push(utilisateur);
  }

  return result;
}

async function seedProfesseurs(hashProfesseur) {
  const professeurs = [
    {
      email: "prof1@plateforme.ma",
      nom: "Bennani",
      prenom: "Fatima",
      code_administratif: "PROF-001",
      departement: "Informatique",
      specialite: "Genie logiciel",
      titre: "Dr.",
      telephone: "0600000001",
    },
    {
      email: "prof2@plateforme.ma",
      nom: "El Amrani",
      prenom: "Youssef",
      code_administratif: "PROF-002",
      departement: "Reseaux",
      specialite: "Cybersecurite",
      titre: "Pr.",
      telephone: "0600000002",
    },
    {
      email: "prof3@plateforme.ma",
      nom: "Alaoui",
      prenom: "Sara",
      code_administratif: "PROF-003",
      departement: "Mathematiques",
      specialite: "Intelligence artificielle",
      titre: "Dr.",
      telephone: "0600000003",
    },
  ];

  const result = [];

  for (const prof of professeurs) {
    const utilisateur = await upsertUtilisateur({
      email: prof.email,
      mot_de_passe_hashe: hashProfesseur,
      nom: prof.nom,
      prenom: prof.prenom,
      role: "PROFESSEUR",
      est_actif: true,
      est_valide: true,
      email_verifie: true,
    });

    await prisma.professeur.upsert({
      where: { id_utilisateur: utilisateur.id_utilisateur },
      update: {
        code_administratif: prof.code_administratif,
        departement: prof.departement,
        specialite: prof.specialite,
        titre: prof.titre,
      },
      create: {
        id_utilisateur: utilisateur.id_utilisateur,
        code_administratif: prof.code_administratif,
        departement: prof.departement,
        specialite: prof.specialite,
        titre: prof.titre,
      },
    });

    await prisma.profil.upsert({
      where: { id_utilisateur: utilisateur.id_utilisateur },
      update: {
        telephone: prof.telephone,
        adresse: "Maroc",
        email_professionnel: prof.email,
        visibilite: "PUBLIC",
      },
      create: {
        id_utilisateur: utilisateur.id_utilisateur,
        telephone: prof.telephone,
        adresse: "Maroc",
        email_professionnel: prof.email,
        visibilite: "PUBLIC",
      },
    });

    result.push(utilisateur);
  }

  return result;
}

async function seedEtudiants(hashEtudiant) {
  const etudiants = [
    {
      email: "etudiant1@plateforme.ma",
      nom: "Mansouri",
      prenom: "Omar",
      numero_etudiant: "ETU001",
      filiere: "Genie Informatique",
      objectif_pro: "DEV_WEB",
      telephone: "0611111111",
      linkedin_url: "https://linkedin.com/in/omar-mansouri",
    },
    {
      email: "etudiant2@plateforme.ma",
      nom: "Tazi",
      prenom: "Imane",
      numero_etudiant: "ETU002",
      filiere: "Reseaux et Telecoms",
      objectif_pro: "CYBERSECURITE",
      telephone: "0611111112",
      linkedin_url: "https://linkedin.com/in/imane-tazi",
    },
    {
      email: "etudiant3@plateforme.ma",
      nom: "Rifai",
      prenom: "Mehdi",
      numero_etudiant: "ETU003",
      filiere: "Data Science",
      objectif_pro: "DATA_SCIENCE",
      telephone: "0611111113",
      linkedin_url: "https://linkedin.com/in/mehdi-rifai",
    },
    {
      email: "etudiant4@plateforme.ma",
      nom: "El Fassi",
      prenom: "Salma",
      numero_etudiant: "ETU004",
      filiere: "Genie Informatique",
      objectif_pro: "DEVOPS",
      telephone: "0611111114",
      linkedin_url: "https://linkedin.com/in/salma-elfassi",
    },
    {
      email: "etudiant5@plateforme.ma",
      nom: "Naciri",
      prenom: "Yassine",
      numero_etudiant: "ETU005",
      filiere: "Cybersecurite",
      objectif_pro: "CYBERSECURITE",
      telephone: "0611111115",
      linkedin_url: "https://linkedin.com/in/yassine-naciri",
    },
  ];

  const result = [];

  for (const etudiant of etudiants) {
    const utilisateur = await upsertUtilisateur({
      email: etudiant.email,
      mot_de_passe_hashe: hashEtudiant,
      nom: etudiant.nom,
      prenom: etudiant.prenom,
      role: "ETUDIANT",
      est_actif: true,
      est_valide: true,
      email_verifie: true,
    });

    await prisma.etudiant.upsert({
      where: { id_utilisateur: utilisateur.id_utilisateur },
      update: {
        numero_etudiant: etudiant.numero_etudiant,
        filiere: etudiant.filiere,
        annee_universitaire: "2025-2026",
      },
      create: {
        id_utilisateur: utilisateur.id_utilisateur,
        numero_etudiant: etudiant.numero_etudiant,
        filiere: etudiant.filiere,
        annee_universitaire: "2025-2026",
      },
    });

    await prisma.profil.upsert({
      where: { id_utilisateur: utilisateur.id_utilisateur },
      update: {
        telephone: etudiant.telephone,
        adresse: "Maroc",
        linkedin_url: etudiant.linkedin_url,
        bio: `Profil de ${etudiant.prenom} ${etudiant.nom}, etudiant en ${etudiant.filiere}.`,
        visibilite: "PUBLIC",
      },
      create: {
        id_utilisateur: utilisateur.id_utilisateur,
        telephone: etudiant.telephone,
        adresse: "Maroc",
        linkedin_url: etudiant.linkedin_url,
        bio: `Profil de ${etudiant.prenom} ${etudiant.nom}, etudiant en ${etudiant.filiere}.`,
        visibilite: "PUBLIC",
      },
    });

    result.push({ ...utilisateur, objectif_pro: etudiant.objectif_pro });
  }

  return result;
}

async function seedProfessionnels(hashProfessionnel) {
  const professionnels = [
    {
      email: "pro1@plateforme.ma",
      nom: "Chakir",
      prenom: "Nadia",
      entreprise: "Entreprise Alpha",
      poste: "Directrice technique",
      secteur: "Tech",
      est_valide: true,
      statut_validation: "VALIDE",
    },
    {
      email: "pro2@plateforme.ma",
      nom: "Lahlou",
      prenom: "Karim",
      entreprise: "Entreprise Beta",
      poste: "Responsable RH",
      secteur: "Finance",
      est_valide: false,
      statut_validation: "EN_ATTENTE",
    },
    {
      email: "pro3@plateforme.ma",
      nom: "Berrada",
      prenom: "Samir",
      entreprise: "Startup Gamma",
      poste: "CEO",
      secteur: "Startup",
      est_valide: true,
      statut_validation: "VALIDE",
    },
  ];

  const result = [];

  for (const pro of professionnels) {
    const utilisateur = await upsertUtilisateur({
      email: pro.email,
      mot_de_passe_hashe: hashProfessionnel,
      nom: pro.nom,
      prenom: pro.prenom,
      role: "PROFESSIONNEL",
      est_actif: pro.est_valide,
      est_valide: pro.est_valide,
      email_verifie: true,
    });

    await prisma.professionnel.upsert({
      where: { id_utilisateur: utilisateur.id_utilisateur },
      update: {
        entreprise: pro.entreprise,
        poste: pro.poste,
        secteur: pro.secteur,
        est_valide: pro.est_valide,
        statut_validation: pro.statut_validation,
        date_validation: pro.est_valide ? new Date() : null,
      },
      create: {
        id_utilisateur: utilisateur.id_utilisateur,
        entreprise: pro.entreprise,
        poste: pro.poste,
        secteur: pro.secteur,
        est_valide: pro.est_valide,
        statut_validation: pro.statut_validation,
        date_validation: pro.est_valide ? new Date() : null,
      },
    });

    await prisma.profil.upsert({
      where: { id_utilisateur: utilisateur.id_utilisateur },
      update: {
        adresse: "Maroc",
        email_professionnel: pro.email,
        visibilite: "PUBLIC",
      },
      create: {
        id_utilisateur: utilisateur.id_utilisateur,
        adresse: "Maroc",
        email_professionnel: pro.email,
        visibilite: "PUBLIC",
      },
    });

    result.push(utilisateur);
  }

  return result;
}

async function seedCompetences() {
  const competencesData = [
    { nom: "JavaScript", categorie: "TECHNIQUE", niveau: "AVANCE" },
    { nom: "TypeScript", categorie: "TECHNIQUE", niveau: "INTERMEDIAIRE" },
    { nom: "React", categorie: "TECHNIQUE", niveau: "AVANCE" },
    { nom: "Node.js", categorie: "TECHNIQUE", niveau: "INTERMEDIAIRE" },
    { nom: "PostgreSQL", categorie: "TECHNIQUE", niveau: "INTERMEDIAIRE" },
    { nom: "Prisma", categorie: "TECHNIQUE", niveau: "INTERMEDIAIRE" },
    { nom: "Docker", categorie: "TECHNIQUE", niveau: "DEBUTANT" },
    { nom: "Python", categorie: "TECHNIQUE", niveau: "INTERMEDIAIRE" },
    { nom: "Communication", categorie: "COMPORTEMENTALE", niveau: "AVANCE" },
    {
      nom: "Travail en equipe",
      categorie: "COMPORTEMENTALE",
      niveau: "EXPERT",
    },
    {
      nom: "Leadership",
      categorie: "COMPORTEMENTALE",
      niveau: "INTERMEDIAIRE",
    },
    { nom: "Gestion du temps", categorie: "COMPORTEMENTALE", niveau: "AVANCE" },
  ];

  const result = [];

  for (const competence of competencesData) {
    result.push(
      await upsertByFirst(
        prisma.competence,
        { nom: competence.nom, categorie: competence.categorie },
        competence,
        "id_competence",
      ),
    );
  }

  return result;
}

async function seedTechnologies() {
  const technologiesData = [
    { nom: "React", categorie: "Frontend" },
    { nom: "Node.js", categorie: "Backend" },
    { nom: "Python", categorie: "Data" },
    { nom: "Docker", categorie: "DevOps" },
    { nom: "PostgreSQL", categorie: "Database" },
    { nom: "TypeScript", categorie: "Frontend" },
    { nom: "Spring Boot", categorie: "Backend" },
    { nom: "Prisma", categorie: "Database" },
    { nom: "Firebase", categorie: "Backend" },
    { nom: "Git", categorie: "Tools" },
    { nom: "Linux", categorie: "DevOps" },
  ];

  const result = [];

  for (const technologie of technologiesData) {
    result.push(
      await prisma.technologie.upsert({
        where: { nom: technologie.nom },
        update: { categorie: technologie.categorie, est_validee: true },
        create: { ...technologie, est_validee: true },
      }),
    );
  }

  return result;
}

async function seedProfilCompetences(etudiants, competences) {
  for (let i = 0; i < etudiants.length; i += 1) {
    const selected = competences.slice(i, i + 5);

    for (let j = 0; j < selected.length; j += 1) {
      await prisma.profilCompetence.upsert({
        where: {
          id_etudiant_id_competence: {
            id_etudiant: etudiants[i].id_utilisateur,
            id_competence: selected[j].id_competence,
          },
        },
        update: {
          niveau_maitrise: Math.min(95, 60 + i * 5 + j * 5),
          date_ajout: new Date(),
        },
        create: {
          id_etudiant: etudiants[i].id_utilisateur,
          id_competence: selected[j].id_competence,
          niveau_maitrise: Math.min(95, 60 + i * 5 + j * 5),
          date_ajout: new Date(),
        },
      });
    }
  }
}

async function seedProjets(etudiants, professeurs, technologies) {
  const techByName = Object.fromEntries(technologies.map((t) => [t.nom, t]));
  const projetsData = [
    {
      titre: "Projet1 - Application Web",
      description: "Application web full-stack avec authentification.",
      type: "MODULE",
      statut: "VALIDE",
      etudiantIdx: 0,
      profIdx: 0,
      techs: ["React", "Node.js", "PostgreSQL"],
    },
    {
      titre: "Projet2 - API REST",
      description: "API REST pour gestion d'inventaire.",
      type: "INTEGRATION",
      statut: "EN_ATTENTE",
      etudiantIdx: 1,
      profIdx: 1,
      techs: ["Node.js", "Prisma", "PostgreSQL"],
    },
    {
      titre: "Projet3 - Dashboard BI",
      description: "Tableau de bord Business Intelligence.",
      type: "PERSONNEL",
      statut: "VALIDE",
      etudiantIdx: 2,
      profIdx: 2,
      techs: ["Python", "PostgreSQL"],
    },
    {
      titre: "Projet4 - Chatbot IA",
      description: "Chatbot intelligent avec NLP.",
      type: "HACKATHON",
      statut: "EN_ATTENTE",
      etudiantIdx: 3,
      profIdx: 0,
      techs: ["Python", "Docker"],
    },
    {
      titre: "Projet5 - Audit securite",
      description: "Audit et securisation d'une application web.",
      type: "MODULE",
      statut: "REFUSE",
      etudiantIdx: 4,
      profIdx: 1,
      techs: ["Linux", "Docker"],
    },
    {
      titre: "Projet6 - Application mobile hybride",
      description:
        "Application mobile multiplateforme pour suivi de formation.",
      type: "INTEGRATION",
      statut: "VALIDE",
      etudiantIdx: 0,
      profIdx: 2,
      techs: ["React", "TypeScript", "Firebase"],
    },
    {
      titre: "Projet7 - Plateforme e-commerce",
      description: "Site e-commerce avec panier et paiement simulé.",
      type: "MODULE",
      statut: "VALIDE",
      etudiantIdx: 1,
      profIdx: 0,
      techs: ["React", "Node.js", "Docker"],
    },
    {
      titre: "Projet8 - Système de recommendation",
      description: "Moteur de recommandation pour contenus utilisateurs.",
      type: "PERSONNEL",
      statut: "EN_ATTENTE",
      etudiantIdx: 2,
      profIdx: 1,
      techs: ["Python", "Docker", "PostgreSQL"],
    },
    {
      titre: "Projet9 - Application de gestion de conférences",
      description: "Outil collaboratif pour gérer programmes et participants.",
      type: "INTEGRATION",
      statut: "VALIDE",
      etudiantIdx: 3,
      profIdx: 2,
      techs: ["React", "Prisma", "PostgreSQL"],
    },
    {
      titre: "Projet10 - Dashboard securite",
      description: "Tableau de bord de surveillance et alertes securite.",
      type: "HACKATHON",
      statut: "REFUSE",
      etudiantIdx: 4,
      profIdx: 0,
      techs: ["Python", "Docker", "Linux"],
    },
  ];

  const result = [];

  for (const projet of projetsData) {
    const data = {
      id_etudiant: etudiants[projet.etudiantIdx].id_utilisateur,
      id_professeur: professeurs[projet.profIdx].id_utilisateur,
      titre: projet.titre,
      description: projet.description,
      type: projet.type,
      role: "Developpeur",
      resultats:
        projet.statut === "VALIDE" ? "Prototype valide et documente" : null,
      lien_github: `https://github.com/demo/${projet.titre.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      captures: { images: [] },
      statut: projet.statut,
      visibilite: "PUBLIC",
      est_dans_portfolio: projet.statut === "VALIDE",
      appreciation_professeur:
        projet.statut === "VALIDE"
          ? "Bon travail, projet bien structure."
          : null,
    };

    const saved = await upsertByFirst(
      prisma.projet,
      { id_etudiant: data.id_etudiant, titre: data.titre },
      data,
      "id_projet",
    );

    for (const techName of projet.techs) {
      await prisma.projetTechnologie.upsert({
        where: {
          id_projet_id_technologie: {
            id_projet: saved.id_projet,
            id_technologie: techByName[techName].id_technologie,
          },
        },
        update: {},
        create: {
          id_projet: saved.id_projet,
          id_technologie: techByName[techName].id_technologie,
        },
      });
    }

    result.push(saved);
  }

  return result;
}

async function seedStages(etudiants, professeurs) {
  const stagesData = [
    {
      entreprise: "Entreprise Alpha",
      poste: "Developpeur Front-end",
      duree_semaines: 8,
      statut: "VALIDE",
      etudiantIdx: 0,
      profIdx: 0,
      technologies: "React, TypeScript",
    },
    {
      entreprise: "Startup Beta",
      poste: "Data Analyst",
      duree_semaines: 6,
      statut: "EN_ATTENTE",
      etudiantIdx: 1,
      profIdx: 1,
      technologies: "Python, PostgreSQL",
    },
    {
      entreprise: "Grande Entreprise C",
      poste: "DevOps Engineer",
      duree_semaines: 12,
      statut: "VALIDE",
      etudiantIdx: 2,
      profIdx: 2,
      technologies: "Docker, Linux",
    },
    {
      entreprise: "Agence Digitale D",
      poste: "Consultant Cloud",
      duree_semaines: 10,
      statut: "VALIDE",
      etudiantIdx: 3,
      profIdx: 1,
      technologies: "Docker, AWS",
    },
    {
      entreprise: "Institut E",
      poste: "Assistant Data Scientist",
      duree_semaines: 8,
      statut: "REFUSE",
      etudiantIdx: 4,
      profIdx: 2,
      technologies: "Python, SQL",
    },
    {
      entreprise: "Collectif F",
      poste: "Developpeur Backend",
      duree_semaines: 9,
      statut: "EN_ATTENTE",
      etudiantIdx: 0,
      profIdx: 0,
      technologies: "Node.js, Prisma",
    },
  ];

  const result = [];

  for (const stage of stagesData) {
    const data = {
      id_etudiant: etudiants[stage.etudiantIdx].id_utilisateur,
      id_encadrant: professeurs[stage.profIdx].id_utilisateur,
      entreprise: stage.entreprise,
      poste: stage.poste,
      duree_semaines: stage.duree_semaines,
      missions: "Developpement, tests et deploiement.",
      technologies: stage.technologies,
      statut: stage.statut,
      date_debut: toDate("2025-07-01"),
      date_fin: toDate("2025-09-30"),
      commentaire_prof:
        stage.statut === "VALIDE" ? "Stage effectue avec serieux." : null,
    };

    result.push(
      await upsertByFirst(
        prisma.stage,
        {
          id_etudiant: data.id_etudiant,
          entreprise: data.entreprise,
          poste: data.poste,
        },
        data,
        "id_stage",
      ),
    );
  }

  return result;
}

async function seedActivites(etudiants, professeurs) {
  const activites = [
    {
      nom: "Club Robotique",
      type: "CLUB",
      etudiantIdx: 0,
      profIdx: 0,
      statut: "ATTESTEE_INSTITUTION",
    },
    {
      nom: "Hackathon National 2025",
      type: "HACKATHON",
      etudiantIdx: 1,
      profIdx: 1,
      statut: "DECLAREE",
    },
    {
      nom: "Association Entraide",
      type: "ASSOCIATION",
      etudiantIdx: 2,
      profIdx: 2,
      statut: "DECLAREE",
    },
  ];

  const result = [];

  for (const activite of activites) {
    const data = {
      id_etudiant: etudiants[activite.etudiantIdx].id_utilisateur,
      id_validateur: professeurs[activite.profIdx].id_utilisateur,
      type: activite.type,
      nom: activite.nom,
      periode: "2024-2025",
      description: `Participation active a : ${activite.nom}`,
      justificatif_url: `https://example.com/justificatifs/${activite.nom.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`,
      statut: activite.statut,
    };

    result.push(
      await upsertByFirst(
        prisma.activiteParascolaire,
        { id_etudiant: data.id_etudiant, nom: data.nom },
        data,
        "id_activite",
      ),
    );
  }

  return result;
}

async function seedDiplomes(etudiants) {
  const diplomes = [
    {
      etudiantIdx: 0,
      titre_diplome: "Licence Informatique",
      domaine: "Informatique",
    },
    { etudiantIdx: 1, titre_diplome: "Licence Reseaux", domaine: "Reseaux" },
    { etudiantIdx: 2, titre_diplome: "Licence Data", domaine: "Data Science" },
  ];

  const result = [];

  for (const diplome of diplomes) {
    const data = {
      id_etudiant: etudiants[diplome.etudiantIdx].id_utilisateur,
      titre_diplome: diplome.titre_diplome,
      domaine: diplome.domaine,
      etablissement: "Universite Mohammed V",
      annee_debut: 2022,
      annee_fin: 2025,
    };

    result.push(
      await upsertByFirst(
        prisma.diplome,
        { id_etudiant: data.id_etudiant, titre_diplome: data.titre_diplome },
        data,
        "id_diplome",
      ),
    );
  }

  return result;
}

async function seedBadges(etudiants) {
  const badgesData = [
    {
      nom: "Badge Dev Web",
      description: "Maitrise du developpement web.",
      icone_url: "https://example.com/badges/dev-web.svg",
      critere_type: "WEB_DEV",
    },
    {
      nom: "Badge DevOps",
      description: "Competences DevOps validees.",
      icone_url: "https://example.com/badges/devops.svg",
      critere_type: "DEVOPS",
    },
    {
      nom: "Badge Data",
      description: "Expert en data science.",
      icone_url: "https://example.com/badges/data.svg",
      critere_type: "DATA",
    },
    {
      nom: "Badge Hackathon",
      description: "Participation a un hackathon.",
      icone_url: "https://example.com/badges/hackathon.svg",
      critere_type: "HACKATHON",
    },
    {
      nom: "Badge Collaboration",
      description: "Excellent esprit d'equipe.",
      icone_url: "https://example.com/badges/collab.svg",
      critere_type: "COLLAB",
    },
  ];

  const badges = [];

  for (const badge of badgesData) {
    badges.push(
      await upsertByFirst(
        prisma.badge,
        { nom: badge.nom },
        { ...badge, est_visible: true, mis_en_avant: false },
        "id_badge",
      ),
    );
  }

  for (let i = 0; i < etudiants.length; i += 1) {
    await prisma.profilBadge.upsert({
      where: {
        id_etudiant_id_badge: {
          id_etudiant: etudiants[i].id_utilisateur,
          id_badge: badges[i % badges.length].id_badge,
        },
      },
      update: {
        date_attribution: new Date(),
        position: 1,
      },
      create: {
        id_etudiant: etudiants[i].id_utilisateur,
        id_badge: badges[i % badges.length].id_badge,
        date_attribution: new Date(),
        position: 1,
      },
    });
  }

  return badges;
}

async function seedReglesBadge(badges) {
  const rules = [
    {
      badge: badges[0],
      criteres: { projets_valides: 2, technologies: ["React", "Node.js"] },
      seuils: { min_projets: 2 },
    },
    {
      badge: badges[3],
      criteres: { type_activite: "HACKATHON" },
      seuils: { min_participations: 1 },
    },
  ];

  for (const rule of rules) {
    await upsertByFirst(
      prisma.regleBadge,
      { id_badge: rule.badge.id_badge },
      {
        id_badge: rule.badge.id_badge,
        criteres: rule.criteres,
        seuils: rule.seuils,
        est_valide: true,
      },
      "id_regle",
    );
  }
}

async function seedReglesScore(admin) {
  const rules = [
    { critere: "PROJETS", poids: 30, seuil: { min: 1 } },
    { critere: "GITHUB", poids: 20, seuil: { min_repos: 3 } },
    { critere: "STAGES", poids: 25, seuil: { min_semaines: 4 } },
    { critere: "RECOMMANDATIONS", poids: 10, seuil: { min: 1 } },
    { critere: "COMPLETUDE", poids: 15, seuil: { min_pct: 50 } },
  ];

  for (const rule of rules) {
    await upsertByFirst(
      prisma.regleScoreCredibilite,
      { cree_par_admin: admin.id_utilisateur, critere: rule.critere },
      {
        cree_par_admin: admin.id_utilisateur,
        critere: rule.critere,
        poids: rule.poids,
        seuil: rule.seuil,
        est_active: true,
      },
      "id_regle_score",
    );
  }
}

async function seedScoresCredibilite(etudiants) {
  for (const etudiant of etudiants) {
    await prisma.scoreCredibilite.upsert({
      where: { id_etudiant: etudiant.id_utilisateur },
      update: {
        score_total: 65.5,
        score_projets: 25.0,
        score_github: 12.5,
        score_stages: 15.0,
        score_recommandations: 5.0,
        score_certifications: 3.0,
        score_completude: 5.0,
        niveau: "INTERMEDIAIRE",
      },
      create: {
        id_etudiant: etudiant.id_utilisateur,
        score_total: 65.5,
        score_projets: 25.0,
        score_github: 12.5,
        score_stages: 15.0,
        score_recommandations: 5.0,
        score_certifications: 3.0,
        score_completude: 5.0,
        niveau: "INTERMEDIAIRE",
      },
    });
  }
}

async function seedModelesPortfolio(admin) {
  const modelesData = [
    {
      nom: "Modele1 - Classique",
      structure: { sections: ["projets", "stages", "competences", "badges"] },
      theme: "light",
      sections: "projets,stages,competences,badges",
    },
    {
      nom: "Modele2 - Moderne",
      structure: {
        sections: ["badges", "github", "projets", "recommandations"],
      },
      theme: "dark",
      sections: "badges,github,projets,recommandations",
    },
  ];

  const result = [];

  for (const modele of modelesData) {
    result.push(
      await upsertByFirst(
        prisma.modelePortfolio,
        { nom: modele.nom },
        { ...modele, cree_par_admin: admin.id_utilisateur },
        "id_modele",
      ),
    );
  }

  return result;
}

async function seedPortfolios(etudiants, modeles) {
  const result = [];

  for (let i = 0; i < etudiants.length; i += 1) {
    result.push(
      await prisma.portfolio.upsert({
        where: { id_etudiant: etudiants[i].id_utilisateur },
        update: {
          id_modele: modeles[i % modeles.length].id_modele,
          titre: `Portfolio de ${etudiants[i].prenom} ${etudiants[i].nom}`,
          objectif_pro: etudiants[i].objectif_pro,
          theme: i % 2 === 0 ? "light" : "dark",
          est_public: true,
          url_public: `etudiant${i + 1}-portfolio`,
          date_modification: new Date(),
        },
        create: {
          id_etudiant: etudiants[i].id_utilisateur,
          id_modele: modeles[i % modeles.length].id_modele,
          titre: `Portfolio de ${etudiants[i].prenom} ${etudiants[i].nom}`,
          objectif_pro: etudiants[i].objectif_pro,
          theme: i % 2 === 0 ? "light" : "dark",
          est_public: true,
          url_public: `etudiant${i + 1}-portfolio`,
          date_modification: new Date(),
        },
      }),
    );
  }

  return result;
}

async function seedLettresRecommandation(etudiants, professeurs) {
  const lettres = [
    {
      etudiantIdx: 0,
      profIdx: 0,
      motif: "MASTER",
      date_souhaitee: toDate("2026-06-01"),
      statut: "REDIGEE",
      visibilite: "PRIVE",
      contenu:
        "Je recommande vivement cet etudiant pour ses qualites techniques et son serieux.",
    },
    {
      etudiantIdx: 1,
      profIdx: 1,
      motif: "EMPLOI",
      date_souhaitee: toDate("2026-07-01"),
      statut: "EN_ATTENTE",
      visibilite: "TELECHARGEABLE",
      contenu: null,
    },
    {
      etudiantIdx: 2,
      profIdx: 2,
      motif: "STAGE",
      date_souhaitee: toDate("2026-05-15"),
      statut: "REDIGEE",
      visibilite: "PUBLIC",
      contenu:
        "Etudiant rigoureux et motive, parfaitement adapte aux missions de stage en data science.",
    },
    {
      etudiantIdx: 3,
      profIdx: 0,
      motif: "INTERNATIONAL",
      date_souhaitee: toDate("2026-08-01"),
      statut: "EN_ATTENTE",
      visibilite: "TELECHARGEABLE",
      contenu: null,
    },
    {
      etudiantIdx: 4,
      profIdx: 1,
      motif: "EMPLOI",
      date_souhaitee: toDate("2026-09-01"),
      statut: "REDIGEE",
      visibilite: "PRIVE",
      contenu:
        "Yassine a fait preuve d’un excellent esprit d’equipe et d’un vrai sens du detail.",
    },
  ];

  for (const lettre of lettres) {
    const data = {
      id_etudiant: etudiants[lettre.etudiantIdx].id_utilisateur,
      id_professeur: professeurs[lettre.profIdx].id_utilisateur,
      motif: lettre.motif,
      date_souhaitee: lettre.date_souhaitee,
      statut: lettre.statut,
      visibilite: lettre.visibilite,
      contenu: lettre.contenu,
      url_fichier:
        lettre.statut === "REDIGEE"
          ? "https://example.com/lettres/lettre-1.pdf"
          : null,
    };

    await upsertByFirst(
      prisma.lettreRecommandation,
      {
        id_etudiant: data.id_etudiant,
        id_professeur: data.id_professeur,
        motif: data.motif,
      },
      data,
      "id_lettre",
    );
  }
}

async function seedConnexions(etudiants, professeurs, professionnels) {
  const connexions = [
    {
      demandeur: etudiants[0],
      destinataire: professeurs[0],
      statut: "EN_ATTENTE",
      date_demande: toDate("2026-05-28"),
    },
    {
      demandeur: etudiants[1],
      destinataire: professeurs[0],
      statut: "ACCEPTEE",
      date_demande: toDate("2026-05-20"),
      date_reponse: toDate("2026-05-22"),
    },
    {
      demandeur: etudiants[2],
      destinataire: professeurs[1],
      statut: "EN_ATTENTE",
      date_demande: toDate("2026-05-26"),
    },
    {
      demandeur: etudiants[3],
      destinataire: professeurs[1],
      statut: "ACCEPTEE",
      date_demande: toDate("2026-05-15"),
      date_reponse: toDate("2026-05-16"),
    },
    {
      demandeur: etudiants[4],
      destinataire: professeurs[2],
      statut: "EN_ATTENTE",
      date_demande: toDate("2026-05-30"),
    },
    {
      demandeur: etudiants[1],
      destinataire: professeurs[2],
      statut: "ACCEPTEE",
      date_demande: toDate("2026-05-12"),
      date_reponse: toDate("2026-05-14"),
    },
    {
      demandeur: etudiants[3],
      destinataire: professeurs[1],
      statut: "EN_ATTENTE",
      date_demande: toDate("2026-06-01"),
    },
    {
      demandeur: etudiants[2],
      destinataire: professeurs[2],
      statut: "ACCEPTEE",
      date_demande: toDate("2026-05-25"),
      date_reponse: toDate("2026-05-27"),
    },
    {
      demandeur: etudiants[0],
      destinataire: professionnels[0],
      statut: "EN_ATTENTE",
      date_demande: toDate("2026-05-29"),
    },
    {
      demandeur: etudiants[2],
      destinataire: professionnels[0],
      statut: "ACCEPTEE",
      date_demande: toDate("2026-05-18"),
      date_reponse: toDate("2026-05-20"),
    },
  ];

  for (const connexion of connexions) {
    const existing = await prisma.connexion.findFirst({
      where: {
        demandeur_id: connexion.demandeur.id_utilisateur,
        destinataire_id: connexion.destinataire.id_utilisateur,
      },
      select: { id_connexion: true },
    });

    const data = {
      demandeur_id: connexion.demandeur.id_utilisateur,
      destinataire_id: connexion.destinataire.id_utilisateur,
      statut: connexion.statut,
      date_demande: connexion.date_demande,
      date_reponse: connexion.date_reponse ?? null,
    };

    if (existing) {
      await prisma.connexion.update({
        where: { id_connexion: existing.id_connexion },
        data,
      });
    } else {
      await prisma.connexion.create({ data });
    }
  }
}

async function seedPostes(etudiants) {
  const result = [];
  const postsData = [
    "Je viens de publier mon portfolio et je suis fier du travail accompli.",
    "Aujourd’hui, j’ai termine la phase de design UI/UX de mon projet.",
    "Mon projet de fin d’annee avance bien et la demo est presque prete.",
    "Merci a mon professeur pour son soutien sur ma nouvelle application web.",
    "J’ai participe a un hackathon sur la cybersécurite ce weekend.",
    "Je suis en periode de stage chez Entreprise Alpha, c’est une super experience.",
    "Je cherche un mentor pour un projet de data science.",
    "J’ai obtenu une certification en Docker et je partage mes retours.",
    "Mon groupe a finalise la presentation de notre application mobile.",
    "Je travaille sur des exemples de projets GitHub pour enrichir mon portfolio.",
  ];

  for (let i = 0; i < postsData.length; i += 1) {
    const etudiant = etudiants[i % etudiants.length];
    const data = {
      id_auteur: etudiant.id_utilisateur,
      contenu: postsData[i],
      visibilite: "PUBLIC",
    };

    result.push(
      await upsertByFirst(
        prisma.poste,
        { id_auteur: data.id_auteur, contenu: data.contenu },
        data,
        "id_poste",
      ),
    );
  }

  return result;
}

async function seedCommentairesReactionsRecommandations(
  postes,
  portfolios,
  etudiants,
  professeurs,
  pros,
) {
  await prisma.reaction.upsert({
    where: {
      id_auteur_id_poste: {
        id_auteur: etudiants[1].id_utilisateur,
        id_poste: postes[0].id_poste,
      },
    },
    update: { type: "LIKE" },
    create: {
      id_auteur: etudiants[1].id_utilisateur,
      id_poste: postes[0].id_poste,
      type: "LIKE",
    },
  });

  const commentaires = [
    {
      id_auteur: pros[0].id_utilisateur,
      id_portfolio: portfolios[0].id_portfolio,
      id_poste: null,
      contenu: "Excellent portfolio, tres bien structure.",
    },
    {
      id_auteur: professeurs[0].id_utilisateur,
      id_portfolio: null,
      id_poste: postes[0].id_poste,
      contenu: "Bravo pour ce travail.",
    },
    {
      id_auteur: pros[1].id_utilisateur,
      id_portfolio: portfolios[1].id_portfolio,
      id_poste: null,
      contenu: "Une belle demonstration de maturite professionnelle.",
    },
    {
      id_auteur: professeurs[1].id_utilisateur,
      id_portfolio: null,
      id_poste: postes[1].id_poste,
      contenu: "Continue comme ca, le projet est prometteur.",
    },
  ];

  for (const commentaire of commentaires) {
    await upsertByFirst(
      prisma.commentaire,
      {
        id_auteur: commentaire.id_auteur,
        id_portfolio: commentaire.id_portfolio,
        id_poste: commentaire.id_poste,
        contenu: commentaire.contenu,
      },
      { ...commentaire, statut: "VALIDE", date: new Date() },
      "id_commentaire",
    );
  }

  const recommandations = [
    {
      id_auteur: pros[0].id_utilisateur,
      id_etudiant_cible: etudiants[0].id_utilisateur,
      message: "Etudiant tres competent, je le recommande chaleureusement.",
      role_auteur: "PROFESSIONNEL",
      statut: "VALIDE",
      portfolioIdx: 0,
    },
    {
      id_auteur: professeurs[0].id_utilisateur,
      id_etudiant_cible: etudiants[1].id_utilisateur,
      message: "Etudiant serieux et motive.",
      role_auteur: "PROFESSEUR",
      statut: "EN_ATTENTE",
      portfolioIdx: 1,
    },
    {
      id_auteur: pros[1].id_utilisateur,
      id_etudiant_cible: etudiants[2].id_utilisateur,
      message: "Excellent esprit d’innovation et collaboration.",
      role_auteur: "PROFESSIONNEL",
      statut: "VALIDE",
      portfolioIdx: 2,
    },
    {
      id_auteur: professeurs[1].id_utilisateur,
      id_etudiant_cible: etudiants[3].id_utilisateur,
      message: "Un profil serieux et une belle capacite de communication.",
      role_auteur: "PROFESSEUR",
      statut: "VALIDE",
      portfolioIdx: 3,
    },
  ];

  for (const recommandation of recommandations) {
    const { portfolioIdx, ...data } = recommandation;
    const reco = await upsertByFirst(
      prisma.recommandation,
      {
        id_auteur: data.id_auteur,
        id_etudiant_cible: data.id_etudiant_cible,
        message: data.message,
      },
      data,
      "id_recommandation",
    );

    if (data.statut === "VALIDE") {
      await prisma.portfolioRecommandation.upsert({
        where: {
          id_portfolio_id_recommandation: {
            id_portfolio: portfolios[portfolioIdx].id_portfolio,
            id_recommandation: reco.id_recommandation,
          },
        },
        update: { position: 1, est_affichee: true },
        create: {
          id_portfolio: portfolios[portfolioIdx].id_portfolio,
          id_recommandation: reco.id_recommandation,
          position: 1,
          est_affichee: true,
        },
      });
    }
  }
}

async function seedNotifications(etudiants, professeurs) {
  const notifications = [
    {
      utilisateur_id: etudiants[0].id_utilisateur,
      type: "VALIDATION_PROJET",
      message: "Votre projet a ete valide par le professeur.",
      canal_envoi: "APPLICATION",
      lu: false,
    },
    {
      utilisateur_id: etudiants[1].id_utilisateur,
      type: "BADGE_OBTENU",
      message: "Felicitations, vous avez obtenu le badge Dev Web.",
      canal_envoi: "EMAIL",
      lu: false,
    },
    {
      utilisateur_id: professeurs[0].id_utilisateur,
      type: "SOUMISSION_PROJET",
      message: "Un etudiant a soumis un nouveau projet a valider.",
      canal_envoi: "APPLICATION",
      lu: true,
    },
  ];

  for (const notification of notifications) {
    await upsertByFirst(
      prisma.notification,
      {
        utilisateur_id: notification.utilisateur_id,
        type: notification.type,
        message: notification.message,
      },
      {
        ...notification,
        date_reception: new Date(),
        cible_id: null,
        cible_type: null,
      },
      "id_notification",
    );
  }
}

async function seedGithub(etudiant) {
  const integration = await prisma.githubIntegration.upsert({
    where: { id_etudiant: etudiant.id_utilisateur },
    update: {
      github_username: "etudiant1-github",
      total_depot: 5,
      date_synchronisation: new Date(),
      est_actif: true,
    },
    create: {
      id_etudiant: etudiant.id_utilisateur,
      github_username: "etudiant1-github",
      total_depot: 5,
      date_synchronisation: new Date(),
      est_actif: true,
    },
  });

  const depots = [
    {
      nom_depot: "projet-web-app",
      url_depot: "https://github.com/etudiant1-github/projet-web-app",
      langages: { JavaScript: 70, CSS: 20, HTML: 10 },
      nb_commits: 45,
      total_depots: 5,
      est_public: true,
      est_importe_portfolio: true,
      date_creation: toDate("2024-10-01"),
    },
    {
      nom_depot: "api-rest-node",
      url_depot: "https://github.com/etudiant1-github/api-rest-node",
      langages: { TypeScript: 90, JavaScript: 10 },
      nb_commits: 28,
      total_depots: 5,
      est_public: true,
      est_importe_portfolio: false,
      date_creation: toDate("2025-01-15"),
    },
  ];

  for (const depot of depots) {
    await upsertByFirst(
      prisma.depotGithub,
      {
        id_integration: integration.id_integration,
        nom_depot: depot.nom_depot,
      },
      { ...depot, id_integration: integration.id_integration },
      "id_depot",
    );
  }
}

async function seedElementsValidables(projets, stages, activites, admin) {
  const elements = [
    { type: "PROJET", reference_id: projets[0].id_projet, statut: "VALIDE" },
    {
      type: "PROJET",
      reference_id: projets[1].id_projet,
      statut: "EN_ATTENTE",
    },
    { type: "STAGE", reference_id: stages[0].id_stage, statut: "VALIDE" },
    { type: "STAGE", reference_id: stages[1].id_stage, statut: "EN_ATTENTE" },
    {
      type: "ACTIVITE",
      reference_id: activites[0].id_activite,
      statut: "VALIDE",
    },
    {
      type: "ACTIVITE",
      reference_id: activites[1].id_activite,
      statut: "EN_ATTENTE",
    },
  ];

  for (const element of elements) {
    const saved = await upsertByFirst(
      prisma.elementValidable,
      { type: element.type, reference_id: element.reference_id },
      {
        ...element,
        validateur_id: admin.id_utilisateur,
        date_soumission: toDate("2026-01-10"),
        date_validation:
          element.statut === "VALIDE" ? toDate("2026-01-12") : null,
        motif_refus: element.statut === "REFUSE" ? "Document incomplet" : null,
      },
      "id_element",
    );

    if (["ACTIVITE", "PROJET", "STAGE"].includes(saved.type)) {
      const attestationType =
        saved.type === "ACTIVITE"
          ? "Activite parascolaire"
          : saved.type === "PROJET"
            ? "Projet academique"
            : "Stage professionnel";

      await prisma.attestation.upsert({
        where: { id_element: saved.id_element },
        update: {
          id_etudiant:
            saved.type === "PROJET"
              ? projets.find((projet) => projet.id_projet === saved.reference_id)?.id_etudiant
              : saved.type === "STAGE"
                ? stages.find((stage) => stage.id_stage === saved.reference_id)?.id_etudiant
                : activites.find((activite) => activite.id_activite === saved.reference_id)?.id_etudiant,
          titre: `Attestation de ${attestationType.toLowerCase()}`,
          type: attestationType,
          date: toDate("2026-01-12"),
          organisme: "Plateforme Portfolio",
          date_retention: toDate("2031-01-12"),
          description: `Attestation generee pour l’element validable de type ${saved.type}.`,
        },
        create: {
          id_element: saved.id_element,
          id_etudiant:
            saved.type === "PROJET"
              ? projets.find((projet) => projet.id_projet === saved.reference_id)?.id_etudiant
              : saved.type === "STAGE"
                ? stages.find((stage) => stage.id_stage === saved.reference_id)?.id_etudiant
                : activites.find((activite) => activite.id_activite === saved.reference_id)?.id_etudiant,
          titre: `Attestation de ${attestationType.toLowerCase()}`,
          type: attestationType,
          date: toDate("2026-01-12"),
          organisme: "Plateforme Portfolio",
          date_retention: toDate("2031-01-12"),
          description: `Attestation generee pour l’element validable de type ${saved.type}.`,
        },
      });
    }
  }
}

async function main() {
  console.log("Debut du seeding complet...");

  const [hashAdmin, hashProfesseur, hashEtudiant, hashProfessionnel] =
    await Promise.all([
      bcrypt.hash(PASSWORDS.admin, SALT_ROUNDS),
      bcrypt.hash(PASSWORDS.professeur, SALT_ROUNDS),
      bcrypt.hash(PASSWORDS.etudiant, SALT_ROUNDS),
      bcrypt.hash(PASSWORDS.professionnel, SALT_ROUNDS),
    ]);

  const admins = await seedAdministrateurs(hashAdmin);
  const professeurs = await seedProfesseurs(hashProfesseur);
  const etudiants = await seedEtudiants(hashEtudiant);
  const professionnels = await seedProfessionnels(hashProfessionnel);
  const competences = await seedCompetences();
  const technologies = await seedTechnologies();

  await seedProfilCompetences(etudiants, competences);
  const projets = await seedProjets(etudiants, professeurs, technologies);
  const stages = await seedStages(etudiants, professeurs);
  const activites = await seedActivites(etudiants, professeurs);
  const diplomes = await seedDiplomes(etudiants);
  const badges = await seedBadges(etudiants);

  await seedReglesBadge(badges);
  await seedReglesScore(admins[0]);
  await seedScoresCredibilite(etudiants);

  const modeles = await seedModelesPortfolio(admins[0]);
  const portfolios = await seedPortfolios(etudiants, modeles);

  await seedLettresRecommandation(etudiants, professeurs);

  const postes = await seedPostes(etudiants);
  await seedConnexions(etudiants, professeurs, professionnels);

  await seedCommentairesReactionsRecommandations(
    postes,
    portfolios,
    etudiants,
    professeurs,
    professionnels,
  );
  await seedNotifications(etudiants, professeurs);
  await seedGithub(etudiants[0]);
  await seedElementsValidables(projets, stages, activites, admins[0]);

  console.log("Seeding complet termine avec succes.");
  console.log("Comptes crees ou mis a jour :");
  console.log(
    `Admins: ${admins.map((u) => u.email).join(", ")} / ${PASSWORDS.admin}`,
  );
  console.log(
    `Professeurs: ${professeurs.map((u) => u.email).join(", ")} / ${PASSWORDS.professeur}`,
  );
  console.log(
    `Etudiants: ${etudiants.map((u) => u.email).join(", ")} / ${PASSWORDS.etudiant}`,
  );
  console.log(
    `Professionnels: ${professionnels.map((u) => u.email).join(", ")} / ${PASSWORDS.professionnel}`,
  );
  console.log(`Competences: ${competences.length}`);
  console.log(`Technologies: ${technologies.length}`);
  console.log(`Projets: ${projets.length}`);
  console.log(`Stages: ${stages.length}`);
  console.log(`Activites: ${activites.length}`);
  console.log(`Diplomes: ${diplomes.length}`);
  console.log(`Badges: ${badges.length}`);
}

main()
  .catch((e) => {
    console.error("Erreur de seeding complet :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
