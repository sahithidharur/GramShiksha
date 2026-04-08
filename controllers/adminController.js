const { getAllUsers, getAnalytics } = require('../services/firebaseService');

/**
 * GET /admin/users
 * Returns all users (admin only).
 */
async function listUsers(req, res) {
  try {
    const users = await getAllUsers();
    return res.json({ users });
  } catch (err) {
    console.error('ListUsers error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

/**
 * GET /admin/analytics
 * Returns aggregate stats.
 */
async function getAnalyticsData(req, res) {
  try {
    const analytics = await getAnalytics();
    return res.json(analytics);
  } catch (err) {
    console.error('Analytics error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

module.exports = { listUsers, getAnalyticsData };
