require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/pool');
const incidentRoutes = require('./routes/incidents');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/incidents', incidentRoutes);
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'ok', db: 'disconnected', error: err.message });
  }
});

app.use('/api/auth', authRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Hindsight API running on port ${PORT}`);
});