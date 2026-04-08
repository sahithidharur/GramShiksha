const {
  getProgress,
  updateProgress,
  getStudentStats,
  updateStudentXP,
  updateStudentStreak,
} = require('../services/firebaseService');

/**
 * GET /progress/:studentId
 * Returns progress + gamification stats for a student.
 */
async function getStudentProgress(req, res) {
  try {
    const { studentId } = req.params;
    
    // Auto-update streak purely based on fetching dashboard today
    await updateStudentStreak(studentId);

    const [progress, stats] = await Promise.all([
      getProgress(studentId),
      getStudentStats(studentId),
    ]);

    return res.json({ progress, stats });
  } catch (err) {
    console.error('GetProgress error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch progress' });
  }
}


/**
 * POST /progress/update
 * Body: { uid, topicId, quizScore }
 * Marks a topic as complete, saves quiz score, awards XP.
 */
async function updateStudentProgress(req, res) {
  try {
    const { uid, topicId, quizScore } = req.body;

    if (!uid) return res.status(400).json({ error: 'uid is required' });

    const current = await getProgress(uid);

    const updates = {};

    if (topicId) {
      const topics = current.completedTopics || [];
      if (!topics.includes(topicId)) {
        updates.completedTopics = [...topics, topicId];
      }
    }

    if (quizScore !== undefined && topicId) {
      updates.quizScores = { ...(current.quizScores || {}), [topicId]: quizScore };
      updates.quizHistory = [
        ...(current.quizHistory || []),
        {
          topicId,
          score: quizScore,
          passed: quizScore >= 60,
          timestamp: new Date().toISOString(),
        }
      ];
    }

    if (Object.keys(updates).length > 0) {
      await updateProgress(uid, updates);
    }

    // Award XP for completing a topic (25 XP) or quiz (up to 50 XP based on score)
    let xpToAdd = 0;
    if (topicId && updates.completedTopics) xpToAdd += 25;
    if (quizScore !== undefined) xpToAdd += Math.floor((quizScore / 100) * 50);

    let stats = null;
    if (xpToAdd > 0) {
      stats = await updateStudentXP(uid, xpToAdd);
    }

    return res.json({ success: true, xpAwarded: xpToAdd, stats });
  } catch (err) {
    console.error('UpdateProgress error:', err.message);
    return res.status(500).json({ error: 'Failed to update progress' });
  }
}

module.exports = { getStudentProgress, updateStudentProgress };
