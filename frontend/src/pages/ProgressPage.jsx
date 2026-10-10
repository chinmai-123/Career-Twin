import React, { useEffect, useState } from 'react';
import { progressApi } from '../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import {
  LineChart as ChartIcon,
  TrendingUp,
  Award,
  CheckCircle2,
  Trophy,
  Map,
  Sparkles
} from 'lucide-react';

const ProgressPage = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await progressApi.getProgress();
        setProgress(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading placement progress analytics...</div>;
  }

  const trendData = progress?.readinessTrend || [];
  const skillData = progress?.skillProficiencies || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Placement Progress & Growth Analytics</h1>
        <p className="page-subtitle">
          Longitudinal tracking of your Career Twin readiness, verified competencies, and challenge completions.
        </p>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '26px' }}>
        <div className="card">
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>CURRENT READINESS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>
            {progress?.currentReadiness}%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <TrendingUp size={14} /> +{progress?.readinessGrowth || 0}% overall growth
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>SKILLS VERIFIED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#7c3aed', marginTop: '4px' }}>
            {progress?.skillsVerifiedCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            Across assessments & platforms
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>CHALLENGES COMPLETED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>
            {progress?.challengesCompletedCount} / {progress?.totalChallengesCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            Weekly micro-sprints
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>ROADMAP MILESTONES</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
            {progress?.roadmapCompletionPercentage}%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            Curriculum completed
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2" style={{ marginBottom: '26px' }}>
        {/* Readiness Growth Trend */}
        <div className="card">
          <div className="card-title">
            <TrendingUp size={20} color="#2563eb" />
            <span>Readiness Score Growth Over Time</span>
          </div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="readinessScore" name="Placement Readiness %" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="atsScore" name="ATS Resume Score %" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Proficiency Benchmarks */}
        <div className="card">
          <div className="card-title">
            <Award size={20} color="#7c3aed" />
            <span>Target Role Competency Benchmarks</span>
          </div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="skill" stroke="#94a3b8" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="level" name="Your Level" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="required" name="Role Benchmark" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Milestones Achievements */}
      <div className="card">
        <div className="card-title">
          <Sparkles size={20} color="#f59e0b" />
          <span>Recent Milestones & Activity Log</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {progress?.recentMilestones && progress.recentMilestones.map((m, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span style={{ fontSize: '0.9rem', color: '#1e293b' }}>{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
