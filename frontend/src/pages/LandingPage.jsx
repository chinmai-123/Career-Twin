import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Target, FileText, Code2, Award, ArrowRight, CheckCircle2, ShieldCheck, Map, Bot } from 'lucide-react';

const LandingPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* Top Navigation */}
      <nav style={{
        padding: '18px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#151E27',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 4px 10px rgba(21, 30, 39, 0.25)',
            flexShrink: 0
          }}>
            <img
              src="/logo.png"
              alt="CareerTwin Logo"
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
            />
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1e3a8a' }}>CareerTwin</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link to="/login" className="btn btn-secondary">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary">
            Register Student <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '70px 24px 50px', textAlign: 'center', maxWidth: '1050px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          padding: '6px 16px',
          borderRadius: '999px',
          color: '#1e40af',
          fontSize: '0.86rem',
          fontWeight: '600',
          marginBottom: '24px'
        }}>
          <Sparkles size={16} />
          B.Tech Final Year Academic Project &bull; AI-Powered Placement Readiness
        </div>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: '800',
          lineHeight: '1.15',
          color: '#0f172a',
          letterSpacing: '-0.03em',
          marginBottom: '20px'
        }}>
          Meet Your Digital <span style={{ color: '#2563eb' }}>Career Twin</span> For Campus Placements
        </h1>

        <p style={{
          fontSize: '1.18rem',
          color: '#475569',
          lineHeight: '1.6',
          maxWidth: '820px',
          margin: '0 auto 36px'
        }}>
          Instead of treating resume analysis, coding profiles, technical assessments, and roadmap planning as disconnected tools, <strong>CareerTwin</strong> unifies your entire career trajectory into a real-time predictive student profile.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
            Build My Career Twin <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 24px', fontSize: '1.05rem' }}>
            Try Demo Student Profile
          </Link>
        </div>
      </section>

      {/* The Core Concept: What Goes In -> Engine -> What Comes Out */}
      <section style={{ maxWidth: '1200px', margin: '30px auto 60px', padding: '0 24px' }}>
        <div className="card" style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
          border: '2px solid #cbd5e1',
          padding: '36px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span className="badge badge-primary">System Architecture</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1e293b', marginTop: '8px' }}>
              How the Career Twin Engine Works
            </h2>
          </div>

          <div className="grid-3" style={{ alignItems: 'stretch' }}>
            {/* Input Box */}
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: '700', marginBottom: '12px' }}>
                <Target size={20} />
                <span>1. WHAT GOES IN</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10b981" /> Target Role (Custom or Preset)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10b981" /> PDF Resume (Text, Experience, Skills)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10b981" /> Coding Profiles (GitHub, LeetCode)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10b981" /> Skill Verification Assessments
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10b981" /> Projects & Weekly Challenges
                </li>
              </ul>
            </div>

            {/* Engine Box */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
              color: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(37,99,235,0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '14px' }}>
                <Sparkles size={34} style={{ margin: '0 auto', color: '#fbbf24' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>
                2. CAREER TWIN ENGINE
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#dbeafe', lineHeight: '1.5' }}>
                Deterministic multi-factor calculation combining ATS (25%), Technical (25%), Coding (20%), Projects (15%), and Verified Skills (15%). Powered by Google Gemini AI for contextual recruiter insights.
              </p>
            </div>

            {/* Output Box */}
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '700', marginBottom: '12px' }}>
                <Award size={20} />
                <span>3. WHAT COMES OUT</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#2563eb" /> Placement Readiness Score (0-100%)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#2563eb" /> Prioritized Skill Gaps (High/Med/Low)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#2563eb" /> Multi-Phase Personalized Roadmap
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#2563eb" /> Recruiter-Style Feedback & Action Plan
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#2563eb" /> Comprehensive Placement Report
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 70px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
            Comprehensive Placement Readiness Modules
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '6px' }}>
            Everything required for student assessment, interview preparation, and college project evaluation.
          </p>
        </div>

        <div className="grid-3">
          <div className="card">
            <FileText size={28} color="#2563eb" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>ATS Resume Analyzer</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5' }}>
              Upload PDF resumes with version history (V1, V2, V3). Automatically extracts sections, identifies missing keywords, and suggests quantified bullet rewrites.
            </p>
          </div>

          <div className="card">
            <Code2 size={28} color="#7c3aed" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>Coding Profile Analyzer</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5' }}>
              Connect GitHub, LeetCode, CodeChef, and HackerRank. Evaluates DSA strength, problem difficulty distribution, and programming consistency.
            </p>
          </div>

          <div className="card">
            <Award size={28} color="#10b981" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>Skill Verification Test</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5' }}>
              Interactive timed MCQs across Java, Spring Boot, SQL, DBMS, and DSA. Provides real-time score feedback and updates verified competencies.
            </p>
          </div>

          <div className="card">
            <Map size={28} color="#f59e0b" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>Personalized Roadmap</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5' }}>
              Multi-week preparation timeline tailored to target company and role. Track topic milestones and project checkpoints dynamically.
            </p>
          </div>

          <div className="card">
            <Bot size={28} color="#ec4899" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>AI Career Guidance</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5' }}>
              Powered by Google Gemini API. Offers realistic recruiter-style evaluations, mock interview question banks with model answers, and career advice.
            </p>
          </div>

          <div className="card">
            <ShieldCheck size={28} color="#0284c7" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>Printable Placement Report</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5' }}>
              Executive summary for college placement officers and viva examiners showing progress growth, remaining gaps, and next milestones.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '30px',
        textAlign: 'center',
        borderTop: '1px solid #e2e8f0',
        background: '#ffffff',
        fontSize: '0.88rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '7px',
            backgroundColor: '#151E27',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            verticalAlign: 'middle'
          }}>
            <img src="/logo.png" alt="CareerTwin" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
          </div>
          <strong style={{ color: '#0f172a' }}>CareerTwin</strong> &bull; AI-Powered Placement Readiness and Career Guidance Platform
        </div>
        <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Developed with React 18, Spring Boot 3, MySQL 8, and Google Gemini AI &bull; B.Tech Final Year Academic Project</p>
      </footer>
    </div>
  );
};

export default LandingPage;
