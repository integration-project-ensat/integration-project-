require("dotenv").config();

const bcrypt = require("bcryptjs");
const prisma = require("./prisma/client");

async function main() {

  const password =
    await bcrypt.hash(
      "Nabil2006@",
      12
    );

  const user =
    await prisma.utilisateur.create({
      data: {
        nom: "Super",
        prenom: "Admin",
        email: "hboy29935@gmail.com",
        mot_de_passe_hashe: password,
        role: "ADMINISTRATEUR",
        est_actif: true,
        email_verifie: true
      }
    });

  await prisma.profil.create({
    data: {
      id_utilisateur:
        user.id_utilisateur
    }
  });

  await prisma.administrateur.create({
    data: {
      id_utilisateur:
        user.id_utilisateur,
      niveau_acces:
        "SUPER_ADMIN"
    }
  });

  console.log(
    "ADMIN CREATED"
  );

  process.exit();
}

main();