import { NextResponse } from "next/server";
import { generateReportDraft, type ReportLanguage } from "@/lib/workshop";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const draft = await generateReportDraft({
      teamId: String(body.teamId || ""),
      title: String(body.title || ""),
      competition: String(body.competition || ""),
      year: String(body.year || ""),
      reportType: String(body.reportType || ""),
      language: String(body.language || "tr") as ReportLanguage,
      brief: String(body.brief || ""),
    });

    return NextResponse.json(draft);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Rapor taslagi olusturulamadi." }, { status: 400 });
  }
}
