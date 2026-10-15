require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS_ORIGIN is a comma-separated list of allowed frontend origins, e.g.
//   https://ethiotriolingo.vercel.app,http://localhost:4200
// Vercel preview deployments (https://<anything>.vercel.app) are allowed when
// ALLOW_VERCEL_PREVIEWS=true.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''))
  .filter(Boolean);
const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === 'true';

app.use(cors({
  origin: (origin, callback) => {
    // No Origin header = server-to-server (e.g. Vercel rewrite proxy), curl, health checks.
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (allowVercelPreviews && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return callback(null, true);
    return callback(null, false); // omit CORS headers instead of throwing a 500
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, service: 'ethiolingo-server' }));
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'ethiolingo-server' }));

app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Unknown API route -> JSON 404 (always { error: "string" })
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️  JWT_SECRET is not set. Using an insecure default. Set it in production!');
    }
    console.log('Connecting to PostgreSQL and ensuring database schema...');
    await initDb();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`EthioLingo API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database connection:', err);
    process.exit(1);
  }
}

startServer();
