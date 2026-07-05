import { authClient } from '../api/authClient';

export default function Header({ activeTab, onTabChange, user }) {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span className="app-header__logo" aria-hidden="true">🎾</span>
        <h1>CourtSide</h1>
      </div>

      <nav className="app-header__tabs">
        <button
          className={activeTab === 'book' ? 'tab tab--active' : 'tab'}
          onClick={() => onTabChange('book')}
        >
          Book a Court
        </button>
        <button
          className={activeTab === 'bookings' ? 'tab tab--active' : 'tab'}
          onClick={() => onTabChange('bookings')}
        >
          My Bookings
        </button>
      </nav>

      <div className="app-header__player">
        <span>{user.name}</span>
        <button className="btn btn--secondary" onClick={() => authClient.signOut()}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
