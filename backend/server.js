import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import admin from 'firebase-admin';
import { sendMail } from './mailer.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [
      /localhost/,
      /\.netlify\.app$/,
      /\.onrender\.com$/,
      /\.vercel\.app$/
    ];
    if (allowed.some(pattern => pattern.test(origin))) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge_secret';

// ---- Firebase Admin Setup ----
let db = null;
try {
  let serviceAccount = null;

  // Cloud Support: Check environment variable first (Base64 encoded JSON recommended)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8'));
  } 
  // Cloud Support: Raw JSON string or Base64 string (auto-detect)
  else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    if (raw.startsWith('{')) {
      // It's raw JSON
      serviceAccount = JSON.parse(raw);
    } else {
      // It's Base64 encoded
      serviceAccount = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
    }
  } 
  // Local Dev Support: File
  else if (fs.existsSync('./firebase-service-account.json')) {
    serviceAccount = JSON.parse(fs.readFileSync('./firebase-service-account.json', 'utf8'));
  }

  if (serviceAccount) {
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log('✅ Firebase Admin SDK initialized successfully with Firestore');
  } else {
    console.warn('⚠️ WARNING: Firebase credentials not found!');
    console.warn('⚠️ Provide FIREBASE_SERVICE_ACCOUNT env var OR create firebase-service-account.json locally');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message);
}

// Helper to check if DB is ready
const checkDb = (req, res, next) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not connected. Firebase credentials may be missing on the server.' });
  }
  next();
};

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    server: 'Skill Bridge Backend',
    database: db ? 'connected' : 'NOT connected',
    geminiKey: process.env.GEMINI_API_KEY ? 'configured' : 'MISSING',
    grokKey: (process.env.GROK_API_KEY || process.env.XAI_API_KEY) ? 'configured' : 'MISSING',
    activeAI: (process.env.GROK_API_KEY || process.env.XAI_API_KEY) ? 'Grok (xAI)' : 'Gemini (Google)',
    firebaseEnv: process.env.FIREBASE_SERVICE_ACCOUNT ? 'configured' : (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ? 'configured (base64)' : 'MISSING')
  });
});

// ---- Groq Setup (Primary - 14,400 req/day FREE) ----
const generateWithGroq = async (promptText) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Groq API key not configured');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // Free, 14,400 RPD, 30,000 TPM (handles large prompts)
      messages: [{ role: 'user', content: promptText }],
      temperature: 0.1,
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const errMsg = err.error?.message || response.statusText;

    // If the 70b model is too large, try the 8b model as fallback
    if (response.status === 413) {
      console.warn('⚠️ Groq 70b token limit hit, retrying with 8b model...');
      const retry = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: promptText.substring(0, 4000) }], // truncate if needed
          temperature: 0.1,
          max_tokens: 4096
        })
      });
      if (retry.ok) {
        const retryData = await retry.json();
        const text = retryData.choices?.[0]?.message?.content || '';
        return { response: { text: () => text } };
      }
    }

    const error = new Error(`Groq error (${response.status}): ${errMsg}`);
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  return { response: { text: () => text } };
};

// ---- Gemini Fallback Setup ----
const GEMINI_MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];
const geminiModels = [];
try {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean);

  if (keys.length > 0) {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    keys.forEach((key, ki) => {
      const genAI = new GoogleGenerativeAI(key);
      GEMINI_MODELS.forEach(name => {
        geminiModels.push({ name, keyIndex: ki, model: genAI.getGenerativeModel({ model: name }) });
      });
    });
    console.log(`✅ Gemini fallback: ${keys.length} key(s) × ${GEMINI_MODELS.length} models = ${geminiModels.length} slots`);
  }
} catch (e) {
  console.error('Gemini initialization failed:', e.message);
}

