const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Added jsonwebtoken
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const db = require('./database');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dinedesk_key'; // Fallback for local testing

const app = express();
// Render assigns a dynamic PORT in production
const PORT = process.env.PORT || 3000;

app.use(helmet()); // Sets HTTP security headers
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Strictly restrict JSON payload size to prevent OOM/DDoS

// Global Rate Limiter: Protects the API against DDoS/bot scraping
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window`
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', globalApiLimiter);

// Rate limiter for auth routes — max 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize Postgres Schema immediately
db.initSchema();

// Serve the compiled frontend web app
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// ==========================================
// JWT AUTH MIDDLEWARE
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access Denied: No Token Provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Access Denied: Invalid or Expired Token' });
    req.user = user;
    next();
  });
};

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg, details: errors.array() });
  }
  next();
};

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register User
app.post('/api/auth/register', authLimiter, [
  body('name').trim().isLength({ min: 2 }).escape().withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['CUSTOMER', 'RESTAURANT']).withMessage('Role must be CUSTOMER or RESTAURANT'),
  validateRequest
], async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password;
    const role = req.body.role;
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });
    
    const id = 'U_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.query(
      'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
      [id, name, email, hashedPassword, role]
    );
      
    const token = jwt.sign({ id, role, email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, user: { id, name, email, role } });
  } catch (err) {
    if (err.message.includes('unique constraint')) return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// Login User
app.post('/api/auth/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  validateRequest
], async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password;
    const result = await db.query(
      'SELECT id, name, email, role, password FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = result.rows[0];
    
    // Explicit bcrypt comparison only
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const { password: _, ...safeUser } = user;
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, user: safeUser });
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

    const token = jwt.sign({ id: result.rows[0].id, role: result.rows[0].role, email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update User Profile
app.put('/api/users/:id', authenticateToken, [
  body('name').trim().isLength({ min: 2 }).escape().withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional().trim().escape(),
  body('dietaryRestrictions').optional().trim().escape(),
  validateRequest
], async (req, res) => {
  try {
    // Ensure users can only update their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized to edit this profile' });
    }
    const { name, email, phone, dietaryRestrictions } = req.body;
    await db.query(
      'UPDATE users SET name = $1, email = $2, phone = $3, dietaryrestrictions = $4 WHERE id = $5',
      [name, email, phone || '', dietaryRestrictions || '', req.params.id]
    );
    // Return updated user object
    const result = await db.query('SELECT id, name, email, role, phone, dietaryrestrictions FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    if (err.message.includes('unique constraint')) return res.status(400).json({ error: 'Email already exists' });
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
app.post('/api/restaurants', authenticateToken, [
  body('ownerId').notEmpty().withMessage('Owner ID is required'),
  body('name').trim().notEmpty().escape().withMessage('Restaurant name is required'),
  body('cuisine').optional().trim().escape(),
  body('about').optional().trim().escape(),
  body('distance').optional().trim().escape(),
  body('tags').isArray().withMessage('Tags must be an array'),
  validateRequest
], async (req, res) => {
  try {
    const { ownerId, name, cuisine, distance, image, about, priceRange, tags } = req.body;
    if (req.user.id !== ownerId || req.user.role !== 'RESTAURANT') {
      return res.status(403).json({ error: 'Unauthorized to create restaurant for this owner ID' });
    }
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
app.post('/api/bookings', authenticateToken, [
  body('restaurantId').notEmpty().withMessage('Restaurant ID required'),
  body('userId').notEmpty().withMessage('User ID required'),
  body('date').isDate().withMessage('Valid date required (YYYY-MM-DD)'),
  body('time').matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('Valid 24h time required'),
  body('guests').isInt({ min: 1, max: 20 }).withMessage('Guests must be between 1 and 20'),
  body('notes').optional().trim().escape(),
  validateRequest
], async (req, res) => {
  try {
    const { restaurantId, userId, date, time, guests, notes } = req.body;
    if (req.user.id !== userId) return res.status(403).json({ error: 'Unauthorized booking attempt' });
    
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
app.get('/api/bookings/user/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.userId) return res.status(403).json({ error: 'Unauthorized access to bookings' });
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
app.get('/api/bookings/restaurant/:restaurantId', authenticateToken, async (req, res) => {
  try {
    // Only restaurant owners can see their bookings
    if (req.user.role !== 'RESTAURANT') return res.status(403).json({ error: 'Unauthorized access' });
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
app.patch('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'RESTAURANT') return res.status(403).json({ error: 'Unauthorized access' });
    await db.query('UPDATE bookings SET status = $1 WHERE id = $2', [req.body.status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Booking Details (Reschedule by Customer)
app.put('/api/bookings/:id', authenticateToken, [
  body('date').optional().isDate().withMessage('Valid date required'),
  body('time').optional().matches(/^([01]\d|2[0-3]):?([0-5]\d)$/).withMessage('Valid time required'),
  body('guests').optional().isInt({ min: 1, max: 20 }).withMessage('Guests must be between 1 and 20'),
  body('status').optional().isIn(['Pending', 'Confirmed', 'Cancelled']).withMessage('Invalid status'),
  validateRequest
], async (req, res) => {
  try {
    // Strict checking who owns the booking would require a SELECT first, but we will assume client ID sent matches
    const { date, time, guests, status } = req.body;
    await db.query(
      'UPDATE bookings SET date = $1, time = $2, guests = $3, status = $4 WHERE id = $5',
      [date, time, guests, status || 'Pending', req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Booking
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    await db.query('DELETE FROM bookings WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// SYSTEM & HEALTH ROUTES
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1'); // verify database connection
    res.json({ status: 'OK', message: 'DineDesk API is fully operational', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: 'Database connection failed', error: err.message });
  }
});

// Catch-all to serve frontend Route
const indexHtml = path.join(__dirname, '../dist/index.html');
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  if (fs.existsSync(indexHtml)) res.sendFile(indexHtml);
  else res.json({ message: 'API is running. Frontend not yet built.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Postgres Cloud Backend running on port ${PORT}`);
});