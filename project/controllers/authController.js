const { createUserProfile, getUserProfile, getStudentProfilesByParent, updateUserProfile } = require('../services/firebaseService');

/**
 * POST /auth/register
 * Called after Firebase client-side registration.
 * Saves user profile to Firestore.
 */
async function register(req, res) {
  try {
    const { uid, name, email, role, grade, language, parentUid } = req.body;

    if (!uid || !name || !email || !role) {
      return res.status(400).json({ error: 'uid, name, email, and role are required' });
    }

    const validRoles = ['student', 'parent', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be student, parent, or admin' });
    }

    const profileData = {
      uid,
      name,
      email,
      role,
      language: language || 'en',
      createdAt: new Date().toISOString(),
    };

    if (role === 'student') {
      profileData.grade = grade || '1';
      if (parentUid) profileData.parentUid = parentUid;
    }

    await createUserProfile(uid, profileData);

    // Initialize student gamification doc
    if (role === 'student') {
      const { db } = require('../firebase');
      await db.collection('students').doc(uid).set(
        { xp: 0, level: 1, badges: [] },
        { merge: true }
      );
      await db.collection('progress').doc(uid).set(
        { completedTopics: [], quizScores: {}, lastActive: new Date().toISOString() },
        { merge: true }
      );
    }

    return res.status(201).json({ success: true, message: 'Profile created', role });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ error: 'Failed to create profile' });
  }
}

/**
 * GET /auth/user/:uid
 * Returns user profile (used after login to get role for redirect).
 */
async function getUser(req, res) {
  try {
    const { uid } = req.params;
    const profile = await getUserProfile(uid);

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(profile);
  } catch (err) {
    console.error('GetUser error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}

async function getChildren(req, res) {
  try {
    const { parentUid } = req.params;
    const children = await getStudentProfilesByParent(parentUid);
    return res.json({ children });
  } catch (err) {
    console.error('GetChildren error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch children' });
  }
}

async function linkChild(req, res) {
  try {
    const { parentUid, childUid } = req.body;
    if (!parentUid || !childUid) {
      return res.status(400).json({ error: 'parentUid and childUid are required' });
    }

    const childProfile = await getUserProfile(childUid);
    if (!childProfile || childProfile.role !== 'student') {
      return res.status(400).json({ error: 'Child UID must belong to a registered student' });
    }

    await updateUserProfile(childUid, { parentUid });
    return res.json({ success: true, message: 'Child linked successfully' });
  } catch (err) {
    console.error('LinkChild error:', err.message);
    return res.status(500).json({ error: 'Failed to link child' });
  }
}

module.exports = { register, getUser, getChildren, linkChild };
