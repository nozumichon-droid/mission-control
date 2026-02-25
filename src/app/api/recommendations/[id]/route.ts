import { NextRequest, NextResponse } from "next/server";
import { isRecommendationStatus, updateRecommendation } from "@/lib/data";
import type { RecommendationStatus } from "@/types/dashboard";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  const recommendationId = (await params).id;

  if (typeof body.status !== "string" || !isRecommendationStatus(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const patch: {
    status: RecommendationStatus;
    blocker_notes?: string | null;
    owner?: string | null;
  } = { status: body.status };

  if ("blocker_notes" in body) {
    patch.blocker_notes = body.blocker_notes ?? null;
  }

  if ("owner" in body) {
    patch.owner = body.owner ?? null;
  }

  try {
    const updated = await updateRecommendation(recommendationId, patch);
    if (!updated) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update recommendation", details: String(error) },
      { status: 500 },
    );
  }
}