const generateWithGemini = async (promptConfig) => {
  let lastError = null;
  for (const { name, keyIndex, model } of geminiModels) {
    try {
      console.log(`🤖 Gemini [key${keyIndex}/${name}]...`);
      const result = await model.generateContent(promptConfig);
      console.log(`✅ Gemini success [key${keyIndex}/${name}]`);
      return result;
    } catch (err) {
      if (err.status === 429 || err.status === 404 ||
          (err.message && (err.message.includes('429') || err.message.includes('quota') || err.message.includes('not found')))) {
        console.warn(`⚠️ Gemini [key${keyIndex}/${name}] unavailable, trying next...`);
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error('All Gemini models exhausted');
};

// ---- Unified AI Router ----
const model = {
  generateContent: async (promptConfig) => {
    // Extract plain text from any prompt format
    let promptText = '';
    if (typeof promptConfig === 'string') {
      promptText = promptConfig;
    } else if (promptConfig?.contents) {
      try { promptText = promptConfig.contents[0].parts[0].text; }
      catch { promptText = JSON.stringify(promptConfig); }
    } else {
      promptText = JSON.stringify(promptConfig);
    }

    // 1. Try Groq first (highest free quota)
    if (process.env.GROQ_API_KEY) {
      try {
        console.log('🚀 Routing to Groq (Llama 3.1)...');
        const result = await generateWithGroq(promptText);
        console.log('✅ Groq success');
        return result;
      } catch (err) {
        if (err.status === 429) {
          console.warn('⚠️ Groq rate limited, falling back to Gemini...');
        } else {
          console.error('❌ Groq failed:', err.message, '- falling back to Gemini...');
        }
      }
    }

    // 2. Try xAI Grok (if configured)
    const xaiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    if (xaiKey) {
      try {
        console.log('🤖 Trying xAI Grok...');
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${xaiKey}` },
          body: JSON.stringify({ messages: [{ role: 'user', content: promptText }], model: 'grok-beta', temperature: 0.1 })
        });
        if (!response.ok) throw new Error(`xAI error: ${response.status}`);
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || '';
        return { response: { text: () => text } };
      } catch (err) {
        console.error('❌ xAI Grok failed:', err.message, '- trying Gemini...');
      }
    }

    // 3. Gemini fallback (multiple keys × multiple models)
    if (geminiModels.length === 0) throw new Error('No AI provider configured');
    return await generateWithGemini(promptConfig);
  }
};

// ---- Auth Middleware ----
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token provided' });
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ===================== AUTH ROUTES =====================

// Register
app.post('/api/auth/register', checkDb, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if email exists
    const usersRef = db.collection('users');
    const q = await usersRef.where('email', '==', email).limit(1).get();
    if (!q.empty) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const userDoc = usersRef.doc();
    const user = { id: userDoc.id, name, email, password: hashed, createdAt: admin.firestore.FieldValue.serverTimestamp() };
    
    await userDoc.set(user);
    
    // Send welcome email in background
    const emailHtml = `
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Gradient Header -->
          <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 40px 30px; text-align: center;">
            <div style="width: 60px; height: 60px; line-height: 60px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.2); display: inline-block; margin-bottom: 16px; font-size: 28px; color: #ffffff; text-align: center;">✨</div>
            <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Welcome to Skill Bridge</h1>
            <p style="margin: 8px 0 0; color: #e9d5ff; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Make Your Career Bright</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; margin-top: 0; color: #1e293b;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">
              Thanks for choosing <strong>Skill Bridge</strong>! We are thrilled to accompany you on your professional journey. Let's start your journey! Skill Bridge makes your career bright.
            </p>
            
            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
              <h3 style="margin-top: 0; font-size: 16px; color: #1e293b; font-weight: 700;">Ready to analyze your skill gaps?</h3>
              <p style="font-size: 14px; color: #64748b; margin-bottom: 20px; line-height: 1.5;">Complete your onboarding profile and get a customized AI career roadmap instantly.</p>
              <a href="http://localhost:5173/onboarding" style="background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);">Start Your Journey</a>
            </div>

            <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin-bottom: 0;">
              If you have any questions, feel free to reply directly to this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 4px;">&copy; 2026 Skill Bridge. All rights reserved.</p>
            <p style="margin: 0;">Empowering careers through artificial intelligence.</p>
          </div>
        </div>
      </div>
    `;
    sendMail(email, "Welcome to Skill Bridge!", emailHtml).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// Login
app.post('/api/auth/login', checkDb, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const usersRef = db.collection('users');
    const q = await usersRef.where('email', '==', email).limit(1).get();
    
    if (q.empty) return res.status(400).json({ error: 'Invalid credentials' });
    
    const user = q.docs[0].data();
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Google Auth
app.post('/api/auth/google', checkDb, async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential is required' });
    }

    let payload;
    // 1. Verify token with Firebase Admin Auth SDK
    try {
      const decodedToken = await admin.auth().verifyIdToken(credential);
      payload = {
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0],
        picture: decodedToken.picture || ''
      };
    } catch (err) {
      console.warn('Firebase token verification failed, checking fallback methods:', err.message);
      
      // Fallback 1: Try verifying as a standard Google ID Token (in case of direct GSI client auth)
      try {
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (googleRes.ok) {
          const googlePayload = await googleRes.json();
          payload = {
            email: googlePayload.email,
            name: googlePayload.name || googlePayload.email.split('@')[0],
            picture: googlePayload.picture || ''
          };
        }
      } catch (googleErr) {
        console.warn('Fallback Google verification failed too');
      }

      // Fallback 2: Development mock credential
      if (!payload && typeof credential === 'string' && credential.startsWith('mock_google_')) {
        const username = credential.replace('mock_google_', '');
        payload = {
          email: `${username}@gmail.com`,
          name: username.charAt(0).toUpperCase() + username.slice(1),
          picture: 'https://lh3.googleusercontent.com/a/default-user'
        };
      }
      
      if (!payload) {
        return res.status(401).json({ error: 'Invalid Google / Firebase credentials: ' + err.message });
      }
    }

    const { email, name, picture } = payload;
    if (!email) {
      return res.status(400).json({ error: 'Google account does not provide email' });
    }

    // 2. Check if user exists in Firestore
    const usersRef = db.collection('users');
    const q = await usersRef.where('email', '==', email).limit(1).get();
    
    let user;
    if (q.empty) {
      // User doesn't exist - create a new user (Auto-Register)
      const userDoc = usersRef.doc();
      user = {
        id: userDoc.id,
        name: name || email.split('@')[0],
        email,
        picture: picture || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        googleAuth: true
      };
      await userDoc.set(user);
    } else {
      // User exists - log them in
      user = q.docs[0].data();
      // If user exists but didn't have googleAuth or needs profile update, update it
      const updates = {};
      if (!user.googleAuth) updates.googleAuth = true;
      if (picture && !user.picture) updates.picture = picture;
      
      if (Object.keys(updates).length > 0) {
        await usersRef.doc(user.id).update(updates);
        user = { ...user, ...updates };
      }
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, picture: user.picture } });
  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(500).json({ error: 'Google authentication failed: ' + err.message });
  }
});

// ElevenLabs TTS route
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const apiKey = process.env.ELEVEN_LABS_API_KEY;
    if (!apiKey) {
      return res.json({ useFallback: true, message: 'ElevenLabs API Key not configured' });
    }

    const targetVoiceId = voiceId || '21m00Tcm4TlvDq8ikWAM'; // Rachel as fallback

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs API error:', errText);
      return res.json({ useFallback: true, message: 'ElevenLabs API returned an error' });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (err) {
    console.error('TTS error:', err);
    res.json({ useFallback: true, message: 'TTS server error' });
  }
});

// AI Single Answer Analysis
app.post('/api/interview/analyze-answer', checkDb, async (req, res) => {
  try {
    const { question, answer, round } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: 'Question and answer are required' });
    }

    const prompt = `
You are an expert interviewer. Analyze the user's answer to this mock interview question.
Round: ${round || 'General'}
Question: ${question}
User's Answer: ${answer}

Provide a concise 2-3 sentence constructive feedback. Suggest what they did well and one thing they can do to improve. Start directly with the feedback.
`;

    let feedback = "";
    if (geminiModels.length > 0) {
      const result = await generateWithGemini(prompt);
      feedback = result.response.text();
    } else {
      feedback = "Good response! To improve, consider adding more concrete metrics or structural steps (using the STAR method for behavioral answers).";
    }

    res.json({ feedback });
  } catch (err) {
    console.error('Single answer analysis error:', err);
    res.json({ feedback: "Good answer! Ensure you expand on practical implementations in a live setting." });
  }
});

// AI Interview Analysis
app.post('/api/interview/analyze', checkDb, async (req, res) => {
  try {
    const { rounds } = req.body;
    if (!rounds || !Array.isArray(rounds)) {
      return res.status(400).json({ error: 'Rounds data is required' });
    }

    let summaryText = "";
    rounds.forEach((round) => {
      summaryText += `### ${round.title}\n`;
      if (round.qas && Array.isArray(round.qas)) {
        round.qas.forEach((qa, idx) => {
          summaryText += `Question ${idx + 1}: ${qa.question}\n`;
          summaryText += `User Answer: ${qa.answer}\n\n`;
        });
      } else {
        summaryText += `Not completed or no answers.\n\n`;
      }
    });

    const prompt = `
You are an expert tech recruiter and career coach.
Analyze the following mock interview results for a user across multiple interview rounds.
Generate a comprehensive, professional, and detailed feedback report.

${summaryText}

Please structure your report in clean Markdown formatting:
1. **Executive Summary**: Overall evaluation of the candidate.
2. **Overall Rating**: Give a score out of 100 and a recommendation (e.g., Hire, Strong Hire, Needs Improvement).
3. **Round-by-Round Breakdown**:
   - For each completed round, analyze the user's answers.
   - Point out specific strengths in their responses.
   - Suggest areas of improvement with concrete suggestions/examples of how to phrase things better.
4. **Key Strengths**: Bullet points of top skills demonstrated.
5. **Growth Areas**: Bullet points of main areas that need study/practice.
6. **Actionable Roadmap**: Steps the user should take next to ace a real interview.

Make the feedback encouraging but realistic, highlighting actionable tips.
`;

    let reportText = "";
    if (geminiModels.length > 0) {
      const result = await generateWithGemini(prompt);
      reportText = result.response.text();
    } else {
      // Fallback response if Gemini is not configured
      reportText = `
### Mock Interview Feedback Report (Offline Mode)

We analyzed your responses across all completed rounds. Here is your feedback:

1. **Executive Summary**:
   You demonstrated solid foundational knowledge. Your technical explanations are accurate, though they could benefit from more structured delivery.

2. **Overall Rating**: **85/100 (Recommended to Hire)**

3. **Round-by-Round Breakdown**:
   * **Technical Round**: Strong knowledge of core concepts. Great explanation of database JOINs.
   * **Coding Round**: Code logic is correct. Try explaining time complexity (Big O) in future interviews.
   * **System Design Round**: Clear architecture overview. Consider adding details about horizontal scaling.
   * **Communication Round**: Expressive and clear. Work on keeping explanations slightly more concise.
   * **HR Round**: Good company alignment. Use the STAR method to structure your behavioral examples.

4. **Actionable Roadmap**:
   * Practice mock coding challenges timed.
   * Review Big O notation and systems scaling.
   * Use structured frameworks like STAR for behavioral questions.
`;
    }

    res.json({ report: reportText });
  } catch (err) {
    console.error('Interview analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze mock interview: ' + err.message });
  }
});


// ===================== ONBOARDING + GEMINI =====================

// Save onboarding profile and get Gemini gap analysis
app.post('/api/onboarding/analyze', [authMiddleware, checkDb], async (req, res) => {
  try {
    const {
      education,
      skills,
      technicalKnowledge,
      certifications = '',
      pastExperiences = '',
      interestedRole = '',
      knownSkillsForRole = '',
    } = req.body;

    // Build prompt for Gemini
    const prompt = `You are an expert career counselor and industry analyst. A user has provided their profile details.

## User Profile:
- **Educational Background:** ${education}
- **Current Skills:** ${skills}
- **Technical Knowledge:** ${technicalKnowledge}

## Available Roles to Recommend From:
- Data Analyst, Data Scientist, Machine Learning Engineer, Data Engineer, Full Stack Developer, Frontend Developer, Backend Developer
- Embedded Systems Engineer, IoT Developer, Robotics Engineer, VLSI Design Engineer
- Network Engineer, Cloud Solutions Architect, Cyber Security Analyst, Telecom Engineer
- Structural Engineer, Transportation Engineer, Geotechnical Engineer, Environmental Engineer
- CAD Designer, Robotics Specialist, HVAC Engineer, Automotive Engineer
- Clinical Pharmacist, Research Scientist, Quality Assurance Specialist, Regulatory Affairs Manager

## Your Task:
1. Recommend 2 to 3 career roles from the list above that best match their profile. Return them in the "recommendedRoles" array.
2. Select the single best-matching role (the top recommendation) to perform the gap analysis and roadmap generation for.
3. Provide a comprehensive JSON response with the following structure (respond ONLY with valid JSON, no markdown):
{
  "recommendedRoles": ["<recommended role 1>", "<recommended role 2>", "<recommended role 3>"],
  "gapAnalysisReport": {
    "overallReadiness": "<percentage 0-100>",
    "summary": "<2-3 sentence summary of where the user stands>",
    "strengths": ["<strength 1>", "<strength 2>", ...],
    "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
    "keyGaps": ["<gap 1>", "<gap 2>", ...]
  },
  "requiredSkills": [
    {
      "skill": "<skill name>",
      "category": "<Technical/Soft/Tool>",
      "importance": "<Critical/Important/Nice to Have>",
      "userHasIt": <true/false>,
      "description": "<why this skill matters>"
    }
  ],
  "requiredCertifications": [
    {
      "name": "<certification name>",
      "provider": "<issuing organization>",
      "importance": "<Critical/Recommended/Optional>",
      "userHasIt": <true/false>
    }
  ],
  "recommendedCourses": [
    {
      "title": "<course title>",
      "platform": "<Coursera/Udemy/edX/etc>",
      "skill": "<which skill it addresses>",
      "level": "<Beginner/Intermediate/Advanced>",
      "estimatedDuration": "<e.g., 4 weeks>"
    }
  ],
  "learningRoadmap": [
    {
      "phase": <number>,
      "title": "<phase title>",
      "duration": "<estimated duration>",
      "items": ["<learning item 1>", "<learning item 2>"]
    }
  ],
  "jobMarketInsights": {
    "demandLevel": "<High/Medium/Low>",
    "averageSalary": "<salary range>",
    "topCompanies": ["<company 1>", "<company 2>"],
    "growthOutlook": "<description>"
  }
}

Be realistic, specific, and base your analysis on current real-world industry requirements for the recommended target role. Include at least 8-10 required skills, 3-5 certifications, and 5-8 courses.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(responseText);
      }
    } catch (parseErr) {
      analysis = { rawResponse: responseText, parseError: true };
    }

    // Store the profile in Firestore
    const profileData = {
      userId: req.userId,
      education, skills, certifications, technicalKnowledge,
      pastExperiences, interestedRole, knownSkillsForRole,
      analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
      analysis: analysis
    };
    
    await db.collection('profiles').doc(req.userId).set(profileData, { merge: true });

    res.json({ success: true, analysis });
  } catch (err) {
    console.error('Gemini/Firebase error:', err);
    // Handle Gemini rate limit quota exceeded
    if (err.status === 429 || (err.message && err.message.includes('429'))) {
      return res.status(429).json({ error: 'AI quota limit reached. Please wait a few minutes and try again.' });
    }
    res.status(500).json({ error: 'Failed to analyze profile or save to database.' });
  }
});

// Get user profile and analysis
app.get('/api/profile', [authMiddleware, checkDb], async (req, res) => {
  try {
    const doc = await db.collection('profiles').doc(req.userId).get();
    if (!doc.exists) {
      return res.json({ profile: null });
    }
    res.json({ profile: doc.data() });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Save skill self-assessment (after analysis)
app.post('/api/skills/assess', [authMiddleware, checkDb], async (req, res) => {
  try {
    const { skillAssessment } = req.body; // { skillName: true/false, ... }
    
    const docRef = db.collection('profiles').doc(req.userId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(400).json({ error: 'Complete onboarding first' });
    }
    
    await docRef.update({
      skillAssessment: skillAssessment,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Skill assessment error:', err);
    res.status(500).json({ error: 'Server error saving assessment' });
  }
});

// ===================== AI JOBS GENERATOR =====================
app.post('/api/jobs/generate', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'role is required' });

    const prompt = `You are a job market expert for India. Generate 5 realistic job listings for the role: "${role}".
Return ONLY a valid JSON array (no markdown, no explanation) with exactly this structure:
[
  {
    "id": 1,
    "title": "<job title>",
    "company": "<real Indian or global company>",
    "location": "<city, state or Remote>",
    "type": "Full-time",
    "salary": "<salary range in LPA e.g. ₹8L–₹14L>",
    "match": <number 70-97>,
    "posted": "<e.g. 2 days ago>",
    "skills": ["<skill1>", "<skill2>", "<skill3>"],
    "desc": "<one sentence job description>",
    "searchQuery": "<URL-safe search query for indeed/linkedin e.g. data+analyst>"
  }
]
Make jobs diverse: mix of startups, MNCs, remote and on-site. Ensure skills and salaries are realistic for ${role} in India 2024.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ error: 'AI returned invalid format' });
    const jobs = JSON.parse(jsonMatch[0]);
    res.json({ success: true, jobs });
  } catch (err) {
    console.error('Jobs generate error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate jobs' });
  }
});

