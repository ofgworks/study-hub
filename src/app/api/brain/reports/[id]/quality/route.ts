import { NextResponse } from "next/server";
import { generateQualityReview, getQualityReview } from "@/lib/workshop";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const review = getQualityReview(id);
  if (!review) {
    return NextResponse.json({ error: "Kalite raporu bulunamadi." }, { status: 404 });
  }
  return NextResponse.json(review);
}

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json(generateQualityReview(id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Kalite raporu olusturulamadi." }, { status: 400 });
  }
}
