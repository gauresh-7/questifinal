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
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// Get all XP logs for current user
router.get('/xp_logs', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM xp_logs WHERE users_uid = $1',
      [req.users.uid]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new XP log
router.post('/xp_logs', verifyToken, async (req, res) => {
  try {
    const { task_id, xp_earned } = req.body;
    await pool.query(
      'INSERT INTO xp_logs (users_uid, task_id, xp_earned, created_at) VALUES ($1, $2, $3, NOW())',
      [req.users.uid, task_id, xp_earned]
    );
    res.json({ message: 'XP log added!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
