import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { assessmentApi } from '../services/api';
import {
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';

const AssessmentResultPage = () => {
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    if (!result) {
      const fetchLatest = async () => {
        try {
          const res = await assessmentApi.getLatest();
          setResult(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchLatest();
    }
  }, [result]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading assessment scorecard...</div>;
  }

  if (!result) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>No Assessment Results Found</h2>
        <p style={{ color: '#64748b', margin: '10px 0 20px' }}>Take an assessment to verify your technical skills.</p>
        <Link to="/skill-verification" className="btn btn-primary">
          Take Assessment Test
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Result Header Banner */}
      <div className="card" style={{
        textAlign: 'center',
        padding: '36px',
        marginBottom: '26px',
        background: result.passed ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        border: `2px solid ${result.passed ? '#a7f3d0' : '#fecaca'}`
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: result.passed ? '#10b981' : '#ef4444',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          {result.passed ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
        </div>

        <span className={`badge ${result.passed ? 'badge-low' : 'badge-high'}`} style={{ fontSize: '0.85rem' }}>
          {result.passed ? 'Skill Verified & Passed' : 'Needs Practice (Below 60%)'}
        </span>

        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#1e293b', marginTop: '10px' }}>
          {result.scorePercentage}%
        </h1>

        <p style={{ fontSize: '1rem', color: '#475569', maxWidth: '500px', margin: '8px auto 20px' }}>
          You correctly answered <strong>{result.correctAnswers} out of {result.totalQuestions}</strong> questions in the <strong>{result.category}</strong> track.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Link to="/career-twin" className="btn btn-primary">
            <Sparkles size={16} /> View Updated Career Twin
          </Link>
          <Link to="/skill-verification" className="btn btn-secondary">
            <RotateCcw size={16} /> Take Another Test
          </Link>
        </div>
      </div>

      {/* Question by Question Review */}
      <div className="card">
        <div className="card-title">
          <HelpCircle size={20} color="#2563eb" />
          <span>Question-by-Question Detailed Review</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {result.reviewList && result.reviewList.map((item, idx) => {
            const isCorrect = item.isCorrect;
            return (
              <div
                key={idx}
                style={{
                  padding: '18px',
                  borderRadius: '10px',
                  border: isCorrect ? '1px solid #a7f3d0' : '1px solid #fecaca',
                  background: isCorrect ? '#f0fdf4' : '#fff5f5'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.98rem', color: '#1e293b' }}>
                    Q{idx + 1}. {item.questionText}
                  </strong>
                  <span className={`badge ${isCorrect ? 'badge-low' : 'badge-high'}`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                {/* Selected vs Correct Answer */}
                <div style={{ display: 'flex', gap: '20px', fontSize: '0.86rem', marginTop: '10px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Your Answer: </span>
                    <strong style={{ color: isCorrect ? '#16a34a' : '#dc2626' }}>
                      Option {item.selectedOption || 'None'}
                    </strong>
                  </div>
                  {!isCorrect && (
                    <div>
                      <span style={{ color: '#64748b' }}>Correct Answer: </span>
                      <strong style={{ color: '#16a34a' }}>
                        Option {item.correctOption}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Explanation */}
                {item.explanation && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px 12px',
                    background: '#ffffff',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    color: '#475569',
                    border: '1px solid #e2e8f0'
                  }}>
                    <strong>Explanation: </strong> {item.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AssessmentResultPage;
