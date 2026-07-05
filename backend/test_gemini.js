const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing GEMINI_API_KEY:', apiKey ? (apiKey.substring(0, 8) + '...') : 'undefined');

if (!apiKey) {
  console.error('No API key found in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

model.generateContent('Hello, respond in one word.')
  .then(res => {
    console.log('✅ SUCCESS! Response:', res.response.text());
  })
  .catch(err => {
    console.error('❌ FAILED with error:');
    console.error(err);
  });
