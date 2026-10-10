import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../services/api';
import {
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Timer
} from 'lucide-react';

const categories = [
  { key: 'ALL', name: 'Comprehensive Placement Assessment', desc: 'Mix of Java, Spring Boot, SQL, DBMS, and DSA' },
  { key: 'JAVA', name: 'Java & OOP Fundamentals', desc: 'Object-Oriented Programming, Memory, Collections' },
  { key: 'SPRING_BOOT', name: 'Spring Boot & Backend APIs', desc: 'REST architecture, JPA, Security, Dependency Injection' },
  { key: 'SQL', name: 'SQL & Database Engineering', desc: 'Relational design, Normalization, Queries, Indexing' },
  { key: 'DSA', name: 'Data Structures & Algorithms', desc: 'Arrays, Trees, Graphs, Complexity, Problem Solving' }
];

const SkillVerificationPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isTestActive, setIsTestActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Timer countdown
  useEffect(() => {
    let timer;
    if (isTestActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTestActive) {
      handleSubmitTest();
    }
    return () => clearInterval(timer);
  }, [isTestActive, timeLeft]);

  const handleStartTest = async () => {
    setLoading(true);
    try {
      const res = await assessmentApi.getQuestions(selectedCategory);
      setQuestions(res.data || []);
      setAnswers({});
      setCurrentIndex(0);
      setTimeLeft(900);
      setIsTestActive(true);
    } catch (err) {
      alert('Failed to load questions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option) => {
    const currentQ = questions[currentIndex];
    setAnswers({ ...answers, [currentQ.id]: option });
  };

  const handleSubmitTest = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await assessmentApi.submitAssessment({
        category: selectedCategory,
        timeTakenSeconds: 900 - timeLeft,
        answers: answers
      });
      navigate('/assessment-results', { state: { result: res.data } });
    } catch (err) {
      alert('Error submitting assessment: ' + err.message);
      setSubmitting(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Start Screen
  if (!isTestActive) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Skill Verification Assessment</h1>
          <p className="page-subtitle">
            Verify your technical competencies with standardized campus placement tests. Results directly update your verified skills.
          </p>
        </div>

        <div className="grid-2">
          {/* Category Chooser */}
          <div className="card">
            <div className="card-title">
              <Award size={20} color="#2563eb" />
              <span>Select Assessment Track</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {categories.map((cat) => (
                <div
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: selectedCategory === cat.key ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: selectedCategory === cat.key ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.96rem', color: selectedCategory === cat.key ? '#1e40af' : '#1e293b' }}>
                      {cat.name}
                    </strong>
                    {selectedCategory === cat.key && <CheckCircle2 size={18} color="#2563eb" />}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                    {cat.desc}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartTest}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              {loading ? 'Preparing Questions...' : 'Begin Assessment Test'} <ArrowRight size={18} />
            </button>
          </div>

          {/* Test Guidelines & Anti-cheating info */}
          <div className="card">
            <div className="card-title">
              <HelpCircle size={20} color="#7c3aed" />
              <span>Assessment Guidelines</span>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem', color: '#334155' }}>
              <li style={{ display: 'flex', gap: '10px' }}>
                <Clock size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Duration:</strong> 15 Minutes (900 seconds) countdown.
                </div>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <Award size={18} color="#10b981" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Format:</strong> 10 Multiple Choice Questions randomly drawn from the verified question bank.
                </div>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <CheckCircle2 size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Passing Score:</strong> 60% or higher updates your Career Twin verified proficiency score.
                </div>
              </li>
              <li style={{ display: 'flex', gap: '10px' }}>
                <AlertCircle size={18} color="#64748b" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Assessment Integrity:</strong> Browser focus tracking and randomized question presentation are active during test execution.
                </div>
              </li>
            </ul>

            <div style={{
              marginTop: '28px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.82rem',
              color: '#64748b'
            }}>
              After submission, you will receive question-by-question explanations, correct answers, and automated Career Twin recalibration.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Test Screen
  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div>
      {/* Top Test Header with Timer */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px 24px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span className="badge badge-primary">{selectedCategory}</span>
          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b', marginTop: '4px' }}>
            Question {currentIndex + 1} of {totalQ}
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: timeLeft < 180 ? '#fee2e2' : '#eff6ff',
          color: timeLeft < 180 ? '#991b1b' : '#1e40af',
          padding: '8px 16px',
          borderRadius: '8px',
          fontWeight: '700',
          fontSize: '1.1rem'
        }}>
          <Timer size={20} />
          <span>{formatTime(timeLeft)}</span>
        </div>

        <button
          onClick={handleSubmitTest}
          disabled={submitting}
          className="btn btn-primary"
          style={{ padding: '8px 18px' }}
        >
          <Send size={15} />
          {submitting ? 'Submitting...' : 'Submit Test'}
        </button>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* Main Question Card */}
        <div className="card">
          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>
            Topic: {currentQ?.skillName || currentQ?.category} &bull; Difficulty: {currentQ?.difficulty}
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', lineHeight: '1.5', marginBottom: '24px' }}>
            {currentQ?.questionText}
          </h2>

          {/* Options A, B, C, D */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {['A', 'B', 'C', 'D'].map((optKey) => {
              const optionText = currentQ?.[`option${optKey}`];
              const isSelected = answers[currentQ?.id] === optKey;
              return (
                <div
                  key={optKey}
                  onClick={() => handleSelectOption(optKey)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: isSelected ? '#2563eb' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.88rem'
                  }}>
                    {optKey}
                  </div>
                  <span style={{ fontSize: '0.94rem', color: '#1e293b', fontWeight: isSelected ? '600' : '400' }}>
                    {optionText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} /> Previous
            </button>

            {currentIndex < totalQ - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(totalQ - 1, prev + 1))}
                className="btn btn-primary"
              >
                Next Question <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmitTest}
                disabled={submitting}
                className="btn btn-primary"
                style={{ background: '#16a34a' }}
              >
                <Send size={16} /> Complete & Finish
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-title">
            <span>Questions Navigator</span>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>
            Answered: <strong>{answeredCount} / {totalQ}</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = currentIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    height: '40px',
                    borderRadius: '8px',
                    border: isCurrent ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: isAnswered ? '#2563eb' : '#f8fafc',
                    color: isAnswered ? '#ffffff' : '#334155',
                    fontWeight: '700',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '14px', fontSize: '0.78rem', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <div style={{ width: '12px', height: '12px', background: '#2563eb', borderRadius: '3px' }} />
              <span>Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '3px' }} />
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillVerificationPage;
