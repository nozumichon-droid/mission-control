# Mission Control Dashboard

Mission Control is a dark-mode command center for optimization telemetry across:
- `bruceac.com`
- `merakirestoration.com`

## Stack Decision

**Confirmed stack is solid for MVP + scale:**
- **Next.js (App Router) + TypeScript**: fast product iteration + typed API routes/components
- **Supabase (Postgres + Row Level Security)**: reliable hosted DB + simple auth/policy model
- **Recharts**: pragmatic charting for KPI trends and comparison visuals

This stack is a strong fit for real-time-ish dashboarding, weekly automated audits, and Vercel deployment.

## Implemented

- Supabase schema with enums/tables/indexes/policies:
  - `audits`
  - `recommendations`
  - `findings`
- API endpoints:
  - `GET /api/audits?site=bruceac`
  - `GET /api/audits/history?site=bruceac&days=30`
  - `GET /api/recommendations?site=bruceac`
  - `POST /api/recommendations/:id`
  - `GET /api/findings?site=bruceac&severity=critical`
  - `GET /api/dashboard`
  - `GET /api/cron/weekly-audit` (for Vercel Cron)
- Dashboard UI components:
  - `DashboardLayout`
  - `MetricsCard`
  - `HealthStatus`
  - `RecommendationsTable`
  - `TrendChart`
  - `ComparisonMatrix`
  - `AuditReport`
  - `AlertBanner`
- Weekly audit automation:
  - Local/CI script: `cron/audit.ts`
  - Shared runner: `src/lib/auditRunner.ts`
  - Vercel cron schedule in `vercel.json` (Mondays @ 6AM PST)

## Environment Variables

Create `.env.local`:

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
PAGESPEED_API_KEY=
ANTHROPIC_API_KEY=
```

## Supabase Setup

1. Open Supabase SQL Editor.
2. Run `supabase/schema.sql`.
3. Verify tables exist and insert seed rows (optional).

## Run

```bash
npm install
npm run dev
```

## Run Weekly Audit Manually

```bash
npm run audit:weekly
```

## Deploy to Vercel

1. Import repo in Vercel.
2. Set env vars from above.
3. Confirm cron route auth secret (`CRON_SECRET`) matches your header strategy.
4. Deploy.

## Notes

- App uses mock fallback data when Supabase env vars are missing.
- Recommendation status changes work in mock mode (in-memory) and persisted mode (Supabase).
