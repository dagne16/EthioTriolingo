const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth, signToken } = require('../middleware/auth');

const router = express.Router();

const VALID_GENDERS = ['female', 'male'];
const VALID_BASE_LANGS = ['amharic', 'oromo', 'tigrigna', 'spanish', 'english'];
const VALID_COURSES = ['spanish', 'english', 'oromo', 'amharic', 'tigrigna'];
const VALID_AVATAR_COLORS = ['green', 'blue', 'purple', 'orange', 'pink', 'teal'];

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    gender: row.gender,
    baseLanguage: row.base_language,
    preferredCourse: row.preferred_course,
    avatarColor: row.avatar_color,
    age: row.age,
    xp: row.xp
  };
}

function isValidAge(age) {
  return Number.isInteger(age) && age >= 5 && age <= 120;
}

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, gender, baseLanguage, preferredCourse, avatarColor } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const insertRes = await db.query(`
      INSERT INTO users (name, email, password_hash, gender, base_language, preferred_course, avatar_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      name,
      normalizedEmail,
      passwordHash,
      VALID_GENDERS.includes(gender) ? gender : 'other',
      VALID_BASE_LANGS.includes(baseLanguage) ? baseLanguage : 'amharic',
      VALID_COURSES.includes(preferredCourse) ? preferredCourse : 'spanish',
      VALID_AVATAR_COLORS.includes(avatarColor) ? avatarColor : 'green'
    ]);

    const user = insertRes.rows[0];
    const token = signToken(user.id);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    const result = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user.id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/me — update profile fields (avatar, preferred course, base language, age)
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { avatarColor, preferredCourse, baseLanguage, name, age } = req.body || {};
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const parsedAge = Number(age);
    const nextValues = {
      name: typeof name === 'string' && name.trim() ? name.trim() : user.name,
      avatar_color: VALID_AVATAR_COLORS.includes(avatarColor) ? avatarColor : user.avatar_color,
      preferred_course: VALID_COURSES.includes(preferredCourse) ? preferredCourse : user.preferred_course,
      base_language: VALID_BASE_LANGS.includes(baseLanguage) ? baseLanguage : user.base_language,
      age: age !== undefined ? (isValidAge(parsedAge) ? parsedAge : user.age) : user.age
    };

    const updateRes = await db.query(`
      UPDATE users SET name = $1, avatar_color = $2, preferred_course = $3, base_language = $4, age = $5
      WHERE id = $6
      RETURNING *
    `, [nextValues.name, nextValues.avatar_color, nextValues.preferred_course, nextValues.base_language, nextValues.age, req.userId]);

    res.json({ user: publicUser(updateRes.rows[0]) });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/me/xp — award XP (e.g. after finishing a lesson)
router.post('/me/xp', requireAuth, async (req, res, next) => {
  try {
    const amount = Number(req.body?.amount);
    if (!Number.isFinite(amount) || amount < 0 || amount > 1000) {
      return res.status(400).json({ error: 'Invalid XP amount.' });
    }
    const updateRes = await db.query(
      'UPDATE users SET xp = xp + $1 WHERE id = $2 RETURNING *',
      [Math.round(amount), req.userId]
    );
    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: publicUser(updateRes.rows[0]) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
