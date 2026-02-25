import { NextRequest, NextResponse } from "next/server";
import { getFindings, isSiteSlug } from "@/lib/data";
import type { FindingSeverity } from "@/types/dashboard";

const severities: FindingSeverity[] = ["critical", "high", "medium", "low"];

export async function GET(request: NextRequest) {
  const site = request.nextUrl.searchParams.get("site");
  const severity = request.nextUrl.searchParams.get("severity");

  if (site && !isSiteSlug(site)) {
    return NextResponse.json({ error: "Invalid site" }, { status: 400 });
  }

  if (severity && !severities.includes(severity as FindingSeverity)) {
    return NextResponse.json({ error: "Invalid severity" }, { status: 400 });
  }

  try {
    const findings = await getFindings({
      site: (site as "bruceac" | "meraki" | null) ?? undefined,
      severity: (severity as FindingSeverity | null) ?? undefined,
      limit: 200,
    });

    return NextResponse.json({ data: findings });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch findings", details: String(error) },
      { status: 500 },
    );
  }
}
