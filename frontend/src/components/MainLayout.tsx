import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isStaffOrAdmin = user && (user.role === 'STAFF' || user.role === 'ADMIN' || user.role === 'PROVIDER');

  return (
    <div className="neo-container">
      <header className="neo-header" style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: '3px solid #000', paddingBottom: '1.25rem', marginBottom: '2rem' }}>
        <Link to="/" className="neo-link-reset" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div>
            <h1 style={{ marginBottom: 0, fontSize: '2rem', letterSpacing: '-0.05em' }}>QueueLess</h1>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#555' }}>
              Virtual Queues & Appointment Scheduling
            </span>
          </div>
        </Link>

        <nav className="neo-nav" style={{ flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/"
            className={`neo-btn ${location.pathname === '/' ? '' : 'neo-btn-secondary'}`}
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
          >
            Browse Desks
          </Link>

          {user ? (
            <>
              {/* Customer Links */}
              <Link
                to="/my-appointments"
                className={`neo-btn ${location.pathname.startsWith('/my-appointments') ? '' : 'neo-btn-secondary'}`}
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
              >
                My Queue & Bookings
              </Link>

              {/* Staff / Admin Links */}
              {isStaffOrAdmin && (
                <Link
                  to="/staff/dashboard"
                  className={`neo-btn ${location.pathname.startsWith('/staff/dashboard') ? '' : 'neo-btn-secondary'}`}
                  style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', backgroundColor: '#ffd43b', color: '#000' }}
                >
                  ⚡ Queue Desk
                </Link>
              )}

              {/* User Identity Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#fff',
                  border: 'var(--border-thick)',
                  padding: '0.35rem 0.75rem',
                  boxShadow: '2px 2px 0 0 #000',
                }}
              >
                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  {user.name}
                </span>
                <span
                  className="neo-tag neo-tag-black"
                  style={{ fontSize: '0.65rem', padding: '0.15rem 0.35rem' }}
                >
                  {user.role}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="neo-btn neo-btn-black"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="neo-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="neo-btn neo-btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      <main style={{ minHeight: '70vh' }}>
        <Outlet />
      </main>

      <footer
        style={{
          marginTop: '4rem',
          padding: '1.5rem 0',
          borderTop: 'var(--border-thick)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          fontWeight: 700,
        }}
      >
        <div>
          <span>© {new Date().getFullYear()} QueueLess — Concurrency-Safe Queue & Scheduling Platform.</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2b8a3e', display: 'inline-block' }}></span>
            Neon Postgres + Upstash Redis Online
          </span>
        </div>
      </footer>
    </div>
  );
}
