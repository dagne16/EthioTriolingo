const express = require('express');
const cors = require('cors');
const { initDb } = require('./db'); // Cleaned up your db initialization line

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS right after defining 'app'
app.use(cors({
  origin: 'https://vercel.app', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true 
}));

// Your routes can safely start below here...
const authRoutes = require('./routes/auth');
const progressRoutes = require('./routes/progress');
const leaderboardRoutes = require('./routes/leaderboard');
