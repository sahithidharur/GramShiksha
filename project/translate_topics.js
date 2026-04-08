require('dotenv').config();
const fs = require('fs');
const { askGemini } = require('./services/geminiService');

async function translateTopics() {
  console.log('Loading topics-data.js...');
  const code = fs.readFileSync('./public/js/topics-data.js', 'utf8');
  
  const jsonMatch = code.match(/const RAW_TOPICS_EN = (\{[\s\S]*?\});\s*const RAW_TOPICS_HI/);
  
  if (!jsonMatch) {
    console.error("Could not extract RAW_TOPICS_EN from topics-data.js");
    process.exit(1);
  }
  
  const topicsEn = JSON.parse(jsonMatch[1]);

  const langs = [
    { code: 'hi', name: 'Hindi' },
    { code: 'te', name: 'Telugu' }
  ];

  const translatedData = { hi: {}, te: {} };

  if (fs.existsSync('./trans_hi.json')) translatedData.hi = JSON.parse(fs.readFileSync('./trans_hi.json'));
  if (fs.existsSync('./trans_te.json')) translatedData.te = JSON.parse(fs.readFileSync('./trans_te.json'));

  for (const lang of langs) {
    console.log(`\n--- Translating to ${lang.name} ---`);
    for (const grade of Object.keys(topicsEn)) {
      if (translatedData[lang.code][grade]) {
        console.log(`Grade ${grade} already translated. Skipping.`);
        continue;
      }
      console.log(`Translating Grade ${grade} to ${lang.name}...`);
      const gradeData = topicsEn[grade];
      
      const prompt = `Translate the following JSON array of educational topics into ${lang.name}. 
IMPORTANT RULES:
1. Return ONLY the raw JSON array. DO NOT wrap in markdown like \`\`\`json.
2. Translate ALL string values for: name, subject, intro, keyPoints, example, q, opts.
3. Keep 'ans' as an integer and 'icon' as an emoji.

JSON to translate:
${JSON.stringify(gradeData, null, 2)}`;

      try {
        let resp = await askGemini(prompt, []);
        resp = resp.trim();
        resp = resp.replace(/^[\s\S]*?\[/, '[');
        resp = resp.replace(/\][\s\S]*$/, ']');
        
        translatedData[lang.code][grade] = JSON.parse(resp);
        console.log(`[SUCCESS] Grade ${grade} translated.`);
        
        fs.writeFileSync(`./trans_${lang.code}.json`, JSON.stringify(translatedData[lang.code], null, 2));
      } catch (err) {
        console.log(`[ERROR] Failed Grade ${grade} to ${lang.name}:`, err.message);
      }
      
      console.log('Sleeping 5 seconds to respect API rate limits...');
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  console.log('\nWriting new topics-data.js...');
  const newCode = `// Auto-generated Translations
const RAW_TOPICS_EN = ${JSON.stringify(topicsEn, null, 2)};
const RAW_TOPICS_HI = ${JSON.stringify(translatedData.hi, null, 2)};
const RAW_TOPICS_TE = ${JSON.stringify(translatedData.te, null, 2)};

const __lang = (typeof window !== 'undefined' && window.getLang) ? window.getLang() : 'en';
const TOPICS_DATA = (() => {
  if (__lang === 'hi') return RAW_TOPICS_HI;
  if (__lang === 'te') return RAW_TOPICS_TE;
  return RAW_TOPICS_EN;
})();
window.TOPICS_DATA = TOPICS_DATA;
`;

  fs.writeFileSync('./public/js/topics-data.js', newCode);
  console.log('Done! Translated topics-data.js generated successfully.');
}

translateTopics();
