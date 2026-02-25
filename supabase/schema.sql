-- Mission Control schema
create extension if not exists "pgcrypto";

create type site_slug as enum ('bruceac', 'meraki');
create type impact_level as enum ('low', 'medium', 'high');
create type priority_level as enum ('critical', 'high', 'medium', 'low');
create type recommendation_status as enum ('not_started', 'in_progress', 'completed', 'blocked');
create type recommendation_category as enum ('seo', 'conversion', 'speed', 'design', 'content');
create type finding_severity as enum ('critical', 'high', 'medium', 'low');
create type finding_type as enum ('broken_link', 'form_error', 'seo_gap', 'speed_issue', 'design_flaw', 'content_gap');

create table if not exists audits (
  id uuid primary key default gen_random_uuid(),
  site_slug site_slug not null,
  audit_date timestamptz not null,
  lighthouse_score int not null check (lighthouse_score >= 0 and lighthouse_score <= 100),
  lcp_ms int not null check (lcp_ms >= 0),
  cls numeric(6,4) not null check (cls >= 0),
  fid_ms int not null check (fid_ms >= 0),
  estimated_seo_visibility int not null check (estimated_seo_visibility >= 0 and estimated_seo_visibility <= 100),
  conversion_rate numeric(6,4) not null check (conversion_rate >= 0 and conversion_rate <= 1),
  critical_issues int not null default 0 check (critical_issues >= 0),
  high_priority_issues int not null default 0 check (high_priority_issues >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_audits_site_slug_date on audits(site_slug, audit_date desc);

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  site_slug site_slug not null,
  title text not null,
  description text not null,
  impact impact_level not null,
  effort_hours int not null check (effort_hours between 1 and 5),
  priority priority_level not null,
  status recommendation_status not null default 'not_started',
  blocker_notes text,
  category recommendation_category not null,
  owner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_recommendations_site_status_priority
  on recommendations(site_slug, status, priority, updated_at desc);

create table if not exists findings (
  id uuid primary key default gen_random_uuid(),
  site_slug site_slug not null,
  audit_id uuid not null references audits(id) on delete cascade,
  title text not null,
  severity finding_severity not null,
  description text not null,
  type finding_type not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_findings_site_severity_created
  on findings(site_slug, severity, created_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_recommendations_updated_at on recommendations;
create trigger trg_recommendations_updated_at
before update on recommendations
for each row execute function set_updated_at();

-- Row level security defaults (tight by default)
alter table audits enable row level security;
alter table recommendations enable row level security;
alter table findings enable row level security;

-- Service role bypasses RLS, anon/auth users currently read-only
create policy if not exists "Public read audits"
on audits for select using (true);

create policy if not exists "Public read recommendations"
on recommendations for select using (true);

create policy if not exists "Public update recommendation status"
on recommendations for update using (true) with check (true);

create policy if not exists "Public read findings"
on findings for select using (true);
