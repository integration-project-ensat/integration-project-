const prisma = require('./client');
const bcrypt = require('bcryptjs');

async function main() {
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 15);

  const admin = await prisma.utilisateur.upsert({
    where: { email: process.env.ADMIN_EMAIL },
    update: {},
    create: {
      email:              process.env.ADMIN_EMAIL,
      mot_de_passe_hashe: hashedPassword,
      nom:                'Super',
      prenom:             'Admin',
      role:               'ADMINISTRATEUR',
      est_actif:          true,
      email_verifie:      true,
      profil: {
        create: {}
      },
      administrateur: {
        create: {
          niveau_acces: 'SUPER_ADMIN'
        }
      }
    }
  });

  console.log('Admin créé :', admin.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });