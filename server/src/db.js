const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ Warning: DATABASE_URL is not set in environment or .env file!');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle Neon PostgreSQL client', err);
});

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        gender TEXT NOT NULL DEFAULT 'other',
        base_language TEXT NOT NULL DEFAULT 'amharic',
        preferred_course TEXT NOT NULL DEFAULT 'spanish',
        avatar_color TEXT NOT NULL DEFAULT 'green',
        xp INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id TEXT NOT NULL,
        unit_id TEXT NOT NULL,
        completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, course_id, unit_id)
      );

      CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_xp ON users(xp DESC);

      ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
    `);
    console.log('✅ Neon PostgreSQL database schema initialized successfully.');
  } finally {
    client.release();
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  initDb
};
