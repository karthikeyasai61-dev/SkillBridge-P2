import { useState, useEffect } from 'react';
import { 
  HiOutlineAcademicCap, 
  HiOutlineLink, 
  HiOutlineBookmarkSquare,
  HiOutlineMagnifyingGlass
} from 'react-icons/hi2';

const defaultCertifications = [
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
    name: 'The Complete SQL Bootcamp: Go from Zero to Hero',
    provider: 'Jose Portilla',
    platform: 'Udemy',
    price: 'Paid',
    duration: '9 hours',
    description: 'Learn SQL, PostgreSQL, and database administration from scratch with practical exercises.',
    redirectUrl: 'https://www.udemy.com/course/the-complete-sql-bootcamp/'
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

const nptelCoursesByRole = {
  'data analyst': [
    { name: 'Introduction to Data Analytics', instructor: 'IIT Roorkee', duration: '8 weeks', url: 'https://nptel.ac.in/courses/110107090', desc: 'Covers data wrangling, visualization, and statistical analysis using Python and R.' },
    { name: 'Business Analytics & Data Mining', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/110105089', desc: 'Predictive modelling, classification, clustering and association rule mining.' },
    { name: 'Database Management System', instructor: 'IIT Madras', duration: '12 weeks', url: 'https://nptel.ac.in/courses/106106093', desc: 'SQL, ER diagrams, relational algebra and transaction management.' },
  ],
  'data scientist': [
    { name: 'Introduction to Machine Learning', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105152', desc: 'Supervised and unsupervised ML algorithms with hands-on Python.' },
    { name: 'Deep Learning', instructor: 'IIT Ropar', duration: '12 weeks', url: 'https://nptel.ac.in/courses/106102165', desc: 'CNNs, RNNs, transformers and deployment of deep neural networks.' },
    { name: 'Programming, Data Structures and Algorithms using Python', instructor: 'IIT Madras', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106106145', desc: 'Core Python programming, recursion, sorting and graph algorithms.' },
  ],
  'ai engineer': [
    { name: 'Deep Learning', instructor: 'IIT Ropar', duration: '12 weeks', url: 'https://nptel.ac.in/courses/106102165', desc: 'CNNs, RNNs, transformers and practical deep learning projects.' },
    { name: 'Introduction to Machine Learning', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105152', desc: 'Foundational ML algorithms essential for AI engineering.' },
    { name: 'Natural Language Processing', instructor: 'IIT Bombay', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106101009', desc: 'Text processing, language models, and NLP applications.' },
  ],
  'machine learning engineer': [
    { name: 'Introduction to Machine Learning', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105152', desc: 'Core ML algorithms, model evaluation and feature engineering.' },
    { name: 'Deep Learning', instructor: 'IIT Ropar', duration: '12 weeks', url: 'https://nptel.ac.in/courses/106102165', desc: 'Advanced neural network architectures and model deployment.' },
    { name: 'Programming, Data Structures and Algorithms using Python', instructor: 'IIT Madras', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106106145', desc: 'Python programming essentials for ML pipelines.' },
  ],
  'software engineer': [
    { name: 'Programming, Data Structures and Algorithms using Python', instructor: 'IIT Madras', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106106145', desc: 'Core programming, data structures, and algorithm design.' },
    { name: 'Software Engineering', instructor: 'IIT Kharagpur', duration: '12 weeks', url: 'https://nptel.ac.in/courses/106105088', desc: 'SDLC, design patterns, testing, and agile methodologies.' },
    { name: 'Database Management System', instructor: 'IIT Madras', duration: '12 weeks', url: 'https://nptel.ac.in/courses/106106093', desc: 'SQL, DBMS design and application-level database programming.' },
  ],
  'full stack developer': [
    { name: 'The Joy of Computing using Python', instructor: 'IIT Ropar', duration: '12 weeks', url: 'https://nptel.ac.in/courses/106106174', desc: 'Approachable introduction to Python for web and application development.' },
    { name: 'Database Management System', instructor: 'IIT Madras', duration: '12 weeks', url: 'https://nptel.ac.in/courses/106106093', desc: 'Backend database design, SQL querying and transaction management.' },
    { name: 'Software Engineering', instructor: 'IIT Kharagpur', duration: '12 weeks', url: 'https://nptel.ac.in/courses/106105088', desc: 'Agile, design patterns, DevOps basics for full-stack workflows.' },
  ],
  'frontend developer': [
    { name: 'The Joy of Computing using Python', instructor: 'IIT Ropar', duration: '12 weeks', url: 'https://nptel.ac.in/courses/106106174', desc: 'Creative computing and problem solving to strengthen logic skills.' },
    { name: 'Software Engineering', instructor: 'IIT Kharagpur', duration: '12 weeks', url: 'https://nptel.ac.in/courses/106105088', desc: 'Software design principles and testing useful for frontend engineers.' },
    { name: 'Human Computer Interaction', instructor: 'IIT Bombay', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106101088', desc: 'UX principles, usability testing and interaction design fundamentals.' },
  ],
  'backend developer': [
    { name: 'Database Management System', instructor: 'IIT Madras', duration: '12 weeks', url: 'https://nptel.ac.in/courses/106106093', desc: 'Relational databases, SQL and backend data management.' },
    { name: 'Cloud Computing', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105143', desc: 'Cloud architecture, virtualization and deployment essentials.' },
    { name: 'Programming, Data Structures and Algorithms using Python', instructor: 'IIT Madras', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106106145', desc: 'Core programming skills for building robust backend systems.' },
  ],
  'cloud engineer': [
    { name: 'Cloud Computing', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105143', desc: 'Virtualization, cloud service models (IaaS, PaaS, SaaS) and deployment.' },
    { name: 'Computer Networks and Internet Protocol', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105081', desc: 'Networking fundamentals critical for cloud infrastructure.' },
    { name: 'Introduction to Internet of Things', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105166', desc: 'IoT and cloud integration patterns for modern infrastructure.' },
  ],
  'cybersecurity analyst': [
    { name: 'Introduction to Cyber Security', instructor: 'IIT Kanpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106104065', desc: 'Cryptography, network security, vulnerabilities and ethical hacking basics.' },
    { name: 'Computer Networks and Internet Protocol', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105081', desc: 'Protocol-level understanding essential for threat analysis.' },
    { name: 'Cloud Computing', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105143', desc: 'Cloud security models and shared responsibility frameworks.' },
  ],
  'devops engineer': [
    { name: 'Cloud Computing', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105143', desc: 'Cloud platforms, automation and CI/CD pipeline fundamentals.' },
    { name: 'Software Engineering', instructor: 'IIT Kharagpur', duration: '12 weeks', url: 'https://nptel.ac.in/courses/106105088', desc: 'Agile, testing and DevOps methodologies.' },
    { name: 'Programming, Data Structures and Algorithms using Python', instructor: 'IIT Madras', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106106145', desc: 'Scripting and automation for DevOps workflows.' },
  ],
  'vlsi engineer': [
    { name: 'VLSI Design Flow: RTL to GDS', instructor: 'IIT Roorkee', duration: '12 weeks', url: 'https://nptel.ac.in/courses/108107119', desc: 'Complete digital VLSI design flow from RTL coding to GDSII.' },
    { name: 'Hardware Modelling using Verilog', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105165', desc: 'RTL design, simulation and synthesis using Verilog HDL.' },
    { name: 'Digital Circuits and Systems', instructor: 'IIT Madras', duration: '12 weeks', url: 'https://nptel.ac.in/courses/108106074', desc: 'Boolean algebra, combinational and sequential circuit design.' },
  ],
  'embedded systems engineer': [
    { name: 'Embedded Systems – Shape the World', instructor: 'IIT Bombay', duration: '12 weeks', url: 'https://nptel.ac.in/courses/108106090', desc: 'Microcontroller programming, real-time OS and peripheral interfacing.' },
    { name: 'Real-Time Operating System', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105139', desc: 'RTOS concepts, task scheduling and inter-process communication.' },
    { name: 'Hardware Modelling using Verilog', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105165', desc: 'Digital hardware modelling for embedded system design.' },
  ],
  'ev engineer': [
    { name: 'Electric Vehicles and Renewable Energy', instructor: 'IIT Kanpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/108104153', desc: 'EV technology, battery management systems and charging infrastructure.' },
    { name: 'Power Electronics', instructor: 'IIT Kharagpur', duration: '12 weeks', url: 'https://nptel.ac.in/courses/108105066', desc: 'Converters and inverters used in EV drivetrains.' },
    { name: 'Introduction to Smart Grid', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/108105046', desc: 'Smart grid integration with EV charging and energy storage.' },
  ],
  'structural engineer': [
    { name: 'Design of Steel Structures', instructor: 'IIT Kharagpur', duration: '12 weeks', url: 'https://nptel.ac.in/courses/105105116', desc: 'IS code-based design of steel beams, columns and connections.' },
    { name: 'Reinforced Concrete Design', instructor: 'IIT Roorkee', duration: '12 weeks', url: 'https://nptel.ac.in/courses/105107123', desc: 'Limit state design of RC slabs, beams, columns and footings.' },
    { name: 'Finite Element Method', instructor: 'IIT Madras', duration: '12 weeks', url: 'https://nptel.ac.in/courses/105106051', desc: 'FEM theory and application for structural analysis.' },
  ],
  'mechanical design engineer': [
    { name: 'Engineering Mechanics', instructor: 'IIT Kharagpur', duration: '12 weeks', url: 'https://nptel.ac.in/courses/112105124', desc: 'Statics, dynamics and mechanics of rigid bodies for design.' },
    { name: 'Machine Design', instructor: 'IIT Kharagpur', duration: '12 weeks', url: 'https://nptel.ac.in/courses/112105125', desc: 'Shafts, gears, bearings and fatigue design using IS and ASME standards.' },
    { name: 'Finite Element Method', instructor: 'IIT Madras', duration: '12 weeks', url: 'https://nptel.ac.in/courses/105106051', desc: 'Structural FEA applied to mechanical component design.' },
  ],
  'default': [
    { name: 'Programming, Data Structures and Algorithms using Python', instructor: 'IIT Madras', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106106145', desc: 'Core Python programming, data structures and algorithm design.' },
    { name: 'Introduction to Machine Learning', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105152', desc: 'ML fundamentals covering supervised, unsupervised and reinforcement learning.' },
    { name: 'Cloud Computing', instructor: 'IIT Kharagpur', duration: '8 weeks', url: 'https://nptel.ac.in/courses/106105143', desc: 'Cloud service models, virtualization and modern deployment strategies.' },
  ],
};

function getNptelCourses(role) {
  const key = (role || '').toLowerCase().trim();
  for (const k of Object.keys(nptelCoursesByRole)) {
    if (k !== 'default' && key.includes(k)) return nptelCoursesByRole[k];
  }
  return nptelCoursesByRole['default'];
}

export default function Certifications() {
  const [certificationsList, setCertificationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPrice, setFilterPrice] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole] = useState(() => localStorage.getItem('selectedRole') || 'Software Developer');
  const nptelCourses = getNptelCourses(selectedRole);

  useEffect(() => {
    const loadCertifications = async () => {
      const role = localStorage.getItem('selectedRole') || 'Software Developer';
      const cachedRole = localStorage.getItem('userCoursesRole');
      const storedCerts = localStorage.getItem('userCertifications');

      if (storedCerts && cachedRole === role) {
        try {
          const parsed = JSON.parse(storedCerts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCertificationsList(parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse cached certifications, clearing cache:", e);
          localStorage.removeItem('userCertifications');
        }
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/courses/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify({ role })
        });
        const data = await res.json();
        if (data.success && data.certifications && Array.isArray(data.certifications) && data.certifications.length > 0) {
          setCertificationsList(data.certifications);
          localStorage.setItem('userCertifications', JSON.stringify(data.certifications));
          localStorage.setItem('userCoursesRole', role);
        } else {
          setCertificationsList(defaultCertifications);
          localStorage.setItem('userCertifications', JSON.stringify(defaultCertifications));
          localStorage.setItem('userCoursesRole', role);
        }
      } catch (err) {
        console.error('Error fetching certifications:', err);
        setCertificationsList(defaultCertifications);
        localStorage.setItem('userCertifications', JSON.stringify(defaultCertifications));
        localStorage.setItem('userCoursesRole', role);
      } finally {
        setLoading(false);
      }
    };

    loadCertifications();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(67, 97, 238, 0.1)',
          borderTop: '4px solid #4361ee',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Generating industry-recognized certifications matching your profile...
        </p>
      </div>
    );
  }

  const listToFilter = Array.isArray(certificationsList) ? certificationsList : [];

  const filtered = listToFilter.filter(cert => {
    if (!cert) return false;
    const priceStr = cert.price || '';
    const nameStr = cert.name || '';
    const providerStr = cert.provider || '';
    const platformStr = cert.platform || '';

    const matchesPrice = 
      filterPrice === 'all' ||
      (filterPrice === 'free' && priceStr.toLowerCase() === 'free') ||
      (filterPrice === 'paid' && priceStr.toLowerCase() !== 'free');

    const matchesSearch = 
      nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      providerStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      platformStr.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPrice && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: 28 }}>
        <h2>Industry Certifications</h2>
        <p>Boost your career prospects by obtaining professional certifications from Coursera, Udemy, and leading free platforms.</p>
      </div>

      {/* Filters Toolbar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: 16, 
        marginBottom: 28, 
        flexWrap: 'wrap'
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <HiOutlineMagnifyingGlass style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            fontSize: '1.1rem'
          }} />
          <input 
            type="text" 
            placeholder="Search certifications, providers, or platforms..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              fontSize: '0.9rem',
              outline: 'none',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              transition: 'all 0.2s'
            }}
          />
        </div>

        {/* Price Filters */}
        <div style={{ display: 'flex', gap: 8, background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
          {['all', 'free', 'paid'].map((price) => (
            <button 
              key={price}
              onClick={() => setFilterPrice(price)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: filterPrice === price ? 'var(--color-primary)' : 'transparent',
                color: filterPrice === price ? '#fff' : 'var(--text-secondary)',
                boxShadow: filterPrice === price ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {price.charAt(0).toUpperCase() + price.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>No certifications found matching your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {filtered.map((cert, index) => {
            if (!cert) return null;
            const certId = cert.id || index;
            const isFree = cert.price?.toLowerCase() === 'free';
            return (
              <div 
                key={certId} 
                className="card animate-fade-in-up" 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '260px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Decorative Accent Ribbon */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: isFree ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #4361ee, #7209b7)'
                }}></div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className="badge-tag gray" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <HiOutlineBookmarkSquare style={{ fontSize: '0.9rem' }} /> {cert.platform || 'Online'}
                    </span>
                    <span className={`badge-tag ${isFree ? 'green' : 'blue'}`} style={{ fontWeight: 700 }}>
                      {cert.price || 'Free'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: 6, lineHeight: '1.4' }}>
                    {cert.name}
                  </h3>

                  <p style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500, marginBottom: 10 }}>
                    Offered by: <strong style={{ color: '#334155' }}>{cert.provider || 'Industry Leader'}</strong>
                  </p>

                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', marginBottom: 16 }}>
                    {cert.description}
                  </p>
                </div>

                <div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    fontSize: '0.8rem', 
                    color: '#94a3b8', 
                    paddingTop: 12,
                    borderTop: '1px solid #f1f5f9',
                    marginBottom: 14
                  }}>
                    <span>Duration: <strong>{cert.duration || 'Self-paced'}</strong></span>
                    <span style={{ color: isFree ? '#10b981' : '#4361ee', fontWeight: 600 }}>Official Certificate</span>
                  </div>

                  <a 
                    href={cert.redirectUrl || `https://www.google.com/search?q=${encodeURIComponent(cert.name || '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`btn ${isFree ? 'btn-secondary' : 'btn-primary'}`} 
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 6,
                      padding: '10px 0',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontWeight: 600
                    }}
                  >
                    <HiOutlineAcademicCap style={{ fontSize: '1.1rem' }} /> Learn on {cert.platform || 'Platform'} <HiOutlineLink />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NPTEL Section */}
      <div style={{ marginTop: 48 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
          borderBottom: '2px solid #f97316', paddingBottom: 10
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            color: 'white', fontWeight: 800, fontSize: '1rem',
            padding: '4px 12px', borderRadius: 8, letterSpacing: 1
          }}>NPTEL</div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Free NPTEL Courses for <span style={{ color: '#f97316' }}>{selectedRole}</span>
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
          🎓 IIT / IISc faculty-taught courses. Free to learn — paid exam for official certification.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {nptelCourses.map((course, i) => (
            <div key={i} className="card" style={{
              border: '1px solid rgba(249,115,22,0.25)',
              borderTop: '3px solid #f97316',
              position: 'relative', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{
                    background: 'rgba(249,115,22,0.1)', color: '#ea580c',
                    fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6
                  }}>NPTEL · IIT Faculty</span>
                  <span className="badge-tag green" style={{ fontWeight: 700 }}>Free Audit</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>
                  {course.name}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  By <strong>{course.instructor}</strong> · {course.duration}
                </p>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {course.desc}
                </p>
              </div>
              <a
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, padding: '10px 0', borderRadius: 10, textDecoration: 'none',
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  color: 'white', fontWeight: 700, fontSize: '0.88rem',
                  transition: 'opacity 0.2s'
                }}
              >
                <HiOutlineAcademicCap style={{ fontSize: '1.1rem' }} />
                Learn on NPTEL <HiOutlineLink />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
