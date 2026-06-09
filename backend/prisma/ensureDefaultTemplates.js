const prisma = require('./client')

async function ensureTemplates() {
  const modern = await prisma.modelePortfolio.findFirst({
    where: { nom: 'Modern' }
  })

  if (!modern) {
    await prisma.modelePortfolio.create({
      data: {
        nom: 'Modern',
        structure: {},
        theme: 'dark',
        sections:
          'about,skills,projects,experience,certifications,contact'
      }
    })

    console.log('Template Modern créé')
  }
}

module.exports = ensureTemplates