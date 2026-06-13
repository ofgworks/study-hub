import { NextResponse } from "next/server";
import { deleteReportDraft } from "@/lib/workshop";

export const runtime = "nodejs";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(deleteReportDraft({ id, teamId: String(body.teamId || "") }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Rapor taslagi silinemedi." }, { status: 400 });
  }
}
