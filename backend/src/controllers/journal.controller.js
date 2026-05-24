// src/controllers/journal.controller.js

const prisma = require('../../prisma/client');
const { getPaginationParams, buildPaginatedResult } = require('../utils/pagination');

const ACTIONS_VALIDES = ['LOGIN_REUSSI', 'LOGIN_ECHOUE', 'DECONNEXION'];
const ROLES_VALIDES   = ['ETUDIANT', 'PROFESSEUR', 'PROFESSIONNEL', 'ADMINISTRATEUR'];

// GET /api/auth/admin/journal-connexions
// Query params supportés :
//   page       (défaut 1)
//   limit      (défaut 10, max 100)
//   action     LOGIN_REUSSI | LOGIN_ECHOUE | DECONNEXION
//   role       ETUDIANT | PROFESSEUR | PROFESSIONNEL | ADMINISTRATEUR
//   ip         filtre partiel sur adresse_ip
//   dateDebut  ISO 8601 (ex: 2024-01-01)
//   dateFin    ISO 8601 (ex: 2024-12-31)

async function getJournalConnexions(req, res, next) {
  try {
    const { page, limit, skip } = getPaginationParams(req);

    const where = {};

    // -- action
    if (req.query.action) {
      if (!ACTIONS_VALIDES.includes(req.query.action)) {
        return res.status(400).json({
          success: false,
          message: `Valeur action invalide. Valeurs acceptées : ${ACTIONS_VALIDES.join(', ')}`,
        });
      }
      where.action = req.query.action;
    }

    // -- role
    if (req.query.role) {
      if (!ROLES_VALIDES.includes(req.query.role)) {
        return res.status(400).json({
          success: false,
          message: `Valeur role invalide. Valeurs acceptées : ${ROLES_VALIDES.join(', ')}`,
        });
      }
      where.role = req.query.role;
    }

    // -- ip (filtre partiel, max 45 caractères)
    if (req.query.ip) {
      const ip = String(req.query.ip).trim().slice(0, 45);
      if (ip) where.adresse_ip = { contains: ip };
    }

    // -- dates
    if (req.query.dateDebut || req.query.dateFin) {
      where.date = {};

      if (req.query.dateDebut) {
        const debut = new Date(req.query.dateDebut);
        if (isNaN(debut.getTime())) {
          return res.status(400).json({ success: false, message: 'dateDebut invalide (format attendu : YYYY-MM-DD)' });
        }
        where.date.gte = debut;
      }

      if (req.query.dateFin) {
        const fin = new Date(req.query.dateFin);
        if (isNaN(fin.getTime())) {
          return res.status(400).json({ success: false, message: 'dateFin invalide (format attendu : YYYY-MM-DD)' });
        }
        fin.setHours(23, 59, 59, 999);
        where.date.lte = fin;
      }

      if (
        where.date.gte &&
        where.date.lte &&
        where.date.gte > where.date.lte
      ) {
        return res.status(400).json({ success: false, message: 'dateDebut doit être antérieure à dateFin' });
      }
    }

    const [items, total] = await Promise.all([
      prisma.journalConnexion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.journalConnexion.count({ where }),
    ]);

    return res.json({
      success: true,
      ...buildPaginatedResult(items, page, limit, total),
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getJournalConnexions };