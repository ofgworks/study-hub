import { NextResponse } from "next/server";
import { getReport, renderReportDocx, renderReportHtml } from "@/lib/workshop";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const report = getReport(id);
  if (!report) {
    return NextResponse.json({ error: "Rapor bulunamadi." }, { status: 404 });
  }

  const url = new URL(request.url);
  const requestedFormat = url.searchParams.get("format");
  const filenameBase = report.title
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-|-$)/g, "");

  if (requestedFormat === "docx") {
    const buffer = await renderReportDocx(report);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filenameBase || "rapor"}.docx"`,
      },
    });
  }

  const format = requestedFormat === "doc" ? "doc" : "pdf";
  const html = renderReportHtml(report, format);
  const filename = `${filenameBase || "rapor"}.${format === "doc" ? "doc" : "html"}`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": format === "doc" ? "application/msword; charset=utf-8" : "text/html; charset=utf-8",
      "Content-Disposition": format === "doc" ? `attachment; filename="${filename}"` : "inline",
    },
  });
}
