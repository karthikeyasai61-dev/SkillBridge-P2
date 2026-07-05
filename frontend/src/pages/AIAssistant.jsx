import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowPath, HiOutlinePaperAirplane } from 'react-icons/hi2';

const initialMessages = [
  {
    role: 'ai',
    text: "👋 Hello! I'm your AI Career Assistant. I can help you discover the right career path, identify skill gaps, and create a personalized learning roadmap.\n\nTry asking me things like:\n• What skills do I need to become a Data Analyst?\n• How do I start a career in Software Development?\n• What's the best way to learn Python?",
  },
];

const quickReplies = [
  'Skills for Data Analyst',
  'How to become a Full Stack Developer?',
  'Best Python learning resources',
  'Career roadmap for ML Engineer',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    
    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: text }),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.error || `HTTP error ${res.status}`);
      }

      const rawText = data.reply || "Sorry, I couldn't process that response.";
      
      // Parse RECOMMENDED_ROLES tag
      let cleanedText = rawText;
      let recommended = null;
      const rolesMatch = rawText.match(/\[RECOMMENDED_ROLES:\s*(\[[\s\S]*?\])\]/);
      if (rolesMatch) {
        try {
          recommended = JSON.parse(rolesMatch[1]);
          cleanedText = rawText.replace(/\[RECOMMENDED_ROLES:[\s\S]*?\]/, '').trim();
        } catch (e) {
          console.error('Failed to parse recommended roles:', e);
        }
      }

      const aiReply = {
        role: 'ai',
        text: cleanedText || "Sorry, I couldn't process that response.",
      };
      setMessages((prev) => [...prev, aiReply]);

      if (recommended && recommended.length > 0) {
        localStorage.setItem('recommendedRoles', JSON.stringify(recommended));
        setRecommendations(recommended);
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
      const errorReply = {
        role: 'ai',
        text: `⚠️ Error: ${err.message || 'Could not connect to the server.'} Please make sure you are logged in and the backend server is running.`,
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="chat-container">
        <div className="chat-messages" style={{ overflowY: 'auto', maxHeight: '55vh' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role === 'ai' ? 'ai' : 'user'}`}>
              <div className="chat-avatar">{msg.role === 'ai' ? 'AI' : 'ME'}</div>
              <div className="chat-bubble" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-message ai">
              <div className="chat-avatar">AI</div>
              <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                <HiOutlineArrowPath className="animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Quick Replies */}
        <div style={{ padding: '0 24px 8px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              className="btn btn-outline btn-sm"
              onClick={() => sendMessage(reply)}
              disabled={loading}
            >
              {reply}
            </button>
          ))}
        </div>

        <div className="chat-input-wrapper">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={loading ? "AI is thinking..." : "Ask me anything about your career..."}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            disabled={loading}
          />
          <button 
            className="chat-send-btn" 
            onClick={() => sendMessage(input)} 
            disabled={loading || !input.trim()}
          >
            <HiOutlinePaperAirplane />
          </button>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '460px',
            width: '90%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(67, 97, 238, 0.1)',
              color: '#4361ee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '2rem'
            }}>
              ✨
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              AI Path Recommendation
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              Based on our conversation, the AI recommends that you explore:
              <span style={{ fontSize: '1.2rem', color: '#4361ee', display: 'block', marginTop: '8px', fontWeight: 700 }}>
                {recommendations.join(', ')}
              </span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                onClick={() => {
                  setShowModal(false);
                  navigate('/career-selection');
                }}
              >
                Go to Career Selection
              </button>
              <button 
                className="btn btn-outline"
                style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                onClick={() => setShowModal(false)}
              >
                Continue Chatting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
