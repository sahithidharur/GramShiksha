require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const progressRoutes = require('./routes/progress');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Service Worker must be served with no-cache so updates apply immediately
app.get('/sw.js', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Firebase client config endpoint
app.get('/config', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/ai', aiRoutes);
app.use('/progress', progressRoutes);
app.use('/admin', adminRoutes);

// HTML page fallback (only for non-API paths)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/auth') || req.path.startsWith('/ai') ||
      req.path.startsWith('/progress') || req.path.startsWith('/admin') ||
      req.path.startsWith('/config')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function startServer(port, attempts = 0) {
  const server = app.listen(port, () => {
    console.log(`✅ GramShiksha server running → http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempts < 3) {
      const nextPort = Number(port) + 1;
      console.warn(`⚠️ Port ${port} is in use, trying ${nextPort}...`);
      startServer(nextPort, attempts + 1);
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
}

startServer(PORT);
