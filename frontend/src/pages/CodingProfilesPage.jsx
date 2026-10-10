import React, { useEffect, useState } from 'react';
import { codingProfileApi } from '../services/api';
import {
  Code2,
  RefreshCw,
  Plus,
  CheckCircle2,
  GitBranch,
  Award,
  Activity,
  ExternalLink,
  Save,
  Trash2,
  Edit3,
  X
} from 'lucide-react';

const platformsList = [
  { key: 'LEETCODE', name: 'LeetCode', placeholder: 'e.g. chinmai_dharmana or leetcode username', color: '#f89f1b', live: true },
  { key: 'GITHUB', name: 'GitHub', placeholder: 'e.g. chinmai-123 or github username', color: '#24292e', live: true },
  { key: 'CODECHEF', name: 'CodeChef', placeholder: 'e.g. tourist or codechef handle', color: '#5b4638', live: false },
  { key: 'HACKERRANK', name: 'HackerRank', placeholder: 'e.g. hackerrank_id', color: '#2ec866', live: false },
  { key: 'GEEKSFORGEEKS', name: 'GeeksforGeeks', placeholder: 'e.g. gfg_handle', color: '#2f8d46', live: false }
];

const sanitizeHandle = (input) => {
  if (!input) return '';
  let s = input.trim();
  while (s.endsWith('/')) {
    s = s.substring(0, s.length - 1);
  }
  if (s.startsWith('@')) {
    s = s.substring(1);
  }
  if (s.includes('?')) {
    s = s.substring(0, s.indexOf('?'));
  }
  if (s.includes('/')) {
    const lastSlash = s.lastIndexOf('/');
    s = s.substring(lastSlash + 1);
  }
  return s.trim();
};

