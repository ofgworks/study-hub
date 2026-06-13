"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  FileStack,
  FolderOpen,
  History,
  Images,
  Info,
  LayoutDashboard,
  Search,
  Trophy,
  Wand2,
  X,
} from "lucide-react";
import type { Snapshot } from "@/lib/workshop";
import { Badge, fmtDate } from "./brain/ui";
import { DashboardView } from "./brain/DashboardView";
import { DocumentsView, SearchView } from "./brain/DocumentsView";
import { WizardView } from "./brain/WizardView";
import { DraftsView } from "./brain/DraftsView";
import { FeedbackView } from "./brain/FeedbackView";
import { VisualsView } from "./brain/VisualsView";

type ViewId = "dashboard" | "documents" | "visuals" | "search" | "wizard" | "drafts" | "feedback";

const navigation: { id: ViewId; label: string; icon: typeof LayoutDashboard; hint: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, hint: "Takımlar ve durum" },
  { id: "documents", label: "Belgeler", icon: FolderOpen, hint: "Yükle, tara, katalogla" },
  { id: "visuals", label: "Görseller", icon: Images, hint: "Diagram ve şekilleri sınıflandır" },
  { id: "search", label: "Kaynak Arama", icon: Search, hint: "Belgelerde kaynaklı ara" },
  { id: "wizard", label: "Rapor Sihirbazı", icon: Wand2, hint: "Adım adım taslak üret" },
  { id: "drafts", label: "Taslaklar & Teslim", icon: FileStack, hint: "Bölümler, denetim, DOCX" },
  { id: "feedback", label: "Geri Bildirim Hafızası", icon: History, hint: "Puanlar ve kararlar" },
];

type Toast = { tone: "ok" | "risk" | "info"; text: string } | null;

