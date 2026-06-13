const { prisma, toBigInt } = require('../models/prisma')
const puppeteer = require('puppeteer')

const buildLettreHTML = async (id_lettre) => {
  const lettre = await prisma.lettreRecommandation.findUnique({
    where: { id_lettre: toBigInt(id_lettre) },
    include: { professeur: { include: { utilisateur: true } }, etudiant: { include: { utilisateur: true } } },
  })

  if (!lettre) throw { status: 404, message: 'Lettre non trouvée' }

  const auteurNom = lettre.professeur?.utilisateur?.nom || ''
  const auteurPrenom = lettre.professeur?.utilisateur?.prenom || ''
  const destinataire = `${lettre.etudiant?.utilisateur?.prenom || ''} ${lettre.etudiant?.utilisateur?.nom || ''}`
  const contenu = lettre.contenu || ''
  const motif = lettre.motif || ''

  return `
    <!doctype html>
    <html lang="fr">
    <head>
      <meta charset="utf-8" />
      <title>Lettre de recommandation</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #222 }
        .header { margin-bottom: 24px }
        .meta { color: #555; font-size: 14px }
        .content { margin-top: 24px; line-height: 1.5 }
        .signature { margin-top: 40px }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Lettre de recommandation</h2>
        <div class="meta">Pour: ${destinataire}</div>
        <div class="meta">De: ${auteurPrenom} ${auteurNom}</div>
        <div class="meta">Motif: ${motif}</div>
      </div>

      <div class="content">${contenu}</div>

      <div class="signature">Cordialement,<br/>${auteurPrenom} ${auteurNom}</div>
    </body>
    </html>
  `
}

const exportHTML = async (id_lettre) => {
  return await buildLettreHTML(id_lettre)
}

const exportPDF = async (id_lettre) => {
  const html = await buildLettreHTML(id_lettre)

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } })
    return pdfBuffer
  } finally {
    await browser.close()
  }
}

module.exports = { exportHTML, exportPDF }
