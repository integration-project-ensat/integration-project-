const prisma = require('./client');

async function main() {

  // récupérer les badges existants
  const webBadge = await prisma.badge.findFirst({
    where: { nom: 'Web Developer' }
  });

  const devopsBadge = await prisma.badge.findFirst({
    where: { nom: 'DevOps Explorer' }
  });

  const hackathonBadge = await prisma.badge.findFirst({
    where: { nom: 'Hackathon Participant' }
  });

  const collabBadge = await prisma.badge.findFirst({
    where: { nom: 'Collaboration' }
  });

  // WEB DEV
  if (webBadge) {
    await prisma.regleBadge.create({
      data: {
        id_badge: webBadge.id_badge,
        criteres: {
          min_projets_valides: 3,
          technologies: [
            'HTML',
            'CSS',
            'JavaScript',
            'React',
            'Node.js'
          ]
        },
        est_valide: true
      }
    });
  }

  // DEVOPS
  if (devopsBadge) {
    await prisma.regleBadge.create({
      data: {
        id_badge: devopsBadge.id_badge,
        criteres: {
          min_projets_valides: 1,
          technologies: [
            'Docker',
            'CI/CD',
            'GitHub Actions',
            'Kubernetes'
          ]
        },
        est_valide: true
      }
    });
  }

  // HACKATHON
  if (hackathonBadge) {
    await prisma.regleBadge.create({
      data: {
        id_badge: hackathonBadge.id_badge,
        criteres: {
          min_hackathons: 1
        },
        est_valide: true
      }
    });
  }

  // COLLABORATION
  if (collabBadge) {
    await prisma.regleBadge.create({
      data: {
        id_badge: collabBadge.id_badge,
        criteres: {
          min_recommandations_valides: 2
        },
        est_valide: true
      }
    });
  }

  console.log('Règles badges insérées avec succès');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());