import { NextResponse } from "next/server";
import { reviewReportWithFeedback } from "@/lib/workshop";

export const runtime = "nodejs";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json(reviewReportWithFeedback(id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Geri bildirim tabanli degerlendirme olusturulamadi." }, { status: 400 });
  }
}
