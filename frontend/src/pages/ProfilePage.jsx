import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';
import {
  User,
  Save,
  Lock,
  CheckCircle2,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    fullName: '',
    college: '',
    branch: '',
    year: '3rd Year',
    graduationYear: 2026,
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileApi.getProfile();
        if (res.data) {
          setProfileData({
            fullName: res.data.fullName || '',
            college: res.data.college || '',
            branch: res.data.branch || '',
            year: res.data.year || '3rd Year',
            graduationYear: res.data.graduationYear || 2026,
            phone: res.data.phone || '',
          });
          setCompletion(res.data.completionPercentage || 85);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    try {
      await profileApi.updateProfile({
        ...profileData,
        graduationYear: parseInt(profileData.graduationYear, 10),
      });
      setProfileSuccess('Profile updated successfully!');
      refreshProfile();
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }

    try {
      await profileApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPwSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.message || 'Failed to change password');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Student Profile Management</h1>
        <p className="page-subtitle">
          Manage your academic background, institution credentials, and account security.
        </p>
      </div>

      {/* Profile Completion Bar */}
      <div className="card" style={{ marginBottom: '26px', padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '8px' }}>
          <span>Profile Completeness</span>
          <strong>{completion}%</strong>
        </div>
        <div className="progress-container" style={{ height: '8px' }}>
          <div className="progress-fill" style={{ width: `${completion}%`, background: '#2563eb' }} />
        </div>
      </div>

      <div className="grid-2">
        {/* Personal & Academic Details */}
        <div className="card">
          <div className="card-title">
            <GraduationCap size={20} color="#2563eb" />
            <span>Academic Information</span>
          </div>

          {profileSuccess && (
            <div className="alert alert-success" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} /> <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="alert alert-danger" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
              <AlertCircle size={16} /> <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                className="form-control"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">College / Institute</label>
              <input
                type="text"
                className="form-control"
                value={profileData.college}
                onChange={(e) => setProfileData({ ...profileData, college: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Branch / Department</label>
              <input
                type="text"
                className="form-control"
                value={profileData.branch}
                onChange={(e) => setProfileData({ ...profileData, branch: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <select
                  className="form-control"
                  value={profileData.year}
                  onChange={(e) => setProfileData({ ...profileData, year: e.target.value })}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year (Final)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <input
                  type="number"
                  className="form-control"
                  value={profileData.graduationYear}
                  onChange={(e) => setProfileData({ ...profileData, graduationYear: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="+91 9876543210"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
              <Save size={16} /> Save Changes
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-title">
            <Lock size={20} color="#7c3aed" />
            <span>Security & Password</span>
          </div>

          {pwSuccess && (
            <div className="alert alert-success" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} /> <span>{pwSuccess}</span>
            </div>
          )}

          {pwError && (
            <div className="alert alert-danger" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
              <AlertCircle size={16} /> <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                required
                className="form-control"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password * (Min 6 chars)</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-control"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-control"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '10px', marginTop: '10px' }}>
              <Lock size={16} /> Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
