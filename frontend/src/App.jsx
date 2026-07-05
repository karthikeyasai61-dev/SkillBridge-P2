import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AIAssistant from './pages/AIAssistant';
import CareerSelection from './pages/CareerSelection';
import SkillsAssessment from './pages/SkillsAssessment';
import SkillTest from './pages/SkillTest';
import Roadmap from './pages/Roadmap';
import Courses from './pages/Courses';
import Certifications from './pages/Certifications';
import CourseDetail from './pages/CourseDetail';
import Projects from './pages/Projects';
import ResumeBuilder from './pages/ResumeBuilder';
import MockInterview from './pages/MockInterview';
import JobOpportunities from './pages/JobOpportunities';
import Internships from './pages/Internships';
import CareerTrainer from './pages/CareerTrainer';

function PrivateRoute({ user, sessionChecking, children }) {
  if (sessionChecking) return null; // Wait — don't redirect while checking
  if (!user) return <Navigate to="/login" />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [sessionChecking, setSessionChecking] = useState(true);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('analysisResult');
    localStorage.removeItem('recommendedRoles');
    localStorage.removeItem('onboardingCompleted');
  };

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await fetch(`${API_URL}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.status === 401) {
            handleLogout();
          } else {
            const data = await res.json();
            if (data.profile) {
              setUser(JSON.parse(storedUser));
            } else {
              handleLogout();
            }
          }
        } catch (e) {
          console.error("Session verification failed:", e);
          // Keep offline state if server is temporarily down
          try { setUser(JSON.parse(storedUser)); } catch {}
        }
      } else {
        handleLogout();
      }
      setSessionChecking(false);
    };
    checkSession();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — always show landing/login/signup, never auto-redirect while session is being checked */}
        <Route path="/" element={<Landing user={user} sessionChecking={sessionChecking} onLogin={handleLogin} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onLogin={handleLogin} />} />



        {/* Main app (needs auth + sidebar layout) */}
        <Route element={
          <PrivateRoute user={user} sessionChecking={sessionChecking}><Layout user={user} onLogout={handleLogout} /></PrivateRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/career-selection" element={<CareerSelection />} />
          <Route path="/skills-assessment" element={<SkillsAssessment />} />
          <Route path="/skill-test" element={<SkillTest />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/internships" element={<Internships />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/mock-interview" element={<MockInterview />} />
          <Route path="/job-opportunities" element={<JobOpportunities />} />
          <Route path="/career-trainer" element={<CareerTrainer />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} />} />
      </Routes>
    </BrowserRouter>
  );
}
