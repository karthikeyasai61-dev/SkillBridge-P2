require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const fs = require('fs');

async function test() {
  // 1) Init Gemini
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // 2) Init Firebase
  const serviceAccount = JSON.parse(fs.readFileSync('./firebase-service-account.json', 'utf8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  // 3) Build prompt (same as server)
  const education = 'B.Tech CSE from JNTU 2022-2026';
  const skills = 'Python, HTML, CSS, JavaScript';
  const technicalKnowledge = 'DSA, Java Programming, Git basics';

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
  "recommendedRoles": ["<role1>", "<role2>"],
  "gapAnalysisReport": {
    "overallReadiness": "45",
    "summary": "summary here",
    "strengths": ["s1"],
    "weaknesses": ["w1"],
    "keyGaps": ["g1"]
  },
  "requiredSkills": [
    { "skill": "React", "category": "Technical", "importance": "Critical", "userHasIt": false, "description": "desc" }
  ],
  "requiredCertifications": [
    { "name": "AWS", "provider": "Amazon", "importance": "Recommended", "userHasIt": false }
  ],
  "recommendedCourses": [
    { "title": "React Complete Guide", "platform": "Udemy", "skill": "React", "level": "Beginner", "estimatedDuration": "4 weeks" }
  ],
  "learningRoadmap": [
    { "phase": 1, "title": "Foundations", "duration": "2 months", "items": ["Learn item"] }
  ],
  "jobMarketInsights": {
    "demandLevel": "High",
    "averageSalary": "5-8 LPA",
    "topCompanies": ["TCS", "Infosys"],
    "growthOutlook": "Strong"
  }
}`;

  try {
    console.log('Calling Gemini...');
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();
    console.log('Response length:', responseText.length);
    console.log('First 300 chars:', responseText.substring(0, 300));

    // Parse
    let analysis;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      console.log('\n✅ JSON parsed successfully!');
      console.log('Recommended roles:', analysis.recommendedRoles);
    } catch (parseErr) {
      console.error('❌ JSON parse failed:', parseErr.message);
      console.log('Raw response:', responseText);
      analysis = { rawResponse: responseText, parseError: true };
    }

    // Save to Firestore
    const profileData = {
      userId: 'test_user_diag',
      education, skills,
      certifications: '',
      technicalKnowledge,
      pastExperiences: '',
      interestedRole: '',
      knownSkillsForRole: '',
      analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
      analysis
    };

    console.log('\nSaving to Firestore...');
    await db.collection('profiles').doc('test_user_diag').set(profileData, { merge: true });
    console.log('✅ Firestore save successful!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

test();
