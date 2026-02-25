import { NextRequest, NextResponse } from "next/server";
import { getAuditHistory, isSiteSlug } from "@/lib/data";

export async function GET(request: NextRequest) {
  const site = request.nextUrl.searchParams.get("site") ?? "bruceac";
  const days = Number(request.nextUrl.searchParams.get("days") ?? 30);

  if (!isSiteSlug(site)) {
    return NextResponse.json({ error: "Invalid site" }, { status: 400 });
  }

  if (!Number.isFinite(days) || days < 1 || days > 365) {
    return NextResponse.json({ error: "days must be between 1 and 365" }, { status: 400 });
  }

  try {
    const audits = await getAuditHistory(site, days);
    return NextResponse.json({ data: audits });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch audit history", details: String(error) },
      { status: 500 },
    );
  }
}
