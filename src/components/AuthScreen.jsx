import { useState } from 'react';
import { authClient } from '../api/authClient';

export default function AuthScreen() {
  const [mode, setMode] = useState('sign-in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: authError } =
      mode === 'sign-in'
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name });

    setSubmitting(false);
    if (authError) {
      setError(authError.message || 'Something went wrong.');
    }
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="app-header__brand auth-card__brand">
          <span className="app-header__logo" aria-hidden="true">🎾</span>
          <h1>CourtSide</h1>
        </div>

        <div className="auth-card__tabs">
          <button
            type="button"
            className={mode === 'sign-in' ? 'tab tab--active' : 'tab'}
            onClick={() => setMode('sign-in')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === 'sign-up' ? 'tab tab--active' : 'tab'}
            onClick={() => setMode('sign-up')}
          >
            Sign Up
          </button>
        </div>

        {mode === 'sign-up' && (
          <div className="field">
            <label htmlFor="auth-name">Name</label>
            <input
              id="auth-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="field">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn btn--primary" type="submit" disabled={submitting}>
          {mode === 'sign-in' ? 'Sign In' : 'Create Account'}
        </button>

        {error && <p className="feedback feedback--error">{error}</p>}
      </form>
    </div>
  );
}
