import React, { useEffect, useState } from 'react';
import { challengeApi } from '../services/api';
import {
  Trophy,
  CheckCircle2,
  Circle,
  Zap,
  Award,
  Calendar,
  Flame
} from 'lucide-react';

const ChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchChallenges = async () => {
    try {
      const res = await challengeApi.getChallenges();
      setChallenges(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      await challengeApi.toggleChallenge(id);
      await fetchChallenges();
    } catch (err) {
      alert('Error updating challenge: ' + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading weekly placement challenges...</div>;
  }

  const completedCount = challenges.filter(c => c.isCompleted).length;
  const totalXp = challenges.filter(c => c.isCompleted).reduce((sum, c) => sum + (c.xpPoints || 0), 0);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Weekly Placement Challenges</h1>
          <p className="page-subtitle">
            Curated micro-tasks to establish a disciplined placement preparation habit.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            background: '#fef3c7',
            padding: '8px 18px',
            borderRadius: '10px',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Flame size={20} color="#d97706" />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: '700' }}>TOTAL EARNED</div>
              <strong style={{ fontSize: '1.1rem', color: '#78350f' }}>{totalXp} XP</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Header */}
      <div className="card" style={{ marginBottom: '26px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '8px' }}>
          <span>Completed <strong>{completedCount} of {challenges.length}</strong> weekly challenges</span>
          <strong>{Math.round((completedCount / (challenges.length || 1)) * 100)}% Complete</strong>
        </div>
        <div className="progress-container" style={{ height: '10px' }}>
          <div
            className="progress-fill"
            style={{ width: `${(completedCount / (challenges.length || 1)) * 100}%`, background: '#f59e0b' }}
          />
        </div>
      </div>

      {/* Challenge Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {challenges.map((c) => {
          const isCompleted = c.isCompleted;
          const isToggling = togglingId === c.id;

          return (
            <div
              key={c.id}
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                background: isCompleted ? '#f0fdf4' : '#ffffff',
                border: isCompleted ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: isCompleted ? '#10b981' : '#eff6ff',
                  color: isCompleted ? '#ffffff' : '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Trophy size={20} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-primary">Week {c.weekNumber}</span>
                    <span className={`badge badge-${c.difficulty.toLowerCase()}`}>{c.difficulty}</span>
                    <span className="badge badge-medium">+{c.xpPoints} XP</span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', maxWidth: '750px' }}>
                    {c.description}
                  </p>
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleToggle(c.id)}
                  disabled={isToggling}
                  className="btn"
                  style={{
                    background: isCompleted ? '#ecfdf5' : '#f1f5f9',
                    color: isCompleted ? '#065f46' : '#334155',
                    border: `1px solid ${isCompleted ? '#a7f3d0' : '#cbd5e1'}`,
                    padding: '8px 18px',
                    fontWeight: '700',
                    fontSize: '0.86rem'
                  }}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 size={16} color="#10b981" /> Completed
                    </>
                  ) : (
                    <>
                      <Circle size={16} color="#64748b" /> Mark Done
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChallengesPage;
