const express = require('express');
const router = express.Router();
const { ask } = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');

// POST /ai/ask — ask AI Study Buddy a question (requires auth)
router.post('/ask', verifyToken, ask);

module.exports = router;
