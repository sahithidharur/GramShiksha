const express = require('express');
const router = express.Router();
const { listUsers, getAnalyticsData } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');

// GET /admin/users — list all users
router.get('/users', verifyToken, listUsers);

// GET /admin/analytics — aggregate stats
router.get('/analytics', verifyToken, getAnalyticsData);

module.exports = router;
