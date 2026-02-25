import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/lib/data";

export async function GET() {
  try {
    const summary = await getDashboardSummary();
    return NextResponse.json({ data: summary });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data", details: String(error) },
      { status: 500 },
    );
  }
}
