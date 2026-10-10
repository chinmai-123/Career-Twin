import React, { useEffect, useState } from 'react';
import { aiGuidanceApi } from '../services/api';
import {
  Bot,
  Sparkles,
  Send,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Briefcase,
  User,
  Copy,
  Check,
  ChevronRight
} from 'lucide-react';

const suggestedQuestions = [
  "How do I answer 'Tell me about yourself' in technical interviews?",
  "How should I explain my resume project using the STAR method?",
  "What are high-frequency SQL and database questions?",
  "Top Java & Spring Boot interview questions for freshers?",
  "What do TCS and campus recruiters look for in technical rounds?"
];

const AIGuidancePage = () => {
  const [guidance, setGuidance] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [activeAnswer, setActiveAnswer] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchInitialGuidance = async () => {
    try {
      const res = await aiGuidanceApi.getGuidance({});
      const data = res?.data || res;
      setGuidance(data);
    } catch (err) {
      console.error('Error fetching AI guidance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialGuidance();
  }, []);

  const handleAsk = async (questionToAsk) => {
    const q = questionToAsk || customPrompt;
    if (!q || !q.trim()) return;

    setAsking(true);
    setActiveQuestion(q.trim());
    setActiveAnswer(null);

    try {
      const res = await aiGuidanceApi.getGuidance({ customPrompt: q.trim() });
      const data = res?.data || res;
      setGuidance(data);
      if (data?.responseText) {
        setActiveAnswer(data.responseText);
      }
      setCustomPrompt('');
    } catch (err) {
      console.error('Error asking AI mentor:', err);
      setActiveAnswer("I encountered a connection issue while preparing your answer. Please ensure the backend is running and try again.");
    } finally {
      setAsking(false);
    }
  };

  const handleCopy = () => {
    if (!activeAnswer) return;
    navigator.clipboard.writeText(activeAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Consulting Google Gemini AI Career Guidance engine...</div>;
  }

  // Helper to format simple markdown-like text (headers, bold, bullets)
  const renderFormattedAnswer = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e3a8a', marginTop: '14px', marginBottom: '8px' }}>{trimmed.replace('### ', '')}</h3>;
      }
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return <strong key={idx} style={{ display: 'block', fontSize: '0.96rem', color: '#1e293b', marginTop: '10px', marginBottom: '4px' }}>{trimmed.replace(/\*\*/g, '')}</strong>;
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '4px', paddingLeft: '8px', fontSize: '0.92rem', color: '#334155' }}>
            <span style={{ color: '#2563eb' }}>•</span>
            <span>{trimmed.substring(2)}</span>
          </div>
        );
      }
      if (trimmed.startsWith('```')) {
        return null;
      }
      if (trimmed === '') {
        return <div key={idx} style={{ height: '8px' }} />;
      }
      return <p key={idx} style={{ fontSize: '0.92rem', color: '#334155', lineHeight: '1.6', marginBottom: '8px' }}>{line}</p>;
    });
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">AI Career Guidance & Mentor</h1>
          <p className="page-subtitle">
            Powered by Google Gemini AI &bull; Personalized Recruiter Coaching for <strong>{guidance?.targetRole}</strong>
          </p>
        </div>
        <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
          <Sparkles size={14} /> Gemini AI Mentor Active
        </span>
      </div>

      {/* Ask AI Mentor Interactive Bar */}
      <div className="card" style={{ marginBottom: '26px', borderTop: '4px solid #2563eb' }}>
        <div className="card-title" style={{ marginBottom: '14px' }}>
          <Bot size={20} color="#2563eb" />
          <span>Ask Your AI Placement Mentor</span>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAsk(); }} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Type any interview question, HR strategy, project explanation, or technical concept..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
          />
          <button
            type="submit"
            disabled={asking || !customPrompt.trim()}
            className="btn btn-primary"
            style={{ flexShrink: 0, padding: '10px 22px' }}
          >
            <Send size={16} />
            {asking ? 'Thinking...' : 'Ask AI Mentor'}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>
            Popular Placement Interview Questions:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { setCustomPrompt(q); handleAsk(q); }}
                disabled={asking}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  color: '#1e293b',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{q}</span>
                <ChevronRight size={12} color="#64748b" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Mentor Answer Box (Displayed when a question is asked) */}
      {(asking || activeAnswer) && (
        <div className="card" style={{
          marginBottom: '28px',
          background: '#ffffff',
          border: '2px solid #3b82f6',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)',
          animation: 'fadeIn 0.3s ease'
        }}>
          {/* Question Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '14px',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}>
                <User size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Your Question</div>
                <div style={{ fontSize: '0.98rem', fontWeight: '700', color: '#1e293b' }}>
                  "{activeQuestion}"
                </div>
              </div>
            </div>

            {activeAnswer && (
              <button
                onClick={handleCopy}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Answer'}
              </button>
            )}
          </div>

          {/* Answer Content */}
          {asking ? (
            <div style={{ padding: '24px 10px', textAlign: 'center', color: '#2563eb' }}>
              <Bot size={36} className="spin" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: '600' }}>AI Mentor is preparing your customized placement answer...</div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                Analyzing interview patterns, technical requirements, and communication frameworks.
              </p>
            </div>
          ) : (
            <div style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Bot size={18} color="#2563eb" />
                <span style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '0.9rem' }}>
                  AI Placement Mentor Response:
                </span>
                <span className="badge badge-low" style={{ fontSize: '0.72rem' }}>
                  Verified Best Practice
                </span>
              </div>
              <div style={{ lineHeight: '1.6' }}>
                {renderFormattedAnswer(activeAnswer)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recruiter-Style Evaluation Card */}
      <div className="card" style={{
        marginBottom: '26px',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '2px solid #93c5fd'
      }}>
        <div className="card-title" style={{ color: '#1e40af' }}>
          <Briefcase size={22} />
          <span>Campus Hiring Recruiter Evaluation</span>
        </div>
        <p style={{ fontSize: '0.96rem', color: '#1e3a8a', lineHeight: '1.6' }}>
          {guidance?.recruiterFeedback}
        </p>
      </div>

      {/* Mock Interview Questions & Model Answers */}
      <div className="card" style={{ marginBottom: '26px' }}>
        <div className="card-title">
          <HelpCircle size={20} color="#2563eb" />
          <span>High-Frequency Technical Interview Questions</span>
        </div>
        <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '18px' }}>
          Master these core conceptual questions frequently asked in technical rounds for <strong>{guidance?.targetRole}</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {guidance?.interviewQuestions && guidance.interviewQuestions.map((q, idx) => (
            <div
              key={idx}
              style={{
                padding: '18px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.98rem', color: '#1e293b' }}>
                  {idx + 1}. {q.question}
                </strong>
                <span className="badge badge-primary">{q.concept}</span>
              </div>
              <div style={{
                marginTop: '10px',
                padding: '12px 14px',
                background: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                fontSize: '0.86rem',
                color: '#334155',
                lineHeight: '1.5'
              }}>
                <strong style={{ color: '#16a34a' }}>Model Answer: </strong>
                {q.modelAnswer}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Week Roadmap Plan */}
      <div className="card" style={{ marginBottom: '26px' }}>
        <div className="card-title">
          <Calendar size={20} color="#7c3aed" />
          <span>AI 4-Week Placement Sprint Plan</span>
        </div>

        <div className="grid-2">
          {guidance?.weeklyPlan && guidance.weeklyPlan.map((w, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ color: '#2563eb', fontSize: '0.94rem' }}>{w.week}: {w.focusArea}</strong>
              </div>
              <ul style={{ listStyle: 'none', margin: '8px 0', fontSize: '0.84rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {w.topics && w.topics.map((t, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#2563eb" /> {t}
                  </li>
                ))}
              </ul>
              <div style={{ fontSize: '0.78rem', color: '#1e3a8a', background: '#eff6ff', padding: '6px 10px', borderRadius: '6px', marginTop: '8px' }}>
                <strong>Deliverable: </strong> {w.expectedOutput}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resume Tips & Key Topics */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            <Lightbulb size={20} color="#f59e0b" />
            <span>Recruiter Resume Advice</span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#334155' }}>
            {guidance?.resumeImprovementTips && guidance.resumeImprovementTips.map((tip, i) => (
              <li key={i} style={{ display: 'flex', gap: '8px', lineHeight: '1.4' }}>
                <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="card-title">
            <Sparkles size={20} color="#ec4899" />
            <span>High-Priority Technical Topics</span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#334155' }}>
            {guidance?.technicalTopicRecommendations && guidance.technicalTopicRecommendations.map((top, i) => (
              <li key={i} style={{ display: 'flex', gap: '8px', lineHeight: '1.4' }}>
                <CheckCircle2 size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{top}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIGuidancePage;
