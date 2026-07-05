import { useState } from 'react';
import { formatHour } from '../utils/booking';

export default function MyBookings({ bookings, onCancel }) {
  const [error, setError] = useState(null);

  async function handleCancel(bookingId) {
    try {
      await onCancel(bookingId);
    } catch (err) {
      setError(err.message);
    }
  }

  const myBookings = bookings.slice().sort((a, b) => (a.date + a.hour).localeCompare(b.date + b.hour));

  if (myBookings.length === 0) {
    return (
      <div className="empty-state">
        <p>No bookings yet. Head to "Book a Court" to reserve a slot.</p>
      </div>
    );
  }

  const now = new Date();
  const upcoming = myBookings.filter((b) => new Date(`${b.date}T00:00:00`).setHours(b.hour + b.duration) >= now);
  const past = myBookings.filter((b) => new Date(`${b.date}T00:00:00`).setHours(b.hour + b.duration) < now);

  return (
    <div className="my-bookings">
      {error && <p className="feedback feedback--error">{error}</p>}
      <section>
        <h2>Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="empty-state">No upcoming bookings.</p>
        ) : (
          <ul className="booking-list">
            {upcoming.map((b) => (
              <li key={b.id} className="booking-list__item">
                <div>
                  <strong>{b.courtName}</strong>
                  <div className="booking-list__meta">
                    {b.date} · {formatHour(b.hour)} · {b.duration}h
                  </div>
                </div>
                <button className="btn btn--secondary" onClick={() => handleCancel(b.id)}>
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2>Past</h2>
          <ul className="booking-list booking-list--past">
            {past.map((b) => (
              <li key={b.id} className="booking-list__item">
                <div>
                  <strong>{b.courtName}</strong>
                  <div className="booking-list__meta">
                    {b.date} · {formatHour(b.hour)} · {b.duration}h
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
