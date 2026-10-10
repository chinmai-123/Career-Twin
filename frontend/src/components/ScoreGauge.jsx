import React from 'react';

const ScoreGauge = ({ score = 0, size = 160, strokeWidth = 14, title = "Readiness Score" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  let color = '#2563eb';
  let badgeText = 'Developing';
  let badgeClass = 'badge-medium';

  if (clampedScore >= 75) {
    color = '#10b981';
    badgeText = 'Placement Ready';
    badgeClass = 'badge-low';
  } else if (clampedScore >= 50) {
    color = '#2563eb';
    badgeText = 'Good Progress';
    badgeClass = 'badge-primary';
  } else {
    color = '#f59e0b';
    badgeText = 'Needs Work';
    badgeClass = 'badge-high';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
          />
        </svg>

        {/* Center Text */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: `${size * 0.26}px`, fontWeight: '800', color: '#1e293b', lineHeight: 1 }}>
            {clampedScore}%
          </span>
          <span style={{ fontSize: `${size * 0.085}px`, color: '#64748b', fontWeight: '500', marginTop: '4px' }}>
            {title}
          </span>
        </div>
      </div>

      <div style={{ marginTop: '12px' }}>
        <span className={`badge ${badgeClass}`}>{badgeText}</span>
      </div>
    </div>
  );
};

export default ScoreGauge;
