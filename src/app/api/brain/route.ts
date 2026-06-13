import { NextResponse } from "next/server";
import { createCompetition, createTeam, deleteTeam, getSnapshot, reindexDocuments, rescanTeamUploads, scanTeamFolder, updateAiSettings } from "@/lib/workshop";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getSnapshot());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "create_team") {
      return NextResponse.json(
        createTeam(
          String(body.name || ""),
          body.competitionId ? String(body.competitionId) : undefined,
          body.folderPath ? String(body.folderPath) : undefined,
        ),
      );
    }

    if (body.action === "create_competition") {
      return NextResponse.json(createCompetition({ name: String(body.name || ""), description: String(body.description || "") }));
    }

    if (body.action === "scan_folder") {
      return NextResponse.json(await scanTeamFolder(String(body.teamId || ""), body.folderPath ? String(body.folderPath) : undefined));
    }

    if (body.action === "rescan_uploads") {
      return NextResponse.json(await rescanTeamUploads(String(body.teamId || "")));
    }

    if (body.action === "reindex_documents") {
      return NextResponse.json(
        await reindexDocuments({
          teamId: body.teamId ? String(body.teamId) : undefined,
          competitionId: body.competitionId ? String(body.competitionId) : undefined,
        }),
      );
    }

    if (body.action === "delete_team") {
      return NextResponse.json(deleteTeam(String(body.teamId || "")));
    }

    if (body.action === "update_ai_settings") {
      return NextResponse.json(updateAiSettings({ openAiModel: String(body.openAiModel || "") }));
    }

    return NextResponse.json({ error: "Bilinmeyen islem." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Islem tamamlanamadi." }, { status: 400 });
  }
}
