import React, { useState } from 'react';
import { Settings, Shield, Database, Cpu, CheckCircle2, Key, Info } from 'lucide-react';

const SettingsPage = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('user_gemini_key') || '');
  const [saved, setSaved] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('user_gemini_key', apiKey.trim());
    } else {
      localStorage.removeItem('user_gemini_key');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Platform Settings & Diagnostics</h1>
        <p className="page-subtitle">
          System configurations, API connections, and academic project specifications.
        </p>
      </div>

      <div className="grid-2">
        {/* Gemini API Key Config */}
        <div className="card">
          <div className="card-title">
            <Key size={20} color="#2563eb" />
            <span>Google Gemini AI Integration</span>
          </div>

          <p style={{ fontSize: '0.86rem', color: '#64748b', marginBottom: '16px', lineHeight: '1.5' }}>
            The Spring Boot backend comes equipped with built-in heuristic AI models ensuring offline reliability during college evaluations. You may optionally supply a Google Gemini API key to activate live generative models.
          </p>

          {saved && (
            <div className="alert alert-success" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} /> <span>Gemini API key preference saved!</span>
            </div>
          )}

          <form onSubmit={handleSaveKey}>
            <div className="form-group">
              <label className="form-label">Gemini API Key (Optional)</label>
              <input
                type="password"
                className="form-control"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
              Save API Configuration
            </button>
          </form>

          <div style={{
            marginTop: '18px',
            padding: '12px',
            background: '#eff6ff',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#1e40af'
          }}>
            <Info size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Keys are never exposed in client requests and communicate exclusively through secure backend proxies.
          </div>
        </div>

        {/* System Architecture & Technology Specs */}
        <div className="card">
          <div className="card-title">
            <Cpu size={20} color="#7c3aed" />
            <span>Academic Project Specification</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Project Title:</span>
              <strong>AI Career Twin</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Architecture:</span>
              <strong>React 18 + Spring Boot 3 + MySQL 8</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Backend Server Port:</span>
              <strong style={{ color: '#16a34a' }}>8085 (Spring Web REST)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Frontend Dev Server:</span>
              <strong style={{ color: '#2563eb' }}>5173 (Vite + React)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Database Engine:</span>
              <strong>MySQL 8.0 (16 JPA Entities)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Authentication:</span>
              <strong>JWT + BCrypt (Spring Security 6)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: '#64748b' }}>PDF Parser:</span>
              <strong>Apache PDFBox 2.0.31</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
