import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, ApiError } from '../api';
import { useAuth } from '../contexts/AuthContext';

interface Service {
  id: string;
  name: string;
  durationMin: number;
  isActive: boolean;
}

interface Provider {
  id: string;
  name: string;
  category: string;
  timezone: string;
  isActive: boolean;
  services: Service[];
}

export default function Home() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Provider[] }>('/providers')
      .then((res) => {
        setProviders(res.data || []);
      })
      .catch((err: any) => {
        const apiErr = err as ApiError;
        setError(apiErr.message || 'Failed to fetch providers');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="neo-card neo-hero" style={{ padding: '3rem 2rem' }}>
        <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
          <span className="neo-tag neo-tag-black">Real-time Virtual Queuing</span>
        </div>
        <h2 className="neo-hero-title" style={{ fontSize: '2.8rem', lineHeight: 1.1 }}>
          Skip the physical line.<br />Never lose your spot.
        </h2>
        <p className="neo-hero-subtitle" style={{ maxWidth: '700px', marginBottom: '2rem' }}>
          QueueLess provides concurrency-safe appointment booking, live token issue,
          real-time ETA calculations, and instant alerts for clinics, banks, and service desks.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {!user ? (
            <>
              <Link to="/register" className="neo-btn neo-btn-large">
                Get Started Free →
              </Link>
              <Link to="/login" className="neo-btn neo-btn-secondary neo-btn-large">
                Sign In to Dashboard
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="neo-tag" style={{ fontSize: '1rem', padding: '0.6rem 1rem' }}>
                Logged in as {user.name} ({user.role})
              </span>
              <a href="#providers-section" className="neo-btn">
                Browse Active Providers ↓
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── Core Value / Workflow Cards ────────────────────────── */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="neo-tag">Engineered For Zero Friction</span>
          <h2 style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>How QueueLess Works</h2>
        </div>

        <div className="neo-grid">
          <div className="neo-card">
            <span className="neo-tag neo-tag-black" style={{ marginBottom: '0.75rem' }}>Step 01</span>
            <h3 style={{ fontSize: '1.25rem' }}>Book In Advance</h3>
            <p className="neo-text-muted">
              Select an exact time slot with atomic database locking. Concurrency-safe index guarantees zero double-bookings even during traffic spikes.
            </p>
          </div>

          <div className="neo-card">
            <span className="neo-tag" style={{ marginBottom: '0.75rem', backgroundColor: '#ffd43b', color: '#000' }}>Step 02</span>
            <h3 style={{ fontSize: '1.25rem' }}>Instant Check-In</h3>
            <p className="neo-text-muted">
              Check in within the −30 to +60 min window. An atomic token sequence (e.g., <strong>A-012</strong>) is issued directly to your device.
            </p>
          </div>

          <div className="neo-card">
            <span className="neo-tag" style={{ marginBottom: '0.75rem', backgroundColor: '#74c0fc', color: '#000' }}>Step 03</span>
            <h3 style={{ fontSize: '1.25rem' }}>Live ETA & Position</h3>
            <p className="neo-text-muted">
              Watch your position countdown in real time. Dynamic ETAs calculate average service durations so you never wait idly in a lobby.
            </p>
          </div>

          <div className="neo-card">
            <span className="neo-tag" style={{ marginBottom: '0.75rem', backgroundColor: '#69db7c', color: '#000' }}>Step 04</span>
            <h3 style={{ fontSize: '1.25rem' }}>Service & Notify</h3>
            <p className="neo-text-muted">
              Staff call the next attendee via transactional outbox workers. Receive instant alerts when it is your turn to be served.
            </p>
          </div>
        </div>
      </section>

      {/* ── Available Providers Section ─────────────────────────── */}
      <section id="providers-section" style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <span className="neo-tag">Active Service Desks</span>
            <h2 style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>Browse Available Providers</h2>
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>
            {providers.length} {providers.length === 1 ? 'Provider' : 'Providers'} Online
          </span>
        </div>

        {loading ? (
          <div className="neo-card neo-flex-center" style={{ padding: '3rem' }}>
            <h3>Loading Providers from Neon PostgreSQL...</h3>
          </div>
        ) : error ? (
          <div className="neo-error-banner">
            <p><strong>Database Notice:</strong> {error}</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="neo-card">
            <h3>No Providers Available</h3>
            <p className="neo-text-muted">No providers are currently registered in the database.</p>
          </div>
        ) : (
          <div className="neo-grid">
            {providers.map((provider) => (
              <div key={provider.id} className="neo-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="neo-flex-between" style={{ marginBottom: '0.75rem' }}>
                    <span className="neo-tag neo-tag-black">{provider.category}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{provider.timezone}</span>
                  </div>

                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{provider.name}</h3>

                  <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                    <label className="neo-label" style={{ fontSize: '0.75rem', color: '#555' }}>Available Services:</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                      {provider.services?.map((service) => (
                        <span
                          key={service.id}
                          style={{
                            border: '2px solid #000',
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            background: '#f8f9fa',
                          }}
                        >
                          {service.name} ({service.durationMin}m)
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '2px dashed #000', paddingTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to={user ? `/book/${provider.id}` : '/login'}
                    className="neo-btn"
                    style={{ flex: 1, padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                  >
                    {user ? 'Book Slot' : 'Sign In to Book'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Role Based Access Guide ─────────────────────────────── */}
      <section className="neo-card" style={{ backgroundColor: '#fff' }}>
        <span className="neo-tag" style={{ marginBottom: '0.75rem' }}>Role-Based Access Control</span>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Multi-Tier Platform Architecture</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ border: '2px solid #000', padding: '1rem', background: '#fff0d4' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>CUSTOMER</h4>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Book appointments, check in on arrival, monitor live queue position and dynamic ETA in real-time.
            </p>
          </div>

          <div style={{ border: '2px solid #000', padding: '1rem', background: '#d3f9d8' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>STAFF</h4>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Desk dashboard: call next customer with `SKIP LOCKED`, start/complete service, skip or requeue tokens.
            </p>
          </div>

          <div style={{ border: '2px solid #000', padding: '1rem', background: '#e7f5ff' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>PROVIDER</h4>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Manage service catalog, define weekly availability windows, and inspect analytics & queue wait times.
            </p>
          </div>

          <div style={{ border: '2px solid #000', padding: '1rem', background: '#f3d9fa' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>ADMIN</h4>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Full system governance, provider creation, role management, and transactional outbox event tracking.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
