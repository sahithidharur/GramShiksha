// Calls Gemini REST API v1 directly using Node's built-in fetch (Node 18+).
// Uses a conversation-prefix approach for the system prompt (universally compatible).

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PREFIX = [
  {
    role: 'user',
    parts: [{ text: `You are GramShiksha AI Study Buddy — a friendly tutor for Indian school students (Grades 1-12). Rules: explain simply with Indian examples (cricket, chapati, trains, festivals), keep answers under 200 words, show step-by-step for maths, be encouraging, and match the student's language (Hindi/Hinglish/English). Understood?` }],
  },
  {
    role: 'model',
    parts: [{ text: `Understood! I'm GramShiksha AI Study Buddy 🎓 Ready to help with any subject — Maths, Science, History, English and more. Ask me anything!` }],
  },
];

/**
 * @param {string} question
 * @param {Array<{role:'user'|'model', text:string}>} history
 * @returns {Promise<string>}
 */
async function askGemini(question, history = []) {
  const contents = [
    ...SYSTEM_PREFIX,
    ...history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })),
    { role: 'user', parts: [{ text: question }] },
  ];

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini API error ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
}

module.exports = { askGemini };
