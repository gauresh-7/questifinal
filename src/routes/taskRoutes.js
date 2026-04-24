const express = require('express');
const router = express.Router();
const pool = require('../db'); // assuming you set up pg Pool in db.js

// GET all tasks
router.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new task
router.post('/tasks', async (req, res) => {
  try {
    const { title, xp_reward } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (title, xp_reward) VALUES ($1, $2) RETURNING *',
      [title, xp_reward]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
