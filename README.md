# 🍽️ DineDesk

**DineDesk** is a modern, high-performance platform for restaurant reservations. It bridges the gap between hungry customers and bustling restaurants with a sleek, neon-themed experience. DineDesk includes both a responsive Web Application (PWA) and a React Native Mobile App (Expo).

---

## 🚀 Features

### For Customers
- **Real-Time Discovery:** Instantly find restaurants and explore curated cuisines.
- **Lightning Search:** Find exactly what you want with our debounced, zero-lag search engine.
- **Instant Booking:** Reserve tables with customizable party sizes and special requests.
- **Live Queue & Modals:** Manage, reschedule, or abort reservations directly from your interactive feed.
- **Neon UI:** A premium glassmorphic dark mode that makes high-quality food photography pop.

### For Restaurant Owners
- **Owner Dashboard:** A dedicated portal to manage incoming reservations.
- **Venue Management:** Create and update restaurant profiles, set price ranges, and define cuisines.
- **Queue Control:** Accept or decline booking requests with a single tap.
- **Zero-Friction:** Real-time feedback via interactive toast notifications.

---

## 🛠️ Technology Stack

1. **Frontend (Web)**: React.js, Vite, Vanilla CSS, Lucide React (Icons).
2. **Mobile App**: React Native, Expo Router, TypeScript, Expo Vector Icons.
3. **Backend API**: Node.js, Express, bcrypt (Security), express-rate-limit.
4. **Database**: PostgreSQL (Neon Serverless DB).

---

## 📂 Project Structure

- `/src`: Web Application components (`App.jsx`, `OwnerApp.jsx`, etc.)
- `/backend`: Node.js Express server (`server.js`) & Postgres controller (`database.js`)
- `/RestaurantMobileApp`: Expo React Native app directory
- `/public`: Service Worker for PWA functionality

---

## 🔧 Setup & Local Development

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Local or Cloud like Neon/Supabase)

### 1. Database Configuration
Create a `.env` file in the root directory:
```env
# Example .env configuration
DATABASE_URL=postgres://username:password@hostname/dbname
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### 2. Run the Backend & Web App
Install dependencies and run the consolidated dev script:
```bash
npm install
npm run dev
```
- The backend starts on `http://localhost:3000`
- The web app runs on `http://localhost:5173`

### 3. Run the Mobile App
```bash
cd RestaurantMobileApp
npm install
npx expo start
```
- Scan the QR code with the Expo Go app.

---

## ✨ Security & Performance Highlights

- **Rate Limiting:** Authentication routes are protected against brute-force attacks.
- **Password Hashing:** User passwords are cryptographically salted and hashed via bcrypt.
- **Skeleton Shimmers:** Advanced perceived performance tricks keep users engaged while data APIs resolve.
- **PWA Ready:** A custom service worker (`sw.js`) provides dynamic offline caching capabilities on mobile Safari and Chrome.
- **Optimized SQL:** Indexes support rapid querying across foreign keys.

---
*Built with speed, aesthetics, and reliability in mind.*
