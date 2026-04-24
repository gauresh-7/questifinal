const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth } = require('../firebase');

// Middleware: verify Firebase ID token
async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Get current user profile
router.get('/users/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE uid = $1',
      [req.user.uid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new user (after signup)
router.post('/users', verifyToken, async (req, res) => {
  try {
    const { display_name } = req.body;
    await pool.query(
      'INSERT INTO users (uid, email, display_name, xp, level) VALUES ($1, $2, $3, $4, $5)',
      [req.user.uid, req.user.email, display_name, 0, 1]
    );
    res.json({ message: 'User created!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all users
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new user
router.post('/users', async (req, res) => {
  try {
    const { uid, email, display_name } = req.body;
    const result = await pool.query(
      'INSERT INTO users (uid, email, display_name) VALUES ($1, $2, $3) RETURNING *',
      [uid, email, display_name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update XP or level
router.put('/users/xp', verifyToken, async (req, res) => {
  try {
    const { xp, level } = req.body;
    await pool.query(
      'UPDATE users SET xp = $1, level = $2 WHERE uid = $3',
      [xp, level, req.user.uid]
    );
    res.json({ message: 'User updated!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;