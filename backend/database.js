const { Pool } = require('pg');
require('dotenv').config();

// Create a Postgres connection pool using the connection string.
// Render will automatically inject DATABASE_URL in production.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
  // Log the error but do NOT exit — a transient error on an idle client
  // should not crash the entire server permanently.
  console.error('⚠️  Unexpected error on idle Postgres client', err.message);
});

// A helper query function replacing the synchronous SQLite patterns
const db = {
  query: (text, params) => pool.query(text, params),
  
  initSchema: async () => {
    try {
      // Run each CREATE TABLE separately so one failure doesn't block others
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('CUSTOMER', 'RESTAURANT')),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS restaurants (
          id SERIAL PRIMARY KEY,
          ownerId TEXT REFERENCES users (id),
          name TEXT NOT NULL,
          cuisine TEXT,
          rating REAL DEFAULT 0,
          reviews INTEGER DEFAULT 0,
          distance TEXT,
          image TEXT,
          about TEXT,
          priceRange TEXT,
          tags TEXT
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          restaurantId INTEGER REFERENCES restaurants (id),
          userId TEXT REFERENCES users (id),
          date TEXT,
          time TEXT,
          guests INTEGER,
          status TEXT DEFAULT 'Pending',
          notes TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Auto-migrate new columns for v2 Profiles
      try {
        await pool.query('ALTER TABLE users ADD COLUMN phone TEXT');
        await pool.query('ALTER TABLE users ADD COLUMN dietaryRestrictions TEXT');
      } catch(e) { /* columns already exist */ }

      // Performance indexes
      try {
        await pool.query('CREATE INDEX IF NOT EXISTS idx_bookings_userId ON bookings(userId)');
        await pool.query('CREATE INDEX IF NOT EXISTS idx_bookings_restaurantId ON bookings(restaurantId)');
      } catch(e) { /* indexes already exist */ }

      console.log('✅ PostgreSQL Schema initialized successfully');
    } catch (err) {
      console.error('❌ Error initializing schema:', err.message);
    }
  }
};

module.exports = db;
