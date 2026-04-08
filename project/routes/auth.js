const express = require('express');
const router = express.Router();
const { register, getUser, getChildren, linkChild } = require('../controllers/authController');

// POST /auth/register — save user profile to Firestore after Firebase Auth signup
router.post('/register', register);

// GET /auth/user/:uid — get user profile (role, name, etc.)
router.get('/user/:uid', getUser);

// GET /auth/children/:parentUid — get students linked to a parent
router.get('/children/:parentUid', getChildren);

// POST /auth/link-child — link a student account to this parent
router.post('/link-child', linkChild);

module.exports = router;
