import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeApi } from '../services/api';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  History,
  Download,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';

const ResumeUploadPage = () => {
  const [file, setFile] = useState(null);
  const [latestResume, setLatestResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!latestResume) return;
    try {
      setDownloading(true);
      await resumeApi.downloadResume(latestResume.id, latestResume.originalFileName);
    } catch (err) {
      console.error('Download error:', err);
      window.open(resumeApi.getDownloadUrl(latestResume.id), '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const fetchLatest = async () => {
    try {
      const res = await resumeApi.getLatest();
      setLatestResume(res.data);
    } catch (err) {
      // No resume yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a PDF file only.');
        setFile(null);
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError('Resume file exceeds maximum size of 10MB.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await resumeApi.uploadResume(formData);
      setSuccess(`Resume V${res.data.versionNumber} uploaded, parsed and ATS analyzed successfully!`);
      setLatestResume(res.data);
      setFile(null);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Resume Management</h1>
          <p className="page-subtitle">
            Upload your PDF resume. Each upload creates a new version (V1, V2, V3...) without overwriting past iterations.
          </p>
        </div>
        <Link to="/resume-history" className="btn btn-secondary">
          <History size={16} /> View Version History
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Upload Card */}
        <div className="card">
          <div className="card-title">
            <UploadCloud size={20} color="#2563eb" />
            <span>Upload New Resume Version</span>
          </div>

          <form onSubmit={handleUpload}>
            <div
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                background: '#f8fafc',
                cursor: 'pointer',
                marginBottom: '20px',
                transition: 'border-color 0.2s ease'
              }}
              onClick={() => document.getElementById('resumeFileInput').click()}
            >
              <UploadCloud size={44} color="#3b82f6" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                {file ? file.name : 'Click to browse or drag and drop your PDF resume'}
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px' }}>
                Supported Format: PDF only &bull; Max Size: 10MB
              </p>
              <input
                id="resumeFileInput"
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            {file && (
              <div style={{
                background: '#eff6ff',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.86rem',
                color: '#1e40af'
              }}>
                <FileText size={18} />
                <span style={{ flex: 1, fontWeight: '600' }}>{file.name}</span>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !file}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              {uploading ? 'Parsing with Apache PDFBox & Analyzing ATS...' : 'Upload & Run ATS Analysis'}
            </button>
          </form>

          <div style={{
            marginTop: '20px',
            fontSize: '0.8rem',
            color: '#64748b',
            lineHeight: '1.5'
          }}>
            <strong>Automatic Processing: </strong>
            Upon upload, CareerTwin extracts technical skills, verifies project impact metrics, generates ATS feedback, and updates your Placement Readiness score immediately.
          </div>
        </div>

        {/* Latest Active Resume Version Card */}
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="#10b981" />
              <span>Current Active Resume</span>
            </div>
            {latestResume && (
              <span className="badge badge-low">
                Version {latestResume.versionNumber}
              </span>
            )}
          </div>

          {latestResume ? (
            <div>
              <div style={{
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={32} color="#2563eb" />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: '700', color: '#1e293b' }}>
                      {latestResume.originalFileName}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Uploaded on {new Date(latestResume.uploadedAt).toLocaleDateString()} &bull; Version {latestResume.versionNumber}
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn btn-outline"
                    style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                  >
                    <Download size={14} /> {downloading ? 'Downloading...' : 'Download'}
                  </button>
                </div>
              </div>

              {/* Extracted Skills Preview */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                  Extracted Technical Skills ({latestResume.parsedSkills?.length || 0}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {latestResume.parsedSkills && latestResume.parsedSkills.length > 0 ? (
                    latestResume.parsedSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: '#f1f5f9',
                          color: '#334155',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: '600'
                        }}
                      >
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No skills extracted</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/ats" className="btn btn-primary" style={{ flex: 1 }}>
                  <Sparkles size={16} /> View Full ATS Analysis
                </Link>
                <Link to="/resume-history" className="btn btn-secondary">
                  Compare History
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <FileText size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
              <p>No resume uploaded yet.</p>
              <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>
                Upload your first version using the form on the left.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUploadPage;
