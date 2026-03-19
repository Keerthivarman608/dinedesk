const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./database');
require('dotenv').config();

const app = express();
// Render assigns a dynamic PORT in production
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Postgres Schema immediately
db.initSchema();

// Serve the compiled frontend web app
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
    
    const id = 'U_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    await db.query(
      'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
      [id, name, email, password, role]
    );
      
    res.json({ success: true, user: { id, name, email, role } });
  } catch (err) {
    if (err.message.includes('unique constraint')) return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query(
      'SELECT id, name, email, role FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth Login
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    // Decode the Google JWT (the payload is the second base64 segment)
    const payload = JSON.parse(Buffer.from(credential.split('.')[1], 'base64').toString());
    const { email, name, sub: googleId, picture } = payload;

    // Check if user already exists
    let result = await db.query('SELECT id, name, email, role FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      // Auto-register as CUSTOMER on first Google login
      const id = 'G_' + googleId.substring(0, 10);
      await db.query(
        'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
        [id, name, email, 'GOOGLE_AUTH', 'CUSTOMER']
      );
      result = await db.query('SELECT id, name, email, role FROM users WHERE email = $1', [email]);
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// RESTAURANT ROUTES
// ==========================================

// Get All (For Customer Feed)
app.get('/api/restaurants', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM restaurants');
    const results = result.rows.map(r => ({ ...r, tags: r.tags ? r.tags.split(',') : [] }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create New Restaurant (For Restaurant Owners)
app.post('/api/restaurants', async (req, res) => {
  try {
    const { ownerId, name, cuisine, distance, image, about, priceRange, tags } = req.body;
    const result = await db.query(`
      INSERT INTO restaurants (ownerId, name, cuisine, rating, reviews, distance, image, about, priceRange, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
    `, [ownerId, name, cuisine, 0.0, 0, distance, image, about, priceRange, tags.join(',')]);
    
    res.json({ success: true, restaurantId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Restaurants Owned By User
app.get('/api/restaurants/owner/:ownerId', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM restaurants WHERE ownerId = $1', [req.params.ownerId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// BOOKING ROUTES
// ==========================================

// Create Booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { restaurantId, userId, date, time, guests, notes } = req.body;
    const id = Math.random().toString(16).substring(2, 10).toUpperCase();

    await db.query(
      'INSERT INTO bookings (id, restaurantId, userId, date, time, guests, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, restaurantId, userId, date, time, guests, 'Pending', notes || '']
    );
    
    res.json({ success: true, bookingId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Bookings for Customer
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const sql = `
      SELECT b.*, r.name as restaurantName, r.distance, r.image 
      FROM bookings b
      JOIN restaurants r ON b.restaurantId = r.id
      WHERE b.userId = $1
      ORDER BY b.createdAt DESC
    `;
    const result = await db.query(sql, [req.params.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Bookings for Restaurant Owner
app.get('/api/bookings/restaurant/:restaurantId', async (req, res) => {
  try {
    const sql = `
      SELECT b.*, u.name as customerName, u.email as customerEmail
      FROM bookings b
      JOIN users u ON b.userId = u.id
      WHERE b.restaurantId = $1
      ORDER BY b.createdAt DESC
    `;
    const result = await db.query(sql, [req.params.restaurantId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Booking Status (Accept/Reject by Owner)
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    await db.query('UPDATE bookings SET status = $1 WHERE id = $2', [req.body.status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all to serve frontend Route
const indexHtml = path.join(__dirname, '../dist/index.html');
app.use((req, res) => {
  if (fs.existsSync(indexHtml)) res.sendFile(indexHtml);
  else res.json({ message: 'API is running. Frontend not yet built.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Postgres Cloud Backend running on port ${PORT}`);
});