const CodingProfilesPage = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('LEETCODE');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [syncingMap, setSyncingMap] = useState({});
  const [message, setMessage] = useState('');
  const [editingProfile, setEditingProfile] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchProfiles = async () => {
    try {
      const res = await codingProfileApi.getProfiles();
      setProfiles(res.data || []);
    } catch (err) {
      console.error('Error fetching coding profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleUsernameChange = (e) => {
    const raw = e.target.value;
    // Auto sanitize on paste or type if it looks like a URL
    if (raw.includes('/') || raw.startsWith('@')) {
      setUsername(sanitizeHandle(raw));
    } else {
      setUsername(raw);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const cleanUser = sanitizeHandle(username);
    if (!cleanUser) return;

    setSubmitting(true);
    setMessage('');

    try {
      await codingProfileApi.saveProfile({
        platform: selectedPlatform,
        username: cleanUser
      });
      setMessage(`Successfully connected and synced ${selectedPlatform} profile!`);
      setUsername('');
      await fetchProfiles();
    } catch (err) {
      alert('Failed to connect profile: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSync = async (platform) => {
    setSyncingMap(prev => ({ ...prev, [platform]: true }));
    setMessage('');
    try {
      await codingProfileApi.syncProfile(platform);
      setMessage(`Updated and synced latest ${platform} metrics!`);
      await fetchProfiles();
    } catch (err) {
      console.error('Failed to sync profile:', err);
      alert('Sync failed: ' + (err.message || 'Network error'));
    } finally {
      setSyncingMap(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleDelete = async (id, platform) => {
    if (!window.confirm(`Are you sure you want to disconnect ${platform}?`)) return;
    try {
      await codingProfileApi.deleteProfile(id);
      setMessage(`Disconnected ${platform} profile.`);
      await fetchProfiles();
    } catch (err) {
      alert('Failed to delete profile: ' + err.message);
    }
  };

  const openEditModal = (p) => {
    setEditingProfile(p);
    setEditForm({
      totalSolved: p.totalSolved || 0,
      easySolved: p.easySolved || 0,
      mediumSolved: p.mediumSolved || 0,
      hardSolved: p.hardSolved || 0,
      rating: p.rating || 0,
      publicRepos: p.publicRepos || 0,
      contributionsCount: p.contributionsCount || 0
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingProfile) return;

    try {
      await codingProfileApi.saveProfile({
        platform: editingProfile.platform,
        username: editingProfile.username,
        profileUrl: editingProfile.profileUrl,
        totalSolved: parseInt(editForm.totalSolved) || 0,
        easySolved: parseInt(editForm.easySolved) || 0,
        mediumSolved: parseInt(editForm.mediumSolved) || 0,
        hardSolved: parseInt(editForm.hardSolved) || 0,
        rating: parseInt(editForm.rating) || 0,
        publicRepos: parseInt(editForm.publicRepos) || 0,
        contributionsCount: parseInt(editForm.contributionsCount) || 0
      });
      setMessage(`Manual metrics saved for ${editingProfile.platform}!`);
      setEditingProfile(null);
      await fetchProfiles();
    } catch (err) {
      alert('Failed to update metrics: ' + err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading coding profiles...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Coding Profile Analyzer</h1>
        <p className="page-subtitle">
          Connect your coding platforms to evaluate DSA strength, problem solving consistency, and project repositories.
        </p>
      </div>

      {message && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Connect Profile Form */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-title">
          <Plus size={20} color="#2563eb" />
          <span>Connect or Update Coding Profile</span>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="grid-3" style={{ alignItems: 'flex-end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Platform</label>
              <select
                className="form-control"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
              >
                {platformsList.map(p => (
                  <option key={p.key} value={p.key}>
                    {p.name} {p.live ? '(Live API Sync)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">
                Username / Handle *
              </label>
              <input
                type="text"
                required
                className="form-control"
                placeholder={platformsList.find(p => p.key === selectedPlatform)?.placeholder}
                value={username}
                onChange={handleUsernameChange}
                onBlur={() => setUsername(sanitizeHandle(username))}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting || !username.trim()}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px' }}
              >
                <Save size={16} />
                {submitting ? 'Connecting & Analyzing...' : 'Connect Profile'}
              </button>
            </div>
          </div>
          <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#64748b' }}>
            💡 Tip: You can paste your profile URL or your username directly (e.g. <code>https://leetcode.com/u/chinmai_dharmana/</code> or <code>chinmai_dharmana</code>). The handle is automatically extracted and synced.
          </div>
        </form>
      </div>

      {/* Connected Profiles List */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
          Connected Platforms ({profiles.length})
        </h2>

        {profiles.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <Code2 size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#64748b' }}>No coding profiles connected yet. Connect your LeetCode or GitHub above.</p>
          </div>
        ) : (
          <div className="grid-2">
            {profiles.map((p) => {
              const isSyncing = syncingMap[p.platform];
              const isGithub = p.platform === 'GITHUB';
              return (
                <div key={p.id} className="card" style={{ borderTop: `4px solid #2563eb` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b' }}>
                          {p.platform}
                        </h3>
                        <span className="badge badge-low">
                          <CheckCircle2 size={12} /> Connected
                        </span>
                        {p.verified && (
                          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                            Verified
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                        @{p.username} &bull; {p.rankName || 'Active Coder'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openEditModal(p)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                        title="Manually edit stats"
                      >
                        <Edit3 size={13} /> Edit
                      </button>

                      <button
                        onClick={() => handleSync(p.platform)}
                        disabled={isSyncing}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                        title="Sync live profile data"
                      >
                        <RefreshCw size={13} className={isSyncing ? 'spin' : ''} />
                        {isSyncing ? 'Syncing...' : 'Sync'}
                      </button>

                      <button
                        onClick={() => handleDelete(p.id, p.platform)}
                        className="btn btn-outline"
                        style={{ padding: '6px 8px', color: '#ef4444', borderColor: '#fca5a5' }}
                        title="Disconnect profile"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    padding: '14px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    {isGithub ? (
                      <>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>{p.publicRepos}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Public Repos</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>{p.contributionsCount}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Contributions</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#2563eb' }}>{p.activityScore}%</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Activity Score</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>{p.totalSolved}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Total Solved</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#059669' }}>
                            {p.mediumSolved || 0} <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>+{p.hardSolved || 0}H</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Med + Hard</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#2563eb' }}>{p.dsaScore}%</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>DSA Score</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Rating / Additional Details */}
                  {!isGithub && p.rating > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      color: '#475569',
                      padding: '6px 10px',
                      background: '#f1f5f9',
                      borderRadius: '6px',
                      marginBottom: '12px'
                    }}>
                      <span>Contest Rating: <strong>{p.rating}</strong></span>
                      <span>Difficulty Breakdown: <strong>{p.easySolved}E / {p.mediumSolved}M / {p.hardSolved}H</strong></span>
                    </div>
                  )}

                  {/* Languages Used */}
                  {p.topLanguages && p.topLanguages.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Languages:</span>
                      {p.topLanguages.map((lang, idx) => (
                        <span key={idx} className="badge badge-primary" style={{ textTransform: 'none' }}>
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
                    Last Synced: {p.lastSyncedAt ? new Date(p.lastSyncedAt).toLocaleString() : 'Recently'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Edit Modal */}
      {editingProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', margin: 0, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>
                Edit {editingProfile.platform} Metrics
              </h3>
              <button
                onClick={() => setEditingProfile(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Override or update your metrics manually if your platform profile is private or external APIs are restricted.
            </p>

            <form onSubmit={handleSaveEdit}>
              {editingProfile.platform === 'GITHUB' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Public Repositories</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={editForm.publicRepos}
                      onChange={(e) => setEditForm({ ...editForm, publicRepos: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Contributions Count</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={editForm.contributionsCount}
                      onChange={(e) => setEditForm({ ...editForm, contributionsCount: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Total Solved</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={editForm.totalSolved}
                        onChange={(e) => setEditForm({ ...editForm, totalSolved: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Contest Rating</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={editForm.rating}
                        onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label className="form-label">Easy</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={editForm.easySolved}
                        onChange={(e) => setEditForm({ ...editForm, easySolved: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Medium</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={editForm.mediumSolved}
                        onChange={(e) => setEditForm({ ...editForm, mediumSolved: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Hard</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={editForm.hardSolved}
                        onChange={(e) => setEditForm({ ...editForm, hardSolved: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Save Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingProfilesPage;
