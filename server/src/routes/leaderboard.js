const express = require('express');
const db = require('../db');

const router = express.Router();

// GET /api/leaderboard?limit=20
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const result = await db.query(
      'SELECT id, name, xp FROM users ORDER BY xp DESC, created_at ASC LIMIT $1',
      [limit]
    );
    res.json({
      leaderboard: result.rows.map((r, i) => ({
        rank: i + 1,
        id: r.id,
        name: r.name,
        xp: r.xp
      }))
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
