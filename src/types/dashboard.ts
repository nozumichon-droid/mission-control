export type SiteSlug = "bruceac" | "meraki";

export type Impact = "low" | "medium" | "high";
export type Priority = "critical" | "high" | "medium" | "low";
export type RecommendationStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "blocked";
export type RecommendationCategory =
  | "seo"
  | "conversion"
  | "speed"
  | "design"
  | "content";
export type FindingSeverity = "critical" | "high" | "medium" | "low";
export type FindingType =
  | "broken_link"
  | "form_error"
  | "seo_gap"
  | "speed_issue"
  | "design_flaw"
  | "content_gap";

export type Audit = {
  id: string;
  site_slug: SiteSlug;
  audit_date: string;
  lighthouse_score: number;
  lcp_ms: number;
  cls: number;
  fid_ms: number;
  estimated_seo_visibility: number;
  conversion_rate: number;
  critical_issues: number;
  high_priority_issues: number;
  created_at: string;
};

export type Recommendation = {
  id: string;
  site_slug: SiteSlug;
  title: string;
  description: string;
  impact: Impact;
  effort_hours: number;
  priority: Priority;
  status: RecommendationStatus;
  blocker_notes: string | null;
  category: RecommendationCategory;
  owner?: string | null;
  created_at: string;
  updated_at: string;
};

export type Finding = {
  id: string;
  site_slug: SiteSlug;
  audit_id: string;
  title: string;
  severity: FindingSeverity;
  description: string;
  type: FindingType;
  created_at: string;
};

export type DashboardSummary = {
  generatedAt: string;
  latestAudits: Record<SiteSlug, Audit | null>;
  auditsBySite: Record<SiteSlug, Audit[]>;
  recommendations: Recommendation[];
  findings: Finding[];
};
