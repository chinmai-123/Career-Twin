import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('student@careertwin.edu');
    setPassword('password123');
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            fontSize: '22px',
            fontWeight: 'bold'
          }}>
            CT
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1e293b' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
            Sign in to access your AI Career Twin & Readiness metrics
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ padding: '10px 14px', fontSize: '0.86rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="e.g. student@careertwin.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : (
              <>
                <LogIn size={18} />
                Sign In to CareerTwin
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Button for Viva / Evaluation */}
        <div style={{
          marginTop: '22px',
          padding: '14px',
          background: '#eff6ff',
          borderRadius: '10px',
          border: '1px dashed #93c5fd',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
            College Viva / Quick Demonstration:
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="btn btn-outline"
            style={{ width: '100%', fontSize: '0.82rem', padding: '6px 12px' }}
          >
            <Sparkles size={14} /> Fill Demo Student Credentials
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.88rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: '600' }}>
            Register as a Student
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
