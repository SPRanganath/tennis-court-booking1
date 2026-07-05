import { betterAuth } from 'better-auth';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const port = process.env.PORT || 3001;

// RENDER_EXTERNAL_URL is auto-populated by Render on every web service, so
// baseURL resolves correctly on deploy with no manual config there.
const baseURL = process.env.BETTER_AUTH_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  // The Vite dev server (5173) proxies /api/* to this server (3001), so the
  // browser's Origin header is localhost:5173 even though this process
  // actually handles the request - trust it in dev, or the CSRF check on
  // sign-in/sign-up requests rejects them.
  trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? 'http://localhost:5173').split(','),
  emailAndPassword: {
    enabled: true,
  },
});
