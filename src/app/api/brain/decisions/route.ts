import { NextResponse } from "next/server";
import { createDecision, deleteDecision, listDecisions } from "@/lib/workshop";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get("teamId") || "";
  return NextResponse.json({ decisions: listDecisions(teamId) });
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id") || "";
    const teamId = url.searchParams.get("teamId") || "";
    const result = deleteDecision({ id, teamId });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Karar silinemedi." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const decision = createDecision({
      teamId: String(body.teamId || ""),
      decision: String(body.decision || ""),
      previousState: String(body.previousState || ""),
      newState: String(body.newState || ""),
      rationale: String(body.rationale || ""),
      affectedSections: Array.isArray(body.affectedSections)
        ? body.affectedSections.map(String)
        : String(body.affectedSections || "")
            .split(",")
            .map((item) => item.trim()),
      dateOrVersion: String(body.dateOrVersion || ""),
    });
    return NextResponse.json(decision);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Karar kaydedilemedi." }, { status: 400 });
  }
}
