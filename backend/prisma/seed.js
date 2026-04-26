const {prismaClient} = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new prismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('supadmin123', 15);
    
    const admin = await prisma.utilisateur.create({
        data: {
            email: 'supadmin@portfolio.ma',
            mot_de_passe: hashedPassword,
            nom: 'Super',
            prenom: 'Admin',
            role: 'ADMINISTRATEUR ',
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
