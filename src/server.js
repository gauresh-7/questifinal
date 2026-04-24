const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { db, auth } = require('./firebase');

const app = express();
const PORT = process.env.PORT;
const dbUrl = process.env.DATABASE_URL;
const firebaseKey = process.env.FIREBASE_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());

// Routes placeholder
app.get('/', (req, res) => {
  res.send('OJT Backend is running');
});

const taskRoutes = require('./routes/taskRoutes');
app.use('/api', taskRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

const xpLogRoutes = require('./routes/xpLogRoutes');
app.use('/api', xpLogRoutes);

const inventoryRoutes = require('./routes/inventoryRoutes');
app.use('/api', inventoryRoutes);


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//test
const pool = require('./db');

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.urlencoded({ extended: true }));
