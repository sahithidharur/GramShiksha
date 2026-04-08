const { askGemini } = require('../services/geminiService');
const { updateStudentXP } = require('../services/firebaseService');

/**
 * POST /ai/ask  (requires verifyToken middleware — uid taken from verified token)
 */
async function ask(req, res) {
  try {
    const { question, history = [] } = req.body;
    const uid = req.user?.uid; // from verified Firebase token

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const answer = await askGemini(question.trim(), history);

    let stats = null;
    if (uid) stats = await updateStudentXP(uid, 10);

    return res.json({ answer, stats });
  } catch (err) {
    console.error('AI ask error:', err.message);
    return res.status(500).json({ error: err.message || 'AI request failed' });
  }
}

module.exports = { ask };
