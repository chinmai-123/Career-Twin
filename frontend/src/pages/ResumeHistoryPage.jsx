import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resumeApi } from '../services/api';
import { History, FileText, Download, CheckCircle, ArrowLeft, UploadCloud, Sparkles } from 'lucide-react';

const ResumeHistoryPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (id, fileName) => {
    try {
      setDownloadingId(id);
      await resumeApi.downloadResume(id, fileName);
    } catch (err) {
      console.error('Download error:', err);
      window.open(resumeApi.getDownloadUrl(id), '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await resumeApi.getHistory();
        setResumes(res.data || []);
      } catch (err) {
        console.error('Error fetching resume history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading resume version history...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Resume Version History</h1>
          <p className="page-subtitle">
            Track resume revisions over time. Previous versions are retained for progress comparison.
          </p>
        </div>
        <Link to="/resume" className="btn btn-primary">
          <UploadCloud size={16} /> Upload New Version
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px' }}>
          <FileText size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3>No Resume Versions Found</h3>
          <p style={{ color: '#64748b', margin: '8px 0 16px' }}>Upload your first version to start tracking revisions.</p>
          <Link to="/resume" className="btn btn-primary">
            Upload Resume
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Original Filename</th>
                  <th>Upload Date & Time</th>
                  <th>File Size</th>
                  <th>Skills Extracted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resumes.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span style={{
                        fontWeight: '700',
                        color: r.latest ? '#2563eb' : '#475569',
                        fontSize: '0.92rem'
                      }}>
                        Version {r.versionNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} color="#2563eb" />
                        <span style={{ fontWeight: '500' }}>{r.originalFileName}</span>
                      </div>
                    </td>
                    <td>{new Date(r.uploadedAt).toLocaleString()}</td>
                    <td>{(r.fileSize / 1024).toFixed(1)} KB</td>
                    <td>
                      <span className="badge badge-primary">
                        {r.parsedSkills?.length || 0} skills
                      </span>
                    </td>
                    <td>
                      {r.latest ? (
                        <span className="badge badge-low">
                          <CheckCircle size={12} /> Latest Active
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          Archived
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link
                          to={`/ats?resumeId=${r.id}`}
                          className="btn btn-outline"
                          style={{ padding: '4px 8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="View ATS Analysis for this version"
                        >
                          <Sparkles size={12} color="#2563eb" /> ATS Score
                        </Link>
                        <button
                          onClick={() => handleDownload(r.id, r.originalFileName)}
                          disabled={downloadingId === r.id}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                        >
                          <Download size={13} /> {downloadingId === r.id ? 'Downloading...' : 'Download'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeHistoryPage;
