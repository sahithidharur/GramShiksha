const fs = require('fs');

function patchParent() {
  let c = fs.readFileSync('public/parent.html', 'utf8');
  c = c.replace(/<h2(.*?)>Student Dashboard 👨‍👩‍👧<\/h2>/, '<h2$1 data-i18n="parentDash">Student Dashboard 👨‍👩‍👧</h2>');
  c = c.replace(/<p(.*?)>Viewing progress for the account you logged in with\.<\/p>/, '<p$1 data-i18n="viewProgress">Viewing progress for the account you logged in with.</p>');
  c = c.replace(/Last Login:/g, '<span data-i18n="lastLogin">Last Login</span>:');
  c = c.replace(/Day Streak/g, '<span data-i18n="dayStreak">Day Streak</span>');
  c = c.replace(/Quiz Avg %/g, '<span data-i18n="quizAvg">Quiz Avg %</span>');
  c = c.replace(/<div(.*?)>📅 This Week's Summary<\/div>/, "<div$1 data-i18n=\"weekSummary\">📅 This Week's Summary</div>");
  c = c.replace(/<div(.*?)>AI Questions Asked<\/div>/, '<div$1 data-i18n="aiQuestionsAsked">AI Questions Asked</div>');
  c = c.replace(/<div(.*?)>Quizzes Taken<\/div>/, '<div$1 data-i18n="quizzesTaken">Quizzes Taken</div>');
  c = c.replace(/<div(.*?)>XP Earned \(Est\.\)<\/div>/, '<div$1 data-i18n="xpEarnedEst">XP Earned (Est.)</div>');
  c = c.replace(/<div(.*?)>📈 7-Day XP Growth<\/div>/, '<div$1 data-i18n="xpGrowthLine">📈 7-Day XP Growth</div>');
  c = c.replace(/<div(.*?)>🏆 Badges Showcase<\/div>/, '<div$1 data-i18n="badgeShowcase">🏆 Badges Showcase</div>');
  c = c.replace(/<div(.*?)>📊 Quiz Performance<\/div>/, '<div$1 data-i18n="quizPerformance">📊 Quiz Performance</div>');
  c = c.replace(/<div(.*?)>🎯 Strength Analysis<\/div>/, '<div$1 data-i18n="strengthAnalysis">🎯 Strength Analysis</div>');
  c = c.replace(/✅ Strong Areas \(≥70%\)/, '<span data-i18n="strongAreas">✅ Strong Areas (≥70%)</span>');
  c = c.replace(/⚠️ Weak Areas \(&lt;70%\)/, '<span data-i18n="weakAreas">⚠️ Weak Areas (&lt;70%)</span>');
  c = c.replace(/<div(.*?)>✅ Completed Topics<\/div>/g, '<div$1 data-i18n="completedTopics">✅ Completed Topics</div>');
  c = c.replace(/<div(.*?)>ℹ️ Your Account<\/div>/, '<div$1 data-i18n="yourAccount">ℹ️ Your Account</div>');
  c = c.replace(/Your UID:/, '<span data-i18n="yourUid">Your UID:</span>');
  c = c.replace(/>Copy</, ' data-i18n="copyText">Copy<');

  c = c.replace(/src="\/js\/i18n\.js"/g, 'src="/js/i18n.js?v=6"');
  fs.writeFileSync('public/parent.html', c);
}

function patchAdmin() {
  let c = fs.readFileSync('public/admin.html', 'utf8');
  c = c.replace(/<h2(.*?)>Platform Overview<\/h2>/, '<h2$1 data-i18n="platformOverview">Platform Overview</h2>');
  c = c.replace(/<div(.*?)>Total Users<\/div>/, '<div$1 data-i18n="totalUsers">Total Users</div>');
  // Avoid replacing inner elements wildly, replace only exact tags
  c = c.replace(/<div class="stat-label">Students<\/div>/, '<div class="stat-label" data-i18n="students">Students</div>');
  c = c.replace(/<div class="stat-label">Parents<\/div>/, '<div class="stat-label" data-i18n="parents">Parents</div>');
  c = c.replace(/<div class="stat-label">Admins<\/div>/, '<div class="stat-label" data-i18n="admins">Admins</div>');
  
  c = c.replace(/<div(.*?)>XP Distributed<\/div>/, '<div$1 data-i18n="xpDistributed">XP Distributed</div>');
  c = c.replace(/<div(.*?)>👥 User Breakdown<\/div>/, '<div$1 data-i18n="userBreakdown">👥 User Breakdown</div>');
  c = c.replace(/<div(.*?)>📊 Student XP Comparison<\/div>/, '<div$1 data-i18n="studentXpCompare">📊 Student XP Comparison</div>');
  c = c.replace(/<div(.*?)>⚠️ Inactive Students \(3\+ Days\)<\/div>/, '<div$1 data-i18n="inactiveStudents">⚠️ Inactive Students (3+ Days)</div>');
  c = c.replace(/<div(.*?)>📢 Send Global Announcement<\/div>/, '<div$1 data-i18n="sendAnnouncement">📢 Send Global Announcement</div>');
  c = c.replace(/<button(.*?)>🚀 Publish Announcement<\/button>/, '<button$1 data-orig="🚀 Publish Announcement" data-i18n="publishBtn">🚀 Publish Announcement</button>');
  c = c.replace(/placeholder="Search by name or email..."/, 'placeholder="Search by name or email..." data-i18n="searchUsers"');
  c = c.replace(/<button(.*?)>↻ Refresh<\/button>/, '<button$1 data-orig="↻ Refresh" data-i18n="refreshBtn">↻ Refresh</button>');
  c = c.replace(/<button(.*?)>📥 Export Report \(CSV\)<\/button>/, '<button$1 data-i18n="exportCsv">📥 Export Report (CSV)</button>');
  c = c.replace(/<h2(.*?)>Platform Activity<\/h2>/, '<h2$1 data-i18n="platformActivity">Platform Activity</h2>');
  c = c.replace(/<div(.*?)>📅 Recent Logins<\/div>/, '<div$1 data-i18n="recentLogins">📅 Recent Logins</div>');
  c = c.replace(/<div(.*?)>📈 Recent Stats Updates<\/div>/, '<div$1 data-i18n="recentStats">📈 Recent Stats Updates</div>');

  // Breakdown lists
  c = c.replace(/<div(.*?)>Students<\/div>/, '<div$1 data-i18n="students">Students</div>');
  c = c.replace(/<div(.*?)>Parents<\/div>/, '<div$1 data-i18n="parents">Parents</div>');
  c = c.replace(/<div(.*?)>Admins<\/div>/, '<div$1 data-i18n="admins">Admins</div>');

  c = c.replace(/src="\/js\/i18n\.js"/g, 'src="/js/i18n.js?v=6"');
  fs.writeFileSync('public/admin.html', c);
}

function patchLogin() {
  let c = fs.readFileSync('public/login.html', 'utf8');
  c = c.replace(/src="\/js\/i18n\.js"/g, 'src="/js/i18n.js?v=6"');
  fs.writeFileSync('public/login.html', c);
}

function patchI18nVersionAndSw() {
  // sw cache bust
  let c = fs.readFileSync('public/sw.js', 'utf8');
  c = c.replace(/const CACHE_NAME = 'gramshiksha-v5';/, "const CACHE_NAME = 'gramshiksha-v6';");
  fs.writeFileSync('public/sw.js', c);
}

patchParent();
patchAdmin();
patchLogin();
patchI18nVersionAndSw();
console.log("Patched correctly.");
