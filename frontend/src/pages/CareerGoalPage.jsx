import React, { useEffect, useState } from 'react';
import { careerGoalApi } from '../services/api';
import { Target, Sparkles, CheckCircle2, Plus, X, ArrowRight, Save } from 'lucide-react';

const popularRoles = [
  'Backend Developer',
  'Software Development Engineer at Microsoft',
  'Full Stack Developer',
  'Frontend Developer',
  'AI Engineer',
  'Data Analyst',
  'Cloud & DevOps Engineer',
  'Cybersecurity Specialist'
];

const CareerGoalPage = () => {
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [description, setDescription] = useState('');
  const [targetTimeline, setTargetTimeline] = useState('Campus Placement 2026');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchCurrentGoal = async () => {
      try {
        const res = await careerGoalApi.getGoal();
        if (res.data) {
          setTargetRole(res.data.targetRole || '');
          setTargetCompany(res.data.targetCompany || '');
          setDescription(res.data.description || '');
          setTargetTimeline(res.data.targetTimeline || 'Campus Placement 2026');
          setSkills(res.data.requiredSkills || []);
        }
      } catch (err) {
        // Goal not set yet, initialize default
        handleRoleSelect('Backend Developer');
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentGoal();
  }, []);

  const handleRoleSelect = async (role) => {
    setTargetRole(role);
    try {
      const res = await careerGoalApi.getRoleSkills(role);
      if (res.data) {
        setSkills(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRoleInputChange = async (val) => {
    setTargetRole(val);
    if (val.trim().length > 2) {
      try {
        const res = await careerGoalApi.getRoleSkills(val);
        if (res.data) {
          setSkills(res.data);
        }
      } catch (e) {}
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      await careerGoalApi.saveGoal({
        targetRole,
        targetCompany,
        description,
        targetTimeline,
        customSkills: skills
      });
      setSuccessMsg('Career Goal and Required Skills saved! Your Career Twin has been updated.');
    } catch (err) {
      alert('Failed to save career goal: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Career Goal...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Career Goal Management</h1>
        <p className="page-subtitle">
          Define your custom dream career role and let CareerTwin identify the exact placement requirements
        </p>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Left Form: Goal Inputs */}
        <div className="card">
          <div className="card-title">
            <Target size={20} color="#2563eb" />
            <span>Target Role & Company</span>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">
                Custom Target Role * (Type anything or choose below)
              </label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Software Development Engineer at Microsoft"
                value={targetRole}
                onChange={(e) => handleRoleInputChange(e.target.value)}
              />
            </div>

            {/* Quick Pick Example Chips */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '8px' }}>
                Quick Pick Popular Roles:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {popularRoles.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: '500',
                      border: '1px solid #cbd5e1',
                      background: targetRole === r ? '#2563eb' : '#ffffff',
                      color: targetRole === r ? '#ffffff' : '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Target Company / Sector</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Microsoft, Amazon, Google, Fintech Startups"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Placement Timeline</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 6 Months, Campus Placement 2026"
                value={targetTimeline}
                onChange={(e) => setTargetTimeline(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Personal Career Aspiration / Notes</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Describe your career interests, dream team, or specialization..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              <Save size={18} />
              {saving ? 'Saving & Updating Twin...' : 'Save Career Goal & Update Twin'}
            </button>
          </form>
        </div>

        {/* Right Card: Identified Required Skills */}
        <div className="card">
          <div className="card-title">
            <Sparkles size={20} color="#7c3aed" />
            <span>Identified Role Skills ({skills.length})</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
            CareerTwin dynamically mapped these core technical skills as prerequisites for <strong>{targetRole || 'your target role'}</strong>.
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            maxHeight: '340px',
            overflowY: 'auto',
            padding: '12px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            {skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ffffff',
                  color: '#1e3a8a',
                  border: '1px solid #bfdbfe',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  style={{ color: '#94a3b8', hover: { color: '#ef4444' } }}
                  title="Remove skill"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          {/* Add Custom Skill Form */}
          <form onSubmit={handleAddCustomSkill} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Add another required skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary" style={{ flexShrink: 0 }}>
              <Plus size={16} /> Add
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            padding: '14px',
            background: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
            fontSize: '0.82rem',
            color: '#1e40af'
          }}>
            <strong>Next Step: </strong> Upload your latest resume PDF to compare your current profile against these required skills.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerGoalPage;
