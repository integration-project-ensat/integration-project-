const prisma = require('./client');

const badges = [
  {
    nom: 'Web Developer',
    description: 'Attribué après plusieurs projets web validés',
    critere_type: 'WEB_DEV',
    est_visible: true,
    mis_en_avant: true,
    criteres: {
      min_projets_valides: 3,
      technologies: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js']
    }
  },
  {
    nom: 'DevOps Explorer',
    description: 'Attribué pour un projet utilisant Docker ou CI/CD',
    critere_type: 'DEVOPS',
    est_visible: true,
    mis_en_avant: true,
    criteres: {
      min_projets_valides: 1,
      technologies: ['Docker', 'CI/CD', 'GitHub Actions', 'Kubernetes']
    }
  },
  {
    nom: 'Hackathon Participant',
    description: 'Attribué après participation à un hackathon',
    critere_type: 'HACKATHON',
    est_visible: true,
    mis_en_avant: false,
    criteres: {
      min_hackathons: 1
    }
  },
  {
    nom: 'Collaboration',
    description: 'Attribué après plusieurs recommandations validées',
    critere_type: 'COLLAB',
    est_visible: true,
    mis_en_avant: false,
    criteres: {
      min_recommandations_valides: 2
    }
  },
  {
    nom: 'Ingénieur Full-Stack',
    description: 'Attribué à l’étudiant capable de livrer plusieurs projets validés en combinant front-end, back-end et déploiement',
    critere_type: 'WEB_DEV',
    est_visible: true,
    mis_en_avant: true,
    criteres: {
      min_projets_valides: 4,
      technologies: ['React', 'Node.js', 'Docker', 'PostgreSQL', 'TypeScript', 'Express', 'GitHub Actions', 'Kubernetes'],
      min_hackathons: 1,
      min_recommandations_valides: 1
    }
  }
];

async function main() {
  for (const item of badges) {
    const { criteres, ...badgeData } = item;

    let badge = await prisma.badge.findFirst({
      where: {
        nom: badgeData.nom,
        critere_type: badgeData.critere_type
      }
    });

    if (!badge) {
      badge = await prisma.badge.create({
        data: badgeData
      });
    } else {
      badge = await prisma.badge.update({
        where: { id_badge: badge.id_badge },
        data: badgeData
      });
    }

    const regleExistante = await prisma.regleBadge.findFirst({
      where: {
        id_badge: badge.id_badge
      }
    });

    if (!regleExistante) {
      await prisma.regleBadge.create({
        data: {
          id_badge: badge.id_badge,
          criteres,
          est_valide: true
        }
      });
    } else {
      await prisma.regleBadge.update({
        where: { id_regle: regleExistante.id_regle },
        data: {
          criteres,
          est_valide: true
        }
      });
    }
  }

  console.log('Badges et règles insérés avec succès');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
