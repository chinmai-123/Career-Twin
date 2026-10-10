import React, { useEffect, useState } from 'react';
import { roadmapApi } from '../services/api';
import {
  Map,
  CheckCircle2,
  Circle,
  Calendar,
  Briefcase,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const RoadmapPage = () => {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchRoadmap = async () => {
    try {
      const res = await roadmapApi.getRoadmap();
      setPhases(res.data || []);
    } catch (err) {
      console.error('Error fetching roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggle = async (phaseId) => {
    setTogglingId(phaseId);
    try {
      await roadmapApi.togglePhase(phaseId);
      await fetchRoadmap();
    } catch (err) {
      alert('Error updating phase: ' + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Generating your personalized placement roadmap...</div>;
  }

  const completedCount = phases.filter(p => p.isCompleted).length;
  const progressPercent = phases.length > 0 ? Math.round((completedCount / phases.length) * 100) : 0;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Personalized Placement Roadmap</h1>
          <p className="page-subtitle">
            Structured step-by-step phases designed to bridge your skill gaps before campus recruitment.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Roadmap Progress</span>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#2563eb' }}>{progressPercent}%</div>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div className="card" style={{ marginBottom: '28px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
          <span>Completed <strong>{completedCount} of {phases.length}</strong> preparation phases</span>
          <strong>{progressPercent}% Ready</strong>
        </div>
        <div className="progress-container" style={{ height: '10px' }}>
          <div className="progress-fill" style={{ width: `${progressPercent}%`, background: '#2563eb' }} />
        </div>
      </div>

      {/* Timeline Phases */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {phases.map((phase) => {
          const isCompleted = phase.isCompleted;
          const isToggling = togglingId === phase.id;

          return (
            <div
              key={phase.id}
              className="card"
              style={{
                borderLeft: `6px solid ${isCompleted ? '#10b981' : '#2563eb'}`,
                background: isCompleted ? '#f0fdf4' : '#ffffff',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-primary">
                      Phase {phase.phaseNumber}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> Duration: {phase.durationWeeks} Weeks
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>
                    {phase.phaseTitle}
                  </h2>
                </div>

                <button
                  onClick={() => handleToggle(phase.id)}
                  disabled={isToggling}
                  className="btn"
                  style={{
                    background: isCompleted ? '#ecfdf5' : '#eff6ff',
                    color: isCompleted ? '#065f46' : '#1e40af',
                    border: `1px solid ${isCompleted ? '#a7f3d0' : '#bfdbfe'}`,
                    padding: '8px 16px',
                    fontSize: '0.86rem',
                    fontWeight: '700'
                  }}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 size={16} color="#10b981" /> Completed
                    </>
                  ) : (
                    <>
                      <Circle size={16} color="#2563eb" /> Mark Phase Completed
                    </>
                  )}
                </button>
              </div>

              {/* Topics Breakdown */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                  Core Topics to Master:
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', color: '#334155' }}>
                  {phase.topics && phase.topics.map((t, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={15} color={isCompleted ? '#10b981' : '#2563eb'} />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills and Milestone Footer */}
              <div style={{
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Skills:</span>
                  {phase.skillsCovered && phase.skillsCovered.map((s, i) => (
                    <span key={i} className="badge badge-primary" style={{ fontSize: '0.74rem' }}>
                      {s}
                    </span>
                  ))}
                </div>

                {phase.projectMilestone && (
                  <div style={{ fontSize: '0.84rem', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={15} />
                    <strong>Milestone: </strong> {phase.projectMilestone}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoadmapPage;
