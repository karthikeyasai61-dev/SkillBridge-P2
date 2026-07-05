import { useLocation } from 'react-router-dom';
import { HiOutlineBell, HiOutlineMagnifyingGlass, HiOutlineBars3 } from 'react-icons/hi2';

const pageTitles = {
  '/': { title: 'Dashboard', sub: 'Welcome back, John! Here\'s your learning progress.' },
  '/ai-assistant': { title: 'AI Assistant', sub: 'Ask me anything about your career path.' },
  '/career-selection': { title: 'Career Selection', sub: 'Choose your dream career role.' },
  '/skills-assessment': { title: 'Skills Assessment', sub: 'Evaluate your current skill level.' },
  '/skill-test': { title: 'Skill Evaluation Test', sub: 'Test your knowledge with multi-level questions.' },
  '/roadmap': { title: 'Learning Roadmap', sub: 'Your personalized path to success.' },
  '/courses': { title: 'Courses', sub: 'Learn new skills with curated courses.' },
  '/certifications': { title: 'Certifications', sub: 'Target professional industry certifications to validate your knowledge.' },
  '/projects': { title: 'Mini Projects', sub: 'Apply your skills with real-world projects.' },
  '/resume-builder': { title: 'Resume Builder', sub: 'Build a professional resume with your achievements.' },
  '/mock-interview': { title: 'Mock Interview', sub: 'Practice for your dream job interview.' },
  '/job-opportunities': { title: 'Job Opportunities', sub: 'Discover jobs matching your skills.' },
};

export default function Topbar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const page = pageTitles[location.pathname] || { title: 'Skill Bridge', sub: '' };

  return (
    <header className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', background: 'rgba(7, 9, 19, 0.45)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button 
          className="topbar-icon-btn hamburger-btn" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <HiOutlineBars3 />
        </button>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            {page.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '1px' }}>{page.sub}</p>
        </div>
      </div>
      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button className="topbar-icon-btn" style={{ color: 'var(--text-secondary)', width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HiOutlineMagnifyingGlass />
        </button>
        <button className="topbar-icon-btn" style={{ color: 'var(--text-secondary)', position: 'relative', width: '40px', height: '40px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HiOutlineBell />
          <span className="badge" style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', boxShadow: '0 0 10px var(--color-primary)' }}></span>
        </button>
      </div>
    </header>
  );
}
