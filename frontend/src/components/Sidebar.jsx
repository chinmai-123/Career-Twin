import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  FileText,
  History,
  CheckCircle2,
  Code2,
  Award,
  Sparkles,
  GitPullRequest,
  Map,
  Briefcase,
  Trophy,
  LineChart,
  FileBarChart,
  User,
  Settings,
  Bot
} from 'lucide-react';

const Sidebar = () => {
  const navSections = [
    {
      title: 'Core Engine',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Career Twin', path: '/career-twin', icon: Sparkles, badge: 'Core' },
        { name: 'Placement Readiness', path: '/skill-gap', icon: GitPullRequest },
      ]
    },
    {
      title: 'Profile & Analysis',
      items: [
        { name: 'Career Goal', path: '/career-goal', icon: Target },
        { name: 'Resume Upload', path: '/resume', icon: FileText },
        { name: 'Resume History', path: '/resume-history', icon: History },
        { name: 'ATS Analyzer', path: '/ats', icon: CheckCircle2 },
        { name: 'Coding Profiles', path: '/coding-profiles', icon: Terminal },
        { name: 'Skill Verification', path: '/skill-verification', icon: Award, badge: 'MCQ' },
        { name: 'Coding Assessment', path: '/coding-assessment', icon: Code2, badge: 'Live' },
      ]
    },
    {
      title: 'Action & Growth',
      items: [
        { name: 'Personalized Roadmap', path: '/roadmap', icon: Map },
        { name: 'Recommended Projects', path: '/projects', icon: Briefcase },
        { name: 'Weekly Challenges', path: '/challenges', icon: Trophy },
        { name: 'AI Career Guidance', path: '/ai-guidance', icon: Bot, badge: 'Gemini' },
        { name: 'Progress & Analytics', path: '/progress', icon: LineChart },
        { name: 'Placement Report', path: '/reports', icon: FileBarChart },
      ]
    },
    {
      title: 'Account',
      items: [
        { name: 'My Profile', path: '/profile', icon: User },
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Logo Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '18px',
          boxShadow: '0 4px 10px rgba(37,99,235,0.3)'
        }}>
          CT
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e3a8a', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
            CareerTwin
          </h2>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>
            AI Placement Twin
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: '#94a3b8',
              letterSpacing: '0.06em',
              padding: '0 12px 6px'
            }}>
              {sec.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {sec.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? '600' : '500',
                      color: isActive ? '#2563eb' : '#475569',
                      background: isActive ? '#eff6ff' : 'transparent',
                      transition: 'all 0.15s ease'
                    })}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        padding: '2px 6px',
                        borderRadius: '999px',
                        background: item.badge === 'Core' ? '#dbeafe' : '#ede9fe',
                        color: item.badge === 'Core' ? '#1e40af' : '#6d28d9'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div style={{
        padding: '14px 20px',
        borderTop: '1px solid var(--border)',
        fontSize: '0.75rem',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>B.Tech Academic Mini-Project</span>
        <span style={{ fontWeight: '600', color: '#2563eb' }}>v1.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
