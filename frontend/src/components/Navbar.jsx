import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, User as UserIcon, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      {/* Role / Context Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f1f5f9',
          padding: '6px 14px',
          borderRadius: '999px',
          border: '1px solid #e2e8f0'
        }}>
          <Sparkles size={16} color="#2563eb" />
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
            Career Twin Status: <strong style={{ color: '#2563eb' }}>Synchronized</strong>
          </span>
        </div>
      </div>

      {/* Right Controls: User Profile + Notifications + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#e0e7ff',
            color: '#3730a3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '14px'
          }}>
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1e293b', lineHeight: '1.2' }}>
              {user?.fullName || 'Student'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {user?.college || 'B.Tech Student'}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.82rem' }}
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
