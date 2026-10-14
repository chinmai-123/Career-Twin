import React, { useEffect, useState } from 'react';
import { roadmapApi } from '../services/api';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await roadmapApi.getProjects();
      setProjects(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await roadmapApi.updateProjectStatus(projectId, newStatus);
      await fetchProjects();
    } catch (err) {
      alert('Error updating project status: ' + err.message);
    }
  };

  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!window.confirm("Regenerate projects tailored specifically to your academic year and verified skill gaps?")) {
      return;
    }
    try {
      setRegenerating(true);
      const res = await roadmapApi.regenerateProjects();
      setProjects(res.data || []);
    } catch (err) {
      alert('Error regenerating projects: ' + err.message);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading recommended projects...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Recommended Placement Projects</h1>
          <p className="page-subtitle">
            Projects strategically personalized for your academic year and prioritized to bridge your verified skill gaps.
          </p>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Sparkles size={16} />
          {regenerating ? 'Regenerating...' : 'AI Refresh Recommendations'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {projects.map((project) => {
          const isCompleted = project.status === 'COMPLETED';
          const isInProgress = project.status === 'IN_PROGRESS';

          return (
            <div
              key={project.id}
              className="card"
              style={{
                borderLeft: `6px solid ${isCompleted ? '#10b981' : isInProgress ? '#2563eb' : '#94a3b8'}`,
                background: isCompleted ? '#f0fdf4' : '#ffffff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className={`badge badge-${project.difficulty === 'ADVANCED' ? 'high' : project.difficulty === 'INTERMEDIATE' ? 'medium' : 'low'}`}>
                      {project.difficulty}
                    </span>
                    <span className="badge badge-primary">
                      Status: {project.status}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' }}>
                    {project.title}
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {!isCompleted && !isInProgress && (
                    <button
                      onClick={() => handleStatusChange(project.id, 'IN_PROGRESS')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.84rem', padding: '6px 14px' }}
                    >
                      Start Project
                    </button>
                  )}
                  {isInProgress && (
                    <button
                      onClick={() => handleStatusChange(project.id, 'COMPLETED')}
                      className="btn btn-primary"
                      style={{ fontSize: '0.84rem', padding: '6px 14px', background: '#10b981' }}
                    >
                      <CheckCircle2 size={16} /> Mark Completed
                    </button>
                  )}
                  {isCompleted && (
                    <button
                      onClick={() => handleStatusChange(project.id, 'IN_PROGRESS')}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.84rem', padding: '6px 14px' }}
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.9rem', color: '#475569', margin: '14px 0', lineHeight: '1.6' }}>
                {project.description}
              </p>

              {/* Relevance Reason */}
              <div style={{
                background: '#eff6ff',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#1e40af',
                marginBottom: '16px',
                border: '1px solid #bfdbfe'
              }}>
                <Sparkles size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-3px' }} />
                <strong>Why this is recommended: </strong> {project.relevanceReason}
              </div>

              {/* Technologies */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Tech Stack:</span>
                {project.technologies && project.technologies.map((t, i) => (
                  <span key={i} className="badge badge-primary" style={{ fontSize: '0.78rem' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsPage;
