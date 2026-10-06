import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  services: Service[];
}

export default function BookAppointment() {
  const { providerId } = useParams<{ providerId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>(providerId || '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [date, setDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState<string>('10:00');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ data: Provider[] }>('/providers')
      .then((res) => {
        setProviders(res.data || []);
        if (!selectedProviderId && res.data?.length > 0) {
          setSelectedProviderId(res.data[0].id);
        }
      })
      .catch((err: any) => {
        const apiErr = err as ApiError;
        setError(apiErr.message || 'Failed to fetch providers');
      })
      .finally(() => setLoading(false));
  }, [selectedProviderId]);

  const currentProvider = providers.find((p) => p.id === selectedProviderId);

  useEffect(() => {
    if (currentProvider && currentProvider.services?.length > 0 && !selectedServiceId) {
      setSelectedServiceId(currentProvider.services[0].id);
    }
  }, [currentProvider, selectedServiceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedProviderId || !selectedServiceId || !date || !time) {
      setError('Please fill in all required booking fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    const startsAt = new Date(`${date}T${time}:00Z`).toISOString();

    try {
      await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          providerId: selectedProviderId,
          serviceId: selectedServiceId,
          startsAt,
          notes,
        }),
      });

      navigate('/my-appointments');
    } catch (err: any) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="neo-flex-center neo-page-min-height">
        <div className="neo-card">
          <h2>Loading booking catalog...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1rem 0' }}>
      <div className="neo-card">
        <div className="neo-flex-between" style={{ marginBottom: '1.25rem' }}>
          <span className="neo-tag">Slot Reservation</span>
          <Link to="/" className="neo-link-reset" style={{ fontWeight: 800, fontSize: '0.85rem' }}>← Browse All Desks</Link>
        </div>

        <h2>Schedule An Appointment</h2>
        <p className="neo-text-muted" style={{ marginBottom: '1.5rem' }}>
          Guaranteed slot with atomic concurrency protection. You can check in on arrival to receive a live queue token.
        </p>

        {error && (
          <div className="neo-error-banner" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="neo-form">
          <div>
            <label className="neo-label" htmlFor="provider">Select Provider / Desk</label>
            <select
              id="provider"
              className="neo-input"
              value={selectedProviderId}
              onChange={(e) => {
                setSelectedProviderId(e.target.value);
                setSelectedServiceId('');
              }}
              required
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category}) — {p.timezone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="neo-label" htmlFor="service">Select Service</label>
            <select
              id="service"
              className="neo-input"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              required
            >
              {currentProvider?.services?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (~{s.durationMin} minutes)
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="neo-label" htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                className="neo-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="neo-label" htmlFor="time">Time Slot</label>
              <input
                id="time"
                type="time"
                className="neo-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                step="900"
                required
              />
            </div>
          </div>

          <div>
            <label className="neo-label" htmlFor="notes">Notes / Reason for Visit (Optional)</label>
            <textarea
              id="notes"
              className="neo-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Annual checkup, account verification..."
            />
          </div>

          <button
            type="submit"
            className="neo-btn neo-mt-4"
            disabled={submitting}
            style={{ width: '100%', fontSize: '1.05rem', padding: '1rem' }}
          >
            {submitting ? 'Confirming Reservation...' : 'Confirm Appointment Booking →'}
          </button>
        </form>
      </div>
    </div>
  );
}
