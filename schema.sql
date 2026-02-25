-- Mission Control Dashboard Schema
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE severity_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE issue_type AS ENUM ('broken_link', 'form_error', 'seo_gap', 'speed_issue', 'design_flaw', 'content_gap');
CREATE TYPE recommendation_status AS ENUM ('not_started', 'in_progress', 'completed', 'blocked');
CREATE TYPE impact_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE site_slug AS ENUM ('bruceac', 'meraki');

-- Audits table
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_slug site_slug NOT NULL,
  audit_date TIMESTAMP DEFAULT NOW(),
  lighthouse_score INTEGER CHECK (lighthouse_score >= 0 AND lighthouse_score <= 100),
  lcp_ms INTEGER,
  cls FLOAT,
  fid_ms INTEGER,
  estimated_seo_visibility INTEGER CHECK (estimated_seo_visibility >= 0 AND estimated_seo_visibility <= 100),
  conversion_rate FLOAT CHECK (conversion_rate >= 0 AND conversion_rate <= 1),
  critical_issues INTEGER DEFAULT 0,
  high_priority_issues INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audits_site_date ON audits(site_slug, audit_date DESC);
CREATE INDEX idx_audits_created_at ON audits(created_at DESC);

-- Recommendations table
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_slug site_slug NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  impact impact_level NOT NULL,
  effort_hours INTEGER CHECK (effort_hours >= 1 AND effort_hours <= 5),
  priority severity_level NOT NULL,
  status recommendation_status DEFAULT 'not_started',
  category VARCHAR(50),
  blocker_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recommendations_site_status ON recommendations(site_slug, status);
CREATE INDEX idx_recommendations_priority ON recommendations(priority DESC);

-- Findings table
CREATE TABLE findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_slug site_slug NOT NULL,
  audit_id UUID REFERENCES audits(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  severity severity_level NOT NULL,
  description TEXT,
  type issue_type,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_findings_site_audit ON findings(site_slug, audit_id);
CREATE INDEX idx_findings_severity ON findings(severity);

-- Trigger to update updated_at on audits
CREATE OR REPLACE FUNCTION update_audits_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audits_update_timestamp
BEFORE UPDATE ON audits
FOR EACH ROW
EXECUTE FUNCTION update_audits_timestamp();

-- Trigger to update updated_at on recommendations
CREATE OR REPLACE FUNCTION update_recommendations_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recommendations_update_timestamp
BEFORE UPDATE ON recommendations
FOR EACH ROW
EXECUTE FUNCTION update_recommendations_timestamp();

-- Row Level Security (RLS)
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all for now (public read/write for MVP)
CREATE POLICY "Allow read access to audits" ON audits
  FOR SELECT USING (true);

CREATE POLICY "Allow insert/update on audits" ON audits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update audits" ON audits
  FOR UPDATE USING (true);

CREATE POLICY "Allow read access to recommendations" ON recommendations
  FOR SELECT USING (true);

CREATE POLICY "Allow insert on recommendations" ON recommendations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update recommendations" ON recommendations
  FOR UPDATE USING (true);

CREATE POLICY "Allow read access to findings" ON findings
  FOR SELECT USING (true);

CREATE POLICY "Allow insert on findings" ON findings
  FOR INSERT WITH CHECK (true);
