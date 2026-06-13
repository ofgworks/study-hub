import { NextResponse } from "next/server";
import { type DocumentKind, saveUploadedCompetitionDocument, saveUploadedDocument } from "@/lib/workshop";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya bulunamadi." }, { status: 400 });
    }

    const teamId = String(form.get("teamId") || "");
    const competitionId = String(form.get("competitionId") || "");
    const scope = String(form.get("scope") || "team");
    const kind = String(form.get("kind") || "technical_doc") as DocumentKind;
    const isSampleReport = String(form.get("isSampleReport") || "") === "true";
    const bytes = Buffer.from(await file.arrayBuffer());

    if (scope === "competition") {
      const document = await saveUploadedCompetitionDocument({
        competitionId,
        fileName: file.name,
        bytes,
        kind,
      });
      return NextResponse.json(document);
    }

    const document = await saveUploadedDocument({
      teamId,
      fileName: file.name,
      bytes,
      kind,
      isSampleReport,
    });

    return NextResponse.json(document);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Dosya yuklenemedi." }, { status: 400 });
  }
}
