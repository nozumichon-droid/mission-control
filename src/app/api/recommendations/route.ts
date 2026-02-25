import { NextRequest, NextResponse } from "next/server";
import { getRecommendations, isSiteSlug } from "@/lib/data";

export async function GET(request: NextRequest) {
  const site = request.nextUrl.searchParams.get("site");

  if (site && !isSiteSlug(site)) {
    return NextResponse.json({ error: "Invalid site" }, { status: 400 });
  }

  try {
    const recommendations = await getRecommendations(
      (site as "bruceac" | "meraki" | null) ?? undefined,
    );
    return NextResponse.json({ data: recommendations });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch recommendations", details: String(error) },
      { status: 500 },
    );
  }
}
