import { NextResponse } from "next/server";
import { deleteDocument, type DocumentKind, updateDocumentMetadata } from "@/lib/workshop";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const kind = String(body.kind || "technical_doc") as DocumentKind;
    return NextResponse.json(
      await updateDocumentMetadata({
        id: String(body.id || ""),
        teamId: body.teamId ? String(body.teamId) : undefined,
        competitionId: body.competitionId ? String(body.competitionId) : undefined,
        name: String(body.name || ""),
        kind,
        isSampleReport: Boolean(body.isSampleReport) || kind === "sample_report",
      }),
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Belge guncellenemedi." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(
      await deleteDocument({
        id: String(body.id || ""),
        teamId: body.teamId ? String(body.teamId) : undefined,
        competitionId: body.competitionId ? String(body.competitionId) : undefined,
      }),
    );
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Belge silinemedi." }, { status: 400 });
  }
}
