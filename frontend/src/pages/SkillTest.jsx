import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi2';

const difficultyColors = { Easy: '#06d6a0', Medium: '#ffd166', Hard: '#ef476f' };

const fallbackExam = {
  Easy: [
    { q: "Which of the following is NOT a fundamental programming data type?", options: ["Integer", "String", "HTML", "Boolean"], answer: 2 },
    { q: "What does Git use to track changes in a project?", options: ["Commits", "Emails", "Zipped files", "Excel sheets"], answer: 0 },
    { q: "Which HTTP status code represents a successful request?", options: ["404", "500", "200", "301"], answer: 2 },
    { q: "What is the main purpose of a database?", options: ["To compile code", "To store and manage data", "To style web pages", "To send emails"], answer: 1 },
    { q: "Which of the following is a key-value store database?", options: ["PostgreSQL", "Redis", "MySQL", "Oracle"], answer: 1 }
  ],
  Medium: [
    { q: "What is the difference between REST and GraphQL?", options: ["REST is only for frontend", "GraphQL allows fetching specific data fields in one request", "REST is always faster", "There is no difference"], answer: 1 },
    { q: "What does a 403 HTTP status code mean?", options: ["Not Found", "Internal Server Error", "Forbidden", "Unauthorized"], answer: 2 },
    { q: "Which of the following is a primary benefit of using a CDN?", options: ["Reduced server load and faster asset delivery", "Automatic code compiling", "Better database indexing", "Enhanced CSS styling"], answer: 0 },
    { q: "What is the purpose of unit testing?", options: ["To test the entire system at once", "To test individual components or functions in isolation", "To test user interface colors", "To test network speed"], answer: 1 },
    { q: "What does SQL stand for?", options: ["Simple Query Language", "Structured Query Language", "Sequential Query Language", "Standard Query Language"], answer: 1 }
  ],
  Hard: [
    { q: "Which of the following is a primary characteristic of a microservices architecture?", options: ["Single database for all services", "Tightly coupled components", "Independent deployability and loose coupling", "Monolithic codebase"], answer: 2 },
    { q: "What does the CAP theorem state?", options: ["Consistency, Availability, Partition tolerance cannot be achieved simultaneously", "All databases must use SQL", "Cloud applications are always secure", "HTML is superior to CSS"], answer: 0 },
    { q: "What is a SQL injection vulnerability?", options: ["An error in CSS styling", "A technique to crash the database server", "A security vulnerability allowing attackers to execute arbitrary SQL commands", "A way to optimize database queries"], answer: 2 },
    { q: "What is the role of a load balancer?", options: ["To store database backups", "To distribute incoming network traffic across multiple servers", "To compile Javascript code", "To style HTML elements"], answer: 1 },
    { q: "What is the main advantage of asymmetric encryption over symmetric encryption?", options: ["It is faster", "It uses the same key for encryption and decryption", "It does not require sharing a secret key beforehand", "It uses shorter keys"], answer: 2 }
  ]
};

