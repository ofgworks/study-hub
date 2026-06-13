import { NextResponse } from "next/server";
import { searchBrain } from "@/lib/workshop";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const results = searchBrain(String(body.teamId || ""), String(body.query || ""), Number(body.limit || 6));
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Arama tamamlanamadi." }, { status: 400 });
  }
}
