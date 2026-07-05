import { useEffect, useState } from 'react';
import Header from './components/Header';
import CourtList from './components/CourtList';
import BookingPanel from './components/BookingPanel';
import MyBookings from './components/MyBookings';
import AuthScreen from './components/AuthScreen';
import { getCourts, getBookings, createBooking, cancelBooking } from './api/client';
import { authClient } from './api/authClient';
import './App.css';

export default function App() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [activeTab, setActiveTab] = useState('book');
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    getCourts()
      .then((data) => {
        setCourts(data);
        setSelectedCourtId((current) => current ?? data[0]?.id ?? null);
      })
      .catch((err) => setLoadError(err.message));
  }, []);

  useEffect(() => {
    if (!session) {
      setBookings([]);
      return;
    }
    getBookings()
      .then(setBookings)
      .catch((err) => setLoadError(err.message));
  }, [session]);

  const selectedCourt = courts.find((c) => c.id === selectedCourtId) ?? null;

  async function handleConfirmBooking(booking) {
    const created = await createBooking(booking);
    setBookings((prev) => [...prev, created]);
  }

  async function handleCancelBooking(bookingId) {
    await cancelBooking(bookingId);
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  }

  if (sessionPending) {
    return null;
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (loadError) {
    return (
      <div className="app">
        <div className="empty-state">Couldn't reach the server: {loadError}</div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header activeTab={activeTab} onTabChange={setActiveTab} user={session.user} />

      <main className="app-main">
        {activeTab === 'book' ? (
          <div className="book-layout">
            <CourtList courts={courts} selectedCourtId={selectedCourtId} onSelect={(c) => setSelectedCourtId(c.id)} />
            {selectedCourt && <BookingPanel court={selectedCourt} onConfirmBooking={handleConfirmBooking} />}
          </div>
        ) : (
          <MyBookings bookings={bookings} onCancel={handleCancelBooking} />
        )}
      </main>
    </div>
  );
}
