import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { pool } from './db.js';
import { auth } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Render (and most PaaS hosts) terminate TLS at an edge proxy and forward
// plain HTTP internally - without this, Express sees every request as
// insecure, which breaks secure-cookie handling for sessions.
app.set('trust proxy', 1);

app.get('/healthz', (req, res) => res.status(200).send('ok'));

// Mounted before express.json() - Better Auth reads the raw request body
// itself, so express.json() must not consume the stream first.
app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

async function requireAuth(req, res, next) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) {
    return res.status(401).json({ error: 'Sign in required.' });
  }
  req.user = session.user;
  next();
}

function courtRowToJson(row) {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    surface: row.surface,
    indoor: row.indoor,
    numberOfCourts: row.number_of_courts,
    pricePerHour: Number(row.price_per_hour),
    openHour: row.open_hour,
    closeHour: row.close_hour,
  };
}

function bookingRowToJson(row) {
  return {
    id: row.id,
    courtId: row.court_id,
    courtName: row.court_name,
    date: row.date,
    hour: row.hour,
    duration: row.duration,
    playerName: row.player_name,
    createdAt: row.created_at,
  };
}

app.get('/api/courts', async (req, res) => {
  const result = await pool.query('SELECT * FROM courts ORDER BY name');
  res.json(result.rows.map(courtRowToJson));
});

// Occupied slots for a court/date, across all users, with no identifying
// info - used to grey out taken slots in the booking UI regardless of who
// booked them. Separate from /api/bookings, which is scoped to the caller.
app.get('/api/availability', requireAuth, async (req, res) => {
  const { courtId, date } = req.query;
  if (!courtId || !date) {
    return res.status(400).json({ error: 'courtId and date are required.' });
  }
  const result = await pool.query(
    'SELECT hour, duration FROM bookings WHERE court_id = $1 AND date = $2',
    [courtId, date]
  );
  res.json(result.rows);
});

app.get('/api/bookings', requireAuth, async (req, res) => {
  const result = await pool.query(
    `SELECT bookings.*, courts.name AS court_name, "user".name AS player_name
     FROM bookings
     JOIN courts ON courts.id = bookings.court_id
     JOIN "user" ON "user".id = bookings.user_id
     WHERE bookings.user_id = $1
     ORDER BY date, hour`,
    [req.user.id]
  );
  res.json(result.rows.map(bookingRowToJson));
});

app.post('/api/bookings', requireAuth, async (req, res) => {
  const { courtId, date, hour, duration } = req.body;

  if (!courtId || !date || !Number.isInteger(hour) || !Number.isInteger(duration)) {
    return res.status(400).json({ error: 'courtId, date, hour and duration are all required.' });
  }

  const courtResult = await pool.query('SELECT * FROM courts WHERE id = $1', [courtId]);
  const court = courtResult.rows[0];
  if (!court) {
    return res.status(404).json({ error: 'Court not found.' });
  }
  if (hour < court.open_hour || hour + duration > court.close_hour) {
    return res.status(400).json({ error: 'That time is outside the court\'s opening hours.' });
  }

  const id = `${courtId}-${date}-${hour}-${Date.now()}`;

  // Atomic insert-if-no-overlap: the WHERE NOT EXISTS runs in the same
  // statement as the insert, so two concurrent requests can't both land
  // on an overlapping slot the way a separate check-then-insert could.
  const insertResult = await pool.query(
    `INSERT INTO bookings (id, court_id, user_id, date, hour, duration)
     SELECT $1, $2, $3, $4, $5::integer, $6::integer
     WHERE NOT EXISTS (
       SELECT 1 FROM bookings
       WHERE court_id = $2 AND date = $4
       AND hour < $5::integer + $6::integer AND $5::integer < hour + duration
     )
     RETURNING *`,
    [id, courtId, req.user.id, date, hour, duration]
  );

  if (insertResult.rows.length === 0) {
    return res.status(409).json({ error: 'That slot was just booked. Pick another.' });
  }

  res.status(201).json(
    bookingRowToJson({ ...insertResult.rows[0], court_name: court.name, player_name: req.user.name })
  );
});

app.delete('/api/bookings/:id', requireAuth, async (req, res) => {
  const result = await pool.query('DELETE FROM bookings WHERE id = $1 AND user_id = $2 RETURNING id', [
    req.params.id,
    req.user.id,
  ]);
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Booking not found.' });
  }
  res.status(204).end();
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Serve the built frontend (npm run build) as one deployable artifact.
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
