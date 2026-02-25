import { subDays } from "date-fns";
import type { Audit, Finding, Recommendation } from "@/types/dashboard";

const now = new Date();

export const mockAudits: Audit[] = Array.from({ length: 30 }).flatMap((_, i) => {
  const date = subDays(now, i).toISOString();
  return [
    {
      id: `bruce-${i}`,
      site_slug: "bruceac",
      audit_date: date,
      lighthouse_score: 74 + ((i * 3) % 20),
      lcp_ms: 1500 + ((i * 70) % 1200),
      cls: Number((0.07 + ((i * 0.01) % 0.1)).toFixed(3)),
      fid_ms: 80 + ((i * 9) % 90),
      estimated_seo_visibility: 58 + ((i * 2) % 30),
      conversion_rate: Number((0.11 + ((i * 0.005) % 0.1)).toFixed(3)),
      critical_issues: i % 6 === 0 ? 1 : 0,
      high_priority_issues: (i + 2) % 4,
      created_at: date,
    },
    {
      id: `meraki-${i}`,
      site_slug: "meraki",
      audit_date: date,
      lighthouse_score: 69 + ((i * 4) % 22),
      lcp_ms: 1800 + ((i * 90) % 1300),
      cls: Number((0.09 + ((i * 0.01) % 0.12)).toFixed(3)),
      fid_ms: 95 + ((i * 8) % 100),
      estimated_seo_visibility: 52 + ((i * 3) % 35),
      conversion_rate: Number((0.09 + ((i * 0.004) % 0.08)).toFixed(3)),
      critical_issues: i % 5 === 0 ? 1 : 0,
      high_priority_issues: (i + 1) % 5,
      created_at: date,
    },
  ];
});

export const mockRecommendations: Recommendation[] = [
  {
    id: "r1",
    site_slug: "bruceac",
    title: "Fix homepage hero LCP image preload",
    description: "Preload hero image and convert to AVIF to cut LCP by ~500ms.",
    impact: "high",
    effort_hours: 2,
    priority: "critical",
    status: "in_progress",
    blocker_notes: null,
    category: "speed",
    owner: "Ricky",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
  {
    id: "r2",
    site_slug: "meraki",
    title: "Repair quote form email validation edge cases",
    description: "Client-side and server-side validation mismatch drops submissions.",
    impact: "high",
    effort_hours: 3,
    priority: "critical",
    status: "not_started",
    blocker_notes: null,
    category: "conversion",
    owner: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
  {
    id: "r3",
    site_slug: "meraki",
    title: "Add location pages for top ZIPs",
    description: "Build 5 geo-targeted pages to increase local SEO coverage.",
    impact: "medium",
    effort_hours: 5,
    priority: "high",
    status: "blocked",
    blocker_notes: "Need approved copy deck",
    category: "seo",
    owner: "Content",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
];

export const mockFindings: Finding[] = [
  {
    id: "f1",
    site_slug: "bruceac",
    audit_id: "bruce-0",
    title: "Broken financing link on services page",
    severity: "critical",
    description: "404 on CTA path /financing",
    type: "broken_link",
    created_at: now.toISOString(),
  },
  {
    id: "f2",
    site_slug: "meraki",
    audit_id: "meraki-0",
    title: "Quote form timeout after 12s",
    severity: "high",
    description: "Form endpoint timing out under moderate load.",
    type: "form_error",
    created_at: now.toISOString(),
  },
];
