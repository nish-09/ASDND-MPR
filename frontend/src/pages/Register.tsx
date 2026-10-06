import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { apiFetch, ApiError } from '../api';
import { useAuth, User, Role } from '../contexts/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiFetch<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
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
      setError(apiErr.message || 'Failed to register account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="neo-flex-center neo-page-min-height" style={{ padding: '2rem 1rem' }}>
      <div className="neo-card neo-auth-card" style={{ maxWidth: '460px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="neo-tag">New Account</span>
          <Link to="/" className="neo-link-reset" style={{ fontSize: '0.85rem', fontWeight: 800 }}>← Back Home</Link>
        </div>

        <h2>Create Account</h2>
        <p className="neo-text-muted" style={{ marginBottom: '1.25rem' }}>
          Register to book time slots, check in, and track live queue progress.
        </p>

        {error && (
          <div className="neo-error-banner" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="neo-form">
          <div>
            <label className="neo-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="neo-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label className="neo-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="neo-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="neo-label" htmlFor="password">Password (8+ chars)</label>
            <input
              id="password"
              type="password"
              className="neo-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="neo-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="neo-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="neo-label" htmlFor="role">Account Type</label>
            <select
              id="role"
              className="neo-input"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="CUSTOMER">Customer (Book & Join Queue)</option>
              <option value="STAFF">Staff (Manage Provider Desks)</option>
            </select>
          </div>

          <button
            type="submit"
            className="neo-btn neo-mt-4"
            disabled={isLoading}
            style={{ width: '100%', fontSize: '1rem' }}
          >
            {isLoading ? 'Creating Account...' : 'Register Account →'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <span>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 800, color: 'var(--color-primary)' }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
