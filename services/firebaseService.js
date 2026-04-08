const { db } = require('../firebase');

// ─── User Operations ─────────────────────────────────────────────────────────

async function createUserProfile(uid, data) {
  await db.collection('users').doc(uid).set(data, { merge: true });
}

async function getUserProfile(uid) {
  const doc = await db.collection('users').doc(uid).get();
  return doc.exists ? { uid: doc.id, ...doc.data() } : null;
}

async function getAllUsers() {
  const snapshot = await db.collection('users').get();
  return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
}

// ─── Gamification / Student Stats ────────────────────────────────────────────

async function getStudentStats(uid) {
  const doc = await db.collection('students').doc(uid).get();
  if (doc.exists) return { uid: doc.id, ...doc.data() };

  // Default stats for new student
  return { uid, xp: 0, level: 1, badges: [] };
}

async function updateStudentStreak(uid, lastActiveISO) {
  const ref = db.collection('students').doc(uid);
  const doc = await ref.get();
  
  let current = { xp: 0, level: 1, badges: [], streak: 0, streakLastDate: null };
  if (doc.exists) current = doc.data();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  let newStreak = current.streak || 0;
  
  if (current.streakLastDate !== todayStr) {
    if (!current.streakLastDate) {
      newStreak = 1; // First day
    } else {
      const lastDate = new Date(current.streakLastDate);
      const diffMs = now.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1; // Reset streak
      }
    }
  }

  // Award streak badges
  const newBadges = [...(current.badges || [])];
  if (newStreak >= 3 && !newBadges.includes('streak_3')) newBadges.push('streak_3');
  if (newStreak >= 7 && !newBadges.includes('streak_7')) newBadges.push('streak_7');

  await ref.set({ streak: newStreak, streakLastDate: todayStr, badges: newBadges }, { merge: true });
  return { streak: newStreak, badges: newBadges };
}

async function updateStudentXP(uid, xpToAdd) {
  const ref = db.collection('students').doc(uid);
  const doc = await ref.get();

  let current = { xp: 0, level: 1, badges: [], streak: 0 };
  if (doc.exists) current = doc.data();

  const newXP = (current.xp || 0) + xpToAdd;
  const newLevel = calculateLevel(newXP);
  const newBadges = checkBadges(newXP, newLevel, current.badges || []);

  await ref.set(
    { xp: newXP, level: newLevel, badges: newBadges },
    { merge: true }
  );

  return { xp: newXP, level: newLevel, badges: newBadges, streak: current.streak };
}

function calculateLevel(xp) {
  // Every 100 XP = 1 level
  return Math.floor(xp / 100) + 1;
}

function checkBadges(xp, level, existing = []) {
  const badges = [...existing];
  if (xp >= 10 && !badges.includes('first_question')) badges.push('first_question');
  if (xp >= 50 && !badges.includes('curious_learner')) badges.push('curious_learner');
  if (level >= 3 && !badges.includes('rising_star')) badges.push('rising_star');
  if (level >= 5 && !badges.includes('knowledge_seeker')) badges.push('knowledge_seeker');
  if (level >= 10 && !badges.includes('scholar')) badges.push('scholar');
  return badges;
}

// ─── Progress Operations ──────────────────────────────────────────────────────

async function getProgress(uid) {
  const doc = await db.collection('progress').doc(uid).get();
  if (doc.exists) return { uid: doc.id, ...doc.data() };
  return { uid, completedTopics: [], quizScores: {}, quizHistory: [], lastActive: null };
}

async function updateProgress(uid, updates) {
  const ref = db.collection('progress').doc(uid);
  await ref.set(
    {
      ...updates,
      lastActive: new Date().toISOString(),
    },
    { merge: true }
  );
}

async function getStudentProfilesByParent(parentUid) {
  const snapshot = await db.collection('users')
    .where('role', '==', 'student')
    .where('parentUid', '==', parentUid)
    .get();

  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}

async function updateUserProfile(uid, updates) {
  const ref = db.collection('users').doc(uid);
  await ref.set({ ...updates }, { merge: true });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

async function getAnalytics() {
  const users = await getAllUsers();
  const students = users.filter((u) => u.role === 'student');
  const parents = users.filter((u) => u.role === 'parent');
  const admins = users.filter((u) => u.role === 'admin');

  // Total XP across all students
  let totalXP = 0;
  if (students.length > 0) {
    const statsSnap = await db.collection('students').get();
    statsSnap.docs.forEach((doc) => {
      totalXP += doc.data().xp || 0;
    });
  }

  return {
    totalUsers: users.length,
    totalStudents: students.length,
    totalParents: parents.length,
    totalAdmins: admins.length,
    totalXPDistributed: totalXP,
  };
}

module.exports = {
  createUserProfile,
  getUserProfile,
  getAllUsers,
  getStudentStats,
  updateStudentStreak,
  updateStudentXP,
  getProgress,
  updateProgress,
  getStudentProfilesByParent,
  updateUserProfile,
  getAnalytics,
};
