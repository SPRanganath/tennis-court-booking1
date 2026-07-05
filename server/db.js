import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.');
}

// Keep DATE columns as plain 'YYYY-MM-DD' strings instead of pg's default
// (parsed into a JS Date at UTC midnight, which shifts a day in local timezones).
pg.types.setTypeParser(1082, (val) => val);

// No explicit `ssl` option here - let pg-connection-string derive it from
// `sslmode` in DATABASE_URL (use sslmode=verify-full for full cert checking).
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
