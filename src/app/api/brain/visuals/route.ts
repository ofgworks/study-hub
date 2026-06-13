import { NextResponse } from "next/server";
import { rescanVisualAssets } from "@/lib/workshop";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "rescan_visuals") {
      return NextResponse.json(
        await rescanVisualAssets({
          teamId: body.teamId ? String(body.teamId) : undefined,
          competitionId: body.competitionId ? String(body.competitionId) : undefined,
        }),
      );
    }
    return NextResponse.json({ error: "Bilinmeyen islem." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gorseller siniflandirilamadi." }, { status: 400 });
  }
}
