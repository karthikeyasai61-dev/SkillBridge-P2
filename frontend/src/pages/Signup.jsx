import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import { FcGoogle } from 'react-icons/fc';
import StarBackground from '../components/StarBackground';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function Signup({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      if (auth) {
        // Use Firebase Client Auth Google Provider
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: idToken }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google registration failed');
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
        
        const profileRes = await fetch(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const profileData = await profileRes.json();
        if (profileData.profile && profileData.profile.analysis) {
          navigate('/dashboard');
        } else {
          navigate('/career-selection');
        }
      } else {
        // Fallback Mock Google Login for development / review (if firebase.js config is incomplete)
        const mockEmail = prompt("Enter a Google email address to mock sign-up (e.g. user@gmail.com):", "testuser@gmail.com");
        if (!mockEmail) {
          setLoading(false);
          return;
        }
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: `mock_google_${mockEmail.split('@')[0]}` }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google registration failed');
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
        
        const profileRes = await fetch(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        const profileData = await profileRes.json();
        if (profileData.profile && profileData.profile.analysis) {
          navigate('/dashboard');
        } else {
          navigate('/career-selection');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Google Sign-In failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPw) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
      navigate('/career-selection');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <StarBackground />
      <div className="auth-container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="auth-left" style={{ background: 'linear-gradient(135deg, rgba(15,23,41,0.9) 0%, rgba(26,29,78,0.9) 50%, rgba(67,97,238,0.7) 100%)' }}>
          <div className="auth-brand">
            <div className="sidebar-logo-icon" style={{ width: 48, height: 48, fontSize: '1.4rem', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>SB</div>
            <h1 style={{ fontFamily: "'Modern Romance', serif", fontSize: '2.4rem', fontWeight: 'normal', color: '#fff', marginTop: '16px', letterSpacing: '0.5px' }}>Skill Bridge</h1>
            <p>AI-Powered Skill to Industry Gap Detector</p>
          </div>
          <div className="auth-features">
            <div className="auth-feature-item">
              <span className="auth-feature-icon">🎯</span>
              <div>
                <strong>Personalized Gap Analysis</strong>
                <p>AI analyzes your skills vs industry requirements</p>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">📚</span>
              <div>
                <strong>Custom Learning Roadmap</strong>
                <p>Step-by-step path from beginner to job-ready</p>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">💼</span>
              <div>
                <strong>Career Ready in Weeks</strong>
                <p>Resume builder, mock interviews & job matching</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-wrapper">
            <h2>Create Account</h2>
            <p>Start your journey to becoming job-ready</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label>Full Name</label>
                <div className="auth-input-wrapper">
                  <HiOutlineUser className="auth-input-icon" />
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma" required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Email Address</label>
                <div className="auth-input-wrapper">
                  <HiOutlineEnvelope className="auth-input-icon" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>Password</label>
                <div className="auth-input-wrapper">
                  <HiOutlineLockClosed className="auth-input-icon" />
                  <input
                    type={showPw ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters" required
                  />
                  <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label>Confirm Password</label>
                <div className="auth-input-wrapper">
                  <HiOutlineLockClosed className="auth-input-icon" />
                  <input
                    type={showPw ? 'text' : 'password'} value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Re-enter your password" required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: 'rgba(255,255,255,0.2)' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ padding: '0 10px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginBottom: '16px'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
            >
              <FcGoogle style={{ fontSize: '1.25rem' }} /> Continue with Google
            </button>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
