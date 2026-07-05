import { useState, useEffect } from 'react';
import {
  HiOutlineBriefcase, HiOutlineMapPin, HiOutlineCurrencyDollar,
  HiOutlineClock, HiOutlineArrowTopRightOnSquare, HiOutlineBuildingOffice2,
  HiOutlineMagnifyingGlass, HiOutlineAcademicCap, HiOutlineSparkles,
} from 'react-icons/hi2';

const CACHE_KEY = 'aiGeneratedInternships';
const CACHE_ROLE_KEY = 'aiGeneratedInternshipsRole';

export default function Internships() {
  const selectedRole = localStorage.getItem('selectedRole') || 'Software Developer';
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const load = async () => {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedRole = localStorage.getItem(CACHE_ROLE_KEY);
      if (cached && cachedRole === selectedRole) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setInternships(parsed);
            setLoading(false);
            return;
          }
        } catch {}
      }
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/internships/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
          body: JSON.stringify({ role: selectedRole }),
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.internships) && data.internships.length > 0) {
          setInternships(data.internships);
          localStorage.setItem(CACHE_KEY, JSON.stringify(data.internships));
          localStorage.setItem(CACHE_ROLE_KEY, selectedRole);
        } else {
          setError(data.error || 'AI generation failed. Please try again.');
        }
      } catch (err) {
        setError('Could not connect to AI. Check if backend is running.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedRole]);

  const filtered = internships.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = i.title?.toLowerCase().includes(q) || i.company?.toLowerCase().includes(q) || i.location?.toLowerCase().includes(q);
    const matchType = filterType === 'all' || i.type?.toLowerCase() === filterType;
    return matchSearch && matchType;
  });

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: '4px solid rgba(67,97,238,0.1)', borderTop: '4px solid #4361ee', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
          ✨ AI is generating internship opportunities for <strong>{selectedRole}</strong>...
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 6 }}>This may take a few seconds</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: 28 }}>
        <h2>Internships</h2>
        <p>AI-generated internship opportunities for <strong>{selectedRole}</strong> from Indeed & LinkedIn.</p>
      </div>

      {/* AI Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)', width: 'fit-content' }}>
        <HiOutlineSparkles style={{ color: 'var(--color-primary)', fontSize: '1rem' }} />
        <span style={{ fontSize: '0.83rem', color: 'var(--color-primary)', fontWeight: 600 }}>AI-generated internships for <strong>{selectedRole}</strong></span>
        <button onClick={() => { localStorage.removeItem(CACHE_KEY); localStorage.removeItem(CACHE_ROLE_KEY); window.location.reload(); }}
          style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--color-primary)', background: 'none', border: '1px solid var(--color-primary)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontWeight: 600 }}>
          Refresh AI ↺
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,71,111,0.1)', border: '1px solid #ef476f', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#ef476f', fontSize: '0.88rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <HiOutlineMagnifyingGlass style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.1rem' }} />
          <input type="text" placeholder="Search by title, company or location..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 12px 10px 38px', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.9rem', outline: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)' }} />
        </div>
        <div style={{ display: 'flex', gap: 8, background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
          {['all', 'paid', 'unpaid'].map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              background: filterType === t ? 'var(--color-primary)' : 'transparent',
              color: filterType === t ? '#fff' : 'var(--text-secondary)',
              boxShadow: filterType === t ? '0 2px 8px rgba(0,0,0,0.2)' : 'none', transition: 'all 0.2s'
            }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card" style={{ marginBottom: 24, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length} internships</strong> for <strong style={{ color: 'var(--color-primary)' }}>{selectedRole}</strong>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge-tag green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2164f3', display: 'inline-block' }} /> Indeed
          </span>
          <span className="badge-tag blue" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0077b5', display: 'inline-block' }} /> LinkedIn
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No internships found matching your filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {filtered.map((job, idx) => {
            const isPaid = job.type === 'Paid';
            const matchColor = (job.match || 80) >= 90 ? '#06d6a0' : (job.match || 80) >= 80 ? '#4361ee' : '#f97316';
            const q = encodeURIComponent(job.searchQuery || job.title || '');
            const indeedUrl = `https://in.indeed.com/jobs?q=${q}&l=India`;
            const linkedinUrl = `https://www.linkedin.com/jobs/search/?keywords=${q}&location=India`;
            return (
              <div key={job.id || idx} className="card" style={{ borderLeft: `4px solid ${matchColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--color-primary)' }}>
                        <HiOutlineBuildingOffice2 />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{job.title}</h3>
                        <span style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{job.company}</span>
                      </div>
                      <span className={`badge-tag ${isPaid ? 'green' : 'orange'}`} style={{ fontWeight: 700 }}>{job.type}</span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{job.desc}</p>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiOutlineMapPin /> {job.location}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiOutlineCurrencyDollar /> {job.stipend}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiOutlineClock /> {job.duration}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><HiOutlineAcademicCap /> Internship</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                      {(job.skills || []).map((s, i) => <span key={i} className="badge-tag gray">{s}</span>)}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <a href={indeedUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.84rem', background: '#2164f3', color: '#fff' }}>
                        Apply on Indeed <HiOutlineArrowTopRightOnSquare />
                      </a>
                      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: '0.84rem', background: '#0077b5', color: '#fff' }}>
                        Apply on LinkedIn <HiOutlineArrowTopRightOnSquare />
                      </a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: `conic-gradient(${matchColor} ${(job.match || 80) * 3.6}deg, rgba(255, 255, 255, 0.06) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--bg-card, rgba(20, 20, 40, 0.95))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem', color: matchColor }}>
                        {job.match}%
                      </div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Match</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