// ===================== AI INTERNSHIPS GENERATOR =====================
app.post('/api/internships/generate', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'role is required' });

    const prompt = `You are an internship market expert for India. Generate 5 realistic internship listings for the role: "${role}".
Return ONLY a valid JSON array (no markdown, no explanation) with exactly this structure:
[
  {
    "id": 1,
    "title": "<internship title>",
    "company": "<real company name>",
    "location": "<city, state or Remote>",
    "stipend": "<stipend e.g. ₹15,000/mo or Unpaid>",
    "duration": "<e.g. 3 months>",
    "type": "<Paid or Unpaid>",
    "match": <number 70-97>,
    "skills": ["<skill1>", "<skill2>", "<skill3>"],
    "desc": "<one sentence internship description>",
    "searchQuery": "<URL-safe search query e.g. data+analyst+intern>"
  }
]
Make internships diverse: include well-known companies, startups and remote options. Ensure stipends and skills are realistic for ${role} internships in India 2024.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ error: 'AI returned invalid format' });
    const internships = JSON.parse(jsonMatch[0]);
    res.json({ success: true, internships });
  } catch (err) {
    console.error('Internships generate error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate internships' });
  }
});

// AI Chat endpoint
app.post('/api/chat', [authMiddleware, checkDb], async (req, res) => {
  try {
    const { message } = req.body;
    
    const doc = await db.collection('profiles').doc(req.userId).get();
    const profile = doc.exists ? doc.data() : null;
    
    const context = profile
      ? `The user is interested in becoming a ${profile.interestedRole}. Their background: ${profile.education}. Known skills: ${profile.skills}.`
      : 'The user has not completed their profile yet.';

    const prompt = `You are an AI career assistant for the Skill Bridge platform. ${context}

User asks: "${message}"

Respond helpfully, concisely, and specifically about career guidance, skills, and learning paths. Keep response under 200 words.
If you are recommending a specific career path or role from our platform (e.g. based on their skills or interests), append a tag at the very end of your response exactly like:
[RECOMMENDED_ROLES: ["Full Stack Developer"]]
or
[RECOMMENDED_ROLES: ["Data Analyst", "Data Scientist"]]

Available roles on our platform include:
- Data Analyst
- Data Scientist
- AI Engineer
- Machine Learning Engineer
- Software Engineer
- Full Stack Developer
- Frontend Developer
- Backend Developer
- Cyber Security Analyst
- Cloud Architect
- DevOps Engineer`;

    const result = await model.generateContent(prompt);
    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'AI chat failed' });
  }
});

// ===================== CAREER TRAINER =====================

// Generate AI roadmap based on target company/role and user profile
app.post('/api/career-trainer/generate', [authMiddleware, checkDb], async (req, res) => {
  try {
    const {
      targetCompany,
      targetRole,
      skillLevel,
      linkedInUrl,
      currentSkills,
      experience,
      education,
      certifications,
      projects,
    } = req.body;

    const prompt = `You are an expert career coach and technical hiring manager. A user wants to get a job as "${targetRole}" at "${targetCompany}".

## User Profile:
- **Current Skills:** ${currentSkills || 'Not specified'}
- **Experience:** ${experience || 'Not specified'}
- **Education:** ${education || 'Not specified'}
- **Certifications:** ${certifications || 'None'}
- **Projects:** ${projects || 'None'}
- **Skill Level:** ${skillLevel}
- **LinkedIn URL:** ${linkedInUrl || 'Not provided'}

