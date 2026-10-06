import { useEffect, useState, useCallback } from 'react';
import { apiFetch, ApiError } from '../api';

interface Provider {
  id: string;
  name: string;
  category: string;
}

interface QueueEntry {
  id: string;
  tokenLabel: string;
  tokenNumber: number;
  status: 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'SKIPPED' | 'NO_SHOW' | 'CANCELLED';
  priority: number;
  checkedInAt: string;
  calledAt?: string | null;
  serviceStartedAt?: string | null;
  appointment: {
    user: {
      name: string;
      email: string;
      phone?: string | null;
    };
    service: {
      name: string;
      durationMin: number;
    };
  };
}

export default function StaffDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [callingNext, setCallingNext] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load providers on mount
  useEffect(() => {
    apiFetch<{ data: Provider[] }>('/providers')
      .then((res) => {
        setProviders(res.data || []);
        if (res.data?.length > 0 && !selectedProviderId) {
          setSelectedProviderId(res.data[0].id);
        }
      })
      .catch((err: any) => {
        const apiErr = err as ApiError;
        setError(apiErr.message || 'Failed to load providers');
      });
  }, [selectedProviderId]);

  // Fetch queue entries for selected provider
  const fetchQueue = useCallback(async () => {
    if (!selectedProviderId) return;
    try {
      const res = await apiFetch<{ data: QueueEntry[] }>(`/queue/provider/${selectedProviderId}`);
      setQueue(res.data || []);
    } catch (err: any) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to fetch queue entries');
    } finally {
      setLoading(false);
    }
  }, [selectedProviderId]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleCallNext = async () => {
    if (!selectedProviderId) return;
    setCallingNext(true);
    setError(null);

    try {
      await apiFetch(`/queue/provider/${selectedProviderId}/call-next`, { method: 'POST' });
      await fetchQueue();
    } catch (err: any) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to call next attendee');
    } finally {
      setCallingNext(false);
    }
  };

  const handleAction = async (entryId: string, action: string) => {
    setActioningId(entryId);
    setError(null);

    try {
      await apiFetch(`/queue/entries/${entryId}/${action}`, { method: 'POST' });
      await fetchQueue();
    } catch (err: any) {
      const apiErr = err as ApiError;
      setError(apiErr.message || `Action ${action} failed`);
    } finally {
      setActioningId(null);
    }
  };

  const currentServing = queue.find((e) => e.status === 'CALLED' || e.status === 'IN_SERVICE');
  const waitingList = queue.filter((e) => e.status === 'WAITING');
  const historyList = queue.filter((e) => ['COMPLETED', 'SKIPPED', 'NO_SHOW'].includes(e.status));

  return (
    <div>
      {/* ── Header & Desk Selector ─────────────────────────────── */}
      <div className="neo-card" style={{ marginBottom: '2rem' }}>
        <div className="neo-flex-between" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div>
            <span className="neo-tag neo-tag-black">Desk Operations</span>
            <h2 style={{ fontSize: '2rem', marginTop: '0.4rem', marginBottom: 0 }}>Staff Live Queue Desk</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <label className="neo-label" style={{ marginBottom: 0 }} htmlFor="deskSelect">Active Desk:</label>
            <select
              id="deskSelect"
              className="neo-input"
              style={{ width: 'auto', minWidth: '220px' }}
              value={selectedProviderId}
              onChange={(e) => {
                setSelectedProviderId(e.target.value);
                setLoading(true);
              }}
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="neo-error-banner" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* ── Active Service Counter ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="neo-card" style={{ backgroundColor: currentServing ? '#fff0d4' : '#fff', border: '4px solid #000' }}>
          <span className="neo-tag" style={{ marginBottom: '1rem' }}>Active Counter Status</span>

          {currentServing ? (
            <div>
              <p className="neo-label" style={{ color: '#e03131', fontSize: '0.9rem' }}>
                CURRENTLY AT DESK [{currentServing.status}]
              </p>
              <h1 style={{ fontSize: '4rem', lineHeight: 1, margin: '0.5rem 0' }}>
                {currentServing.tokenLabel}
              </h1>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
                {currentServing.appointment?.user?.name}
              </h3>
              <p className="neo-text-muted" style={{ marginBottom: '1.25rem' }}>
                Service: <strong>{currentServing.appointment?.service?.name}</strong> (~{currentServing.appointment?.service?.durationMin} min)
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {currentServing.status === 'CALLED' && (
                  <button
                    type="button"
                    onClick={() => handleAction(currentServing.id, 'start')}
                    disabled={actioningId === currentServing.id}
                    className="neo-btn"
                    style={{ backgroundColor: '#2b8a3e', color: '#fff' }}
                  >
                    Start Service →
                  </button>
                )}

                {currentServing.status === 'IN_SERVICE' && (
                  <button
                    type="button"
                    onClick={() => handleAction(currentServing.id, 'complete')}
                    disabled={actioningId === currentServing.id}
                    className="neo-btn"
                    style={{ backgroundColor: '#2b8a3e', color: '#fff' }}
                  >
                    ✓ Mark Complete
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleAction(currentServing.id, 'skip')}
                  disabled={actioningId === currentServing.id}
                  className="neo-btn neo-btn-secondary"
                >
                  Skip
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(currentServing.id, 'no-show')}
                  disabled={actioningId === currentServing.id}
                  className="neo-btn neo-btn-black"
                >
                  No-Show
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Counter Is Free</h3>
              <p className="neo-text-muted" style={{ marginBottom: '1.5rem' }}>
                No attendee is currently in service or being called.
              </p>
              <button
                type="button"
                onClick={handleCallNext}
                disabled={callingNext || waitingList.length === 0}
                className="neo-btn neo-btn-large"
                style={{ width: '100%' }}
              >
                {callingNext ? 'Calling...' : `Call Next Customer (${waitingList.length} Waiting) →`}
              </button>
            </div>
          )}
        </div>

        {/* ── Summary Stats ────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="neo-card" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p className="neo-label">WAITING IN QUEUE</p>
              <h1 style={{ fontSize: '3rem', margin: 0 }}>{waitingList.length}</h1>
            </div>
            <button
              type="button"
              onClick={handleCallNext}
              disabled={callingNext || waitingList.length === 0}
              className="neo-btn"
            >
              Call Next →
            </button>
          </div>

          <div className="neo-card" style={{ flex: 1 }}>
            <p className="neo-label">COMPLETED TODAY</p>
            <h1 style={{ fontSize: '3rem', margin: 0, color: '#2b8a3e' }}>
              {historyList.filter((e) => e.status === 'COMPLETED').length}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Waiting Attendees List ─────────────────────────────────── */}
      <section className="neo-card">
        <div className="neo-flex-between" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.4rem' }}>Upcoming Queue Attendees ({waitingList.length})</h3>
          <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Auto-refresh: 5s</span>
        </div>

        {loading ? (
          <p>Loading queue entries...</p>
        ) : waitingList.length === 0 ? (
          <p className="neo-text-muted">Queue is currently empty. Attendees will appear here as they check in.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '3px solid #000' }}>
                  <th style={{ padding: '0.75rem' }}>POS</th>
                  <th style={{ padding: '0.75rem' }}>TOKEN</th>
                  <th style={{ padding: '0.75rem' }}>CUSTOMER</th>
                  <th style={{ padding: '0.75rem' }}>SERVICE</th>
                  <th style={{ padding: '0.75rem' }}>CHECKED IN</th>
                  <th style={{ padding: '0.75rem' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {waitingList.map((entry, idx) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid #ccc' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 800 }}>#{idx + 1}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="neo-tag neo-tag-black">{entry.tokenLabel}</span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>
                      {entry.appointment?.user?.name}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {entry.appointment?.service?.name} ({entry.appointment?.service?.durationMin}m)
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                      {new Date(entry.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => handleAction(entry.id, 'call')}
                        className="neo-btn"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      >
                        Call
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
