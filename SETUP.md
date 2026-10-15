# EthioLingo — Full-Stack Setup

This project now has two parts that run together:

- **Frontend** — the Angular app (this root folder)
- **Backend** — a real API + database in `server/` (Node.js, Express, SQLite)

Accounts, XP, and lesson progress are now stored in a real database on the
backend, with password-based login (bcrypt-hashed passwords, JWT sessions) —
this replaces the old browser-only demo storage.

## 1. Start the backend

```bash
cd server
npm install
cp .env.example .env      # optional — defaults work fine for local dev
npm start
```

You should see:
```
EthioLingo API listening on http://localhost:3000
```

Leave this running in its own terminal. It creates `server/data/ethiolingo.db`
automatically on first run (a SQLite file — your whole database, nothing else
to install).

To reset all data (wipe every account, all progress), just delete that file:
```bash
rm server/data/ethiolingo.db*
```

## 2. Start the frontend

In a **second terminal**, from the project root:

```bash
npm install
npm start
```

This runs `ng serve` with a dev proxy (`proxy.conf.json`) that automatically
forwards any `/api/...` request from the Angular app to `http://localhost:3000`.
You don't need to configure anything else for local development — just make
sure the backend (step 1) is running first.

Open **http://localhost:4200**.

## How it fits together

- Sign up / log in now hit real endpoints (`POST /api/auth/signup`,
  `POST /api/auth/login`) with actual password verification — a wrong
  password is rejected, unlike the old demo.
- A JWT token is stored in the browser (`localStorage`, key
  `ethiolingo_token`) and automatically attached to every API request via
  `AuthInterceptor`. Reloading the page restores your session by calling
  `GET /api/auth/me` with that token.
- Finishing a lesson calls `POST /api/progress` (marks the unit complete) and
  `POST /api/auth/me/xp` (adds XP) — both saved server-side, so progress
  survives across devices/browsers once you're logged in.
- The Leaderboard page calls `GET /api/leaderboard` and shows real ranked
  users from the database.
- If you're **not logged in**, the app still works as a guest: progress is
  cached in `localStorage` only (not synced anywhere) so you can still try
  lessons without an account, exactly like before.

## Deploying

**Backend**: works on any Node host (Render, Railway, Fly.io, a VPS, etc.)
that gives you a persistent disk — the SQLite file needs to survive restarts.
Set these environment variables in production:
- `JWT_SECRET` — a long random string (required; don't use the dev default)
- `CORS_ORIGIN` — your deployed frontend's URL (comma-separate multiple)
- `PORT` — usually set automatically by the host

⚠️ **Serverless platforms (e.g. Vercel functions) will not work as-is** —
their filesystem is ephemeral/read-only, so the SQLite file won't persist
between requests. For serverless, swap `better-sqlite3` for a hosted
Postgres/MySQL database (e.g. Supabase, Neon, PlanetScale) — the route logic
in `server/src/routes/` would stay almost identical, just the `db.js` file
and SQL syntax would change.

**Frontend**: update `src/environments/environment.prod.ts` — set `apiUrl` to
your deployed backend's URL (e.g. `'https://api.yourdomain.com/api''`), then
`ng build` as usual. If frontend and backend are on different domains, make
sure `CORS_ORIGIN` on the backend matches your frontend's exact origin.

## Security notes (read before going live)

- Change `JWT_SECRET` in production — the checked-in default is for local
  dev only and is not a secret.
- This uses `localStorage` for the JWT, which is standard for SPAs but is
  vulnerable to XSS token theft if you ever add third-party scripts. For
  higher-security needs, consider httpOnly cookies instead (would need
  backend + interceptor changes).
- There's no rate-limiting on `/api/auth/login` yet — worth adding
  (e.g. `express-rate-limit`) before public launch to slow down
  brute-force attempts.