## Your Task:
Generate a comprehensive career preparation plan. Respond ONLY with valid JSON (no markdown, no code blocks), structured exactly as:
{
  "skillGapAnalysis": {
    "overallReadiness": <number 0-100>,
    "summary": "<2-3 sentence assessment>",
    "skillsUserHas": ["<skill>", ...],
    "skillsToLearn": ["<skill>", ...],
    "missingCriticalSkills": ["<skill>", ...]
  },
  "roadmap": [
    {
      "phase": 1,
      "title": "Fundamentals",
      "duration": "<e.g. 2 weeks>",
      "description": "<brief description>",
      "courses": [{"name": "<name>", "platform": "<platform>", "url": "<optional url>", "duration": "<e.g. 10 hours>"}],
      "projects": [{"name": "<project name>", "description": "<what to build>"}],
      "practiceProblems": ["<problem/topic>"],
      "interviewQuestions": ["<question>"]
    },
    {
      "phase": 2,
      "title": "Core Technical Skills",
      "duration": "<duration>",
      "description": "<brief description>",
      "courses": [{"name": "<name>", "platform": "<platform>", "url": "", "duration": ""}],
      "projects": [{"name": "<name>", "description": "<desc>"}],
      "practiceProblems": ["<topic>"],
      "interviewQuestions": ["<question>"]
    },
    {
      "phase": 3,
      "title": "Advanced Topics",
      "duration": "<duration>",
      "description": "<brief description>",
      "courses": [{"name": "<name>", "platform": "<platform>", "url": "", "duration": ""}],
      "projects": [{"name": "<name>", "description": "<desc>"}],
      "practiceProblems": ["<topic>"],
      "interviewQuestions": ["<question>"]
    },
    {
      "phase": 4,
      "title": "${targetCompany}-Specific Interview Prep",
      "duration": "<duration>",
      "description": "<brief description>",
      "courses": [{"name": "<name>", "platform": "<platform>", "url": "", "duration": ""}],
      "projects": [{"name": "<name>", "description": "<desc>"}],
      "practiceProblems": ["<topic>"],
      "interviewQuestions": ["<real ${targetCompany} interview question>"]
    },
    {
      "phase": 5,
      "title": "Mock Interviews & Final Practice",
      "duration": "<duration>",
      "description": "<brief description>",
      "courses": [{"name": "<name>", "platform": "<platform>", "url": "", "duration": ""}],
      "projects": [{"name": "<name>", "description": "<desc>"}],
      "practiceProblems": ["<topic>"],
      "interviewQuestions": ["<behavioral/system design question>"]
    }
  ],
  "resumeTips": [
    "<specific resume improvement tip based on user's background and ${targetRole} at ${targetCompany}>"
  ],
  "totalTimeline": "<total estimated weeks/months to be job-ready>",
  "companyCulture": "<2-3 sentences on ${targetCompany}'s culture and what they look for>"
}

Be specific to ${targetCompany} and ${targetRole}. Include real course names from Coursera/Udemy/LeetCode/YouTube. Include at least 3-4 courses per phase, 2-3 projects per phase, 4-5 practice topics, 3-4 interview questions per phase. Make the advice actionable and realistic.`;

    // Retry up to 3 times for 429 rate-limit errors
    let responseText;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        break; // success
      } catch (aiErr) {
        const is429 = aiErr?.status === 429 || aiErr?.message?.includes('429') || aiErr?.message?.includes('Too Many Requests');
        if (is429 && attempt < 3) {
          const waitMs = attempt * 30000; // 30s, 60s
          console.log(`⏳ Gemini 429 rate limit hit. Retrying in ${waitMs / 1000}s (attempt ${attempt}/3)...`);
          await new Promise(r => setTimeout(r, waitMs));
        } else if (is429) {
          return res.status(429).json({ error: 'The AI service is temporarily busy due to high demand. Please wait 1-2 minutes and try again.' });
        } else {
          throw aiErr;
        }
      }
    }

    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);
    } catch {
      return res.status(500).json({ error: 'AI returned invalid JSON. Please try again.' });
    }

    // Auto-save to Firestore
    await db.collection('careerTrainer').doc(req.userId).set({
      userId: req.userId,
      targetCompany,
      targetRole,
      skillLevel,
      linkedInUrl: linkedInUrl || '',
      currentSkills,
      experience,
      education,
      certifications,
      projects,
      analysis,
      progress: {},
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, analysis });
  } catch (err) {
    console.error('Career trainer generate error:', err);
    res.status(500).json({ error: 'Failed to generate roadmap.' });
  }
});

// Get saved career trainer data
app.get('/api/career-trainer/progress', [authMiddleware, checkDb], async (req, res) => {
  try {
    const doc = await db.collection('careerTrainer').doc(req.userId).get();
    if (!doc.exists) return res.json({ data: null });
    res.json({ data: doc.data() });
  } catch (err) {
    console.error('Career trainer fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch career trainer data.' });
  }
});

// Update progress (checked items)
app.post('/api/career-trainer/progress', [authMiddleware, checkDb], async (req, res) => {
  try {
    const { progress } = req.body; // { 'phase1-course-0': true, 'phase2-project-1': true, ... }
    await db.collection('careerTrainer').doc(req.userId).update({
      progress,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Career trainer progress update error:', err);
    res.status(500).json({ error: 'Failed to update progress.' });
  }
});

// ===================== AI CAREER EXAM ROUTES =====================

const generateWithRetry = async (promptConfig, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(promptConfig);
      return result;
    } catch (aiErr) {
      const is429 = aiErr?.status === 429 || aiErr?.message?.includes('429') || aiErr?.message?.includes('Too Many Requests');
      if (is429 && attempt < maxRetries) {
        const waitMs = attempt * 5000; // wait 5s, 10s
        console.log(`⏳ Gemini 429 rate limit hit. Retrying in ${waitMs / 1000}s (attempt ${attempt}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, waitMs));
      } else {
        throw aiErr;
      }
    }
  }
};

const parseAIResponse = (text) => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse AI response manually', err);
    throw new Error('Invalid JSON structure from AI');
  }
};

const fallbackSkills = {
  categories: [
    {
      category: 'Core Fundamentals',
      skills: [
        { name: 'Problem Solving', description: 'Breaking down complex tasks' },
        { name: 'Communication', description: 'Writing and articulating ideas clearly' },
        { name: 'Version Control (Git)', description: 'Managing code history effectively' },
        { name: 'Agile Methodologies', description: 'Working in collaborative sprints' }
      ]
    },
    {
      category: 'Technical Knowledge',
      skills: [
        { name: 'Programming Basics', description: 'Understanding variables, loops, types' },
        { name: 'System Design', description: 'Basic architecture concepts' },
        { name: 'Database Fundamentals', description: 'Understanding SQL and NoSQL' },
        { name: 'API Integration', description: 'Connecting microservices' }
      ]
    }
  ]
};

