import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { careerTwinApi, progressApi, challengeApi } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import {
  FileText,
  Code2,
  Award,
  Briefcase,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Map,
  Trophy,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const [twin, setTwin] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [twinRes, progressRes] = await Promise.all([
        careerTwinApi.getCareerTwin(),
        progressApi.getProgress()
      ]);
      setTwin(twinRes.data);
      setProgress(progressRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await careerTwinApi.recalculate();
      setTwin(res.data);
      const progRes = await progressApi.getProgress();
      setProgress(progRes.data);
    } catch (err) {
      console.error('Recalculate failed:', err);
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: '#64748b' }}>Synthesizing Career Twin data...</p>
      </div>
    );
  }

  const trendData = progress?.readinessTrend || [
    { date: 'Day 1', readinessScore: 25, atsScore: 35 },
    { date: 'Week 1', readinessScore: 40, atsScore: 50 },
    { date: 'Current', readinessScore: twin?.overallReadiness || 45, atsScore: twin?.resumeScore || 60 }
  ];

  const skillData = progress?.skillProficiencies || [
    { skill: 'Java', level: 75, required: 85 },
    { skill: 'Spring Boot', level: 45, required: 85 },
    { skill: 'SQL', level: 70, required: 80 },
    { skill: 'DSA', level: 60, required: 85 }
  ];

  return (
    <div>
      {/* Welcome & Target Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '28px 32px',
        marginBottom: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 8px 24px rgba(37,99,235,0.25)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              fontSize: '0.78rem',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '999px',
              textTransform: 'uppercase'
            }}>
              Active Career Twin
            </span>
            <span style={{ fontSize: '0.85rem', color: '#bfdbfe' }}>
              Target: {twin?.targetRole || 'Backend Developer'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>
            Hello, {user?.fullName || twin?.studentName}!
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#dbeafe', marginTop: '6px', maxWidth: '600px' }}>
            Aiming for <strong>{twin?.targetRole}</strong> at <strong>{twin?.targetCompany || 'Top Product MNCs'}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="btn"
            style={{ background: '#ffffff', color: '#1e3a8a', padding: '10px 18px', fontWeight: '700' }}
          >
            <RefreshCw size={16} className={recalculating ? 'spin' : ''} />
            {recalculating ? 'Syncing Engine...' : 'Sync Career Twin'}
          </button>
          <Link
            to="/career-twin"
            className="btn"
            style={{ background: '#172554', color: '#ffffff', padding: '10px 18px', fontWeight: '700' }}
          >
            <Sparkles size={16} color="#fbbf24" /> View Digital Twin
          </Link>
        </div>
      </div>

      {/* Recommended Next Action Alert */}
      {twin?.recommendedNextAction && (
        <div className="alert alert-info" style={{ marginBottom: '26px' }}>
          <Sparkles size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong>AI Recommended Next Step: </strong>
            <span>{twin.recommendedNextAction}</span>
          </div>
        </div>
      )}

      {/* Top 5 Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '26px' }}>
        {/* ATS Score Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb'
          }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
              ATS Resume Match
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b' }}>
              {twin?.resumeScore || 0}%
            </div>
            <Link to="/ats" style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '600' }}>
              View ATS report &rarr;
            </Link>
          </div>
        </div>

        {/* Technical Match */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#f5f3ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7c3aed'
          }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
              Role Skills Match
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b' }}>
              {twin?.technicalScore || 0}%
            </div>
            <Link to="/skill-gap" style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: '600' }}>
              View skill gaps &rarr;
            </Link>
          </div>
        </div>

        {/* Coding & DSA Score */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#059669'
          }}>
            <Code2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
              Coding & DSA Strength
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b' }}>
              {twin?.codingScore || 0}%
            </div>
            <Link to="/coding-profiles" style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '600' }}>
              Synced platforms &rarr;
            </Link>
          </div>
        </div>

        {/* Assessment Verified Score */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: '#fffbeb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d97706'
          }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>
              Verified Assessments
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b' }}>
              {twin?.assessmentScore || 0}%
            </div>
            <Link to="/skill-verification" style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: '600' }}>
              Take assessment &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Score Gauge + Progress & Charts */}
      <div className="grid-2" style={{ marginBottom: '26px' }}>
        {/* Placement Readiness Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-title">
              <Sparkles size={20} color="#2563eb" />
              <span>Placement Readiness Gauge</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              Calculated using the deterministic Career Twin formula combining resume, coding, skills, and assessment metrics.
            </p>
            <div style={{ padding: '14px 0' }}>
              <ScoreGauge score={twin?.overallReadiness || 0} size={180} strokeWidth={16} />
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            borderRadius: '10px',
            padding: '14px',
            marginTop: '16px',
            border: '1px solid #e2e8f0',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Roadmap Milestone Progress:</span>
              <strong>{twin?.roadmapProgress || 0}%</strong>
            </div>
            <div className="progress-container">
              <div
                className="progress-fill"
                style={{ width: `${twin?.roadmapProgress || 0}%`, background: '#2563eb' }}
              />
            </div>
          </div>
        </div>

        {/* Readiness Trend Chart */}
        <div className="card">
          <div className="card-title">
            <TrendingUp size={20} color="#2563eb" />
            <span>Readiness & ATS Progress Trend</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
            Historical growth across assessments and updated resume uploads.
          </p>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="readinessScore" name="Readiness %" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="atsScore" name="ATS Score" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Priority Skill Gaps + Skill Proficiencies Chart */}
      <div className="grid-2" style={{ marginBottom: '26px' }}>
        {/* Top Skill Gaps */}
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} color="#ef4444" />
              <span>Priority Skill Gaps for {twin?.targetRole}</span>
            </div>
            <Link to="/skill-gap" className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
              All Gaps
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {twin?.topSkillGaps && twin.topSkillGaps.length > 0 ? (
              twin.topSkillGaps.map((gap, i) => (
                <div key={i} style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.92rem', color: '#1e293b' }}>{gap.skillName}</strong>
                    <span className={`badge badge-${gap.priority.toLowerCase()}`}>
                      {gap.priority} Priority
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                    <span>Current: {gap.currentLevel}%</span>
                    <span>Required: {gap.requiredLevel}%</span>
                  </div>
                  <div className="progress-container" style={{ marginTop: '4px', height: '6px' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${gap.currentLevel}%`,
                        background: gap.priority === 'HIGH' ? '#ef4444' : '#f59e0b'
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.88rem' }}>No critical skill gaps identified!</p>
            )}
          </div>
        </div>

        {/* Skill Proficiencies Bar Chart */}
        <div className="card">
          <div className="card-title">
            <Award size={20} color="#7c3aed" />
            <span>Skill Benchmark vs Role Requirement</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
            Comparison of your current skill levels vs campus hiring benchmarks.
          </p>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="skill" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="level" name="Your Level" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="required" name="Benchmark" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Weekly Challenges + Quick Links */}
      <div className="grid-2">
        {/* Weekly Challenges Summary */}
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={20} color="#f59e0b" />
              <span>Weekly Placement Challenges</span>
            </div>
            <Link to="/challenges" className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
              View All
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>
              {twin?.weeklyChallengesCompleted || 0} / {twin?.totalChallenges || 5}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Challenges completed. Keep consistent daily problem solving to boost your coding rank!
            </div>
          </div>
          <Link to="/challenges" className="btn btn-secondary" style={{ width: '100%' }}>
            Solve Placement Challenges &rarr;
          </Link>
        </div>

        {/* Quick Actions Card */}
        <div className="card">
          <div className="card-title">
            <Briefcase size={20} color="#2563eb" />
            <span>Placement Action Center</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <Link to="/resume" className="btn btn-secondary" style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}>
              <FileText size={16} color="#2563eb" /> Upload Resume PDF
            </Link>
            <Link to="/skill-verification" className="btn btn-secondary" style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}>
              <Award size={16} color="#10b981" /> Take Skill Test
            </Link>
            <Link to="/coding-profiles" className="btn btn-secondary" style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}>
              <Code2 size={16} color="#7c3aed" /> Connect LeetCode
            </Link>
            <Link to="/ai-guidance" className="btn btn-secondary" style={{ justifyContent: 'flex-start', fontSize: '0.82rem' }}>
              <Sparkles size={16} color="#f59e0b" /> AI Recruiter Prep
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
