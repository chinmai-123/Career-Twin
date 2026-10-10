import React, { useEffect, useState } from 'react';
import { skillGapApi, careerTwinApi } from '../services/api';
import {
  GitPullRequest,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ArrowRight,
  TrendingDown,
  Sparkles
} from 'lucide-react';

const SkillGapPage = () => {
  const [gaps, setGaps] = useState([]);
  const [twin, setTwin] = useState(null);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gapsRes, twinRes] = await Promise.all([
          skillGapApi.getSkillGaps(),
          careerTwinApi.getCareerTwin()
        ]);
        setGaps(gapsRes.data || []);
        setTwin(twinRes.data);
      } catch (err) {
        console.error('Error fetching skill gaps:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Calculating skill gaps for your target role...</div>;
  }

  const filteredGaps = filterPriority === 'ALL'
    ? gaps
    : gaps.filter(g => g.priority === filterPriority);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Skill Gap Analysis & Placement Readiness</h1>
        <p className="page-subtitle">
          Comparing your current competencies against the benchmark requirements of <strong>{twin?.targetRole || 'your target role'}</strong>.
        </p>
      </div>

      {/* Category Breakdown Bar */}
      <div className="card" style={{ marginBottom: '26px' }}>
        <div className="card-title">
          <Sparkles size={20} color="#2563eb" />
          <span>Placement Readiness Category Breakdown</span>
        </div>

        <div className="grid-4" style={{ marginTop: '14px' }}>
          <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Resume / ATS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2563eb' }}>{twin?.resumeScore || 0}%</div>
            <div className="progress-container" style={{ marginTop: '6px' }}>
              <div className="progress-fill" style={{ width: `${twin?.resumeScore || 0}%`, background: '#2563eb' }} />
            </div>
          </div>

          <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Technical Match</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#7c3aed' }}>{twin?.technicalScore || 0}%</div>
            <div className="progress-container" style={{ marginTop: '6px' }}>
              <div className="progress-fill" style={{ width: `${twin?.technicalScore || 0}%`, background: '#7c3aed' }} />
            </div>
          </div>

          <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Coding / DSA</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#059669' }}>{twin?.codingScore || 0}%</div>
            <div className="progress-container" style={{ marginTop: '6px' }}>
              <div className="progress-fill" style={{ width: `${twin?.codingScore || 0}%`, background: '#059669' }} />
            </div>
          </div>

          <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Assessment Score</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d97706' }}>{twin?.assessmentScore || 0}%</div>
            <div className="progress-container" style={{ marginTop: '6px' }}>
              <div className="progress-fill" style={{ width: `${twin?.assessmentScore || 0}%`, background: '#d97706' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className="btn"
            style={{
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: '600',
              borderRadius: '999px',
              border: filterPriority === p ? '1px solid #2563eb' : '1px solid #cbd5e1',
              background: filterPriority === p ? '#2563eb' : '#ffffff',
              color: filterPriority === p ? '#ffffff' : '#475569'
            }}
          >
            {p === 'ALL' ? 'All Gaps' : `${p} Priority`}
          </button>
        ))}
      </div>

      {/* Detailed Skill Gaps Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Required Level</th>
                <th>Current Level</th>
                <th>Gap Score</th>
                <th>Priority</th>
                <th>Why It's a Gap</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGaps.map((gap, i) => (
                <tr key={i}>
                  <td>
                    <strong style={{ fontSize: '0.92rem', color: '#1e293b' }}>
                      {gap.skillName}
                    </strong>
                  </td>
                  <td>{gap.requiredLevel}%</td>
                  <td>
                    <span style={{ fontWeight: '600', color: gap.currentLevel >= 70 ? '#16a34a' : '#475569' }}>
                      {gap.currentLevel}%
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: '700',
                      color: gap.priority === 'HIGH' ? '#dc2626' : gap.priority === 'MEDIUM' ? '#d97706' : '#16a34a'
                    }}>
                      -{gap.gapScore}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${gap.priority.toLowerCase()}`}>
                      {gap.priority}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.84rem', color: '#475569', maxWidth: '280px' }}>
                    {gap.reason}
                  </td>
                  <td style={{ fontSize: '0.84rem', color: '#2563eb', maxWidth: '300px' }}>
                    {gap.recommendedAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SkillGapPage;
