import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StarBackground from '../components/StarBackground';

export default function Landing({ user, sessionChecking, onLogin }) {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const isLoggedIn = !sessionChecking && !!user;

  // login modal state
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
      const profileRes = await fetch(`${API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${data.token}` },
      });
      const profileData = await profileRes.json();
      navigate(profileData.profile?.analysis ? '/dashboard' : '/career-selection');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'transparent', fontFamily: "'Space Grotesk', sans-serif" }}>

      <StarBackground />

      {/* ── Navbar ── */}
      <nav style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 52px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        backdropFilter: 'blur(14px)',
        background: 'rgba(0,0,0,0.35)',
      }}>
        {/* Logo — Modern Romance for brand name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: 34, height: 34, borderRadius: 9, objectFit: 'cover' }} />
          <span style={{
            fontFamily: "'Modern Romance', serif",
            fontSize: '1.55rem', color: '#fff',
            letterSpacing: '0.5px',
            textShadow: '0 0 20px rgba(139,92,246,0.5)',
          }}>Skill Bridge</span>
        </div>

        {/* Nav buttons — Space Grotesk */}
        <div style={{ display: 'flex', gap: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
          <button onClick={() => navigate('/login')} style={{
            padding: '9px 24px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.85)',
            fontWeight: 500, fontSize: '0.88rem', cursor: 'pointer',
            backdropFilter: 'blur(8px)', transition: 'all 0.2s', letterSpacing: '0.3px',
          }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >Login</button>
          <button onClick={() => navigate('/signup')} style={{
            padding: '9px 24px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #4361ee, #7209b7)',
            color: '#fff', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
            boxShadow: '0 4px 22px rgba(67,97,238,0.42)', transition: 'all 0.2s', letterSpacing: '0.3px',
          }}
            onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 28px rgba(67,97,238,0.65)'}
            onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 22px rgba(67,97,238,0.42)'}
          >Get Started Free</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '80px 32px 0',
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0)' : 'translateY(28px)',
        transition: 'all 1s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Eyebrow badge — Space Grotesk mono-caps */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 50, padding: '6px 18px', marginBottom: 32,
          backdropFilter: 'blur(12px)',
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', display: 'inline-block', boxShadow: '0 0 8px #818cf8', animation: 'blink 2s ease-in-out infinite' }} />
          <span style={{ fontSize: '0.68rem', color: '#a5b4fc', fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase' }}>
            AI-Powered Career Intelligence
          </span>
        </div>

        {/* Main headline — Modern Romance (display) */}
        <h1 style={{
          fontFamily: "'Modern Romance', serif",
          fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          fontWeight: 'normal',
          lineHeight: 1.08,
          textAlign: 'center',
          color: '#fff',
          margin: '0 0 10px',
          letterSpacing: '1px',
          textShadow: '0 0 60px rgba(139,92,246,0.3), 0 0 120px rgba(67,97,238,0.15)',
          maxWidth: 820,
        }}>
          Bridge the Gap Between
        </h1>

        {/* Gradient accent line — Modern Romance */}
        <h1 style={{
          fontFamily: "'Modern Romance', serif",
          fontSize: 'clamp(3rem, 7vw, 5.5rem)',
          fontWeight: 'normal',
          lineHeight: 1.08,
          textAlign: 'center',
          margin: '0 0 28px',
          letterSpacing: '1px',
          background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 40%, #06d6a0 80%, #38bdf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 28px rgba(139,92,246,0.4))',
          maxWidth: 820,
        }}>
          Skills &amp; Industry
        </h1>

        {/* Subtitle — Space Grotesk, light weight */}
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(1rem, 2.2vw, 1.18rem)',
          fontWeight: 300,
          color: 'rgba(255,255,255,0.52)',
          maxWidth: 560,
          lineHeight: 1.8,
          textAlign: 'center',
          margin: '0 0 40px',
          letterSpacing: '0.3px',
        }}>
          Detect skill gaps with AI · Get a personalised roadmap<br />
          Find internships &amp; jobs · Build your career — <em style={{ color: 'rgba(165,180,252,0.75)', fontStyle: 'italic' }}>all in one place</em>
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48, fontFamily: "'Space Grotesk', sans-serif" }}>
          <button onClick={() => navigate('/login')} style={{
            padding: '15px 52px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color: '#fff', fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
            boxShadow: '0 8px 36px rgba(79,70,229,0.45)',
            transition: 'transform 0.2s, box-shadow 0.2s', letterSpacing: '0.5px',
          }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 14px 44px rgba(79,70,229,0.6)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(79,70,229,0.45)'; }}
          >Login</button>
          <button onClick={() => navigate('/signup')} style={{
            padding: '15px 42px', borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: '1rem', cursor: 'pointer',
            backdropFilter: 'blur(14px)', transition: 'all 0.2s', letterSpacing: '0.5px',
          }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >Sign Up</button>
        </div>
      </div>

      {/* ── Inline Login Modal ── */}
      {loginOpen && (
        <div onClick={() => setLoginOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.25s ease',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 420,
            background: 'rgba(15,15,30,0.92)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 20,
            padding: '40px 36px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.12)',
            fontFamily: "'Space Grotesk', sans-serif",
            animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
            position: 'relative',
          }}>
            {/* Close */}
            <button onClick={() => setLoginOpen(false)} style={{
              position: 'absolute', top: 16, right: 16,
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1,
              transition: 'color 0.2s',
            }}
              onMouseOver={e => e.currentTarget.style.color = '#fff'}
              onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >&times;</button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <img src="/logo.jpg" alt="Logo" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', marginBottom: 12 }} />
              <h2 style={{
                fontFamily: "'Modern Romance', serif",
                fontSize: '2rem', color: '#fff', margin: '0 0 6px',
                textShadow: '0 0 20px rgba(139,92,246,0.4)',
              }}>Welcome Back</h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', margin: 0 }}>Sign in to continue your journey</p>
            </div>

            {/* Error */}
            {loginError && (
              <div style={{
                background: 'rgba(239,71,111,0.12)', border: '1px solid rgba(239,71,111,0.3)',
                borderRadius: 10, padding: '10px 14px', marginBottom: 18,
                color: '#f87171', fontSize: '0.85rem', textAlign: 'center',
              }}>⚠️ {loginError}</div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '1px', textTransform: 'uppercase' }}>Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  style={{
                    width: '100%', padding: '12px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10, color: '#fff', fontSize: '0.95rem',
                    outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box',
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                  onFocus={e => e.target.style.border = '1px solid rgba(139,92,246,0.6)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6, letterSpacing: '1px', textTransform: 'uppercase' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password" required
                    style={{
                      width: '100%', padding: '12px 44px 12px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 10, color: '#fff', fontSize: '0.95rem',
                      outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box',
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                    onFocus={e => e.target.style.border = '1px solid rgba(139,92,246,0.6)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.12)'}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer', fontSize: '1rem', lineHeight: 1,
                  }}>{showPw ? '🙈' : '👁️'}</button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loginLoading} style={{
                marginTop: 8, padding: '13px', borderRadius: 12, border: 'none',
                background: loginLoading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#fff', fontWeight: 600, fontSize: '1rem', cursor: loginLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 28px rgba(79,70,229,0.4)', transition: 'all 0.2s',
                letterSpacing: '0.4px', fontFamily: "'Space Grotesk', sans-serif",
              }}
                onMouseOver={e => { if (!loginLoading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >{loginLoading ? 'Signing In...' : 'Sign In'}</button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
              Don't have an account?{' '}
              <span onClick={() => navigate('/signup')} style={{ color: '#a5b4fc', cursor: 'pointer', fontWeight: 600 }}>Sign up free</span>
            </p>
          </div>
        </div>
      )}

      {/* ── Thin horizontal divider line ── */}
      <div style={{
        position: 'absolute', bottom: 52, left: '50%',
        transform: 'translateX(-50%)', zIndex: 10,
        width: 280, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(6,214,160,0.3), transparent)',
      }} />

      {/* Bottom credit — Space Grotesk */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%',
        transform: 'translateX(-50%)', zIndex: 20,
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)',
        textAlign: 'center', pointerEvents: 'none', letterSpacing: '1.5px',
        textTransform: 'uppercase',
      }}>
        © 2026 Skill Bridge · AI-Powered Career Platform
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        @font-face {
          font-family: 'Modern Romance';
          src: url('/fonts/ModernRomance.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