export function WorkshopBrainApp() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [view, setView] = useState<ViewId>("dashboard");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/brain", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as Snapshot;
      setSnapshot(data);
      setLoadError(null);
      setSelectedCompetitionId((current) => {
        if (current && data.competitions.some((competition) => competition.id === current)) return current;
        const teamCompetitionId = data.teams.find((team) => team.id === selectedTeamId)?.competitionId;
        return teamCompetitionId || data.competitions[0]?.id || "";
      });
      setSelectedTeamId((current) => {
        if (current && data.teams.some((team) => team.id === current)) return current;
        const competitionId = data.teams.find((team) => team.id === current)?.competitionId || data.competitions[0]?.id;
        return data.teams.find((team) => team.competitionId === competitionId)?.id || data.teams[0]?.id || "";
      });
    } catch {
      setLoadError("Proje beyni yüklenemedi. Sunucunun çalıştığından emin olup sayfayı yenile.");
    }
  }, [selectedTeamId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!toast || toast.tone === "risk") return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((tone: "ok" | "risk" | "info", text: string) => {
    setToast({ tone, text });
  }, []);

  const competition = useMemo(() => snapshot?.competitions.find((item) => item.id === selectedCompetitionId), [snapshot?.competitions, selectedCompetitionId]);
  const competitionTeams = useMemo(
    () => snapshot?.teams.filter((item) => item.competitionId === selectedCompetitionId) || [],
    [snapshot?.teams, selectedCompetitionId],
  );
  const team = useMemo(() => snapshot?.teams.find((item) => item.id === selectedTeamId), [snapshot?.teams, selectedTeamId]);
  const teamReports = useMemo(
    () => snapshot?.reports.filter((report) => report.teamId === selectedTeamId) || [],
    [snapshot?.reports, selectedTeamId],
  );
  const teamDocs = useMemo(
    () =>
      snapshot?.documents.filter(
        (doc) =>
          (doc.scope !== "competition" && doc.teamId === selectedTeamId) ||
          (doc.scope === "competition" && doc.competitionId === selectedCompetitionId),
      ) || [],
    [snapshot?.documents, selectedTeamId, selectedCompetitionId],
  );
  const contextReport = teamReports.find((report) => report.id === selectedReportId) || teamReports[0];

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-6">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertTriangle className="mx-auto text-red-500" size={28} />
          <p className="mt-3 text-sm font-semibold text-red-900">{loadError}</p>
          <button onClick={() => void refresh()} className="primary-btn mt-4 justify-center">Yeniden dene</button>
        </div>
      </main>
    );
  }

  if (!snapshot) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-100">
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <BrainCircuit className="animate-pulse text-sky-600" size={20} /> Proje beyni yükleniyor...
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-neutral-100 text-neutral-900">
      {/* kenar cubugu */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-950 lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
            <BrainCircuit size={20} />
          </span>
          <div>
            <div className="text-sm font-bold tracking-tight text-white">Atölye Beyni</div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Rapor Üretim Sistemi</div>
          </div>
        </div>
        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                  active ? "bg-sky-500/15 text-sky-300" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <item.icon size={17} className="shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block truncate text-[10px] text-slate-500">{item.hint}</span>
                </span>
              </button>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 px-5 py-4 text-[10px] leading-4 text-slate-500">
          Veriler yerel olarak <code className="text-slate-400">workspace/</code> klasöründe saklanır.
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* baglam cubugu */}
        <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3">
            {/* mobil nav */}
            <select
              value={view}
              onChange={(event) => setView(event.target.value as ViewId)}
              className="input !w-auto bg-white text-sm font-semibold lg:hidden"
            >
              {navigation.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>

            <ContextItem label="Yarışma">
              <select
                value={selectedCompetitionId}
                onChange={(event) => {
                  const nextCompetitionId = event.target.value;
                  setSelectedCompetitionId(nextCompetitionId);
                  const nextTeam = snapshot.teams.find((item) => item.competitionId === nextCompetitionId);
                  setSelectedTeamId(nextTeam?.id || "");
                  setSelectedReportId(null);
                }}
                className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm font-semibold text-neutral-900"
              >
                {snapshot.competitions.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </ContextItem>

            <ContextItem label="Takım">
              <select
                value={selectedTeamId}
                onChange={(event) => {
                  setSelectedTeamId(event.target.value);
                  setSelectedReportId(null);
                }}
                className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm font-semibold text-neutral-900"
              >
                {competitionTeams.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </ContextItem>

            {contextReport ? (
              <>
                <ContextItem label="Rapor">
                  <button onClick={() => setView("drafts")} className="text-sm font-semibold text-neutral-900 hover:text-sky-700 hover:underline">
                    {contextReport.title}
                  </button>
                </ContextItem>
                <ContextItem label="Yarışma">
                  <span className="text-sm text-neutral-700">{contextReport.competition} {contextReport.year} · {contextReport.reportType}</span>
                </ContextItem>
                <ContextItem label="Durum">
                  <Badge tone={contextReport.missingInfo.length > 0 ? "warn" : "ok"}>
                    {contextReport.missingInfo.length > 0 ? `Taslak · ${contextReport.missingInfo.length} eksik` : "Taslak hazır"}
                  </Badge>
                </ContextItem>
              </>
            ) : (
              <ContextItem label="Durum">
                <Badge tone={teamDocs.length > 0 ? "info" : "neutral"}>
                  {teamDocs.length > 0 ? `${teamDocs.length} belge indekslendi · rapor bekleniyor` : "Proje beyni kuruluyor"}
                </Badge>
              </ContextItem>
            )}

            <div className="ml-auto hidden text-[11px] text-neutral-400 sm:block">
              {competition ? <span className="inline-flex items-center gap-1"><Trophy size={13} /> {competition.name}</span> : team ? `Oluşturuldu: ${fmtDate(team.createdAt)}` : null}
            </div>
          </div>
        </header>

        {/* bildirim */}
        {toast ? (
          <div className="px-5 pt-4">
            <div
              className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                toast.tone === "ok"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : toast.tone === "risk"
                    ? "border-red-200 bg-red-50 text-red-900"
                    : "border-sky-200 bg-sky-50 text-sky-900"
              }`}
            >
              <span className="flex items-start gap-2">
                {toast.tone === "ok" ? <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> : toast.tone === "risk" ? <AlertTriangle size={17} className="mt-0.5 shrink-0" /> : <Info size={17} className="mt-0.5 shrink-0" />}
                {toast.text}
              </span>
              <button onClick={() => setToast(null)} className="shrink-0 opacity-60 hover:opacity-100" aria-label="Kapat">
                <X size={15} />
              </button>
            </div>
          </div>
        ) : null}

        <div className="px-5 py-6">
          {view === "dashboard" ? (
            <DashboardView
              snapshot={snapshot}
              selectedCompetitionId={selectedCompetitionId}
              selectedTeamId={selectedTeamId}
              onSelectCompetition={(competitionId) => {
                setSelectedCompetitionId(competitionId);
                const nextTeam = snapshot.teams.find((item) => item.competitionId === competitionId);
                setSelectedTeamId(nextTeam?.id || "");
                setSelectedReportId(null);
              }}
              onSelectTeam={(teamId) => {
                setSelectedTeamId(teamId);
                setSelectedReportId(null);
              }}
              onNavigate={(next) => setView(next as ViewId)}
              notify={notify}
              refresh={refresh}
            />
          ) : null}
          {view === "documents" ? <DocumentsView key={`${selectedCompetitionId}-${selectedTeamId}`} snapshot={snapshot} competitionId={selectedCompetitionId} teamId={selectedTeamId} notify={notify} refresh={refresh} /> : null}
          {view === "visuals" ? <VisualsView key={`${selectedCompetitionId}-${selectedTeamId}`} snapshot={snapshot} competitionId={selectedCompetitionId} teamId={selectedTeamId} notify={notify} refresh={refresh} /> : null}
          {view === "search" ? <SearchView key={selectedTeamId} snapshot={snapshot} teamId={selectedTeamId} notify={notify} /> : null}
          {view === "wizard" ? (
            <WizardView
              key={selectedTeamId}
              snapshot={snapshot}
              competitionId={selectedCompetitionId}
              teamId={selectedTeamId}
              notify={notify}
              refresh={refresh}
              onNavigate={(next) => setView(next as ViewId)}
              onOpenDraft={(reportId) => {
                setSelectedReportId(reportId);
                setView("drafts");
              }}
            />
          ) : null}
          {view === "drafts" ? (
            <DraftsView
              snapshot={snapshot}
              teamId={selectedTeamId}
              selectedReportId={selectedReportId}
              onSelectReport={setSelectedReportId}
              notify={notify}
              refresh={refresh}
              onNavigate={(next) => setView(next as ViewId)}
            />
          ) : null}
          {view === "feedback" ? <FeedbackView key={selectedTeamId} snapshot={snapshot} teamId={selectedTeamId} notify={notify} refresh={refresh} /> : null}
        </div>
      </div>
    </main>
  );
}

function ContextItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</span>
      {children}
    </div>
  );
}