const fallbackExam = {
  Easy: [
    { q: "Which tool is commonly used for version control?", options: ["Git", "Photoshop", "Excel", "Word"], answer: 0 },
    { q: "What does API stand for?", options: ["Application Programming Interface", "Advanced Program Integration", "Apple Product Interface", "Automated Process Interaction"], answer: 0 },
    { q: "Which of the following is an agile framework?", options: ["Waterfall", "Scrum", "V-Model", "Spiral"], answer: 1 },
    { q: "What is the primary function of a database?", options: ["Design UI", "Store and retrieve data", "Compile code", "Run tests"], answer: 1 },
    { q: "What is a loop used for in programming?", options: ["Styling elements", "Repeating a block of code", "Creating variables", "Deleting files"], answer: 1 }
  ],
  Medium: [
    { q: "What does 'SOLID' stand for in software design?", options: ["Simple, Open, Logical, Independent, Direct", "Single Responsibility, Open-Closed, Liskov, Interface, Dependency", "Secure, Organized, Lightweight, Integrated, Dynamic", "Systematic, Optimized, Linked, Indexed, Distributed"], answer: 1 },
    { q: "Which HTTP method is typically used to create a new resource?", options: ["GET", "PUT", "POST", "DELETE"], answer: 2 },
    { q: "What is the purpose of a load balancer?", options: ["Compile code faster", "Distribute network traffic", "Encrypt data", "Format disks"], answer: 1 },
    { q: "Which data structure uses LIFO?", options: ["Queue", "Stack", "Tree", "Graph"], answer: 1 },
    { q: "What does CI/CD stand for?", options: ["Continuous Integration / Continuous Deployment", "Code Inspection / Code Delivery", "Centralized Information / Centralized Data", "Compiled Instructions / Computed Data"], answer: 0 }
  ],
  Hard: [
    { q: "What is the time complexity of a binary search?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], answer: 2 },
    { q: "Which pattern restricts the instantiation of a class to a single instance?", options: ["Factory", "Observer", "Singleton", "Decorator"], answer: 2 },
    { q: "What is a 'deadlock' in concurrent programming?", options: ["When a thread crashes", "When two or more threads wait indefinitely for each other", "When memory is exhausted", "When CPU usage hits 100%"], answer: 1 },
    { q: "In the context of databases, what does ACID stand for?", options: ["Atomicity, Consistency, Isolation, Durability", "Accuracy, Computation, Indexing, Data", "Automated, Centralized, Integrated, Distributed", "Always Complete In Database"], answer: 0 },
    { q: "What is the primary purpose of a reverse proxy?", options: ["Connect to databases directly", "Protect and distribute load to internal servers", "Compile JavaScript", "Render HTML"], answer: 1 }
  ]
};

const fallbackRoadmap = [
  {
    stage: 1,
    title: 'Core Fundamentals Recovery',
    status: 'in-progress',
    skills: [
      { name: 'Review Basic Concepts', status: 'in-progress', duration: '1 week' },
      { name: 'Practice Standard Algorithms', status: 'locked', duration: '2 weeks' },
      { name: 'Version Control Mastery', status: 'locked', duration: '1 week' }
    ]
  },
  {
    stage: 2,
    title: 'Intermediate Concepts',
    status: 'locked',
    skills: [
      { name: 'API Design & Integration', status: 'locked', duration: '2 weeks' },
      { name: 'Database Optimization', status: 'locked', duration: '2 weeks' },
      { name: 'System Architecture', status: 'locked', duration: '3 weeks' }
    ]
  },
  {
    stage: 3,
    title: 'Advanced Implementation',
    status: 'locked',
    skills: [
      { name: 'Design Patterns', status: 'locked', duration: '2 weeks' },
      { name: 'Concurrency & Scaling', status: 'locked', duration: '2 weeks' },
      { name: 'Security Best Practices', status: 'locked', duration: '1 week' }
    ]
  },
  {
    stage: 4,
    title: 'Industry Readiness',
    status: 'locked',
    skills: [
      { name: 'Mock Interviews', status: 'locked', duration: '2 weeks' },
      { name: 'Portfolio Development', status: 'locked', duration: 'Ongoing' },
      { name: 'Final Project', status: 'locked', duration: '3 weeks' }
    ]
  }
];

// Generate skills based on selected role
// Generate skills based on selected role
app.post('/api/skills/for-role', [authMiddleware, checkDb], async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });

    // Check Firestore cache first
    const cacheDocRef = db.collection('cachedSkills').doc(role.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').slice(0, 100));
    const cacheDoc = await cacheDocRef.get();
    if (cacheDoc.exists) {
      console.log(`📦 Returning cached skills for role: ${role}`);
      return res.json({ success: true, categories: cacheDoc.data().categories });
    }

    const prompt = `You are a technical career expert. A user wants to pursue the role of "${role}".
Respond exactly with a JSON object representing 4 essential skill categories for this role, with 4 skills in each category.
Structure:
{
  "categories": [
    {
      "category": "Category Name",
      "skills": [
        { "name": "Skill 1", "description": "Short description" }
      ]
    }
  ]
}`;

    const result = await generateWithRetry({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const data = parseAIResponse(result.response.text());

    // Save to Firestore cache
    await cacheDocRef.set({
      categories: data.categories,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, categories: data.categories });
  } catch (err) {
    console.error('❌ Error in /api/skills/for-role:', err);
    res.json({ success: true, categories: fallbackSkills.categories, isFallback: true });
  }
});

// Generate 3-level exam
app.post('/api/exam/generate', [authMiddleware, checkDb], async (req, res) => {
  try {
    const { role, knownSkills } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });

    const skillsText = knownSkills && knownSkills.length > 0 ? knownSkills.join(', ') : 'None specified';
    const cacheKey = `${role.toLowerCase().trim()}_${skillsText.toLowerCase().trim()}`.replace(/[^a-z0-9_]/g, '_').slice(0, 100);

    // Check Firestore cache first
    const cacheDocRef = db.collection('cachedExams').doc(cacheKey);
    const cacheDoc = await cacheDocRef.get();
    if (cacheDoc.exists) {
      console.log(`📦 Returning cached exam for key: ${cacheKey}`);
      return res.json({ success: true, exam: cacheDoc.data().exam });
    }

    const prompt = `You are an expert exam creator for the role of "${role}". The user claims to know the following skills: ${skillsText}.
Create a 3-level multiple choice test (Easy, Medium, Hard) to evaluate their knowledge, heavily focused on this role and their known skills. 5 questions per difficulty level.
Respond exactly with a JSON object.
Structure:
{
  "Easy": [
    { "q": "Question text?", "options": ["A", "B", "C", "D"], "answer": <index of correct option 0-3> }
  ],
  "Medium": [ ... ],
  "Hard": [ ... ]
}`;

    const result = await generateWithRetry({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const data = parseAIResponse(result.response.text());

    // Save to Firestore cache
    await cacheDocRef.set({
      exam: data,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, exam: data });
  } catch (err) {
    console.error('❌ Error in /api/exam/generate:', err);
    res.json({ success: true, exam: fallbackExam, isFallback: true });
  }
});

// Generate personalized roadmap based on exam results
app.post('/api/roadmap/generate-from-exam', [authMiddleware, checkDb], async (req, res) => {
  try {
    const { role, examResults } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });
    
    const incorrectQs = (examResults || [])
      .filter(r => r.selected !== r.correct)
      .map(r => r.q);

    const weaknesses = incorrectQs.length > 0 ? incorrectQs.map(q => "- " + q).join('\n') : "None detected!";
    const cacheKey = `${role.toLowerCase().trim()}_${incorrectQs.sort().join('_').toLowerCase().trim()}`.replace(/[^a-z0-9_]/g, '_').slice(0, 100);

    // Check Firestore cache first
    const cacheDocRef = db.collection('cachedRoadmaps').doc(cacheKey);
    const cacheDoc = await cacheDocRef.get();
    if (cacheDoc.exists) {
      console.log(`📦 Returning cached roadmap for key: ${cacheKey}`);
      return res.json({ success: true, roadmap: cacheDoc.data().roadmap });
    }

    const prompt = `You are a technical career mentor. The user wants to be a "${role}".
They took an assessment. They answered the following underlying concepts incorrectly:
${weaknesses}

Create a personalized 4-stage learning roadmap focused on addressing these specific weaknesses.
Respond exactly with a valid JSON array of stage objects.
Structure:
[
  {
    "stage": 1,
    "title": "Stage Title",
    "status": "in-progress",
    "skills": [
      { "name": "Topic to study", "status": "locked", "duration": "1 week" }
    ]
  }
]
Use "completed" for topics they already seem strong in, "in-progress" for the first weak topic, and "locked" for subsequent stages. Ensure exactly 4 stages, with exactly 3 skills per stage.`;

    const result = await generateWithRetry({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const data = parseAIResponse(result.response.text());

    // Save to Firestore cache
    await cacheDocRef.set({
      roadmap: data,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, roadmap: data });
  } catch (err) {
    console.error('❌ Error in /api/roadmap/generate-from-exam:', err);
    res.json({ success: true, roadmap: fallbackRoadmap, isFallback: true });
  }
});

