const prisma = require('./client')

async function main() {
  await prisma.modelePortfolio.createMany({
    skipDuplicates: true,
    data: [
      {
        nom: 'Modern',
        structure: {},
        theme: 'dark',
        sections:
          'about,skills,projects,experience,certifications,contact'
      },
      {
        nom: 'Corporate',
        structure: {},
        theme: 'light',
        sections:
          'about,experience,projects,contact'
      },
      {
        nom: 'Creative',
        structure: {},
        theme: 'purple',
        sections:
          'about,skills,projects,gallery,contact'
      }
    ]
  })

  console.log('Templates créés')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })