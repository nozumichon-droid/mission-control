import { mockAudits, mockFindings, mockRecommendations } from "@/lib/mockData";
import { hasSupabase, supabase, supabaseAdmin } from "@/lib/supabase";
import type {
  Audit,
  DashboardSummary,
  Finding,
  FindingSeverity,
  Recommendation,
  RecommendationStatus,
  SiteSlug,
} from "@/types/dashboard";

const orderByPriority = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export async function getLatestAudit(site: SiteSlug): Promise<Audit | null> {
  if (!hasSupabase || !supabase) {
    return (
      mockAudits
        .filter((a) => a.site_slug === site)
        .sort((a, b) => +new Date(b.audit_date) - +new Date(a.audit_date))[0] ?? null
    );
  }

  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("site_slug", site)
    .order("audit_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as Audit | null;
}

export async function getAuditHistory(
  site: SiteSlug,
  days = 30,
): Promise<Audit[]> {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  if (!hasSupabase || !supabase) {
    return mockAudits
      .filter((a) => a.site_slug === site && a.audit_date >= cutoff)
      .sort((a, b) => +new Date(a.audit_date) - +new Date(b.audit_date));
  }

  const { data, error } = await supabase
    .from("audits")
    .select("*")
    .eq("site_slug", site)
    .gte("audit_date", cutoff)
    .order("audit_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Audit[];
}

export async function getRecommendations(site?: SiteSlug): Promise<Recommendation[]> {
  if (!hasSupabase || !supabase) {
    const base = site
      ? mockRecommendations.filter((r) => r.site_slug === site)
      : mockRecommendations;

    return base.toSorted(
      (a, b) => orderByPriority[a.priority] - orderByPriority[b.priority],
    );
  }

  let query = supabase.from("recommendations").select("*");
  if (site) query = query.eq("site_slug", site);

  const { data, error } = await query
    .order("priority", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Recommendation[];
}

export async function updateRecommendation(
  id: string,
  patch: Partial<Pick<Recommendation, "status" | "blocker_notes" | "owner">>,
): Promise<Recommendation | null> {
  if (!hasSupabase || !supabaseAdmin) {
    const idx = mockRecommendations.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    mockRecommendations[idx] = {
      ...mockRecommendations[idx],
      ...patch,
      updated_at: new Date().toISOString(),
    };
    return mockRecommendations[idx];
  }

  const { data, error } = await supabaseAdmin
    .from("recommendations")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return (data as Recommendation) ?? null;
}

export async function getFindings(params: {
  site?: SiteSlug;
  severity?: FindingSeverity;
  limit?: number;
}): Promise<Finding[]> {
  const { site, severity, limit = 100 } = params;

  if (!hasSupabase || !supabase) {
    return mockFindings
      .filter((f) => (site ? f.site_slug === site : true))
      .filter((f) => (severity ? f.severity === severity : true))
      .slice(0, limit);
  }

  let query = supabase.from("findings").select("*").limit(limit);
  if (site) query = query.eq("site_slug", site);
  if (severity) query = query.eq("severity", severity);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Finding[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [bruceLatest, merakiLatest, bruce30, meraki30, recommendations, findings] =
    await Promise.all([
      getLatestAudit("bruceac"),
      getLatestAudit("meraki"),
      getAuditHistory("bruceac", 30),
      getAuditHistory("meraki", 30),
      getRecommendations(),
      getFindings({ limit: 50 }),
    ]);

  return {
    generatedAt: new Date().toISOString(),
    latestAudits: {
      bruceac: bruceLatest,
      meraki: merakiLatest,
    },
    auditsBySite: {
      bruceac: bruce30,
      meraki: meraki30,
    },
    recommendations,
    findings,
  };
}

export function isSiteSlug(value: string): value is SiteSlug {
  return value === "bruceac" || value === "meraki";
}

export function isRecommendationStatus(
  value: string,
): value is RecommendationStatus {
  return ["not_started", "in_progress", "completed", "blocked"].includes(value);
}