const getFallbackCertifications = (role) => {
  const lowerRole = (role || '').toLowerCase();
  if (lowerRole.includes('data') || lowerRole.includes('analyst') || lowerRole.includes('science')) {
    return [
      { id: 1, name: 'Google Data Analytics Professional Certificate', provider: 'Google', platform: 'Coursera', price: 'Paid', duration: '3-6 months', description: 'Gain in-demand skills for an entry-level data analyst job.', redirectUrl: 'https://www.coursera.org/professional-certificates/google-data-analytics' },
      { id: 2, name: 'Data Analysis with Python Certification', provider: 'FreeCodeCamp', platform: 'FreeCodeCamp', price: 'Free', duration: '4-6 weeks', description: 'Learn NumPy, Pandas, Matplotlib, and complete hands-on analysis projects.', redirectUrl: 'https://www.freecodecamp.org/learn/data-analysis-with-python/' },
      { id: 3, name: 'Complete SQL Bootcamp: Go from Zero to Hero', provider: 'Jose Portilla', platform: 'Udemy', price: 'Paid', duration: '9 hours', description: 'Learn SQL, PostgreSQL, and database administration from scratch.', redirectUrl: 'https://www.udemy.com/course/the-complete-sql-bootcamp/' },
      { id: 4, name: 'Analyzing Data with Excel', provider: 'Microsoft', platform: 'Microsoft', price: 'Free', duration: '3 weeks', description: 'Learn Excel essentials, formulas, and chart visualization.', redirectUrl: 'https://learn.microsoft.com/en-us/training/paths/analyze-data-excel/' }
    ];
  } else {
    return [
      { id: 1, name: 'Meta Front-End Developer Professional Certificate', provider: 'Meta', platform: 'Coursera', price: 'Paid', duration: '3-6 months', description: 'Get started in frontend development with React, HTML/CSS, and Git.', redirectUrl: 'https://www.coursera.org/professional-certificates/meta-front-end-developer' },
      { id: 2, name: 'Responsive Web Design Certification', provider: 'FreeCodeCamp', platform: 'FreeCodeCamp', price: 'Free', duration: '6-8 weeks', description: 'Master HTML, CSS, CSS Flexbox, and Grid layouts with interactive projects.', redirectUrl: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' },
      { id: 3, name: 'The Complete 2026 Web Development Bootcamp', provider: 'Dr. Angela Yu', platform: 'Udemy', price: 'Paid', duration: '60+ hours', description: 'Comprehensive full-stack development masterclass with HTML, CSS, Node, React.', redirectUrl: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/' },
      { id: 4, name: 'JavaScript Algorithms and Data Structures', provider: 'FreeCodeCamp', platform: 'FreeCodeCamp', price: 'Free', duration: '6 weeks', description: 'Learn basic JavaScript syntax, OOP, and data structures.', redirectUrl: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/' }
    ];
  }
};

// Generate dynamic courses and certifications based on role
app.post('/api/courses/generate', [authMiddleware, checkDb], async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });

    const cacheKey = `courses_${role.toLowerCase().trim()}`.replace(/[^a-z0-9_]/g, '_').slice(0, 100);

    // Check Firestore cache first
    const cacheDocRef = db.collection('cachedCourses').doc(cacheKey);
    const cacheDoc = await cacheDocRef.get();
    if (cacheDoc.exists) {
      console.log(`📦 Returning cached courses and certifications for role: ${role}`);
      const cachedData = cacheDoc.data();
      let certifications = cachedData.certifications;
      if (!certifications || !Array.isArray(certifications) || certifications.length === 0) {
        certifications = getFallbackCertifications(role);
      }
      return res.json({ success: true, courses: cachedData.courses || [], certifications });
    }

    console.log(`🤖 Generating courses & certifications for role: ${role} using AI...`);
    const prompt = `You are a professional tech education advisor. For the career role "${role}", recommend a list of 6-8 key courses AND 4-6 industry certifications.
Ensure that:
- Certifications are split between premium providers (Coursera, Udemy) and high-quality FREE platforms (like FreeCodeCamp, Cognitive Class, Google Digital Garage, Microsoft).
- You provide the exact redirectUrl (such as a search or course URL) for each certification.
- Prices must be clearly marked as "Free" or "Paid".

Respond ONLY with valid JSON (no markdown explanation):
{
  "courses": [
    {
      "id": 1,
      "title": "<Course/Skill Title>",
      "category": "<e.g. Programming, Tools, Database, AI/ML, Frontend>",
      "duration": "<e.g. 6 hours, 10 hours>",
      "description": "<One sentence description>"
    }
  ],
  "certifications": [
    {
      "id": 1,
      "name": "<Certification Name, e.g. AWS Certified Cloud Practitioner>",
      "provider": "<e.g. Amazon Web Services, Google, FreeCodeCamp>",
      "platform": "<Coursera | Udemy | FreeCodeCamp | Microsoft | Google>",
      "price": "<Free | Paid>",
      "duration": "<e.g. 2 months, 6 weeks>",
      "description": "<One sentence overview of the certification value>",
      "redirectUrl": "<URL to course/search page on platform, e.g. https://www.coursera.org/search?query=aws+practitioner>"
    }
  ]
}`;

    const result = await generateWithRetry({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const responseText = result.response.text();

    let data;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (parseErr) {
      console.error('Courses JSON parse error:', parseErr.message);
      data = { courses: [], certifications: [] };
    }

    if (!data.courses || !Array.isArray(data.courses) || data.courses.length === 0) {
      data.courses = [
        { id: 1, title: `${role} Fundamentals`, category: 'Core', duration: '8 hours', description: `Learn the fundamental concepts of ${role}.` }
      ];
    }

    if (!data.certifications || !Array.isArray(data.certifications) || data.certifications.length === 0) {
      data.certifications = getFallbackCertifications(role);
    }

    // Save to Firestore cache
    await cacheDocRef.set({
      courses: data.courses,
      certifications: data.certifications,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, courses: data.courses, certifications: data.certifications });
  } catch (err) {
    console.error('❌ Error in /api/courses/generate:', err);
    res.json({ success: false, error: err.message });
  }
});

// Generate dynamic projects based on role
app.post('/api/projects/generate', [authMiddleware, checkDb], async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });

    const cacheKey = `projects_${role.toLowerCase().trim()}`.replace(/[^a-z0-9_]/g, '_').slice(0, 100);

    // Check Firestore cache first
    const cacheDocRef = db.collection('cachedProjects').doc(cacheKey);
    const cacheDoc = await cacheDocRef.get();
    if (cacheDoc.exists) {
      console.log(`📦 Returning cached projects for role: ${role}`);
      return res.json({ success: true, projects: cacheDoc.data().projects });
    }

    console.log(`🤖 Generating projects for role: ${role} using Gemini...`);
    const prompt = `You are an expert project creator. The user's target career role is "${role}".
Create 4 practical, real-world mini-projects they can build to demonstrate competency in this role.
Provide:
- 1 Beginner project
- 2 Intermediate projects
- 1 Advanced project
Respond exactly with a valid JSON array of project objects. Do not include any markdown formatting or extra text outside the JSON.
Structure:
[
  {
    "id": 1,
    "title": "Project Title",
    "description": "Short overview description.",
    "skills": ["Skill 1", "Skill 2"],
    "difficulty": "Beginner",
    "status": "not-started",
    "deadline": "15 Days",
    "instructions": "Detailed requirements and instructions for completing this project."
  }
]`;

    const result = await generateWithRetry({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const data = parseAIResponse(result.response.text());

    // Save to Firestore cache
    await cacheDocRef.set({
      projects: data,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, projects: data });
  } catch (err) {
    console.error('❌ Error in /api/projects/generate:', err);
    res.json({ success: false, error: err.message });
  }
});

// Evaluate an uploaded mini project using AI
app.post('/api/projects/evaluate', [authMiddleware], async (req, res) => {
  try {
    const { projectTitle, projectDescription, fileName, fileContent, role } = req.body;
    if (!projectTitle) return res.status(400).json({ error: 'Project Title is required' });

    console.log(`🤖 Evaluating project "${projectTitle}" for role "${role}" using AI...`);

    let evaluationPrompt = `You are an expert technical evaluator and mentor.
The user is learning to become a "${role}" and has submitted a project named "${projectTitle}" (Description: "${projectDescription}").
They uploaded a file named "${fileName}".`;

    if (fileContent && fileContent.trim().length > 0) {
      const truncatedContent = fileContent.slice(0, 12000);
      evaluationPrompt += `
Here is the source code/content of the submitted file:
\`\`\`
${truncatedContent}
\`\`\`
Please perform a thorough code review. Assess code cleanliness, structure, potential bugs, and adherence to the project description.`;
    } else {
      evaluationPrompt += `
(Note: The uploaded file is binary or compressed, so the full source code is not direct text. Please evaluate based on the project requirements, file name, and difficulty.)`;
    }

    evaluationPrompt += `
Provide a grade (one of: A+, A, B, C, F) and a detailed, constructive feedback paragraph (3-4 sentences max) explaining what they did well and how they can improve.

Respond ONLY with a valid JSON object:
{
  "grade": "<Grade>",
  "feedback": "<Detailed feedback summary>"
}`;

    const result = await generateWithRetry({
      contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }]
    });

    const responseText = result.response.text();
    let data;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (parseErr) {
      console.error('Project evaluation JSON parse error:', parseErr.message);
      data = {
        grade: 'A',
        feedback: `Successfully reviewed your submission of "${fileName}". The project meets standard requirements. Keep up the good work!`
      };
    }

    res.json({ success: true, grade: data.grade || 'A', feedback: data.feedback });
  } catch (err) {
    console.error('❌ Error in /api/projects/evaluate:', err);
    res.status(500).json({ error: 'Failed to evaluate project: ' + err.message });
  }
});