export default function SkillTest() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role || 'Software Developer';
  const knownSkills = location.state?.knownSkills || [];

  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState(`Creating Easy, Medium, and Hard tests for ${role}.`);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setLoadingText("The AI is experiencing high traffic. Retrying securely in the background..."), 5000);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const [difficulty, setDifficulty] = useState('Easy');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [allAnswers, setAllAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/exam/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify({ role, knownSkills })
        });
        const data = await res.json();
        if (data.success && data.exam && data.exam.Easy && data.exam.Easy.length > 0) {
          setQuestions(data.exam);
        } else {
          setQuestions(fallbackExam);
          setIsFallback(true);
        }
      } catch (err) {
        console.error('Failed to fetch exam:', err);
        setQuestions(fallbackExam);
        setIsFallback(true);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [role]); // only refetch if role changes

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ margin: '0 auto 20px', width: 40, height: 40, border: '4px solid rgba(255, 255, 255, 0.1)', borderTopColor: '#ef476f', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <h3>Generating your Evaluation Exam...</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{loadingText}</p>
      </div>
    );
  }

  if (!questions || (!questions.Easy && !questions.Medium && !questions.Hard) || (questions.Easy?.length === 0 && questions.Medium?.length === 0 && questions.Hard?.length === 0)) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#ef476f', marginBottom: 12 }}>AI is currently busy 🤖</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>The AI failed to generate your exam due to high traffic limits. Please try again.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry Exam Generation</button>
      </div>
    );
  }

  const qList = questions[difficulty] || [];
  const question = qList[current];

  const handleNext = () => {
    const newAnswers = [...answers, { 
      q: question.q, 
      selected, 
      correct: question.answer, 
      difficulty 
    }];
    if (current + 1 < qList.length) {
      setAnswers(newAnswers);
      setCurrent(current + 1);
      setSelected(null);
    } else {
      setAnswers(newAnswers);
      setAllAnswers(prev => [...prev, ...newAnswers]);
      setFinished(true);
    }
  };

  const score = answers.filter((a) => a.selected === a.correct).length;

  const reset = (diff) => {
    setDifficulty(diff);
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
  };

  const handleFinishAll = () => {
    const finalAnswers = allAnswers.length > 0 ? allAnswers : answers;
    const finalCorrect = finalAnswers.filter(a => a.selected === a.correct).length;
    const finalTotal = finalAnswers.length;
    const finalPct = finalTotal > 0 ? Math.round((finalCorrect / finalTotal) * 100) : 0;

    // Save test results to completedTests
    let tests = [];
    try {
      const stored = localStorage.getItem('completedTests');
      if (stored) tests = JSON.parse(stored);
    } catch (e) {}
    tests.push({
      role,
      correct: finalCorrect,
      total: finalTotal,
      score: finalPct,
      date: Date.now()
    });
    localStorage.setItem('completedTests', JSON.stringify(tests));

    // Log recent activity
    let activities = [];
    try {
      const stored = localStorage.getItem('recentActivities');
      if (stored) activities = JSON.parse(stored);
    } catch (e) {}
    const newAct = {
      text: `Scored ${finalPct}% on ${role} Skill Assessment`,
      time: 'Just now',
      color: 'blue',
      timestamp: Date.now()
    };
    activities = [newAct, ...activities.filter(a => a.text !== newAct.text)];
    localStorage.setItem('recentActivities', JSON.stringify(activities.slice(0, 10)));

    // Save exam results so roadmap can load them on direct sidebar access
    localStorage.setItem('lastExamResults', JSON.stringify(finalAnswers));
    // Clear cached roadmap so new AI one is generated
    localStorage.removeItem(`roadmapStages_${role}`);

    navigate('/roadmap', { state: { role, examResults: finalAnswers } });
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Skill Evaluation Test: {role}</h2>
        <p>Test your proficiency with multi-level assessment questions based on your stated skills.</p>
      </div>

      {isFallback && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          color: '#d97706',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20,
          fontSize: '0.88rem',
          fontWeight: 500,
        }}>
          ⚠️ Offline / Local Mode: Showing default test questions because the server or AI returned an error.
        </div>
      )}

      {/* Difficulty Tabs */}
      <div className="tab-nav">
        {Object.keys(difficultyColors).map((d) => (
          <button key={d} className={`tab-btn ${difficulty === d && !finished ? 'active' : ''}`} onClick={() => reset(d)} disabled={loading || !questions[d] || questions[d].length === 0}>
            {d}
          </button>
        ))}
      </div>

      {!finished && qList.length > 0 ? (
        <div className="card" style={{ maxWidth: 700 }}>
          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge-tag" style={{ background: `${difficultyColors[difficulty]}18`, color: difficultyColors[difficulty] }}>
                {difficulty}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Question {current + 1} of {qList.length}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <HiOutlineClock /> No time limit
            </div>
          </div>

          <div className="progress-bar-track" style={{ marginBottom: 24 }}>
            <div className="progress-bar-fill" style={{ width: `${((current + 1) / qList.length) * 100}%` }}></div>
          </div>

          {/* Question */}
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 20, lineHeight: 1.5 }}>
            {question.q}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  padding: '14px 20px',
                  borderRadius: 10,
                  border: `2px solid ${selected === i ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  background: selected === i ? 'rgba(99, 102, 241, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  fontWeight: selected === i ? 600 : 400,
                  color: selected === i ? 'var(--text-white)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: '50%', marginRight: 12, fontSize: '0.78rem', fontWeight: 600,
                  background: selected === i ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.06)',
                  color: selected === i ? '#fff' : 'var(--text-secondary)',
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <button className="btn btn-primary" onClick={handleNext} disabled={selected === null}
              style={{ opacity: selected === null ? 0.5 : 1 }}>
              {current + 1 < qList.length ? 'Next Question →' : 'Submit Test'}
            </button>
          </div>
        </div>
      ) : finished ? (
        /* Results */
        <div className="card" style={{ maxWidth: 700, textAlign: 'center', padding: 40 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
            background: score >= qList.length * 0.7 ? 'rgba(6,214,160,0.12)' : 'rgba(255,209,102,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
          }}>
            {score >= qList.length * 0.7 ? '🎉' : '📚'}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
            {score >= qList.length * 0.7 ? 'Great Job!' : 'Keep Learning!'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            You scored <strong style={{ color: 'var(--color-primary)', fontSize: '1.2rem' }}>{score}/{qList.length}</strong> on the {difficulty} level test.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
            {answers.map((a, i) => (
              <div key={i} title={a.q} style={{
                width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: a.selected === a.correct ? 'rgba(6,214,160,0.15)' : 'rgba(239,71,111,0.1)',
                color: a.selected === a.correct ? '#06d6a0' : '#ef476f', fontWeight: 600, fontSize: '0.85rem',
              }}>
                {a.selected === a.correct ? <HiOutlineCheckCircle /> : '✗'}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => reset(difficulty)}>Retry {difficulty}</button>
            {difficulty !== 'Hard' && (
              <button className="btn btn-primary" onClick={() => reset(difficulty === 'Easy' ? 'Medium' : 'Hard')}>
                Try {difficulty === 'Easy' ? 'Medium' : 'Hard'} Level
              </button>
            )}
            <button className="btn btn-primary" style={{ background: '#7209b7', borderColor: '#7209b7' }} onClick={handleFinishAll}>
              Generate Final AI Roadmap →
            </button>
          </div>
        </div>
      ) : (
        <p>No questions generated for this difficulty.</p>
      )}
    </div>
  );
}
