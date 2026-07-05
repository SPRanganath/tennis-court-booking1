import { useEffect, useMemo, useState } from 'react';
import { formatHour, generateTimeSlots, isPastSlot, isSlotBooked, todayISODate } from '../utils/booking';
import { getAvailability } from '../api/client';

export default function BookingPanel({ court, onConfirmBooking }) {
  const today = todayISODate();
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState(1);
  const [selectedHour, setSelectedHour] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [occupiedSlots, setOccupiedSlots] = useState([]);

  const slots = useMemo(
    () => generateTimeSlots(court.openHour, court.closeHour),
    [court.openHour, court.closeHour]
  );

  useEffect(() => {
    let cancelled = false;
    getAvailability(court.id, date)
      .then((data) => {
        if (!cancelled) setOccupiedSlots(data);
      })
      .catch(() => {
        if (!cancelled) setOccupiedSlots([]);
      });
    return () => {
      cancelled = true;
    };
  }, [court.id, date]);

  function handleDateChange(nextDate) {
    setDate(nextDate);
    setSelectedHour(null);
    setFeedback(null);
  }

  function handleDurationChange(nextDuration) {
    setSelectedHour(null);
    setFeedback(null);
    setDuration(nextDuration);
  }

  async function handleConfirm() {
    if (selectedHour === null) return;
    if (selectedHour + duration > court.closeHour) {
      setFeedback({ type: 'error', message: 'That duration runs past closing time.' });
      return;
    }
    if (isSlotBooked(occupiedSlots, selectedHour, duration)) {
      setFeedback({ type: 'error', message: 'That slot was just taken. Pick another.' });
      return;
    }

    try {
      await onConfirmBooking({
        courtId: court.id,
        date,
        hour: selectedHour,
        duration,
      });

      setFeedback({
        type: 'success',
        message: `Booked ${court.name} on ${date} at ${formatHour(selectedHour)}.`,
      });
      setSelectedHour(null);
      setOccupiedSlots((prev) => [...prev, { hour: selectedHour, duration }]);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  }

  return (
    <div className="booking-panel">
      <h2>Book {court.name}</h2>

      <div className="booking-panel__controls">
        <div className="field">
          <label htmlFor="booking-date">Date</label>
          <input
            id="booking-date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="booking-duration">Duration</label>
          <select
            id="booking-duration"
            value={duration}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
          >
            <option value={1}>1 hour</option>
            <option value={2}>2 hours</option>
          </select>
        </div>
      </div>

      <div className="slot-grid">
        {slots.map((hour) => {
          const past = isPastSlot(date, hour);
          const booked = !past && isSlotBooked(occupiedSlots, hour, duration);
          const overflows = hour + duration > court.closeHour;
          const disabled = past || booked || overflows;

          return (
            <button
              key={hour}
              className={
                'slot' +
                (selectedHour === hour ? ' slot--selected' : '') +
                (disabled ? ' slot--disabled' : '')
              }
              disabled={disabled}
              onClick={() => setSelectedHour(hour)}
              title={booked ? 'Already booked' : overflows ? 'Past closing time' : ''}
            >
              {formatHour(hour)}
            </button>
          );
        })}
      </div>

      <div className="booking-panel__footer">
        <p className="booking-panel__price">
          {selectedHour !== null
            ? `Total: $${court.pricePerHour * duration} (${duration}h at $${court.pricePerHour}/hr)`
            : 'Select a time slot'}
        </p>
        <button className="btn btn--primary" disabled={selectedHour === null} onClick={handleConfirm}>
          Confirm Booking
        </button>
      </div>

      {feedback && (
        <p className={feedback.type === 'error' ? 'feedback feedback--error' : 'feedback feedback--success'}>
          {feedback.message}
        </p>
      )}
    </div>
  );
}
