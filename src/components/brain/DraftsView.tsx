"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, Download, FileText, History, Image as ImageIcon, Plus, ShieldCheck, Trash2 } from "lucide-react";
import type { FeedbackBasedReportReview, QualityReview, ReportDraft, Snapshot } from "@/lib/workshop";
import { Badge, EmptyState, Panel, fmtDate, postJson, requestJson, type Tone } from "./ui";

export function DraftsView({
  snapshot,
  teamId,
  selectedReportId,
  onSelectReport,
  notify,
  refresh,
  onNavigate,
}: {
  snapshot: Snapshot;
  teamId: string;
  selectedReportId: string | null;
  onSelectReport: (reportId: string | null) => void;
  notify: (tone: "ok" | "risk" | "info", text: string) => void;
  refresh: () => Promise<void>;
  onNavigate: (view: string) => void;
}) {
  const reports = useMemo(() => snapshot.reports.filter((report) => report.teamId === teamId), [snapshot.reports, teamId]);
  const report = reports.find((item) => item.id === selectedReportId) || reports[0];
  const [busy, setBusy] = useState<"quality" | "feedback" | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const qualityReview = snapshot.qualityReviews.find((review) => review.reportId === report?.id);
  const feedbackReview = snapshot.feedbackReviews.find((review) => review.reportId === report?.id);

  async function runQuality() {
    if (!report) return;
    setBusy("quality");
    try {
      const review = await postJson<QualityReview>(`/api/brain/reports/${report.id}/quality`);
      await refresh();
      notify("ok", `Jüri / kalite denetimi tamamlandı. Genel puan: ${review.overallScore}/100.`);
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Kalite denetimi tamamlanamadı.");
    } finally {
      setBusy(null);
    }
  }

  async function runFeedbackReview() {
    if (!report) return;
    setBusy("feedback");
    try {
      const review = await postJson<FeedbackBasedReportReview>(`/api/brain/reports/${report.id}/feedback-review`);
      await refresh();
      notify("ok", `Geçmiş geri bildirim denetimi tamamlandı. Risk seviyesi: ${review.riskLevel}.`);
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Geri bildirim denetimi tamamlanamadı.");
    } finally {
      setBusy(null);
    }
  }

  async function deleteDraft(target: ReportDraft) {
    if (!window.confirm(`"${target.title}" taslağı silinsin mi?`)) return;
    setDeletingId(target.id);
    try {
      await requestJson(`/api/brain/reports/${target.id}`, "DELETE", { teamId });
      if (report?.id === target.id) {
        const nextReport = reports.find((item) => item.id !== target.id);
        onSelectReport(nextReport?.id || null);
      }
      await refresh();
      notify("ok", "Taslak silindi. Bu taslağa bağlı jüri ve geri bildirim denetimleri de temizlendi.");
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Taslak silinemedi.");
    } finally {
      setDeletingId(null);
    }
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        title="Bu takım için henüz rapor taslağı yok"
        text="Rapor sihirbazı kaynaklarını kontrol eder ve ilk taslağı bölüm bölüm üretir."
        action={<button onClick={() => onNavigate("wizard")} className="primary-btn">Rapor sihirbazını başlat</button>}
      />
    );
  }
  if (!report) return null;

  const sectionsWithSources = report.sections.filter((section) => section.sourceIds.length > 0).length;

  return (
    <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_330px]">
      {/* taslak listesi */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 px-1">
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">Taslaklar ({reports.length})</p>
          <button
            type="button"
            onClick={() => onNavigate("wizard")}
            className="rounded-md border border-sky-200 bg-sky-50 p-1.5 text-sky-700 transition hover:bg-sky-100"
            title="Yeni taslak üret"
            aria-label="Yeni taslak üret"
          >
            <Plus size={14} />
          </button>
        </div>
        {reports.map((item) => (
          <div
            key={item.id}
            className={`w-full rounded-xl border p-3 text-left transition ${
              item.id === report.id ? "border-sky-400 bg-sky-50" : "border-neutral-200 bg-white hover:bg-neutral-50"
            }`}
          >
            <button type="button" onClick={() => onSelectReport(item.id)} className="block w-full text-left">
              <div className="truncate text-sm font-semibold text-neutral-900">{item.title}</div>
              <div className="mt-0.5 text-[11px] text-neutral-400">{item.reportType} · {fmtDate(item.createdAt)}</div>
            </button>
            <div className="mt-2 flex items-center justify-between gap-2">
              <Badge tone={item.generationMode === "ai" ? "ai" : "info"}>{item.generationMode === "ai" ? "AI" : "Kaynak modu"}</Badge>
              <button
                type="button"
                onClick={() => void deleteDraft(item)}
                disabled={deletingId === item.id}
                className="rounded-md border border-neutral-200 p-1.5 text-neutral-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                title="Taslağı sil"
                aria-label="Taslağı sil"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* bolum kartlari */}
      <div className="space-y-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-neutral-900">{report.title}</h2>
                <Badge tone={report.generationMode === "ai" ? "ai" : "info"}>
                  {report.generationMode === "ai" ? "AI destekli" : "Güvenli kaynak modu"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-neutral-500">{report.competition} · {report.year} · {report.reportType} · {fmtDate(report.createdAt)}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => onNavigate("wizard")} className="secondary-btn text-xs">
                <Plus size={14} /> Yeni taslak
              </button>
              <button
                type="button"
                onClick={() => void deleteDraft(report)}
                disabled={deletingId === report.id}
                className="secondary-btn text-xs text-red-700 hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={14} /> Sil
              </button>
            </div>
          </div>
        </div>

        {report.sections.map((section) => {
          const sources = section.sourceIds
            .map((sourceId) => report.sources.find((source) => source.documentId === sourceId)?.documentName || sourceId)
            .filter((value, index, arr) => arr.indexOf(value) === index);
          const open = openSection === section.title;
          return (
            <article key={section.title} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-bold text-neutral-900">{section.title}</h3>
                <Badge tone={sources.length > 0 ? "ok" : "warn"}>
                  {sources.length > 0 ? `${sources.length} kaynak` : "Kaynak yok"}
                </Badge>
              </div>
              <p className={`mt-2 text-sm leading-6 text-neutral-600 ${open ? "" : "line-clamp-3"}`}>{section.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {sources.map((name) => (
                  <span key={name} className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800">{name}</span>
                ))}
                {sources.length === 0 ? (
                  <span className="text-[11px] text-amber-700">Bu bölüm için yeterli kaynak bulunamadı — proje bilgi dosyası, teknik çizim açıklaması veya test sonucu yükle.</span>
                ) : null}
              </div>
              <button onClick={() => setOpenSection(open ? null : section.title)} className="mt-3 text-xs font-semibold text-sky-700 hover:underline">
                {open ? "Daralt" : "Tam metni göster"}
              </button>
            </article>
          );
        })}

        {/* diagram onerileri */}
        <Panel title="Görsel ve diagram önerileri" icon={ImageIcon}>
          {report.diagrams.length === 0 ? (
            <p className="text-sm text-neutral-500">Bu taslak için görsel önerisi üretilmedi.</p>
          ) : (
            <div className="space-y-3">
              {report.diagrams.map((diagram) => (
                <div key={diagram.title} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-neutral-900">{diagram.title}</span>
                    <Badge tone={diagram.type === "mermaid" ? "ai" : "info"}>{diagram.type === "mermaid" ? "Mermaid önerisi" : "Mevcut görsel"}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">{diagram.reason}</p>
                  {diagram.mermaid ? (
                    <pre className="mt-2 overflow-x-auto rounded-md border border-neutral-200 bg-white p-2 text-[11px] leading-4 text-neutral-700">{diagram.mermaid}</pre>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* teslim paneli */}
      <div className="space-y-4">
        <Panel title="Teslim paneli" icon={ClipboardCheck}>
          <div className="space-y-2">
            <DeliveryRow label="Bölümler" value={`${sectionsWithSources}/${report.sections.length} kaynaklı`} tone={sectionsWithSources === report.sections.length ? "ok" : "warn"} />
            <DeliveryRow label="Eksik bilgi" value={`${report.missingInfo.length} madde`} tone={report.missingInfo.length === 0 ? "ok" : "warn"} />
            <DeliveryRow
              label="Şablon tabloları"
              value={`${report.templateProfile?.tableTemplates?.length || 0}`}
              tone={report.templateProfile?.tableTemplates?.length ? "ok" : "neutral"}
            />
            <DeliveryRow
              label="Kapak formatı"
              value={report.templateProfile?.coverImagePath ? "Alındı" : "Yok"}
              tone={report.templateProfile?.coverImagePath ? "ok" : "neutral"}
            />
            <DeliveryRow label="Kaynak parçası" value={`${report.sources.length}`} tone={report.sources.length > 0 ? "info" : "risk"} />
            <DeliveryRow label="Görsel önerisi" value={`${report.diagrams.length}`} tone={report.diagrams.length > 0 ? "info" : "warn"} />
            <DeliveryRow
              label="Jüri denetimi"
              value={qualityReview ? `${qualityReview.overallScore}/100` : "Yapılmadı"}
              tone={qualityReview ? (qualityReview.overallScore >= 70 ? "ok" : "warn") : "neutral"}
            />
            <DeliveryRow
              label="Geri bildirim riski"
              value={feedbackReview ? feedbackReview.riskLevel : "Denetlenmedi"}
              tone={feedbackReview ? riskTone(feedbackReview.riskLevel) : "neutral"}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <a href={`/api/brain/reports/${report.id}/export?format=docx`} className="primary-btn justify-center">
              <Download size={15} /> DOCX indir
            </a>
            <a href={`/api/brain/reports/${report.id}/export?format=pdf`} target="_blank" className="secondary-btn justify-center">
              <FileText size={15} /> Yazdır / PDF
            </a>
          </div>

          <div className="mt-2 grid gap-2">
            <button onClick={runQuality} disabled={busy !== null} className="secondary-btn justify-center disabled:opacity-50">
              <ShieldCheck size={15} /> {busy === "quality" ? "Denetleniyor..." : qualityReview ? "Jüri denetimini yenile" : "Jüri gibi değerlendir"}
            </button>
            <button onClick={runFeedbackReview} disabled={busy !== null} className="secondary-btn justify-center disabled:opacity-50">
              <History size={15} /> {busy === "feedback" ? "İnceleniyor..." : "Geçmiş puanlarla denetle"}
            </button>
          </div>
        </Panel>

        {report.missingInfo.length > 0 ? (
          <Panel title="Eksik bilgi listesi" tone="warn">
            <ul className="space-y-1.5">
              {report.missingInfo.map((item) => (
                <li key={item} className="text-xs leading-5 text-amber-900">• {item}</li>
              ))}
            </ul>
          </Panel>
        ) : null}

        {qualityReview ? <QualityReviewCard review={qualityReview} /> : null}
        {feedbackReview ? <FeedbackReviewCard review={feedbackReview} /> : null}
      </div>
    </div>
  );
}

function DeliveryRow({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-neutral-600">{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}

function riskTone(risk: string): Tone {
  if (risk === "Dusuk") return "ok";
  if (risk === "Orta") return "warn";
  return "risk";
}

function statusTone(status: string): Tone {
  if (status === "Tamam" || status === "Karsilanmis") return "ok";
  if (status === "Riskli" || status === "Eksik" || status === "Sartnameyle celisiyor") return "risk";
  return "warn";
}

function QualityReviewCard({ review }: { review: QualityReview }) {
  return (
    <Panel title={`Jüri denetimi · ${review.overallScore}/100`} icon={ShieldCheck}>
      <div className="space-y-2">
        <Disclosure title={`Jüri kriterleri (${review.juryEvaluation.length})`}>
          {review.juryEvaluation.map((item) => (
            <div key={item.title} className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-900">{item.title}</span>
                <Badge tone={item.score >= 75 ? "ok" : item.score >= 55 ? "warn" : "risk"}>{item.score}</Badge>
              </div>
              <p className="mt-1 text-[11px] leading-4 text-neutral-500">{item.scoreBoostSuggestion}</p>
            </div>
          ))}
        </Disclosure>
        <Disclosure title={`Şartname eşleştirme (${review.requirementMatches.length})`}>
          {review.requirementMatches.map((item) => (
            <div key={item.requirement} className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] leading-4 text-neutral-700">{item.requirement}</span>
                <Badge tone={statusTone(item.status)}>{item.status}</Badge>
              </div>
            </div>
          ))}
        </Disclosure>
        <Disclosure title={`Teknik tutarlılık (${review.consistencyIssues.length} bulgu)`}>
          {review.consistencyIssues.length === 0 ? (
            <p className="text-xs text-neutral-500">Belirgin çelişki bulunamadı.</p>
          ) : (
            review.consistencyIssues.map((issue) => (
              <div key={issue.inconsistency} className="rounded-lg border border-red-100 bg-red-50 p-2.5">
                <p className="text-[11px] font-semibold text-red-900">{issue.inconsistency}</p>
                <p className="mt-0.5 text-[11px] leading-4 text-red-800">{issue.suggestedFix}</p>
              </div>
            ))
          )}
        </Disclosure>
        <Disclosure title={`Teknik iddia denetimi (${review.technicalClaims.length})`}>
          {review.technicalClaims.map((claim) => (
            <div key={claim.claim} className="rounded-lg border border-neutral-200 bg-neutral-50 p-2.5">
              <p className="text-[11px] leading-4 text-neutral-700">{claim.claim}</p>
              <div className="mt-1 flex gap-1.5">
                <Badge tone={claim.hasEvidence === "Evet" ? "ok" : claim.hasEvidence === "Kismen" ? "warn" : "risk"}>Kanıt: {claim.hasEvidence}</Badge>
                <Badge tone={claim.hasTest === "Evet" ? "ok" : claim.hasTest === "Kismen" ? "warn" : "risk"}>Test: {claim.hasTest}</Badge>
              </div>
            </div>
          ))}
        </Disclosure>
        <Disclosure title={`Son kontrol listesi (${review.deliveryChecklist.length})`}>
          {review.deliveryChecklist.map((item) => (
            <div key={item.item} className="flex items-start justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2.5">
              <span className="text-[11px] leading-4 text-neutral-700">{item.item}</span>
              <Badge tone={statusTone(item.status)}>{item.status}</Badge>
            </div>
          ))}
        </Disclosure>
      </div>
    </Panel>
  );
}

function FeedbackReviewCard({ review }: { review: FeedbackBasedReportReview }) {
  return (
    <Panel title="Geçmiş puan denetimi" icon={History}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-600">Risk seviyesi</span>
        <Badge tone={riskTone(review.riskLevel)}>{review.riskLevel}</Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-neutral-600">{review.generalImpression}</p>
      <p className="mt-2 text-xs font-semibold text-neutral-700">{review.evaluationRange.currentRiskRange}</p>
      <div className="mt-3 space-y-2">
        <Disclosure title={`Öncelikli düzeltmeler (${review.priorityFixes.length})`}>
          {review.priorityFixes.map((fix) => (
            <p key={fix} className="rounded-lg bg-amber-50 p-2 text-[11px] leading-4 text-amber-900">{fix}</p>
          ))}
        </Disclosure>
        <Disclosure title={`Olası jüri soruları (${review.juryQuestions.length})`}>
          {review.juryQuestions.map((question) => (
            <p key={question} className="rounded-lg bg-neutral-50 p-2 text-[11px] leading-4 text-neutral-700">{question}</p>
          ))}
        </Disclosure>
        <Disclosure title={`Kontrol listesi (${review.checklist.length})`}>
          {review.checklist.map((item) => (
            <p key={item} className="rounded-lg bg-neutral-50 p-2 text-[11px] leading-4 text-neutral-700">{item}</p>
          ))}
        </Disclosure>
      </div>
      <p className="mt-3 text-[10px] text-neutral-400">
        {review.appliedFeedbackRecordIds.length} geçmiş geri bildirim kaydı bu denetimde kullanıldı. Farklı yarışmalardan gelen dersler kesin kural olarak uygulanmaz.
      </p>
    </Panel>
  );
}

function Disclosure({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border border-neutral-200">
      <summary className="cursor-pointer select-none rounded-lg px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50">
        {title}
      </summary>
      <div className="space-y-1.5 px-3 pb-3 pt-1">{children}</div>
    </details>
  );
}
