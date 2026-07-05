import { useState, useEffect } from 'react';
import {
  HiOutlineMicrophone,
  HiOutlineCodeBracket,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUserGroup,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlinePlayCircle,
  HiOutlineLockClosed,
  HiOutlineServer,
  HiOutlineSpeakerWave,
  HiOutlineSparkles,
  HiOutlineArrowPath
} from 'react-icons/hi2';
import StarBackground from '../components/StarBackground';

const roundIcons = {
  technical: HiOutlineMicrophone,
  coding: HiOutlineCodeBracket,
  system_design: HiOutlineServer,
  communication: HiOutlineChatBubbleLeftRight,
  hr: HiOutlineUserGroup
};

const initialRounds = [
  {
    id: 'technical',
    title: 'Technical Round',
    icon: HiOutlineMicrophone,
    description: 'Answer domain-specific questions about database design, indexing, and SQL.',
    duration: '15 min',
    status: 'available',
    questions: 3,
  },
  {
    id: 'coding',
    title: 'Coding Round',
    icon: HiOutlineCodeBracket,
    description: 'Solve programming challenges and analyze algorithm complexities.',
    duration: '20 min',
    status: 'locked',
    questions: 3,
  },
  {
    id: 'system_design',
    title: 'System Design Round',
    icon: HiOutlineServer,
    description: 'Architect scalable web applications, databases, and microservices.',
    duration: '25 min',
    status: 'locked',
    questions: 3,
  },
  {
    id: 'communication',
    title: 'Communication Round',
    icon: HiOutlineChatBubbleLeftRight,
    description: 'Explain technical concepts clearly and practice behavioral communications.',
    duration: '15 min',
    status: 'locked',
    questions: 3,
    voice: true
  },
  {
    id: 'hr',
    title: 'HR Round',
    icon: HiOutlineUserGroup,
    description: 'Assess behavioral fit, company culture alignment, and aspirations.',
    duration: '15 min',
    status: 'locked',
    questions: 3,
    voice: true
  },
];

const roundQuestions = {
  technical: [
    { q: "What is database normalization and why is it important in database design?", type: "Database" },
    { q: "Explain the differences between SQL and NoSQL databases. When would you choose a NoSQL database?", type: "Databases" },
    { q: "What are database indexes, and how do they speed up query execution? Are there any disadvantages?", type: "Performance" }
  ],
  coding: [
    { q: "Write a function in Python that checks if a given string is a palindrome (reads the same forwards and backwards).", type: "Algorithms" },
    { q: "How does the binary search algorithm work, and what is its time complexity? What is the precondition for using it?", type: "Algorithms" },
    { q: "Explain the difference between a list and a tuple in Python. When would you prefer one over the other?", type: "Python Basics" }
  ],
  system_design: [
    { q: "How would you design a rate limiter for a public API to prevent abuse? What algorithms could you use?", type: "System Design" },
    { q: "What is a Content Delivery Network (CDN), and how does it help in scaling web applications?", type: "Infrastructure" },
    { q: "Explain the concept of database sharding. What are the key challenges associated with it?", type: "Scaling" }
  ],
  communication: [
    { q: "Imagine you need to explain a complex technical bug or latency issue to a non-technical marketing manager. How would you structure your explanation?", type: "Professional Communication" },
    { q: "Tell me about a time you had a strong disagreement with a teammate on an architectural choice. How did you handle it?", type: "Conflict Resolution" },
    { q: "How do you explain the concept of Machine Learning to a 10-year old using a simple analogy?", type: "Clear Presentation" }
  ],
  hr: [
    { q: "Why do you want to join our company and what value do you believe you can bring to our engineering team?", type: "Company Culture" },
    { q: "Where do you see yourself in 5 years, and how does this role fit into your long-term career aspirations?", type: "Career Plan" },
    { q: "Describe a time you failed or made a mistake on a project. What did you do to rectify it, and what did you learn?", type: "Self Reflection" }
  ]
};

const statusConfig = {
  completed: { badge: 'green', label: '✓ Completed', icon: HiOutlineCheckCircle },
  available: { badge: 'blue', label: 'Start Now', icon: HiOutlinePlayCircle },
  locked: { badge: 'gray', label: 'Locked', icon: HiOutlineLockClosed },
  failed: { badge: 'pink', label: '✗ Failed', icon: HiOutlineXCircle },
};

