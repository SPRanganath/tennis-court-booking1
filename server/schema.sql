CREATE TABLE IF NOT EXISTS courts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  surface TEXT NOT NULL,
  indoor BOOLEAN NOT NULL DEFAULT FALSE,
  number_of_courts INTEGER NOT NULL,
  price_per_hour NUMERIC NOT NULL,
  open_hour INTEGER NOT NULL,
  close_hour INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  court_id TEXT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hour INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bookings used to carry a free-text player_name before Better Auth was
-- added; these statements migrate an existing table over to user_id.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE;
ALTER TABLE bookings ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE bookings DROP COLUMN IF EXISTS player_name;

CREATE INDEX IF NOT EXISTS bookings_court_date_idx ON bookings (court_id, date);
CREATE INDEX IF NOT EXISTS bookings_user_idx ON bookings (user_id);