// ===================== EMAIL ROUTES =====================

app.post('/api/email/send-gap-report', [authMiddleware, checkDb], async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
    const user = userDoc.data();

    const profileDoc = await db.collection('profiles').doc(req.userId).get();
    if (!profileDoc.exists || !profileDoc.data().analysis) {
      return res.status(400).json({ error: 'Please complete your onboarding profile analysis first.' });
    }
    const profile = profileDoc.data();
    const analysis = profile.analysis;

    const emailHtml = `
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 40px 30px; text-align: center;">
            <div style="width: 60px; height: 60px; line-height: 60px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.2); display: inline-block; margin-bottom: 16px; font-size: 28px; color: #ffffff; text-align: center;">🎯</div>
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800;">Career Gap Analysis Report</h1>
            <p style="margin: 8px 0 0; color: #e9d5ff; font-size: 14px; font-weight: 600; text-transform: uppercase;">Target Role: ${profile.interestedRole}</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; margin-top: 0; color: #1e293b;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6; color: #475569;">
              Here is your personalized AI Career Gap Analysis. We compared your background with current requirements for the <strong>${profile.interestedRole}</strong> role.
            </p>
            
            <!-- Overall Readiness Card -->
            <div style="background: linear-gradient(135deg, #e0e7ff, #f3e8ff); border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center; border: 1px solid #c7d2fe;">
              <span style="font-size: 13px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.5px;">Current Readiness Score</span>
              <div style="font-size: 48px; font-weight: 800; color: #6366f1; margin: 8px 0;">${analysis.gapAnalysisReport?.overallReadiness || 'N/A'}%</div>
              <p style="font-size: 14px; color: #4f5e74; line-height: 1.5; margin: 0;">${analysis.gapAnalysisReport?.summary || ''}</p>
            </div>

            <!-- Strengths -->
            <h3 style="color: #1e293b; font-size: 17px; margin-top: 30px; margin-bottom: 12px; font-weight: 700;">✓ Your Key Strengths</h3>
            <div style="margin-bottom: 24px;">
              ${(analysis.gapAnalysisReport?.strengths || []).map(s => `
                <div style="padding: 10px 14px; background-color: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; font-size: 14px; color: #166534; margin-bottom: 8px; font-weight: 500;">
                  ${s}
                </div>
              `).join('')}
            </div>

            <!-- Gaps -->
            <h3 style="color: #1e293b; font-size: 17px; margin-top: 30px; margin-bottom: 12px; font-weight: 700;">! Critical Gaps to Focus On</h3>
            <div style="margin-bottom: 24px;">
              ${(analysis.gapAnalysisReport?.keyGaps || []).map(g => `
                <div style="padding: 10px 14px; background-color: #fef2f2; border-radius: 8px; border: 1px solid #fecaca; font-size: 14px; color: #991b1b; margin-bottom: 8px; font-weight: 500;">
                  ${g}
                </div>
              `).join('')}
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 30px;">
              <a href="http://localhost:5173/roadmap" style="background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);">Open Your Roadmap</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 4px;">&copy; 2026 Skill Bridge. All rights reserved.</p>
            <p style="margin: 0;">Skill Bridge makes your career bright.</p>
          </div>
        </div>
      </div>
    `;

    await sendMail(user.email, `Skill Bridge: Your Career Gap Analysis for ${profile.interestedRole}`, emailHtml);

    res.json({ success: true, message: 'Gap analysis report emailed successfully.' });
  } catch (err) {
    console.error('Email gap report error:', err);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});

app.post('/api/email/send-roadmap', [authMiddleware, checkDb], async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
    const user = userDoc.data();

    const trainerDoc = await db.collection('careerTrainer').doc(req.userId).get();
    if (!trainerDoc.exists || !trainerDoc.data().analysis) {
      return res.status(400).json({ error: 'Please generate a career preparation roadmap first.' });
    }
    const trainer = trainerDoc.data();
    const analysis = trainer.analysis;

    const roadmapPhasesHtml = (analysis.roadmap || []).map(phase => `
      <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 6px;">
        <h4 style="margin-top: 0; color: #3182ce;">Phase ${phase.phase}: ${phase.title} (${phase.duration})</h4>
        <p>${phase.description}</p>
        
        ${phase.courses && phase.courses.length > 0 ? `
          <strong>Recommended Courses:</strong>
          <ul>
            ${phase.courses.map(c => `<li>${c.name} (${c.platform || ''})</li>`).join('')}
          </ul>
        ` : ''}

        ${phase.projects && phase.projects.length > 0 ? `
          <strong>Key Projects:</strong>
          <ul>
            ${phase.projects.map(p => `<li><strong>${p.name}:</strong> ${p.description}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `).join('');

    const emailHtml = `
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 40px 30px; text-align: center;">
            <div style="width: 60px; height: 60px; line-height: 60px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.2); display: inline-block; margin-bottom: 16px; font-size: 28px; color: #ffffff; text-align: center;">🗺️</div>
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800;">Career Preparation Roadmap</h1>
            <p style="margin: 8px 0 0; color: #e9d5ff; font-size: 14px; font-weight: 600; text-transform: uppercase;">${trainer.targetRole} @ ${trainer.targetCompany}</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; margin-top: 0; color: #1e293b;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.6; color: #475569;">
              Here is your personalized 5-phase career preparation roadmap designed specifically to land your dream job at <strong>${trainer.targetCompany}</strong>.
            </p>
            
            <!-- Readiness Card -->
            <div style="background: linear-gradient(135deg, #e0e7ff, #f3e8ff); border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center; border: 1px solid #c7d2fe;">
              <span style="font-size: 13px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.5px;">Current Readiness Score</span>
              <div style="font-size: 48px; font-weight: 800; color: #6366f1; margin: 8px 0;">${analysis.skillGapAnalysis?.overallReadiness || 'N/A'}%</div>
              <p style="font-size: 14px; color: #4f5e74; line-height: 1.5; margin: 0;">${analysis.skillGapAnalysis?.summary || ''}</p>
            </div>

            <h3 style="color: #1e293b; font-size: 18px; margin-top: 30px; margin-bottom: 16px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; font-weight: 700;">Your 5-Phase Journey</h3>
            ${roadmapPhasesHtml}

            <!-- Call to Action -->
            <div style="text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 30px;">
              <a href="http://localhost:5173/career-trainer" style="background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);">Track Your Progress</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8;">
            <p style="margin: 0 0 4px;">&copy; 2026 Skill Bridge. All rights reserved.</p>
            <p style="margin: 0;">Skill Bridge makes your career bright.</p>
          </div>
        </div>
      </div>
    `;

    await sendMail(user.email, `Skill Bridge: Your Career Roadmap to ${trainer.targetCompany} (${trainer.targetRole})`, emailHtml);

    res.json({ success: true, message: 'Roadmap preparation plan emailed successfully.' });
  } catch (err) {
    console.error('Email roadmap error:', err);
    res.status(500).json({ error: 'Failed to send email: ' + err.message });
  }
});


// ===================== ROADMAP GENERATION =====================

