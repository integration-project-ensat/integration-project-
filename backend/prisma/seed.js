const {PrismaClient} = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 15);
    
    const admin = await prisma.utilisateur.create({
        data: {
            email: process.env.ADMIN_EMAIL,
            mot_de_passe: hashedPassword,
            nom: 'Super',
            prenom: 'Admin',
            role: 'ADMINISTRATEUR',
            est_actif: true,
            administrateur: {
                create: {
                    niveau_acces: 'SUPER'
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
