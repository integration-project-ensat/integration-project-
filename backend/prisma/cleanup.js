
const prisma = require('./client');
require('dotenv').config();
const emailsAGarder = [
  'youssef.alaoui@test.com',
  'fatima.bennani@test.com',
  'hamid.tazi@entreprise.com',
  'non.verifie@entreprise.com',
  'expire@test.com',
  'admin@systeme.com',
  'supadmin@portfolio.ma',
 process.env.ADMIN_EMAIL
];

async function main() {
  console.log('🧹 Nettoyage en cours...');

  // Trouver les IDs à supprimer
  const aSupprimer = await prisma.utilisateur.findMany({
    where: { email: { notIn: emailsAGarder } },
    select: { id_utilisateur: true, email: true }
  });

  if (aSupprimer.length === 0) {
    console.log('✅ Rien à supprimer.');
    return;
  }

  console.log('\n🗑️  Utilisateurs à supprimer :');
  console.table(aSupprimer);

  const ids = aSupprimer.map(u => u.id_utilisateur);

  // 1. Supprimer profil étudiant (relation la plus profonde)
  await prisma.Profil.deleteMany({
    where: { etudiant: { id_utilisateur: { in: ids } } }
  }).catch(() => console.log('ℹ️  Pas de profilEtudiant à supprimer'));

  // 2. Supprimer étudiant
  await prisma.etudiant.deleteMany({
    where: { id_utilisateur: { in: ids } }
  });

  // 3. Supprimer professeur
  await prisma.professeur.deleteMany({
    where: { id_utilisateur: { in: ids } }
  });

  // 4. Supprimer professionnel
  await prisma.professionnel.deleteMany({
    where: { id_utilisateur: { in: ids } }
  });

  // 5. Supprimer administrateur
  await prisma.administrateur.deleteMany({
    where: { id_utilisateur: { in: ids } }
  });

  // 6. Supprimer utilisateur
  const suppression = await prisma.utilisateur.deleteMany({
    where: { id_utilisateur: { in: ids } }
  });

  console.log(`\n✅ ${suppression.count} utilisateur(s) supprimé(s)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());