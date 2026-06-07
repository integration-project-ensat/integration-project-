/**
 * Seed réaliste pour alimenter le dashboard admin (dashboard + connexions).
 *
 * Objectif : créer suffisamment de données pour que GET /api/admin/dashboard retourne
 * des valeurs non vides (stats, croissance, repartitionFilieres, activiteRecente).
 *
 * Usage (exemple) :
 *   node prisma/seedAdminDashboardRealData.js
 */

const prisma = require('./client')

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)]
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function monthsAgo(n) {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  d.setDate(1)
  return d
}

async function main() {
  const bcrypt = require('bcryptjs')
  const SALT_ROUNDS = 12

  // password utilisé pour mot_de_passe_hashe (adapte si besoin)
  const PASSWORD = process.env.SEED_ADMINBOARD_ETUDIANT_PASSWORD || 'Etudiant1234!'
  const hashEtudiant = await bcrypt.hash(PASSWORD, SALT_ROUNDS)

  // Dépendances : schema doit contenir ces modèles
  // (les noms correspondent au backend existant)


  const filieres = [
    'Design',
    'Informatique',
    'Développement',
    'IA',
    'Data',
    'Marketing',
    'Réseaux',
    'Sécurité',
  ]

  const etablissements = [
    'Universite Hassan II',
    'EST Agadir',
    'EMI Rabat',
    'Al Akhawayn University',
    'ENCG Fes',
  ]

  const villes = ['Casablanca', 'Agadir', 'Rabat', 'Ifrane', 'Fès', 'Marrakech']

  // 1) Clean partiel (optionnel). Ici on ne purge pas en prod.
  // Si vous voulez un reset complet, décommentez :
  // await prisma.journalConnexion.deleteMany({});

  // 2) Créer des étudiants si nécessaire
  // On crée des utilisateurs ETUDIANT actifs.
  const existingStudentsCount = await prisma.utilisateur.count({ where: { role: 'ETUDIANT', est_actif: true } })
  const target = Math.max(60, existingStudentsCount)

  if (existingStudentsCount < target) {
    const toCreate = target - existingStudentsCount
    const firstNames = ['Karim', 'Leila', 'Amine', 'Sarah', 'Youssef', 'Sofia', 'Nadia', 'Omar', 'Laila', 'Hassan']
    const lastNames = ['Bennani', 'Chraibi', 'El Fassi', 'Mansouri', 'Ame', 'Kenzi', 'Tazi', 'Benali', 'Akhawayn', 'Haddad']

    const createdIds = []

    for (let i = 0; i < toCreate; i++) {
      const prenom = pick(firstNames)
      const nom = pick(lastNames)
      const email = `${prenom.toLowerCase()}.${nom.toLowerCase()}${randInt(1, 999)}@example.com`

      // create utilisateur
      // Note : selon votre schéma, les champs peuvent varier.
      // On essaye de rester minimal : vous devrez adapter si votre modèle exige d'autres champs.
      const utilisateur = await prisma.utilisateur.create({
        data: {
          nom,
          prenom,
          email,
          role: 'ETUDIANT',
          est_actif: true,
          mot_de_passe_hashe: hashEtudiant,

          // date_creation gérée par défaut si @default(now())
          profil: {
            create: {
              photo_profil: null,
              adresse: pick(villes),
            },
          },
          etudiant: {
            create: {
              filiere: pick(filieres),
              // score_credibilite : si modèle séparé
              score_credibilite: {
                create: {
                  score_total: randInt(0, 100),
                },
              },
              diplomes: {
                create: {
                  annee_fin: randInt(2018, new Date().getFullYear()),
                  etablissement: pick(etablissements),
                  titre_diplome: pick(['Licence', 'Master', 'Doctorat', 'Ingénierie']),
                },
              },
            },
          },
        },
      })

      createdIds.push(utilisateur.id_utilisateur)

      if ((i + 1) % 10 === 0) {
        // eslint-disable-next-line no-console
        console.log(`seed utilisateurs: ${i + 1}/${toCreate}`)
      }
    }

    // 3) Déterminer email_verifie pour générer des statuts
    // On n'ajuste pas ici sans savoir votre champ exact. Adaptation possible.
    // eslint-disable-next-line no-console
    console.log(`Created students: ${createdIds.length}`)
  }

  // 4) Ajouter des journaux de connexion pour remplir activiteRecente
  // On génère 30-100 logs sur les dernières semaines.
  const existingLogs = await prisma.journalConnexion.count()
  const targetLogs = Math.max(120, existingLogs)

  if (existingLogs < targetLogs) {
    const students = await prisma.utilisateur.findMany({
      where: { role: 'ETUDIANT', est_actif: true },
      select: { id_utilisateur: true, prenom: true, nom: true, email: true, profil: { select: { photo_profil: true } } },
      take: 200,
    })

    const actions = [
      { action: 'LOGIN_REUSSI', raison: null },
      { action: 'LOGIN_ECHOUE', raison: 'MOT_DE_PASSE_INCORRECT' },
      { action: 'DECONNEXION', raison: null },
    ]

    const toCreate = targetLogs - existingLogs
    for (let i = 0; i < toCreate; i++) {
      const u = pick(students)
      const a = pick(actions)
      const dt = daysAgo(randInt(0, 30))

      await prisma.journalConnexion.create({
        data: {
          action: a.action,
          raison: a.raison,
          utilisateur: { connect: { id_utilisateur: u.id_utilisateur } },
          date: dt,
          adresse_ip: `${randInt(10, 210)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(0, 255)}`,
          user_agent: 'Mozilla/5.0',
        },
      })
    }

    // eslint-disable-next-line no-console
    console.log(`Created journalConnexion rows: ${toCreate}`)
  }

  // eslint-disable-next-line no-console
  console.log('Seed admin dashboard real data finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

