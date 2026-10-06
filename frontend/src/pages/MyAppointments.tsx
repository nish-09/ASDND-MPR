import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, ApiError } from '../api';

interface Service {
  id: string;
  name: string;
  durationMin: number;
}

interface Provider {
  id: string;
  name: string;
  category: string;
  timezone: string;
}

interface QueueEntry {
  id: string;
  tokenLabel: string;
  tokenNumber: number;
  status: 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'SKIPPED' | 'NO_SHOW' | 'CANCELLED';
  position: number;
  waitingAhead: number;
  etaMinutes: number;
  provider: Provider;
  appointment: {
    service: Service;
  };
}

interface Appointment {
  id: string;
  startsAt: string;
  endsAt: string;
  status: 'BOOKED' | 'CHECKED_IN' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string | null;
  provider: Provider;
  service: Service;
  queueEntry?: {
    id: string;
    tokenLabel: string;
    status: string;
  } | null;
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeQueue, setActiveQueue] = useState<QueueEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [apptsRes, queueRes] = await Promise.all([
        apiFetch<{ data: Appointment[] }>('/appointments'),
        apiFetch<{ data: QueueEntry | null }>('/queue/me'),
      ]);

      setAppointments(apptsRes.data || []);
      setActiveQueue(queueRes.data || null);
    } catch (err: any) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Poll active queue every 5 seconds per spec
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleCheckIn = async (appointmentId: string) => {
    setCheckingInId(appointmentId);
    setError(null);

    try {
      await apiFetch(`/appointments/${appointmentId}/check-in`, { method: 'POST' });
      await fetchData();
    } catch (err: any) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Check-in failed');
    } finally {
      setCheckingInId(null);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    setCancelingId(appointmentId);
    setError(null);

    try {
      await apiFetch(`/appointments/${appointmentId}/cancel`, { method: 'POST' });
      await fetchData();
    } catch (err: any) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Cancellation failed');
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return (
      <div className="neo-flex-center neo-page-min-height">
        <div className="neo-card">
          <h2>Loading your appointments...</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="neo-error-banner" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* ── Active Live Queue Token Spotlight ──────────────────────── */}
      {activeQueue && (
        <section
          className="neo-card"
          style={{
            marginBottom: '2.5rem',
            backgroundColor: activeQueue.status === 'CALLED' ? '#ffc9c9' : '#d3f9d8',
            border: '4px solid #000',
          }}
        >
          <div className="neo-flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            <span
              className="neo-tag"
              style={{
                backgroundColor: activeQueue.status === 'CALLED' ? '#e03131' : '#2b8a3e',
                color: '#fff',
                fontSize: '0.85rem',
              }}
            >
              {activeQueue.status === 'CALLED' ? '🚨 CALLED — PLEASE PROCEED TO COUNTER' : 'LIVE QUEUE TOKEN ACTIVE'}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Auto-refreshing every 5s</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <p className="neo-label" style={{ marginBottom: '0.2rem' }}>YOUR TOKEN</p>
              <h1 style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: '0.5rem' }}>
                {activeQueue.tokenLabel}
              </h1>
              <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                {activeQueue.provider?.name}
              </p>
              <p className="neo-text-muted" style={{ marginBottom: 0 }}>
                {activeQueue.appointment?.service?.name}
              </p>
            </div>

            <div style={{ borderLeft: '3px solid #000', paddingLeft: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <p className="neo-label" style={{ marginBottom: '0.2rem' }}>QUEUE STATUS</p>
                <span className="neo-tag neo-tag-black" style={{ fontSize: '1rem' }}>
                  {activeQueue.status}
                </span>
              </div>

              {activeQueue.status === 'WAITING' && (
                <>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <p className="neo-label" style={{ marginBottom: '0.2rem' }}>POSITION IN LINE</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 900 }}>
                      #{activeQueue.position} <span style={{ fontSize: '1rem', fontWeight: 600 }}>({activeQueue.waitingAhead} ahead of you)</span>
                    </p>
                  </div>

                  <div>
                    <p className="neo-label" style={{ marginBottom: '0.2rem' }}>ESTIMATED WAIT</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#e03131' }}>
                      ~{activeQueue.etaMinutes} minutes
                    </p>
                  </div>
                </>
              )}

              {activeQueue.status === 'CALLED' && (
                <div style={{ padding: '0.5rem', background: '#fff', border: '2px solid #000' }}>
                  <p style={{ fontWeight: 800, color: '#c92a2a', fontSize: '1.1rem' }}>
                    Staff is ready for you! Head to the desk now.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Scheduled Appointments ─────────────────────────────────── */}
      <section>
        <div className="neo-flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="neo-tag">Customer Hub</span>
            <h2 style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>My Appointments</h2>
          </div>

          <Link to="/book" className="neo-btn">
            + Book New Appointment
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="neo-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <h3>No Scheduled Appointments</h3>
            <p className="neo-text-muted" style={{ marginBottom: '1.5rem' }}>
              You don't have any upcoming bookings. Book a time slot with any of our providers.
            </p>
            <Link to="/book" className="neo-btn">
              Explore Available Desks →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.map((appt) => {
              const apptDate = new Date(appt.startsAt);
              const formattedDate = apptDate.toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });
              const formattedTime = apptDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              });

              const isCheckedIn = appt.status === 'CHECKED_IN' || !!appt.queueEntry;
              const isCancelled = appt.status === 'CANCELLED';
              const isCompleted = appt.status === 'COMPLETED';

              return (
                <div key={appt.id} className="neo-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span className="neo-tag neo-tag-black">{appt.provider?.category}</span>
                      <span
                        className="neo-tag"
                        style={{
                          backgroundColor:
                            appt.status === 'BOOKED' ? '#ffd43b' :
                            appt.status === 'CHECKED_IN' ? '#74c0fc' :
                            appt.status === 'COMPLETED' ? '#69db7c' : '#adb5bd',
                          color: '#000',
                        }}
                      >
                        {appt.status}
                      </span>
                      {appt.queueEntry && (
                        <span className="neo-tag" style={{ backgroundColor: '#2b8a3e', color: '#fff' }}>
                          Token: {appt.queueEntry.tokenLabel}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>
                      {appt.provider?.name} — {appt.service?.name}
                    </h3>

                    <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                      📅 {formattedDate} at ⏰ {formattedTime} ({appt.service?.durationMin} mins)
                    </p>

                    {appt.notes && (
                      <p className="neo-text-muted" style={{ fontSize: '0.85rem', marginBottom: 0 }}>
                        Note: {appt.notes}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {!isCheckedIn && !isCancelled && !isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleCheckIn(appt.id)}
                        className="neo-btn"
                        disabled={checkingInId === appt.id}
                        style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}
                      >
                        {checkingInId === appt.id ? 'Issuing Token...' : 'Check In →'}
                      </button>
                    )}

                    {!isCancelled && !isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleCancel(appt.id)}
                        className="neo-btn neo-btn-black"
                        disabled={cancelingId === appt.id}
                        style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                      >
                        {cancelingId === appt.id ? 'Canceling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
