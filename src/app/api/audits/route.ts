import { NextRequest, NextResponse } from "next/server";
import { getLatestAudit, isSiteSlug } from "@/lib/data";

export async function GET(request: NextRequest) {
  const site = request.nextUrl.searchParams.get("site") ?? "bruceac";

  if (!isSiteSlug(site)) {
    return NextResponse.json({ error: "Invalid site" }, { status: 400 });
  }

  try {
    const audit = await getLatestAudit(site);
    return NextResponse.json({ data: audit });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch latest audit", details: String(error) },
      { status: 500 },
    );
  }
}
