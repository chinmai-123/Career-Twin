import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { atsApi } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  UploadCloud,
  Layers,
  ArrowRight,
  TrendingUp,
  Percent,
  RefreshCw
} from 'lucide-react';

const AtsAnalysisPage = () => {
  const [searchParams] = useSearchParams();
  const resumeIdParam = searchParams.get('resumeId');

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState('');

  const fetchAts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = resumeIdParam
        ? await atsApi.getByResumeId(resumeIdParam)
        : await atsApi.getLatest();
      const payload = res?.data || res;
      if (payload && payload.overallAtsScore !== undefined) {
        setAnalysis(payload);
      } else {
        setError('No ATS analysis found. Please upload a resume PDF first.');
      }
    } catch (err) {
      console.error('Error fetching ATS analysis:', err);
      setError(err?.message || 'No ATS analysis found. Please upload a resume PDF first.');
    } finally {
      setLoading(false);
    }
  };

  const handleReAnalyze = async () => {
    try {
      setReanalyzing(true);
      const targetResumeId = analysis?.resumeId || resumeIdParam;
      const res = await atsApi.analyze(targetResumeId);
      const payload = res?.data || res;
      if (payload && payload.overallAtsScore !== undefined) {
        setAnalysis(payload);
      } else {
        await fetchAts();
      }
    } catch (err) {
      console.error('Error re-analyzing ATS:', err);
      alert('Could not re-calculate ATS analysis: ' + (err?.message || 'Unknown error'));
    } finally {
      setReanalyzing(false);
    }
  };

  useEffect(() => {
    fetchAts();
  }, [resumeIdParam]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Evaluating resume against ATS algorithms...</div>;
  }

  if (error || !analysis) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
        <FileText size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
        <h2>No Resume Analyzed Yet</h2>
        <p style={{ color: '#64748b', margin: '8px 0 20px' }}>
          Upload a PDF resume to generate keyword scores, readability metrics, and recruiter suggestions.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <Link to="/resume" className="btn btn-primary">
            <UploadCloud size={16} /> Upload Resume PDF
          </Link>
          <button onClick={fetchAts} className="btn btn-secondary">
            Refresh Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">ATS Resume Analysis</h1>
          <p className="page-subtitle">
            Evaluated for <strong>{analysis.targetRole}</strong> &bull; Resume Version {analysis.resumeVersion}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleReAnalyze} className="btn btn-secondary" disabled={reanalyzing} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={16} className={reanalyzing ? 'spin' : ''} />
            {reanalyzing ? 'Recalculating...' : 'Recalculate ATS'}
          </button>
          <Link to="/resume" className="btn btn-secondary">
            <UploadCloud size={16} /> Upload Revised Resume
          </Link>
        </div>
      </div>

      {/* Top Overview: Overall Score + 5 Metric Cards */}
      <div className="grid-2" style={{ marginBottom: '26px' }}>
        {/* Main ATS Score Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '32px' }}>
          <div>
            <span className="badge badge-primary">Applicant Tracking System</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', marginTop: '6px' }}>
              Overall ATS Score
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '280px', marginTop: '4px' }}>
              Synthesized score based on keyword frequency, technical relevance, section completeness, and readability.
            </p>
          </div>
          <ScoreGauge score={analysis.overallAtsScore} size={160} strokeWidth={16} title="ATS Score" />
        </div>

        {/* 4 Dimension Breakdown */}
        <div className="card">
          <div className="card-title">
            <Percent size={18} color="#2563eb" />
            <span>ATS Dimension Breakdown</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: '600' }}>
                <span>Keyword Match</span>
                <span style={{ color: '#2563eb' }}>{analysis.keywordMatchScore}%</span>
              </div>
              <div className="progress-container" style={{ marginTop: '5px' }}>
                <div className="progress-fill" style={{ width: `${analysis.keywordMatchScore}%`, background: '#2563eb' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: '600' }}>
                <span>Technical Skills Relevance</span>
                <span style={{ color: '#7c3aed' }}>{analysis.skillMatchScore}%</span>
              </div>
              <div className="progress-container" style={{ marginTop: '5px' }}>
                <div className="progress-fill" style={{ width: `${analysis.skillMatchScore}%`, background: '#7c3aed' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: '600' }}>
                <span>Section Completeness</span>
                <span style={{ color: '#10b981' }}>{analysis.sectionCompletenessScore}%</span>
              </div>
              <div className="progress-container" style={{ marginTop: '5px' }}>
                <div className="progress-fill" style={{ width: `${analysis.sectionCompletenessScore}%`, background: '#10b981' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: '600' }}>
                <span>Formatting & Structure</span>
                <span style={{ color: '#f59e0b' }}>{analysis.formattingScore}%</span>
              </div>
              <div className="progress-container" style={{ marginTop: '5px' }}>
                <div className="progress-fill" style={{ width: `${analysis.formattingScore}%`, background: '#f59e0b' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Row: Matched vs Missing */}
      <div className="grid-2" style={{ marginBottom: '26px' }}>
        {/* Matched Keywords */}
        <div className="card">
          <div className="card-title">
            <CheckCircle2 size={18} color="#16a34a" />
            <span>Matched Keywords ({analysis.matchedKeywords?.length || 0})</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '12px' }}>
            Found in your resume and aligned with {analysis.targetRole} expectations.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {analysis.matchedKeywords && analysis.matchedKeywords.length > 0 ? (
              analysis.matchedKeywords.map((k, i) => (
                <span key={i} style={{
                  background: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: '600'
                }}>
                  ✓ {k}
                </span>
              ))
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No matched keywords detected.</p>
            )}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="card">
          <div className="card-title">
            <AlertTriangle size={18} color="#dc2626" />
            <span>Missing Role Keywords ({analysis.missingKeywords?.length || 0})</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '12px' }}>
            Add these keywords naturally in your project descriptions to improve your ATS score.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {analysis.missingKeywords && analysis.missingKeywords.length > 0 ? (
              analysis.missingKeywords.map((k, i) => (
                <span key={i} style={{
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: '600'
                }}>
                  + {k}
                </span>
              ))
            ) : (
              <p style={{ color: '#16a34a', fontSize: '0.85rem' }}>Great job! All critical keywords are present.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recruiter-Style Action Verb Improvements */}
      <div className="card" style={{ marginBottom: '26px' }}>
        <div className="card-title">
          <Lightbulb size={20} color="#f59e0b" />
          <span>Action-Verb & Bullet Point Improvements</span>
        </div>
        <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '16px' }}>
          Practical, resume-friendly suggestions without fabricating experience.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {analysis.improvementSuggestions && analysis.improvementSuggestions.map((sug, i) => (
            <div key={i} style={{
              padding: '14px 18px',
              background: '#f8fafc',
              borderLeft: '4px solid #2563eb',
              borderRadius: '0 8px 8px 0',
              fontSize: '0.9rem',
              color: '#1e293b',
              lineHeight: '1.5'
            }}>
              {sug}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AtsAnalysisPage;
