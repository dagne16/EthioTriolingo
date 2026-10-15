require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'ethiolingo-server' }));

app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

async function startServer() {
  try {
    console.log('Connecting to Neon PostgreSQL and ensuring database schema...');
    await initDb();
    app.listen(PORT, () => {
      console.log(`EthioLingo API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database connection:', err);
    process.exit(1);
  }
}

startServer();
