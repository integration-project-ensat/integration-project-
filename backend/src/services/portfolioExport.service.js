const { prisma, toBigInt } = require('../models/prisma');
const puppeteer = require('puppeteer');

// Construire le HTML du portfolio
const buildPortfolioHTML = async (id_etudiant) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { id_etudiant: toBigInt(id_etudiant) },
    include: {
      etudiant: {
        include: { utilisateur: true }, // adapte selon ton schéma
      },
      modele: true,
    },
  });

  if (!portfolio) throw { status: 404, message: 'Portfolio non trouvé' };

  const nom = portfolio.etudiant?.utilisateur?.nom || 'Étudiant';
  const prenom = portfolio.etudiant?.utilisateur?.prenom || '';
  const email = portfolio.etudiant?.utilisateur?.email || '';
  const titre = portfolio.titre || 'Portfolio';
  const objectif = portfolio.objectif_pro || '';

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8"/>
      <title>${titre}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 50px; color: #2c2c2a; }
        h1 { color: #185FA5; border-bottom: 2px solid #185FA5; padding-bottom: 8px; }
        h2 { color: #0F6E56; margin-top: 30px; }
        .info { color: #5f5e5a; font-size: 14px; margin-bottom: 20px; }
        .section { margin-bottom: 24px; padding: 16px; 
                   background: #f1efe8; border-radius: 8px; }
        .badge { display: inline-block; background: #e1f5ee; 
                 color: #0F6E56; padding: 4px 12px; 
                 border-radius: 12px; margin: 4px; font-size: 13px; }
        .footer { margin-top: 60px; font-size: 11px; color: #888; text-align: center; }
      </style>
    </head>
    <body>
      <h1>${titre}</h1>
      <p class="info">${prenom} ${nom} — ${email}</p>

      ${objectif ? `
      <div class="section">
        <h2>Objectif Professionnel</h2>
        <p>${objectif}</p>
      </div>` : ''}

      <div class="footer">
        Généré le ${new Date().toLocaleDateString('fr-FR')}
      </div>
    </body>
    </html>
  `;
};

// Export HTML → retourne la string
const exportHTML = async (id_etudiant) => {
  return await buildPortfolioHTML(id_etudiant);
};

// Export PDF → retourne un Buffer
const exportPDF = async (id_etudiant) => {
  const html = await buildPortfolioHTML(id_etudiant);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

module.exports = { exportHTML, exportPDF };
