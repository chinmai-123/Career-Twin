import React, { useEffect, useState } from 'react';
import { reportsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Printer,
  FileBarChart,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';

const ReportsPage = () => {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await reportsApi.getReport();
        setReport(res.data);
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Compiling official placement readiness report...</div>;
  }

  const categoryScores = report?.categoryScores || {};

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Comprehensive Placement Readiness Report</h1>
          <p className="page-subtitle">
            Formal student career twin assessment report for college placement reviews and external examiners.
          </p>
        </div>
        <button onClick={handlePrint} className="btn btn-primary">
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      {/* Printable Report Sheet */}
      <div className="card report-sheet" style={{
        padding: '40px',
        background: '#ffffff',
        border: '2px solid #cbd5e1',
        maxWidth: '900px',
        margin: '0 auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.06)'
      }}>
        {/* Document Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #2563eb',
          paddingBottom: '20px',
          marginBottom: '28px'
        }}>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e3a8a', letterSpacing: '-0.02em' }}>
              CAREERTWIN EVALUATION REPORT
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              Autonomous Placement Readiness & Digital Twin Assessment Platform
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`badge ${report?.overallReadiness >= 70 ? 'badge-low' : 'badge-primary'}`} style={{ fontSize: '0.85rem' }}>
              Status: {report?.status}
            </span>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
              Report Generated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Candidate Profile Details Table */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '14px',
          background: '#f8fafc',
          padding: '18px',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          marginBottom: '28px',
          fontSize: '0.88rem'
        }}>
          <div><strong>Candidate Name:</strong> {user?.fullName || report?.studentName}</div>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Institute / College:</strong> {user?.college || 'National Institute of Technology'}</div>
          <div><strong>Branch:</strong> {user?.branch || 'Computer Science & Engineering'}</div>
          <div><strong>Target Career Role:</strong> <span style={{ color: '#2563eb', fontWeight: '700' }}>{report?.targetRole}</span></div>
          <div><strong>Target Company/Industry:</strong> {report?.targetCompany}</div>
        </div>

        {/* Overall Score Box */}
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          marginBottom: '28px'
        }}>
          <div style={{ fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#bfdbfe', fontWeight: '700' }}>
            Overall Placement Readiness Index
          </div>
          <div style={{ fontSize: '3.6rem', fontWeight: '900', lineHeight: '1.1', margin: '8px 0' }}>
            {report?.overallReadiness}%
          </div>
          <p style={{ fontSize: '0.88rem', color: '#dbeafe', maxWidth: '600px', margin: '0 auto' }}>
            Calculated across ATS resume compliance, technical skill match, verified MCQs, project portfolio, and coding profile activity.
          </p>
        </div>

        {/* Category Breakdown Table */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
            1. Placement Readiness Category Scores
          </h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Score</th>
                  <th>Weightage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(categoryScores).map(([cat, score]) => (
                  <tr key={cat}>
                    <td><strong>{cat}</strong></td>
                    <td style={{ fontWeight: '700', color: '#2563eb' }}>{score}%</td>
                    <td>{cat.includes('Resume') || cat.includes('Technical') ? '25%' : cat.includes('Coding') ? '20%' : '15%'}</td>
                    <td>
                      <span className={`badge ${score >= 70 ? 'badge-low' : score >= 50 ? 'badge-medium' : 'badge-high'}`}>
                        {score >= 70 ? 'Satisfactory' : score >= 50 ? 'Developing' : 'Needs Focus'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strengths & Priority Gaps */}
        <div className="grid-2" style={{ marginBottom: '28px' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#16a34a', marginBottom: '10px' }}>
              ✓ Verified Strengths
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.86rem', color: '#334155' }}>
              {report?.strengths && report.strengths.map((s, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#16a34a" /> {s}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#dc2626', marginBottom: '10px' }}>
              ! Priority Skill Gaps
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.86rem', color: '#334155' }}>
              {report?.skillGaps && report.skillGaps.slice(0, 5).map((g, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} color="#dc2626" />
                  <span><strong>{g.skillName}:</strong> Gap of {g.gapScore}% ({g.priority})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recruiter Summary */}
        <div style={{
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          fontSize: '0.86rem',
          lineHeight: '1.6',
          marginBottom: '28px'
        }}>
          <strong>Executive Evaluation Summary: </strong>
          {report?.recruiterFeedbackSummary}
        </div>

        {/* Signature Line for Academic Evaluation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0',
          fontSize: '0.84rem',
          color: '#64748b'
        }}>
          <div>
            <div style={{ borderBottom: '1px solid #94a3b8', width: '200px', height: '30px' }} />
            <div style={{ marginTop: '6px' }}>Student Signature</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ borderBottom: '1px solid #94a3b8', width: '200px', height: '30px', marginLeft: 'auto' }} />
            <div style={{ marginTop: '6px' }}>Examiner / Placement Officer</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
