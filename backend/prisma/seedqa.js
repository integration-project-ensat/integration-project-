const prisma = require('./client');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;
const MOT_DE_PASSE = 'Password123!';

async function main() {
  console.log('🌱 Début du seed QA...');

  const hash = await bcrypt.hash(MOT_DE_PASSE, SALT_ROUNDS);

  // ==================== 1. ETUDIANT ACTIF ====================
  const etudiant = await prisma.utilisateur.upsert({
    where: { email: 'youssef.alaoui@test.com' },
    update: {},
    create: {
      email: 'youssef.alaoui@test.com',
      mot_de_passe_hashe: hash,
      nom: 'Alaoui',
      prenom: 'Youssef',
      role: 'ETUDIANT',
      est_actif: true,
      email_verifie: true,
      etudiant: {
        create: {
          numero_etudiant: 'ETU-2024-001',
          filiere: 'Informatique',
          annee_universitaire: '2024-2025',
          profil: {
            create: {}
          }
        }
      }
    }
  });
  console.log('✅ Etudiant actif créé :', etudiant.email);

  // ==================== 2. PROFESSEUR ACTIF ====================
  const professeur = await prisma.utilisateur.upsert({
    where: { email: 'fatima.bennani@test.com' },
    update: {},
    create: {
      email: 'fatima.bennani@test.com',
      mot_de_passe_hashe: hash,
      nom: 'Bennani',
      prenom: 'Fatima',
      role: 'PROFESSEUR',
      est_actif: true,
      email_verifie: true,
      professeur: {
        create: {
          code_administratif: 'PROF-2024-042',
          departement: 'Informatique',
          specialite: 'Réseaux'
        }
      }
    }
  });
  console.log('✅ Professeur actif créé :', professeur.email);

  // ==================== 3. PROFESSIONNEL EN ATTENTE ====================
  const professionnel = await prisma.utilisateur.upsert({
    where: { email: 'hamid.tazi@entreprise.com' },
    update: {},
    create: {
      email: 'hamid.tazi@entreprise.com',
      mot_de_passe_hashe: hash,
      nom: 'Tazi',
      prenom: 'Hamid',
      role: 'PROFESSIONNEL',
      est_actif: false,
      email_verifie: true,
      professionnel: {
        create: {
          entreprise: 'TechMaroc SA',
          poste: 'Ingénieur Senior',
          secteur: 'Informatique'
        }
      }
    }
  });
  console.log('✅ Professionnel en attente créé :', professionnel.email, '| ID:', professionnel.id_utilisateur);

  // ==================== 4. PROFESSIONNEL NON VERIFIE ====================
  const proNonVerifie = await prisma.utilisateur.upsert({
    where: { email: 'non.verifie@entreprise.com' },
    update: {},
    create: {
      email: 'non.verifie@entreprise.com',
      mot_de_passe_hashe: hash,
      nom: 'Chaoui',
      prenom: 'Sara',
      role: 'PROFESSIONNEL',
      est_actif: false,
      email_verifie: false,
      professionnel: {
        create: {
          entreprise: 'StartupMA',
          poste: 'Designer'
        }
      }
    }
  });
  console.log('✅ Professionnel non vérifié créé :', proNonVerifie.email);

  // ==================== 5. COMPTE AVEC CODE EXPIRE ====================
  const expire = await prisma.utilisateur.upsert({
    where: { email: 'expire@test.com' },
    update: {},
    create: {
      email: 'expire@test.com',
      mot_de_passe_hashe: hash,
      nom: 'Expire',
      prenom: 'Test',
      role: 'ETUDIANT',
      est_actif: false,
      email_verifie: false,
      etudiant: {
        create: {
          numero_etudiant: 'ETU-EXPIRE-001',
          filiere: 'Test',
          annee_universitaire: '2020-2021'
        }
      }
    }
  });
  console.log('✅ Compte expiré créé :', expire.email);

  // ==================== 6. ADMINISTRATEUR ====================
  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@systeme.com' },
    update: {},
    create: {
      email: 'admin@systeme.com',
      mot_de_passe_hashe: hash,
      nom: 'Admin',
      prenom: 'Principal',
      role: 'ADMINISTRATEUR',
      est_actif: true,
      email_verifie: true,
      administrateur: {
        create: {}
      }
    }
  });
  console.log('✅ Administrateur créé :', admin.email);

  // ==================== RÉSUMÉ ====================
  console.log('\n========================================');
  console.log('📋 RÉSUMÉ POUR QA');
  console.log('========================================');
  console.log('Mot de passe de tous les comptes :', MOT_DE_PASSE);
  console.log('');
  console.log('Comptes créés :');
  console.log('  ETUDIANT actif        :', 'youssef.alaoui@test.com');
  console.log('  PROFESSEUR actif      :', 'fatima.bennani@test.com');
  console.log('  PROFESSIONNEL attente :', 'hamid.tazi@entreprise.com', '→ ID:', professionnel.id_utilisateur);
  console.log('  PROFESSIONNEL non vér :', 'non.verifie@entreprise.com');
  console.log('  Compte expiré         :', 'expire@test.com');
  console.log('  ADMINISTRATEUR        :', 'admin@systeme.com');
  console.log('');
  console.log('Variables Postman à remplir :');
  console.log('  base_url            : http://localhost:3000/api/auth');
  console.log('  utilisateur_id_pro  :', professionnel.id_utilisateur);
  console.log('  admin_token         : faire POST /seconnecter avec admin@systeme.com');
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });