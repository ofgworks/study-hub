import { NextResponse } from "next/server";
import { createFeedbackRecord, deleteFeedbackRecord, listFeedbackRecords, updateFeedbackRecord } from "@/lib/workshop";

export const runtime = "nodejs";

function feedbackPayload(body: Record<string, unknown>) {
  return {
    teamId: String(body.teamId || ""),
    competition: String(body.competition || ""),
    year: String(body.year || ""),
    reportType: String(body.reportType || ""),
    reportFileName: String(body.reportFileName || ""),
    relatedDocumentIds: Array.isArray(body.relatedDocumentIds) ? body.relatedDocumentIds.map(String) : [],
    score: body.score === "" || body.score === undefined ? null : Number(body.score),
    maxScore: body.maxScore === "" || body.maxScore === undefined ? null : Number(body.maxScore),
    passStatus: String(body.passStatus || ""),
    juryFeedback: String(body.juryFeedback || ""),
    scoreLossReasons: "",
    missingSections: "",
    strongSections: "",
    specNotes: "",
    userComment: String(body.userComment || ""),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get("teamId") || "";
  return NextResponse.json({ feedbackRecords: listFeedbackRecords(teamId) });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const record = await createFeedbackRecord(feedbackPayload(body));
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Geri bildirim kaydedilemedi." }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const record = await updateFeedbackRecord({
      id: String(body.id || ""),
      ...feedbackPayload(body),
    });
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Geri bildirim guncellenemedi." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(await deleteFeedbackRecord({ id: String(body.id || ""), teamId: String(body.teamId || "") }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Geri bildirim silinemedi." }, { status: 400 });
  }
}
