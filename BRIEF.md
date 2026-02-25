# Mission Control Dashboard - Build Brief

## Project Overview
Build a real-time operations dashboard (AISG Command Center style) to monitor website optimization progress for two client projects: bruceac.com and merakirestoration.com.

**Owner:** Ricky  
**Deployed:** Vercel  
**Tech Stack:** Next.js + TypeScript + Supabase + Recharts  
**Timeline:** MVP live by end of week  
**Deployment Target:** https://mission-control.vercel.app (or similar)

---

## Core Features (MVP)

### 1. KPI Dashboard (Hero Section)
Real-time metrics for each site:

**Bruce A/C:**
- Google Lighthouse Score (0-100)
- Page Speed (Core Web Vitals: LCP, CLS, FID)
- Estimated SEO Visibility (keyword rank aggregation)
- Lead Conversion Rate (phone calls, form submissions)
- Trending indicators (↑ ↓ % from last week)

**Meraki Restoration:**
- Google Lighthouse Score (0-100)
- Page Speed (Core Web Vitals)
- Quote Form Completion Rate (%)
- Estimated Local SEO Visibility
- Trending indicators

**Layout:** 2-column grid (Bruce left, Meraki right) with card-based metrics, color-coded status (🟢 good, 🟡 warning, 🔴 critical).

### 2. System Health Status
- Overall health indicator (all systems operating within normal parameters)
- Critical alerts list (broken links, forms, critical SEO gaps)
- Last audit timestamp
- Next scheduled audit time

### 3. Active Recommendations (Ranked Table)
Per-site recommendations, prioritized by:
- Impact (revenue/traffic potential)
- Effort (hours to implement)
- Status (not started, in progress, completed, blocked)

**Columns:**
- Priority badge (🔴 Critical / 🟡 High / 🔵 Medium)
- Recommendation title
- Site (Bruce / Meraki)
- Impact estimate (low/medium/high revenue impact)
- Effort (1-5 hours)
- Status dropdown (can update from dashboard)
- Owner (if applicable)
- Blocker notes (if status = blocked)

### 4. Weekly Audit Reports
- Collapsible/expandable per-site audit summaries
- Metric snapshots (current week vs last week)
- Findings breakdown (critical / high / medium)
- Links to detailed findings (can expand or link to separate page)

### 5. Side-by-Side Comparison
- Bruce vs Meraki performance matrix
- Which site is stronger in each metric?
- Identify best practices from high performer to apply to other

### 6. Trends & Historical Data
- 7-day and 30-day metric trends (line charts)
- Speed improvements over time
- SEO visibility trending
- Form conversion rate trending
- Recommendation completion tracking

---

## Data Model (Supabase)

### Tables

**audits**
```
id (uuid, pk)
site_slug (string: "bruceac" | "meraki")
audit_date (timestamp)
lighthouse_score (integer 0-100)
lcp_ms (integer)
cls (float)
fid_ms (integer)
estimated_seo_visibility (integer 0-100)
conversion_rate (float 0-1)
critical_issues (integer)
high_priority_issues (integer)
created_at (timestamp)
```

**recommendations**
```
id (uuid, pk)
site_slug (string)
title (string)
description (text)
impact (enum: low, medium, high)
effort_hours (integer 1-5)
priority (enum: critical, high, medium, low)
status (enum: not_started, in_progress, completed, blocked)
blocker_notes (text, nullable)
category (enum: seo, conversion, speed, design, content)
created_at (timestamp)
updated_at (timestamp)
```

**findings**
```
id (uuid, pk)
site_slug (string)
audit_id (uuid, fk → audits)
title (string)
severity (enum: critical, high, medium, low)
description (text)
type (enum: broken_link, form_error, seo_gap, speed_issue, design_flaw, content_gap)
created_at (timestamp)
```

---

## API Endpoints (Next.js)

```
GET /api/audits?site=bruceac - Get latest audit
GET /api/audits/history?site=bruceac&days=30 - Get historical audits
GET /api/recommendations?site=bruceac - Get recommendations for site
POST /api/recommendations/:id - Update recommendation status
GET /api/dashboard - Get dashboard summary data (all sites)
GET /api/findings?site=bruceac&severity=critical - Get findings
```

---

## Frontend Components

1. **DashboardLayout** - Main wrapper (header, nav, footer)
2. **MetricsCard** - Single KPI card (score, trend, sparkline)
3. **HealthStatus** - System health section
4. **RecommendationsTable** - Ranked recommendations, sortable/filterable
5. **AuditReport** - Collapsible audit summary
6. **TrendChart** - Line chart (Recharts) for metric history
7. **ComparisonMatrix** - Side-by-side site comparison
8. **AlertBanner** - Critical alerts (sticky top if any)

---

## Cron Job Integration

**Weekly audit cron (Monday 6 AM PST):**
1. Run Lighthouse audit on both sites
2. Extract Core Web Vitals
3. Estimate SEO visibility (keyword rank proxy)
4. Check form availability/functionality
5. Detect critical issues (broken links, form errors)
6. Insert audit record + findings into Supabase
7. Calculate recommendations (auto-surface new issues)
8. Post summary to project thread/message

**Cron script location:** `/projects/mission-control/cron/audit.ts`

---

## UI/UX Reference

Model after: **AISG Command Center** (https://aisg-ceo-dashboard.vercel.app/)
- Dark theme, modern cards, real-time feel
- Metric emphasis (big numbers, color coding)
- Alert-first design (critical issues pop)
- Responsive (mobile + desktop)

---

## Deployment

**Platform:** Vercel  
**Env vars needed:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for cron)
- `ANTHROPIC_API_KEY` (for future AI-powered insights)

**Deploy after:** MVP complete + tested locally

---

## Success Criteria

- ✅ Dashboard loads in <2s on desktop & mobile
- ✅ Real-time metric updates (manual refresh or cron-driven)
- ✅ All recommendations visible, sortable, editable
- ✅ Audit history visible (7-day, 30-day trends)
- ✅ Critical alerts surface visually
- ✅ Deployed to Vercel + shareable URL
- ✅ Data persists in Supabase

---

## Blockers / Questions for Ricky

1. **Analytics access:** Do you have Google Analytics for bruceac.com & merakirestoration.com? (Needed for conversion rate data)
2. **Supabase project:** Should I create a fresh Supabase project or do you have one?
3. **Vercel project:** Should I link to existing project or create new?
4. **Metrics priority:** Which metric matters most to you? (e.g., SEO visibility, conversion rate, page speed?)
5. **Branding:** Any color scheme preference, or use dark theme like AISG?

---

## Next Steps

1. Confirm tech stack + create Supabase project
2. Build data model (audit, recommendations, findings tables)
3. Create API endpoints
4. Build frontend components + dashboard layout
5. Integrate cron audit job
6. Deploy to Vercel
7. Test end-to-end
8. Report back with live URL + setup instructions

**Owner:** You (GPT-5.3 coding agent)  
**Ricky's role:** Provide feedback, API access, launch when ready

---

_Start now. Report progress in main session. Questions = message Ricky._
