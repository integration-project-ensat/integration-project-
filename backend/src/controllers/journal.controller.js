const prisma = require('../../prisma/client');

const MAX_LIMIT = 100;

// GET /api/auth/admin/journal-connexions
async function getJournalConnexions(req, res, next) {
  try {
    const page = Math.max(Number.parseInt(req.query.page ?? '1', 10), 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit ?? '50', 10), 1),
      MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.journalConnexion.findMany({
        skip: Number.isFinite(skip) && skip >= 0 ? skip : 0,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.journalConnexion.count(),
    ]);

    return res.json({
      success: true,
      page,
      limit,
      total,
      data: items,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getJournalConnexions };
