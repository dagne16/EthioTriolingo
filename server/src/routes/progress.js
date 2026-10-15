const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/progress — list of { courseId, unitId } the user has completed
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT course_id, unit_id FROM progress WHERE user_id = $1',
      [req.userId]
    );
    res.json({
      progress: result.rows.map(r => ({ courseId: r.course_id, unitId: r.unit_id }))
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/progress — mark a unit complete (idempotent)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { courseId, unitId } = req.body || {};
    if (!courseId || !unitId) {
      return res.status(400).json({ error: 'courseId and unitId are required.' });
    }

    await db.query(`
      INSERT INTO progress (user_id, course_id, unit_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, course_id, unit_id) DO NOTHING
    `, [req.userId, courseId, unitId]);

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
