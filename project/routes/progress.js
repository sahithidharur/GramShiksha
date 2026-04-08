const express = require('express');
const router = express.Router();
const { getStudentProgress, updateStudentProgress } = require('../controllers/progressController');
const { verifyToken } = require('../middleware/auth');

// GET /progress/:studentId — fetch progress + stats
router.get('/:studentId', verifyToken, getStudentProgress);

// POST /progress/update — mark topic complete, record quiz score
router.post('/update', verifyToken, updateStudentProgress);

module.exports = router;