export default function MockInterview() {
  const [roundsList, setRoundsList] = useState(() => {
    try {
      const stored = localStorage.getItem('mockInterviewRounds5');
      return stored ? JSON.parse(stored) : initialRounds;
    } catch {
      return initialRounds;
    }
  });

  const [activeRound, setActiveRound] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [apiFeedback, setApiFeedback] = useState('');
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Track all QAs
  const [allQas, setAllQas] = useState(() => {
    try {
      const stored = localStorage.getItem('mockInterviewQas');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [masterReport, setMasterReport] = useState(() => {
    return localStorage.getItem('mockInterviewMasterReport') || '';
  });

  useEffect(() => {
    localStorage.setItem('mockInterviewRounds5', JSON.stringify(roundsList));
  }, [roundsList]);

  useEffect(() => {
    localStorage.setItem('mockInterviewQas', JSON.stringify(allQas));
  }, [allQas]);

  useEffect(() => {
    if (masterReport) {
      localStorage.setItem('mockInterviewMasterReport', masterReport);
    } else {
      localStorage.removeItem('mockInterviewMasterReport');
    }
  }, [masterReport]);

  // Speak question automatically in Communication and HR rounds
  useEffect(() => {
    if (activeRound && (activeRound.id === 'communication' || activeRound.id === 'hr')) {
      const questions = roundQuestions[activeRound.id];
      if (questions && questions[currentQ]) {
        speakQuestion(questions[currentQ].q, activeRound.id);
      }
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeRound, currentQ]);

  const speakQuestion = async (text, roundId) => {
    setIsSpeaking(true);
    try {
      const voiceId = roundId === 'hr' ? '21m00Tcm4TlvDq8ikWAM' : 'pNInz6obpgmA5QCifNaa';
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId })
      });
      const data = await res.clone().json().catch(() => null);
      if (data && data.useFallback) {
        throw new Error('ElevenLabs API fallback triggered');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        setIsSpeaking(false);
        speakWithBrowser(text, roundId);
      };
      await audio.play();
    } catch (err) {
      console.warn('ElevenLabs TTS failed, falling back to Web Speech API:', err);
      speakWithBrowser(text, roundId);
    }
  };

  const speakWithBrowser = (text, roundId) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      if (roundId === 'hr') {
        const femaleVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Zira') || v.name.toLowerCase().includes('female'));
        if (femaleVoice) utterance.voice = femaleVoice;
      } else {
        const maleVoice = voices.find(v => v.name.includes('David') || v.name.includes('Natural') || v.name.toLowerCase().includes('male'));
        if (maleVoice) utterance.voice = maleVoice;
      }
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Try Google Chrome or Microsoft Edge.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsRecording(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setUserAnswer(prev => prev + (prev ? " " : "") + transcript);
    };
    
    recognition.onerror = (event) => {
      console.error(event.error);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    window.recognitionInstance = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (window.recognitionInstance) {
      window.recognitionInstance.stop();
    }
    setIsRecording(false);
  };

  const startRound = (round) => {
    if (round.status === 'locked') return;
    setActiveRound(round);
    setCurrentQ(0);
    setUserAnswer('');
    setSubmitted(false);
    setApiFeedback('');
  };

  const submitAnswer = async () => {
    setLoadingFeedback(true);
    setSubmitted(true);
    const questions = roundQuestions[activeRound.id];
    const currentQuestionText = questions[currentQ].q;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/interview/analyze-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestionText,
          answer: userAnswer,
          round: activeRound.title
        })
      });
      const data = await res.json();
      setApiFeedback(data.feedback);
      
      // Save current QA response
      const updatedQas = { ...allQas };
      if (!updatedQas[activeRound.id]) {
        updatedQas[activeRound.id] = [];
      }
      updatedQas[activeRound.id][currentQ] = {
        question: currentQuestionText,
        answer: userAnswer,
        feedback: data.feedback
      };
      setAllQas(updatedQas);
    } catch (err) {
      console.error(err);
      setApiFeedback("Good response! Let's continue to the next question.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const nextQuestion = () => {
    const questions = roundQuestions[activeRound.id];
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
      setUserAnswer('');
      setSubmitted(false);
      setApiFeedback('');
    } else {
      // Complete current round and unlock next
      const currentIdx = roundsList.findIndex(r => r.id === activeRound.id);
      const updatedRounds = [...roundsList];
      let scoreVal = Math.floor(Math.random() * 15) + 85; // random base score
      
      if (currentIdx !== -1) {
        updatedRounds[currentIdx].status = 'completed';
        updatedRounds[currentIdx].score = scoreVal;
      }
      
      if (currentIdx + 1 < updatedRounds.length) {
        updatedRounds[currentIdx + 1].status = 'available';
      }
      
      setRoundsList(updatedRounds);
      setActiveRound(null);
    }
  };

  const generateMasterReport = async () => {
    setIsAnalyzing(true);
    try {
      const roundPayload = roundsList.map(round => {
        return {
          title: round.title,
          qas: allQas[round.id] || []
        };
      });

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/interview/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rounds: roundPayload })
      });
      const data = await res.json();
      setMasterReport(data.report);
    } catch (err) {
      console.error(err);
      setMasterReport("Failed to generate master report. Please check backend connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const restartInterview = () => {
    if (window.confirm("Are you sure you want to restart your mock interview simulation? This will clear current progress.")) {
      setRoundsList(initialRounds);
      setAllQas({});
      setMasterReport('');
      setActiveRound(null);
      setCurrentQ(0);
      setUserAnswer('');
      setSubmitted(false);
      setApiFeedback('');
    }
  };

  const allCompleted = roundsList.every(r => r.status === 'completed');

  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) {
        return <h4 key={i} style={{ color: 'var(--color-primary)', marginTop: '20px', marginBottom: '10px', fontSize: '1.15rem', fontWeight: 600 }}>{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={i} style={{ color: 'var(--color-primary)', marginTop: '24px', marginBottom: '12px', fontSize: '1.25rem', fontWeight: 600 }}>{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ') || line.startsWith('6. ')) {
        return <p key={i} style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '14px', marginBottom: '6px' }}>{line}</p>;
      }
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginLeft: '20px', marginBottom: '6px', listStyleType: 'disc' }}>{line.trim().replace(/^[\*\-]\s+/, '')}</li>;
      }
      if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />;
      
      const parts = line.split(/\*\*([^*]+)\*\*/g);
      return (
        <p key={i} style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
          {parts.map((part, idx) => idx % 2 === 1 ? <strong key={idx} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part}</strong> : part)}
        </p>
      );
    });
  };

  const activeQuestions = activeRound ? roundQuestions[activeRound.id] : [];

  return (
    <div className="animate-fade-in" style={{ position: 'relative', minHeight: '80vh' }}>
      <StarBackground />
      
      <div className="page-header" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Mock Interview Simulation</h2>
            <p>Complete all 5 rounds to unlock a comprehensive, AI-generated performance evaluation report.</p>
          </div>
          {(allCompleted || roundsList.some(r => r.status === 'completed')) && (
            <button className="btn btn-secondary btn-sm" onClick={restartInterview} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <HiOutlineArrowPath /> Restart Interview
            </button>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {isAnalyzing ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: 600, margin: '40px auto' }}>
            <div className="spinner" style={{ width: 60, height: 60, margin: '0 auto 24px', border: '4px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <HiOutlineSparkles style={{ color: 'var(--color-primary)', animation: 'pulse 1.5s infinite' }} /> Generating AI Performance Report
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Recruiting AI is analyzing your responses across all 5 mock interview rounds...</p>
          </div>
        ) : masterReport ? (
          <div className="card" style={{ maxWidth: 800, margin: '0 auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <HiOutlineSparkles style={{ color: '#ffb703' }} /> AI Interview Feedback Report
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setMasterReport('')}>
                Back to Rounds
              </button>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 24, borderRadius: 14, border: '1px solid var(--border-color)', marginBottom: 24 }}>
              {renderMarkdown(masterReport)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button className="btn btn-primary" onClick={() => window.print()}>
                Print / Save PDF
              </button>
              <button className="btn btn-secondary" onClick={restartInterview}>
                Start New Interview
              </button>
            </div>
          </div>
        ) : !activeRound ? (
          <>
            {/* Rounds List Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginBottom: 32 }}>
              {roundsList.map((round) => {
                const cfg = statusConfig[round.status];
                return (
                  <div
                    key={round.id}
                    className="card"
                    onClick={() => startRound(round)}
                    style={{
                      cursor: round.status !== 'locked' ? 'pointer' : 'default',
                      opacity: round.status === 'locked' ? 0.55 : 1,
                      textAlign: 'center',
                      padding: '28px 24px',
                      border: round.status === 'available' ? '1.5px dashed var(--color-primary)' : '1px solid var(--border-color)',
                      background: round.status === 'available' ? 'rgba(99, 102, 241, 0.03)' : 'var(--bg-card)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseOver={e => {
                      if (round.status !== 'locked') {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
                      }
                    }}
                    onMouseOut={e => {
                      if (round.status !== 'locked') {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{
                      width: 56, height: 56, borderRadius: 14,
                      background: round.status === 'completed' ? 'rgba(6,214,160,0.1)' : round.status === 'available' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 16px', fontSize: '1.5rem',
                      color: round.status === 'completed' ? '#06d6a0' : round.status === 'available' ? 'var(--color-primary)' : 'var(--text-muted)',
                    }}>
                      {(() => {
                        const RoundIcon = roundIcons[round.id] || HiOutlineMicrophone;
                        return <RoundIcon />;
                      })()}
                    </div>
                    <h3 style={{ fontSize: '1.02rem', fontWeight: 600, marginBottom: 6 }}>{round.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12, minHeight: 40 }}>{round.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
                      <span className="badge-tag gray">{round.questions} questions</span>
                      <span className="badge-tag gray">{round.duration}</span>
                    </div>
                    {round.score && (
                      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#06d6a0', marginBottom: 8 }}>{round.score}%</div>
                    )}
                    {round.voice && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: 500, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <HiOutlineSpeakerWave /> TTS Voice Enabled
                      </div>
                    )}
                    <span className={`badge-tag ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Master Report Trigger Section */}
            {allCompleted && (
              <div className="card animate-pulse" style={{ background: 'rgba(99, 102, 241, 0.08)', borderColor: 'var(--color-primary)', textAlign: 'center', padding: '36px 24px', marginBottom: 32 }}>
                <HiOutlineSparkles style={{ fontSize: '2.5rem', color: '#ffb703', marginBottom: 14 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>All 5 Rounds Completed!</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 500, margin: '0 auto 20px' }}>
                  Great work! You have finished all rounds of the mock interview simulation. Unlock your master AI performance evaluation report now.
                </p>
                <button className="btn btn-primary btn-lg" onClick={generateMasterReport} style={{ padding: '12px 32px' }}>
                  Generate Master AI Report
                </button>
              </div>
            )}

            {/* Tips Section */}
            <div className="card" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="card-title" style={{ marginBottom: 12 }}>💡 Mock Interview Tips</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {[
                  { tip: 'Enable your mic to dictate answers in standard rounds for a realistic speaking experience.' },
                  { tip: 'For Communication & HR rounds, listen carefully to the simulated AI voice speaking the questions.' },
                  { tip: 'Submit your answer to get instant AI-generated feedback before heading to the next question.' },
                  { tip: 'Complete all rounds in order to generate the master feedback report.' },
                ].map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: 700, flexShrink: 0 }}>•</span>
                    {t.tip}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Active Interview Screen */
          <div className="card" style={{ maxWidth: 700, margin: '0 auto', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 600 }}>{activeRound.title}</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Question {currentQ + 1} of {activeQuestions.length}
                </span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveRound(null)}>Exit Round</button>
            </div>

            <div className="progress-bar-track" style={{ marginBottom: 24 }}>
              <div className="progress-bar-fill" style={{ width: `${((currentQ + 1) / activeQuestions.length) * 100}%` }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className={`badge-tag blue`}>
                {activeQuestions[currentQ]?.type}
              </span>
              {activeRound.voice && (
                <button
                  onClick={() => speakQuestion(activeQuestions[currentQ].q, activeRound.id)}
                  style={{
                    border: 'none', color: isSpeaking ? 'var(--color-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', padding: '4px 8px',
                    borderRadius: 8, background: 'rgba(255,255,255,0.03)'
                  }}
                >
                  <HiOutlineSpeakerWave style={{ animation: isSpeaking ? 'pulse 1s infinite' : 'none' }} />
                  {isSpeaking ? 'Speaking...' : 'Listen Question'}
                </button>
              )}
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20, lineHeight: 1.6 }}>
              {activeQuestions[currentQ]?.q}
            </h3>

            {/* Dictation Controller */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              {isRecording ? (
                <button className="btn btn-secondary btn-sm" onClick={stopRecording} style={{ background: 'rgba(239, 71, 111, 0.1)', color: '#ef476f', border: '1px solid rgba(239, 71, 111, 0.2)' }}>
                  🔴 Stop Dictation
                </button>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={startRecording} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  🎤 Start Voice Dictation
                </button>
              )}
            </div>

            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={6}
              disabled={submitted}
              placeholder="Type your answer here, or click 'Start Voice Dictation' to speak..."
              style={{
                width: '100%', padding: '14px', borderRadius: 10, background: 'var(--bg-input)', border: '1px solid var(--border-color)', fontSize: '0.88rem',
                color: 'var(--text-primary)', resize: 'vertical', marginBottom: 16,
              }}
            />

            {submitted && (
              <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid var(--border-color)', marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <HiOutlineSparkles /> Instant AI Feedback
                </div>
                {loadingFeedback ? (
                  <div className="spinner" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.05)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {apiFeedback}
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {!submitted ? (
                <button className="btn btn-primary" onClick={submitAnswer} disabled={!userAnswer.trim()} style={{ opacity: !userAnswer.trim() ? 0.5 : 1 }}>
                  Submit Answer
                </button>
              ) : (
                <button className="btn btn-primary" onClick={nextQuestion} disabled={loadingFeedback}>
                  {currentQ + 1 < activeQuestions.length ? 'Next Question →' : 'Finish Round'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
