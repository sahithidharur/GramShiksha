require('dotenv').config();
const { askGemini } = require('./services/geminiService');

async function test() {
  try {
    const res = await askGemini("Respond with exactly: OK", []);
    console.log("Success:", res);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
test();
