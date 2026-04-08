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

app.listen(PORT, () => {
  console.log(`✅ GramShiksha server running → http://localhost:${PORT}`);
});
