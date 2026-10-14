import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assessmentApi, careerGoalApi, careerTwinApi } from '../services/api';
import {
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Timer,
  Code2,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  BookOpen
} from 'lucide-react';

const mcqCategories = [
  { key: 'ALL', name: 'Comprehensive Placement Assessment', desc: 'Mix of Java, Spring Boot, SQL, DBMS, and DSA', role: 'ALL' },
  { key: 'JAVA', name: 'Java & OOP Fundamentals', desc: 'Object-Oriented Programming, Memory, Collections', role: 'Backend Developer' },
  { key: 'SPRING_BOOT', name: 'Spring Boot & Backend APIs', desc: 'REST architecture, JPA, Security, Dependency Injection', role: 'Backend Developer' },
  { key: 'SQL', name: 'SQL & Database Engineering', desc: 'Relational design, Normalization, Queries, Indexing', role: 'Backend / Data Engineer' },
  { key: 'DSA', name: 'Data Structures & Algorithms', desc: 'Arrays, Trees, Graphs, Complexity, Problem Solving', role: 'Software Engineer' }
];

const codingCategories = ['ALL', 'DSA', 'BACKEND', 'SQL', 'FRONTEND'];

const SkillVerificationPage = ({ defaultTab }) => {
  const location = useLocation();
  const initialTab = defaultTab || (location.pathname.includes('coding') ? 'CODING' : 'MCQ');

  // Main Tab: 'MCQ' or 'CODING'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Student Goal
  const [targetRole, setTargetRole] = useState('Backend Developer');

  // MCQ State
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMcqDifficulty, setSelectedMcqDifficulty] = useState('ADAPTIVE');
  const [isTestActive, setIsTestActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Coding State
  const [codingChallenges, setCodingChallenges] = useState([]);
  const [selectedCodingCat, setSelectedCodingCat] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [userLevel, setUserLevel] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [userCode, setUserCode] = useState('');
  const [runningCode, setRunningCode] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [codingLoading, setCodingLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (location.pathname.includes('coding')) {
      setActiveTab('CODING');
    }
  }, [defaultTab, location.pathname]);

  // Load Goal, User Level & Coding Challenges
  useEffect(() => {
    careerGoalApi.getGoal().then(res => {
      if (res.data?.targetRole) {
        setTargetRole(res.data.targetRole);
      }
    }).catch(() => {});

    loadUserLevel();
    loadCodingChallenges('ALL', 'ALL');
  }, []);

  const loadUserLevel = async () => {
    try {
      const res = await assessmentApi.getUserLevel();
      setUserLevel(res.data);
    } catch (err) {
      console.warn('Failed to load user solving level:', err);
    }
  };

  const loadCodingChallenges = async (cat = selectedCodingCat, diff = selectedDifficulty) => {
    setCodingLoading(true);
    try {
      const res = await assessmentApi.getCodingChallenges(cat === 'ALL' ? '' : cat, diff === 'ALL' ? '' : diff);
      const data = res.data || [];
      setCodingChallenges(data);
      if (data.length > 0) {
        const stillPresent = data.find(c => c.id === activeChallenge?.id);
        selectChallenge(stillPresent || data[0]);
      } else {
        setActiveChallenge(null);
      }
    } catch (err) {
      console.error('Failed to load coding challenges:', err);
    } finally {
      setCodingLoading(false);
    }
  };

  const selectChallenge = (c) => {
    setActiveChallenge(c);
    const lang = c.starterCode?.java ? 'java' : Object.keys(c.starterCode || {})[0] || 'javascript';
    setSelectedLanguage(lang);
    setUserCode(c.starterCode?.[lang] || '');
    setExecutionResult(null);
  };

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    if (activeChallenge?.starterCode?.[lang]) {
      setUserCode(activeChallenge.starterCode[lang]);
    }
  };

  // Run Code
  const handleRunCode = async () => {
    if (!activeChallenge || !userCode.trim()) return;
    setRunningCode(true);
    try {
      const res = await assessmentApi.runCoding({
        challengeId: activeChallenge.id,
        language: selectedLanguage,
        code: userCode
      });
      setExecutionResult(res.data);
    } catch (err) {
      alert('Error running code: ' + (err.message || 'Execution failed'));
    } finally {
      setRunningCode(false);
    }
  };

  // Submit Code
  const handleSubmitCode = async () => {
    if (!activeChallenge || !userCode.trim()) return;
    setSubmittingCode(true);
    try {
      const res = await assessmentApi.submitCoding({
        challengeId: activeChallenge.id,
        language: selectedLanguage,
        code: userCode
      });
      setExecutionResult(res.data);
      await careerTwinApi.recalculate();
      await loadUserLevel();
      loadCodingChallenges(selectedCodingCat, selectedDifficulty);
      alert(`Submission ${res.data.passed ? 'PASSED! 🎉' : 'Needs Work'} Score: ${Math.round(res.data.scorePercentage)}%. Career Twin verified skills & solving level updated!`);
    } catch (err) {
      alert('Error submitting code: ' + (err.message || 'Submission failed'));
    } finally {
      setSubmittingCode(false);
    }
  };

  // Timer countdown for MCQ
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
      const diffParam = selectedMcqDifficulty === 'ADAPTIVE' ? '' : selectedMcqDifficulty;
      const res = await assessmentApi.getQuestions(selectedCategory, diffParam);
      setQuestions(res.data || []);
      setAnswers({});
      setCurrentIndex(0);
      setTimeLeft(600); // 10 mins
      setIsTestActive(true);
    } catch (err) {
      alert('Failed to load questions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionKey) => {
    const currentQ = questions[currentIndex];
    setAnswers({ ...answers, [currentQ.id]: optionKey });
  };

  const handleSubmitTest = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await assessmentApi.submitAssessment({
        category: selectedCategory,
        timeTakenSeconds: 600 - timeLeft,
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

  // MCQ Active Test Screen
  if (isTestActive && activeTab === 'MCQ') {
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
  }

  // Main Dashboard / Assessment Hub Screen
  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Skill Verification Hub</h1>
          <p className="page-subtitle">
            Prove your competency with standardized campus placement tests & live interactive coding assessments.
          </p>
        </div>

        {/* Tab Toggle: MCQ vs Coding Assessments */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid #cbd5e1'
        }}>
          <button
            onClick={() => setActiveTab('MCQ')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'MCQ' ? '#ffffff' : 'transparent',
              color: activeTab === 'MCQ' ? '#1e293b' : '#64748b',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'MCQ' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <BookOpen size={16} color={activeTab === 'MCQ' ? '#2563eb' : '#64748b'} />
            MCQ Exams
          </button>

          <button
            onClick={() => setActiveTab('CODING')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'CODING' ? '#ffffff' : 'transparent',
              color: activeTab === 'CODING' ? '#1e293b' : '#64748b',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'CODING' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Code2 size={16} color={activeTab === 'CODING' ? '#2563eb' : '#64748b'} />
            Coding Assessments
          </button>
        </div>
      </div>

      {/* Adaptive Solving Level Progression Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: '12px',
        padding: '18px 22px',
        marginBottom: '20px',
        color: '#ffffff',
        border: '1px solid #334155',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={24} color="#60a5fa" />
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
                {userLevel?.levelTitle || 'Level 1: Foundational Coder'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                Adaptive Engine • Solved questions calibrate upcoming challenge difficulty
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{
              background: userLevel?.currentLevel === 'ADVANCED' ? '#581c87' : userLevel?.currentLevel === 'INTERMEDIATE' ? '#1e3a8a' : '#14532d',
              color: userLevel?.currentLevel === 'ADVANCED' ? '#e9d5ff' : userLevel?.currentLevel === 'INTERMEDIATE' ? '#bfdbfe' : '#bbf7d0',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '0.78rem',
              border: '1px solid rgba(255,255,255,0.15)'
            }}>
              Tier: {userLevel?.currentLevel || 'BEGINNER'}
            </span>

            <span style={{
              background: '#4338ca',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: '700',
              fontSize: '0.78rem'
            }}>
              🎯 Recommended: {userLevel?.recommendedDifficulty || 'EASY'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #334155',
          fontSize: '0.82rem'
        }}>
          <div>
            <span style={{ color: '#94a3b8' }}>Solve Rate:</span>{' '}
            <strong style={{ color: '#38bdf8' }}>{userLevel?.solveRatePercentage || 0}%</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Avg Score:</span>{' '}
            <strong style={{ color: '#4ade80' }}>{userLevel?.averageScorePercentage || 0}%</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Solved Total:</span>{' '}
            <strong style={{ color: '#facc15' }}>{userLevel?.totalSolved || 0} / {userLevel?.totalAttempted || 0}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Solved Tiers:</span>{' '}
            <strong style={{ color: '#cbd5e1' }}>
              {userLevel?.easySolvedCount || 0}E • {userLevel?.mediumSolvedCount || 0}M • {userLevel?.hardSolvedCount || 0}H
            </strong>
          </div>
        </div>

        {/* Next Tier Progression Notice */}
        <div style={{
          marginTop: '12px',
          fontSize: '0.8rem',
          color: '#cbd5e1',
          background: 'rgba(255,255,255,0.06)',
          padding: '8px 12px',
          borderRadius: '6px'
        }}>
          💡 <strong>Progression Target:</strong> {userLevel?.nextTierDescription || 'Complete challenges to unlock higher difficulty tiers.'}
        </div>
      </div>

      {/* Target Role Guidance Banner */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '10px',
        padding: '12px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.88rem',
        color: '#1e40af'
      }}>
        <Sparkles size={18} color="#2563eb" style={{ flexShrink: 0 }} />
        <span>
          Calibrated for your target role: <strong>{targetRole}</strong>. Completing assessments here directly updates your placement readiness gauge!
        </span>
      </div>

      {/* ==================================================== */}
      {/* VIEW 1: MCQ TECHNICAL EXAMS                          */}
      {/* ==================================================== */}
      {activeTab === 'MCQ' && (
        <div className="grid-2">
          {/* Category Chooser */}
          <div className="card">
            <div className="card-title">
              <Award size={20} color="#2563eb" />
              <span>Select MCQ Assessment Track</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {mcqCategories.map((cat) => (
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

            {/* Difficulty Tier Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                Select Assessment Difficulty Tier:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                {[
                  { key: 'ADAPTIVE', label: `🎯 Adaptive`, badge: userLevel?.recommendedDifficulty || 'EASY', desc: 'Auto-calibrated to level' },
                  { key: 'EASY', label: '🟢 Easy', badge: 'Tier 1', desc: 'Foundational' },
                  { key: 'MEDIUM', label: '🟡 Medium', badge: 'Tier 2', desc: 'Intermediate' },
                  { key: 'HARD', label: '🔴 Hard', badge: 'Tier 3', desc: 'MNC Placement' }
                ].map((tier) => (
                  <button
                    key={tier.key}
                    type="button"
                    onClick={() => setSelectedMcqDifficulty(tier.key)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      border: selectedMcqDifficulty === tier.key ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: selectedMcqDifficulty === tier.key ? '#eff6ff' : '#ffffff',
                      color: selectedMcqDifficulty === tier.key ? '#1e40af' : '#334155',
                      fontWeight: selectedMcqDifficulty === tier.key ? '700' : '500',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: '700' }}>{tier.label}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>{tier.desc}</div>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      fontSize: '0.68rem',
                      background: tier.key === 'ADAPTIVE' ? '#dbeafe' : '#f1f5f9',
                      color: tier.key === 'ADAPTIVE' ? '#1e40af' : '#475569',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}>
                      {tier.badge}
                    </span>
                  </button>
                ))}
              </div>
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
                  <strong>Format:</strong> 10 Multiple Choice Questions dynamically adapted to your solving tier ({userLevel?.recommendedDifficulty || 'EASY'}).
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
                  <strong>Adaptive Progression:</strong> Higher scores automatically unlock tougher questions and MNC-level challenges.
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
      )}

      {/* ==================================================== */}
      {/* VIEW 2: INTERACTIVE CODING ASSESSMENTS               */}
      {/* ==================================================== */}
      {activeTab === 'CODING' && (
        <div>
          {/* Coding Filters: Categories + Difficulty Tiers */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {/* Category Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {codingCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCodingCat(cat);
                    loadCodingChallenges(cat, selectedDifficulty);
                  }}
                  className={`btn ${selectedCodingCat === cat ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Difficulty Filter Buttons */}
            <div style={{
              display: 'flex',
              gap: '4px',
              alignItems: 'center',
              background: '#f1f5f9',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1'
            }}>
              <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#64748b', padding: '0 6px' }}>
                Tier:
              </span>
              {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => {
                const isSelected = selectedDifficulty === diff;
                const isRec = userLevel?.recommendedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => {
                      setSelectedDifficulty(diff);
                      loadCodingChallenges(selectedCodingCat, diff);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isSelected ? '#2563eb' : 'transparent',
                      color: isSelected ? '#ffffff' : isRec ? '#4338ca' : '#475569',
                      fontWeight: isSelected || isRec ? '700' : '500',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {diff}
                    {isRec && <span title="Recommended based on your solve rate">🎯</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px' }}>
            {/* Left: Challenge Selector List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {codingLoading ? (
                <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                  Loading coding challenges...
                </div>
              ) : codingChallenges.length > 0 ? (
                codingChallenges.map((c) => {
                  const isSelected = activeChallenge?.id === c.id;
                  const isEasy = c.difficulty === 'EASY';
                  const isMedium = c.difficulty === 'MEDIUM';
                  const isHard = c.difficulty === 'HARD';
                  return (
                    <div
                      key={c.id}
                      onClick={() => selectChallenge(c)}
                      className="card"
                      style={{
                        padding: '14px',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid #2563eb' : c.solved ? '1px solid #86efac' : '1px solid #e2e8f0',
                        background: isSelected ? '#eff6ff' : c.solved ? '#f0fdf4' : '#ffffff',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                        <strong style={{ fontSize: '0.92rem', color: isSelected ? '#1e40af' : '#1e293b' }}>
                          {c.title}
                        </strong>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: isEasy ? '#dcfce7' : isMedium ? '#fef3c7' : '#fce7f3',
                          color: isEasy ? '#15803d' : isMedium ? '#b45309' : '#be185d'
                        }}>
                          {c.difficulty}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {c.solved && (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: '#dcfce7',
                            color: '#166534',
                            border: '1px solid #86efac'
                          }}>
                            ✓ Solved {c.bestScore ? `(${Math.round(c.bestScore)}%)` : ''}
                          </span>
                        )}

                        {c.recommended && !c.solved && (
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: '#ede9fe',
                            color: '#6d28d9',
                            border: '1px solid #ddd6fe'
                          }}>
                            🎯 Recommended
                          </span>
                        )}

                        <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          {c.category} &bull; {c.roleCategory}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="card" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  No challenges matching selected filters.
                </div>
              )}
            </div>

            {/* Right: Problem Description & Interactive Code Editor */}
            {activeChallenge && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Problem Info Card */}
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                        {activeChallenge.title}
                      </h2>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                        Track: <strong>{activeChallenge.category}</strong> &bull; Recommended for: <strong>{activeChallenge.roleCategory}</strong>
                      </div>
                    </div>
                    <span className="badge badge-primary">{activeChallenge.difficulty}</span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', marginTop: '10px' }}>
                    {activeChallenge.description}
                  </p>

                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.85rem'
                  }}>
                    <div><strong>Example Input:</strong> <code>{activeChallenge.sampleInput}</code></div>
                    <div style={{ marginTop: '4px' }}><strong>Expected Output:</strong> <code>{activeChallenge.sampleOutput}</code></div>
                  </div>

                  {activeChallenge.constraints && (
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#64748b' }}>
                      <strong>Constraints:</strong> {activeChallenge.constraints.join(' • ')}
                    </div>
                  )}
                </div>

                {/* Code Editor Card */}
                <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                  {/* Editor Top Bar */}
                  <div style={{
                    background: '#1e293b',
                    padding: '10px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Terminal size={16} color="#38bdf8" />
                      <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#f8fafc', letterSpacing: '0.5px' }}>
                        SOLUTION CODE EDITOR
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <select
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        style={{
                          background: '#0f172a',
                          color: '#f8fafc',
                          border: '1px solid #475569',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="java">Java (OpenJDK 21)</option>
                        <option value="python">Python 3.11</option>
                        <option value="javascript">JavaScript (Node.js)</option>
                        {activeChallenge.starterCode?.sql && <option value="sql">SQL Query</option>}
                      </select>

                      <button
                        onClick={() => setUserCode(activeChallenge.starterCode?.[selectedLanguage] || '')}
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.76rem', background: '#334155', color: '#cbd5e1', border: 'none' }}
                        title="Reset starter template"
                      >
                        <RotateCcw size={12} /> Reset
                      </button>
                    </div>
                  </div>

                  {/* Monospaced Code Area */}
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    rows={12}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      color: '#f8fafc',
                      fontFamily: 'Consolas, Monaco, Courier New, monospace',
                      fontSize: '0.88rem',
                      lineHeight: '1.5',
                      padding: '16px',
                      border: 'none',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                    placeholder="// Write your code solution here..."
                  />

                  {/* Editor Bottom Actions Bar */}
                  <div style={{
                    background: '#f8fafc',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Tested against sample & hidden placement test cases.
                    </span>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={handleRunCode}
                        disabled={runningCode || submittingCode}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px' }}
                      >
                        <Play size={14} color="#2563eb" />
                        {runningCode ? 'Running...' : 'Run Sample Tests'}
                      </button>

                      <button
                        onClick={handleSubmitCode}
                        disabled={runningCode || submittingCode}
                        className="btn btn-primary"
                        style={{ padding: '8px 18px', background: '#16a34a' }}
                      >
                        <Send size={14} />
                        {submittingCode ? 'Evaluating...' : 'Submit & Verify Code'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Execution Results Console */}
                {executionResult && (
                  <div className="card" style={{ borderLeft: `6px solid ${executionResult.passed ? '#16a34a' : '#dc2626'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {executionResult.passed ? (
                          <CheckCircle2 size={20} color="#16a34a" />
                        ) : (
                          <AlertCircle size={20} color="#dc2626" />
                        )}
                        <strong style={{ fontSize: '1rem', color: executionResult.passed ? '#15803d' : '#991b1b' }}>
                          {executionResult.statusMessage}
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        Runtime: {executionResult.executionTimeMs}ms
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '12px' }}>
                      {executionResult.feedback}
                    </p>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                        Test Cases: <strong>{executionResult.passedTestCases} / {executionResult.totalTestCases} Passed</strong>
                      </div>
                      <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                        Score: <strong>{Math.round(executionResult.scorePercentage)}%</strong>
                      </div>
                    </div>

                    {/* Detailed Test Case Output */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {executionResult.testCaseResults?.map((tc, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '10px 14px',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            border: `1px solid ${tc.passed ? '#bbf7d0' : '#fecaca'}`,
                            fontSize: '0.82rem'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong style={{ color: '#1e293b' }}>Test Case {tc.testCaseIndex || idx + 1}: {tc.input}</strong>
                            <span style={{ fontWeight: '700', color: tc.passed ? '#15803d' : '#b91c1c' }}>
                              {tc.passed ? 'PASSED ✓' : 'FAILED ✗'}
                            </span>
                          </div>
                          <div style={{ color: '#64748b' }}>Expected: <code>{tc.expectedOutput}</code> &bull; Actual: <code>{tc.actualOutput}</code></div>
                          {tc.errorMessage && <div style={{ color: '#dc2626', marginTop: '2px' }}>{tc.errorMessage}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillVerificationPage;
