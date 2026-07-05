import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2';

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
        { name: 'Database Fundamentals', description: 'Relational vs non-relational databases' },
        { name: 'API Design', description: 'REST and GraphQL concepts' }
      ]
    },
    {
      category: 'Practical Application',
      skills: [
        { name: 'Debugging', description: 'Finding and fixing errors in code' },
        { name: 'Testing', description: 'Unit testing and integration testing' },
        { name: 'Deployment', description: 'Basic CI/CD and cloud platforms' },
        { name: 'Code Quality', description: 'Writing clean, readable code' }
      ]
    },
    {
      category: 'Specialization',
      skills: [
        { name: 'Frontend Basics', description: 'HTML, CSS, modern JS frameworks' },
        { name: 'Backend Basics', description: 'Server logic and databases' },
        { name: 'Security Awareness', description: 'Basic security practices' },
        { name: 'Performance Optimization', description: 'Improving load times and efficiency' }
      ]
    }
  ]
};

export default function SkillsAssessment() {
  const [skillCategories, setSkillCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Generating essential skills using AI.");
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setLoadingText("The AI is experiencing high traffic. Retrying securely in the background..."), 5000);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || localStorage.getItem('selectedRole') || 'Software Developer';

  const [assessed, setAssessed] = useState(() => {
    try {
      const stored = localStorage.getItem('assessedSkills');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (role) {
      localStorage.setItem('selectedRole', role);
    }
  }, [role]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/skills/for-role`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify({ role })
        });
        const data = await res.json();
        if (data.success && data.categories && data.categories.length > 0) {
          setSkillCategories(data.categories);
        } else {
          setSkillCategories(fallbackSkills.categories);
          setIsFallback(true);
        }
      } catch (err) {
        console.error('Failed to fetch skills:', err);
        setSkillCategories(fallbackSkills.categories);
        setIsFallback(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [role]);

  const toggle = (name, val) => {
    setAssessed((prev) => {
      const next = { ...prev, [name]: val };
      localStorage.setItem('assessedSkills', JSON.stringify(next));
      return next;
    });
  };

  const totalSkills = skillCategories.reduce((a, c) => a + (c.skills?.length || 0), 0) || 0;
  const answeredCount = Object.keys(assessed).length;
  const knownCount = Object.values(assessed).filter(Boolean).length;
  const knownSkillsList = Object.keys(assessed).filter(k => assessed[k]);

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ margin: '0 auto 20px', width: 40, height: 40, border: '4px solid rgba(255, 255, 255, 0.1)', borderTopColor: '#4361ee', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <h3>Analyzing the {role} role...</h3>
        <p style={{ color: 'var(--text-secondary)' }}>{loadingText}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Skills Self-Assessment for {role}</h2>
        <p>For each required skill below, indicate whether you currently know it or not. Be honest — this helps us create the best roadmap for you!</p>
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
          ⚠️ Offline / Local Mode: Showing standard {role} skills because the server or AI returned an error.
        </div>
      )}

      {/* Progress */}
      <div className="card" style={{ marginBottom: 24, padding: '16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Assessed: <strong style={{ color: 'var(--text-primary)' }}>{answeredCount}/{totalSkills}</strong>
            </span>
            <span style={{ margin: '0 16px', color: 'var(--border-color)' }}>|</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Known: <strong style={{ color: '#06d6a0' }}>{knownCount}</strong>
            </span>
            <span style={{ margin: '0 16px', color: 'var(--border-color)' }}>|</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              To Learn: <strong style={{ color: '#ef476f' }}>{answeredCount - knownCount}</strong>
            </span>
          </div>
          <div className="progress-bar-track" style={{ width: 200 }}>
            <div className="progress-bar-fill green" style={{ width: `${totalSkills > 0 ? (knownCount / totalSkills) * 100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      {skillCategories.map((cat, ci) => (
        <div key={ci} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>{cat.category}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {cat.skills?.map((skill) => {
              const val = assessed[skill.name];
              return (
                <div
                  key={skill.name}
                  className="card"
                  style={{
                    padding: '16px 20px',
                    borderColor: val === true ? '#06d6a0' : val === false ? '#ef476f' : undefined,
                    borderWidth: val !== undefined ? 2 : 1,
                    background: val === true ? 'rgba(6,214,160,0.04)' : val === false ? 'rgba(239,71,111,0.04)' : undefined,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 2 }}>{skill.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{skill.description}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className={`btn btn-sm ${val === true ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => toggle(skill.name, true)}
                      style={{ flex: 1 }}
                    >
                      <HiOutlineCheckCircle /> I Know This
                    </button>
                    <button
                      className={`btn btn-sm ${val === false ? 'btn-danger' : 'btn-secondary'}`}
                      onClick={() => toggle(skill.name, false)}
                      style={{ flex: 1 }}
                    >
                      <HiOutlineXCircle /> Not Yet
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {answeredCount > 0 && (
        <div style={{ textAlign: 'center', marginTop: 28 }} className="animate-fade-in-up">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/skill-test', { state: { role, knownSkills: knownSkillsList } })}>
            Proceed to Skill Evaluation Test →
          </button>
          <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            You can proceed at any time, but finishing the assessment gives us better context!
          </p>
        </div>
      )}
    </div>
  );
}
