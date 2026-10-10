import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { careerTwinApi, roadmapApi, challengeApi } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import {
  Sparkles,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Map,
  Briefcase,
  Trophy,
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';

const CareerTwinPage = () => {
  const [twin, setTwin] = useState(null);
  const [projects, setProjects] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadTwin = async () => {
    try {
      const [twinRes, projRes, chalRes] = await Promise.all([
        careerTwinApi.getCareerTwin(),
        roadmapApi.getProjects(),
        challengeApi.getChallenges()
      ]);
      setTwin(twinRes.data);
      setProjects(projRes.data);
      setChallenges(chalRes.data);
    } catch (err) {
      console.error('Error loading Career Twin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTwin();
  }, []);

  const handleRecalculate = async () => {
    setSyncing(true);
    try {
      const res = await careerTwinApi.recalculate();
      setTwin(res.data);
    } catch (err) {
      console.error('Failed to recalculate Twin:', err);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Building your Career Twin...</div>;
  }

  const recommendedProject = projects[0] || {
    title: 'Employee Management REST API',
    description: 'A production-grade backend service built with Spring Boot, MySQL, and JPA.',
    difficulty: 'INTERMEDIATE',
    technologies: ['Spring Boot', 'REST API', 'MySQL', 'JWT', 'JPA']
  };

  const nextChallenge = challenges.find(c => !c.isCompleted) || challenges[0] || {
    title: 'Solve 3 medium-level array/hashmap problems',
    category: 'DSA',
    xpPoints: 60
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Digital Career Twin</h1>
          <p className="page-subtitle">
            Your continuous AI-synthesized placement readiness profile
          </p>
        </div>
        <button
          onClick={handleRecalculate}
          disabled={syncing}
          className="btn btn-primary"
        >
          <RefreshCw size={16} className={syncing ? 'spin' : ''} />
          {syncing ? 'Recalculating Twin...' : 'Recalculate Twin'}
        </button>
      </div>

      {/* Visual Workflow: What Goes In -> Engine -> What Comes Out */}
      <div className="card" style={{ marginBottom: '28px', background: '#ffffff', border: '2px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Layers size={20} color="#2563eb" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
            Career Twin Engine Pipeline
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1.2fr auto 1fr', gap: '16px', alignItems: 'center' }}>
          {/* Step 1: Input */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase' }}>
              Inputs
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', marginTop: '6px' }}>
              Student Career Data
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
              Goal, Resume PDF, LeetCode/GitHub, Assessments, Projects
            </p>
          </div>

          <div style={{ color: '#94a3b8' }}>➔</div>

          {/* Step 2: Engine */}
          <div style={{
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            color: '#fff',
            padding: '16px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <Cpu size={24} style={{ margin: '0 auto 4px' }} />
            <div style={{ fontSize: '0.92rem', fontWeight: '800' }}>
              Twin Engine
            </div>
            <div style={{ fontSize: '0.74rem', color: '#bfdbfe' }}>
              Deterministic Scoring + Gemini Synthesis
            </div>
          </div>

          <div style={{ color: '#94a3b8' }}>➔</div>

          {/* Step 3: Output */}
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#10b981', textTransform: 'uppercase' }}>
              Outputs
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', marginTop: '6px' }}>
              Actionable Intelligence
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
              Readiness ({twin?.overallReadiness}%), Skill Gaps, Roadmap, Recruiter Feedback
            </p>
          </div>
        </div>
      </div>

      {/* Main Career Twin Profile Card */}
      <div className="card" style={{ marginBottom: '28px', border: '2px solid #2563eb', padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'center' }}>
          {/* Gauge Center */}
          <div style={{
            borderRight: '1px solid #e2e8f0',
            paddingRight: '28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <ScoreGauge score={twin?.overallReadiness || 0} size={190} strokeWidth={18} />
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Target Role</div>
              <strong style={{ fontSize: '1.1rem', color: '#1e3a8a' }}>{twin?.targetRole}</strong>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{twin?.targetCompany}</div>
            </div>
          </div>

          {/* Profile Details */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-primary">AI Synthesized Profile</span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b', marginTop: '6px' }}>
                  {twin?.studentName}'s Career Twin
                </h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Last Updated: {twin?.lastUpdated ? new Date(twin.lastUpdated).toLocaleDateString() : 'Today'}
                </span>
              </div>
            </div>

            {/* Recruiter Summary */}
            <div style={{
              background: '#eff6ff',
              borderRadius: '10px',
              padding: '16px',
              border: '1px solid #bfdbfe',
              marginTop: '16px',
              fontSize: '0.9rem',
              color: '#1e40af',
              lineHeight: '1.5'
            }}>
              <strong>Recruiter Persona Assessment: </strong>
              {twin?.recruiterFeedbackSummary}
            </div>

            {/* Strengths & Skill Gaps Chips */}
            <div className="grid-2" style={{ marginTop: '20px' }}>
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#16a34a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} /> Verified Strengths
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {twin?.strengths && twin.strengths.length > 0 ? (
                    twin.strengths.map((s, idx) => (
                      <span key={idx} style={{
                        background: '#ecfdf5',
                        color: '#065f46',
                        border: '1px solid #a7f3d0',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: '600'
                      }}>
                        {s}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>None verified yet</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#dc2626', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} /> Priority Skill Gaps
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {twin?.topSkillGaps && twin.topSkillGaps.length > 0 ? (
                    twin.topSkillGaps.map((g, idx) => (
                      <span key={idx} style={{
                        background: '#fef2f2',
                        color: '#991b1b',
                        border: '1px solid #fecaca',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: '600'
                      }}>
                        {g.skillName} (-{g.gapScore}%)
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No gaps</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Next Actions & Milestones */}
      <div className="grid-3">
        {/* Recommended Project */}
        <div className="card">
          <div className="card-title">
            <Briefcase size={20} color="#2563eb" />
            <span>Recommended Project</span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>
            {recommendedProject.title}
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '6px', lineHeight: '1.5' }}>
            {recommendedProject.description}
          </p>
          <div style={{ marginTop: '14px' }}>
            <Link to="/projects" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
              View Project Specs &rarr;
            </Link>
          </div>
        </div>

        {/* Next Challenge */}
        <div className="card">
          <div className="card-title">
            <Trophy size={20} color="#f59e0b" />
            <span>Next Placement Challenge</span>
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>
            {nextChallenge.title}
          </h3>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <span className="badge badge-medium">{nextChallenge.category}</span>
            <span className="badge badge-primary">+{nextChallenge.xpPoints} XP</span>
          </div>
          <div style={{ marginTop: '20px' }}>
            <Link to="/challenges" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
              Solve Challenge &rarr;
            </Link>
          </div>
        </div>

        {/* Roadmap Progress */}
        <div className="card">
          <div className="card-title">
            <Map size={20} color="#10b981" />
            <span>Roadmap Progress</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>
            {twin?.roadmapProgress || 0}%
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
            Personalized phases to reach full campus placement readiness.
          </p>
          <div className="progress-container" style={{ margin: '14px 0' }}>
            <div
              className="progress-fill"
              style={{ width: `${twin?.roadmapProgress || 0}%`, background: '#10b981' }}
            />
          </div>
          <Link to="/roadmap" className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
            Open Roadmap &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CareerTwinPage;