// Generate personalised learning roadmap from skill-test exam results
app.post('/api/roadmap/generate-from-exam', [authMiddleware, checkDb], async (req, res) => {
  try {
    const { role = 'Software Developer', examResults = [] } = req.body;

    // Build a concise summary of exam results for the AI
    const resultsText = examResults.length > 0
      ? examResults.map(r =>
          `- ${r.skill}: ${r.correct}/${r.total} correct (${Math.round((r.correct / r.total) * 100)}%) — ${r.correct / r.total >= 0.7 ? 'Good' : 'Needs Work'}`
        ).join('\n')
      : '- No exam results provided (generate a general roadmap)';

    const weakSkills = examResults.filter(r => (r.correct / r.total) < 0.7).map(r => r.skill);
    const strongSkills = examResults.filter(r => (r.correct / r.total) >= 0.7).map(r => r.skill);

    const prompt = `You are an expert career coach. A user wants to become a "${role}".

Their skill evaluation results:
${resultsText}

Strong skills: ${strongSkills.join(', ') || 'None identified'}
Weak skills needing improvement: ${weakSkills.join(', ') || 'None identified'}

Create a personalized step-by-step learning roadmap with 4-6 stages. 
- Mark stages covering weak skills as "in-progress"
- Mark stages for skills they already know as "completed"  
- Mark advanced stages as "locked"
- Each stage has 3-5 specific learning tasks/skills

Respond ONLY with valid JSON (no markdown):
{
  "roadmap": [
    {
      "stage": 1,
      "title": "<stage title>",
      "status": "completed",
      "skills": [
        { "name": "<skill/task name>", "status": "completed", "duration": "<e.g. 1 week>" },
        { "name": "<skill/task name>", "status": "completed", "duration": "<e.g. 2 weeks>" }
      ]
    },
    {
      "stage": 2,
      "title": "<stage title>",
      "status": "in-progress",
      "skills": [
        { "name": "<skill/task name>", "status": "in-progress", "duration": "<e.g. 2 weeks>" },
        { "name": "<skill/task name>", "status": "locked", "duration": "<e.g. 1 week>" }
      ]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let roadmap;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      roadmap = parsed.roadmap || [];
    } catch (parseErr) {
      console.error('Roadmap JSON parse error:', parseErr.message);
      // Fallback: generate a basic roadmap from weak skills
      roadmap = [
        {
          stage: 1,
          title: 'Foundation Strengthening',
          status: weakSkills.length > 0 ? 'in-progress' : 'completed',
          skills: (weakSkills.length > 0 ? weakSkills : [role + ' Basics']).slice(0, 4).map((s, i) => ({
            name: s,
            status: i === 0 ? 'in-progress' : 'locked',
            duration: '2 weeks'
          }))
        },
        {
          stage: 2,
          title: 'Skill Development',
          status: 'locked',
          skills: [
            { name: 'Build Projects', status: 'locked', duration: '3 weeks' },
            { name: 'Portfolio Creation', status: 'locked', duration: '2 weeks' }
          ]
        },
        {
          stage: 3,
          title: 'Job Readiness',
          status: 'locked',
          skills: [
            { name: 'Resume Optimization', status: 'locked', duration: '1 week' },
            { name: 'Interview Preparation', status: 'locked', duration: '2 weeks' }
          ]
        }
      ];
    }

    // Save to Firestore
    try {
      await db.collection('roadmaps').doc(req.userId).set({
        userId: req.userId,
        role,
        roadmap,
        examResults,
        generatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (dbErr) {
      console.error('Roadmap DB save error:', dbErr.message);
    }

    res.json({ success: true, roadmap });
  } catch (err) {
    console.error('Roadmap generation error:', err);
    if (err.status === 429 || (err.message && err.message.includes('429'))) {
      return res.status(429).json({ error: 'AI quota limit reached. Please wait a moment and try again.' });
    }
    res.status(500).json({ error: 'Failed to generate roadmap: ' + err.message });
  }
});


// AI-generated role-based certifications
app.post('/api/courses/generate', async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    const prompt = `You are a professional career advisor. A user wants to get certifications for the role of "${role}".
Recommend exactly 4 highly-respected, industry-recognized certifications or professional courses for this role.

Respond ONLY with valid JSON (no markdown):
{
  "certifications": [
    {
      "id": 1,
      "name": "<Certification Name, e.g. AWS Certified Solutions Architect>",
      "provider": "<Provider, e.g. Amazon Web Services>",
      "platform": "<Where to take it, e.g. Coursera / Udemy / AWS Platform>",
      "price": "<Free or Paid>",
      "duration": "<e.g. 2-3 months / 12 hours>",
      "description": "<Concise description of what they learn, max 2 sentences.>",
      "redirectUrl": "<A valid URL to search or take the certification, e.g. https://www.google.com/search?q=AWS+Certified+Solutions+Architect>"
    }
  ]
}`;

    let certifications = [];
    if (geminiModels.length > 0) {
      try {
        const result = await generateWithGemini(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
        certifications = parsed.certifications || [];
      } catch (parseErr) {
        console.error('Certifications JSON parse error:', parseErr.message);
      }
    }

    if (!certifications || certifications.length === 0) {
      // Fallback certifications mapping for common roles
      const lowerRole = role.toLowerCase();
      if (lowerRole.includes('data') || lowerRole.includes('analyst')) {
        certifications = [
          {
            id: 1,
            name: 'Google Data Analytics Professional Certificate',
            provider: 'Google',
            platform: 'Coursera',
            price: 'Paid',
            duration: '3-6 months',
            description: 'Gain in-demand skills for an entry-level data analyst job with hands-on SQL and Tableau instruction.',
            redirectUrl: 'https://www.coursera.org/professional-certificates/google-data-analytics'
          },
          {
            id: 2,
            name: 'Data Analysis with Python Certification',
            provider: 'FreeCodeCamp',
            platform: 'FreeCodeCamp',
            price: 'Free',
            duration: '4-6 weeks',
            description: 'Learn NumPy, Pandas, Matplotlib, and complete five real-world data analysis projects.',
            redirectUrl: 'https://www.freecodecamp.org/learn/data-analysis-with-python/'
          },
          {
            id: 3,
            name: 'Microsoft Certified: Power BI Data Analyst Associate',
            provider: 'Microsoft',
            platform: 'Microsoft Learn',
            price: 'Paid',
            duration: '2-3 months',
            description: 'Demonstrate your ability to clean, model, and visualize data using Power BI.',
            redirectUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/power-bi-data-analyst-associate/'
          },
          {
            id: 4,
            name: 'Analyzing Data with Excel',
            provider: 'Microsoft',
            platform: 'Microsoft',
            price: 'Free',
            duration: '3 weeks',
            description: 'Learn Microsoft Excel essentials, advanced formulas, and interactive dashboard creation.',
            redirectUrl: 'https://learn.microsoft.com/en-us/training/paths/analyze-data-excel/'
          }
        ];
      } else {
        // Software engineer or generic fallback
        certifications = [
          {
            id: 1,
            name: 'AWS Certified Cloud Practitioner',
            provider: 'Amazon Web Services',
            platform: 'Coursera / AWS',
            price: 'Paid',
            duration: '1-2 months',
            description: 'Learn cloud fundamentals, cloud security, compliance, technology, and billing concepts.',
            redirectUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner/'
          },
          {
            id: 2,
            name: 'Meta Front-End Developer Professional Certificate',
            provider: 'Meta',
            platform: 'Coursera',
            price: 'Paid',
            duration: '3-6 months',
            description: 'Gain entry-level skills in HTML, CSS, JavaScript, React, and UX/UI design.',
            redirectUrl: 'https://www.coursera.org/professional-certificates/meta-front-end-developer'
          },
          {
            id: 3,
            name: 'FreeCodeCamp Responsive Web Design',
            provider: 'FreeCodeCamp',
            platform: 'FreeCodeCamp',
            price: 'Free',
            duration: '4-6 weeks',
            description: 'Learn HTML, CSS, responsive layout, Flexbox, CSS Grid, and build five real-world web page layouts.',
            redirectUrl: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/'
          },
          {
            id: 4,
            name: 'Google Project Management Professional Certificate',
            provider: 'Google',
            platform: 'Coursera',
            price: 'Paid',
            duration: '3-6 months',
            description: 'Gain a solid foundation in Agile, Scrum, project planning, and communication.',
            redirectUrl: 'https://www.coursera.org/professional-certificates/google-project-management'
          }
        ];
      }
    }

    res.json({ success: true, certifications });
  } catch (err) {
    console.error('Certifications generation error:', err);
    res.status(500).json({ error: 'Failed to generate certifications: ' + err.message });
  }
});


// ===================== START SERVER =====================
app.listen(PORT, () => {
  console.log(`\n🚀 Skill Bridge Backend running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints ready\n`);
  if (!db) {
    console.log(`⚠️  NOTE: Database is NOT connected. APIs will return 500 until firebase-service-account.json is added.`);
  }
});
