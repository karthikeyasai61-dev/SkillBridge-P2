import { NavLink } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineChatBubbleLeftRight,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineClipboardDocumentCheck,
  HiOutlineMap,
  HiOutlineBookOpen,
  HiOutlineRocketLaunch,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineChartBarSquare,
  HiOutlineArrowRightOnRectangle,
  HiOutlineSparkles,
  HiOutlineTrophy,
  HiOutlineBookmarkSquare,
  HiOutlineNewspaper,
} from 'react-icons/hi2';

const navItems = [
  { section: 'Main' },
  { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { path: '/ai-assistant', icon: HiOutlineChatBubbleLeftRight, label: 'AI Assistant' },
  { section: 'Career' },
  { path: '/career-selection', icon: HiOutlineBriefcase, label: 'Career Selection' },
  { path: '/career-trainer', icon: HiOutlineTrophy, label: 'Career Trainer' },
  { path: '/skills-assessment', icon: HiOutlineAcademicCap, label: 'Skills Assessment' },
  { path: '/skill-test', icon: HiOutlineClipboardDocumentCheck, label: 'Skill Evaluation' },
  { section: 'Learning' },
  { path: '/roadmap', icon: HiOutlineMap, label: 'Learning Roadmap' },
  { path: '/courses', icon: HiOutlineBookOpen, label: 'Courses' },
  { path: '/certifications', icon: HiOutlineBookmarkSquare, label: 'Certifications' },
  { path: '/internships', icon: HiOutlineNewspaper, label: 'Internships' },
  { path: '/projects', icon: HiOutlineRocketLaunch, label: 'Mini Projects' },
  { section: 'Career Ready' },
  { path: '/resume-builder', icon: HiOutlineDocumentText, label: 'Resume Builder' },
  { path: '/mock-interview', icon: HiOutlineUserGroup, label: 'Mock Interview' },
  { path: '/job-opportunities', icon: HiOutlineChartBarSquare, label: 'Job Opportunities' },
];

export default function Sidebar({ user, onLogout, sidebarOpen, setSidebarOpen }) {
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'SB';

  return (
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/logo.jpg" alt="Logo" className="sidebar-logo-icon" style={{ padding: 0, objectFit: 'cover', width: '36px', height: '36px', borderRadius: '10px' }} />
        <div>
          <h2 style={{ fontFamily: "'Modern Romance', serif", fontSize: '1.45rem', fontWeight: 'normal', color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>Skill Bridge</h2>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Smart Platform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) =>
          item.section ? (
            <div key={i} className="sidebar-section-label" style={{ opacity: 0.5 }}>{item.section}</div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-link-icon"><item.icon /></span>
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-user" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderTop: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="sidebar-user-avatar" style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: '#fff', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0, 82, 255, 0.25)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>{initials}</div>
        <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
          <div className="sidebar-user-name" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Student'}</div>
          <div className="sidebar-user-role" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || ''}</div>
        </div>
        <button
          onClick={onLogout}
          title="Logout"
          style={{
            color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)',
            cursor: 'pointer', fontSize: '1.05rem', width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
          }}
        >
          <HiOutlineArrowRightOnRectangle />
        </button>
      </div>
    </aside>
  );
}
