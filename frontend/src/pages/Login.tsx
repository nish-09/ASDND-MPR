import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { apiFetch, ApiError } from '../api';
import { useAuth, User } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await apiFetch<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      login(data.token, data.user);
      if (from && from !== '/') {
        navigate(from, { replace: true });
      } else if (data.user.role === 'STAFF' || data.user.role === 'ADMIN' || data.user.role === 'PROVIDER') {
        navigate('/staff/dashboard', { replace: true });
      } else {
        navigate('/my-appointments', { replace: true });
      }
    } catch (err: any) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="neo-flex-center neo-page-min-height" style={{ padding: '2rem 1rem' }}>
      <div className="neo-card neo-auth-card" style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="neo-tag">QueueLess Auth</span>
          <Link to="/" className="neo-link-reset" style={{ fontSize: '0.85rem', fontWeight: 800 }}>← Back Home</Link>
        </div>

        <h2>Sign In</h2>
        <p className="neo-text-muted" style={{ marginBottom: '1.25rem' }}>
          Enter your credentials to manage appointments & live queue tokens.
        </p>

        {error && (
          <div className="neo-error-banner" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="neo-form">
          <div>
            <label className="neo-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="neo-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="neo-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="neo-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="neo-btn neo-mt-4"
            disabled={isLoading}
            style={{ width: '100%', fontSize: '1rem' }}
          >
            {isLoading ? 'Verifying...' : 'Sign In →'}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '2px dashed #000' }}>
          <p className="neo-label" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', color: '#555' }}>
            Quick Demo Accounts (Click to Fill):
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@queueless.com')}
              className="neo-btn neo-btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff1@smithclinic.com')}
              className="neo-btn"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', backgroundColor: '#ffd43b', color: '#000' }}
            >
              Clinic Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('staff1@citybank.com')}
              className="neo-btn"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', backgroundColor: '#74c0fc', color: '#000' }}
            >
              Bank Staff
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('customer1@example.com')}
              className="neo-btn neo-btn-black"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
            >
              Customer
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span>Don't have an account? </span>
          <Link to="/register" style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
