"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Cpu, FileText, FolderOpen, History, Plus, Trash2, Trophy, Users } from "lucide-react";
import type { Snapshot } from "@/lib/workshop";
import { Badge, EmptyState, Field, Panel, StatCard, fmtDate, postJson } from "./ui";

export function DashboardView({
  snapshot,
  selectedCompetitionId,
  selectedTeamId,
  onSelectCompetition,
  onSelectTeam,
  onNavigate,
  notify,
  refresh,
}: {
  snapshot: Snapshot;
  selectedCompetitionId: string;
  selectedTeamId: string;
  onSelectCompetition: (competitionId: string) => void;
  onSelectTeam: (teamId: string) => void;
  onNavigate: (view: string) => void;
  notify: (tone: "ok" | "risk" | "info", text: string) => void;
  refresh: () => Promise<void>;
}) {
  const [competitionName, setCompetitionName] = useState("");
  const [competitionDescription, setCompetitionDescription] = useState("");
  const [creatingCompetition, setCreatingCompetition] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [creating, setCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [modelDraft, setModelDraft] = useState(snapshot.aiSettings.openAiModel);
  const [savingModel, setSavingModel] = useState(false);

  const selectedCompetition = snapshot.competitions.find((competition) => competition.id === selectedCompetitionId);
  const competitionTeams = snapshot.teams.filter((team) => team.competitionId === selectedCompetitionId);
  const competitionDocs = snapshot.documents.filter((doc) => doc.scope === "competition" && doc.competitionId === selectedCompetitionId);
  const teamDocs = snapshot.documents.filter((doc) => doc.scope !== "competition" && doc.teamId === selectedTeamId);
  const teamReports = snapshot.reports.filter((report) => report.teamId === selectedTeamId);
  const teamFeedback = snapshot.feedbackRecords.filter((record) => record.teamId === selectedTeamId);
  const latestReport = teamReports[0];
  const totalMissing = latestReport?.missingInfo.length ?? 0;

  useEffect(() => {
    setModelDraft(snapshot.aiSettings.openAiModel);
  }, [snapshot.aiSettings.openAiModel]);

  async function createCompetition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!competitionName.trim()) return;
    setCreatingCompetition(true);
    try {
      const competition = await postJson<{ id: string }>("/api/brain", {
        action: "create_competition",
        name: competitionName,
        description: competitionDescription,
      });
      const createdName = competitionName.trim();
      setCompetitionName("");
      setCompetitionDescription("");
      onSelectCompetition(competition.id);
      await refresh();
      notify("ok", `"${createdName}" yarışması oluşturuldu. Şimdi altına takım ve yarışma bilgisi ekleyebilirsin.`);
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Yarışma oluşturulamadı.");
    } finally {
      setCreatingCompetition(false);
    }
  }

  async function handleDeleteTeam(teamId: string, teamNameLabel: string) {
    setDeleting(true);
    try {
      await postJson("/api/brain", { action: "delete_team", teamId });
      setConfirmDeleteId(null);
      if (selectedTeamId === teamId) onSelectTeam("");
      await refresh();
      notify("ok", `"${teamNameLabel}" takımı silindi.`);
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Takım silinemedi.");
    } finally {
      setDeleting(false);
    }
  }

  async function createTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!teamName.trim() || !selectedCompetitionId) return;
    setCreating(true);
    try {
      const team = await postJson<{ id: string }>("/api/brain", { action: "create_team", name: teamName, competitionId: selectedCompetitionId });
      const createdName = teamName.trim();
      setTeamName("");
      onSelectTeam(team.id);
      await refresh();
      notify("ok", `"${createdName}" takımı "${selectedCompetition?.name || "seçili yarışma"}" altına eklendi.`);
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Takım oluşturulamadı.");
    } finally {
      setCreating(false);
    }
  }

  async function saveAiModel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!modelDraft.trim()) return;
    setSavingModel(true);
    try {
      await postJson("/api/brain", { action: "update_ai_settings", openAiModel: modelDraft.trim() });
      await refresh();
      notify("ok", `AI modeli "${modelDraft.trim()}" olarak kaydedildi.`);
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "AI modeli kaydedilemedi.");
    } finally {
      setSavingModel(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Yarışma bilgi belgesi" value={competitionDocs.length} tone={competitionDocs.length > 0 ? "ok" : "warn"} sub={selectedCompetition ? selectedCompetition.name : "Yarışma seçilmedi"} />
        <StatCard label="Takım belgesi" value={teamDocs.length} tone={teamDocs.length > 0 ? "ok" : "warn"} sub={teamDocs.length === 0 ? "Henüz belge yok" : `Son: ${fmtDate(teamDocs[teamDocs.length - 1]?.importedAt)}`} />
        <StatCard label="Rapor taslağı" value={teamReports.length} tone={teamReports.length > 0 ? "info" : "neutral"} sub={latestReport ? latestReport.title : "Henüz taslak üretilmedi"} />
        <StatCard label="Jüri geri bildirimi" value={teamFeedback.length} tone={teamFeedback.length > 0 ? "ai" : totalMissing > 0 ? "warn" : "neutral"} sub={latestReport ? `${totalMissing} eksik bilgi` : "Geçmiş puanları öğretebilirsin"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel title="Yarışmalar ve takımlar" icon={Trophy}>
          <form onSubmit={createCompetition} className="mb-5 grid gap-3 border-b border-neutral-100 pb-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
            <Field label="Yeni yarışma">
              <input value={competitionName} onChange={(event) => setCompetitionName(event.target.value)} placeholder="Örn. Çelikkubbe Hava Savunma Sistemi" className="input" />
            </Field>
            <Field label="Kısa not">
              <input value={competitionDescription} onChange={(event) => setCompetitionDescription(event.target.value)} placeholder="Kategori, sezon, ana amaç..." className="input" />
            </Field>
            <button disabled={creatingCompetition || !competitionName.trim()} className="primary-btn disabled:opacity-50">
              <Plus size={16} /> {creatingCompetition ? "Oluşturuluyor..." : "Yarışma oluştur"}
            </button>
          </form>

          <div className="mb-5 flex flex-wrap gap-2">
            {snapshot.competitions.map((competition) => {
              const teams = snapshot.teams.filter((team) => team.competitionId === competition.id);
              const docs = snapshot.documents.filter((doc) => doc.scope === "competition" && doc.competitionId === competition.id);
              const active = competition.id === selectedCompetitionId;
              return (
                <button
                  key={competition.id}
                  type="button"
                  onClick={() => onSelectCompetition(competition.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                    active ? "border-sky-400 bg-sky-50 text-sky-900" : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                  }`}
                >
                  <span className="block font-bold">{competition.name}</span>
                  <span className="text-neutral-400">{teams.length} takım · {docs.length} bilgi</span>
                </button>
              );
            })}
          </div>

          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-neutral-900">{selectedCompetition?.name || "Seçili yarışma"} takımları</h3>
            <Badge tone={competitionTeams.length > 0 ? "info" : "neutral"}>{competitionTeams.length} takım</Badge>
          </div>

          {competitionTeams.length === 0 ? (
            <EmptyState title="Bu yarışma altında henüz takım yok" text="Takımı seçili yarışmanın altına ekleyerek proje beynini kurmaya başla." />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {competitionTeams.map((team) => {
                const docs = snapshot.documents.filter((doc) => doc.scope !== "competition" && doc.teamId === team.id);
                const reports = snapshot.reports.filter((report) => report.teamId === team.id);
                const feedback = snapshot.feedbackRecords.filter((record) => record.teamId === team.id);
                const active = team.id === selectedTeamId;
                const confirming = confirmDeleteId === team.id;
                return (
                  <div key={team.id} className={`rounded-xl border p-4 transition ${active ? "border-sky-400 bg-sky-50 ring-2 ring-sky-100" : "border-neutral-200 bg-white"}`}>
                    <button onClick={() => onSelectTeam(team.id)} className="w-full text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-neutral-900">{team.name}</span>
                        {active ? <Badge tone="info">Aktif</Badge> : null}
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <TeamStat label="Belge" value={docs.length} />
                        <TeamStat label="Taslak" value={reports.length} />
                        <TeamStat label="Jüri notu" value={feedback.length} />
                      </div>
                      <div className="mt-3 text-[11px] text-neutral-400">
                        Son taslak: {reports[0] ? `${reports[0].title} · ${fmtDate(reports[0].createdAt)}` : "yok"}
                      </div>
                    </button>
                    <div className="mt-3 border-t border-neutral-100 pt-3">
                      {confirming ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="flex-1 text-xs text-neutral-600">Takım ve tüm verileri silinecek. Emin misin?</span>
                          <button onClick={() => void handleDeleteTeam(team.id, team.name)} disabled={deleting} className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                            {deleting ? "Siliniyor..." : "Evet, sil"}
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} disabled={deleting} className="rounded-lg border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100">
                            Vazgeç
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(team.id)} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-600">
                          <Trash2 size={13} /> Takımı sil
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <form onSubmit={createTeam} className="mt-5 flex flex-wrap items-end gap-3 border-t border-neutral-100 pt-4">
            <div className="min-w-[220px] flex-1">
              <Field label="Seçili yarışmaya yeni takım">
                <input value={teamName} onChange={(event) => setTeamName(event.target.value)} placeholder="Örn. 860" className="input" />
              </Field>
            </div>
            <button disabled={creating || !teamName.trim() || !selectedCompetitionId} className="primary-btn disabled:opacity-50">
              <Plus size={16} /> {creating ? "Oluşturuluyor..." : "Takım oluştur"}
            </button>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel title="AI ayarları" icon={Cpu}>
            <form onSubmit={saveAiModel} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">OpenAI API</p>
                  <p className="mt-1 text-sm font-semibold text-neutral-900">{snapshot.aiSettings.openAiModel}</p>
                </div>
                <Badge tone={snapshot.aiSettings.apiKeyConfigured ? "ok" : "warn"}>
                  {snapshot.aiSettings.apiKeyConfigured ? "Anahtar bağlı" : "Anahtar yok"}
                </Badge>
              </div>
              <Field label="Model seçimi" hint="Varsayılan düşük maliyetli modeldir; gerekirse daha güçlü veya özel model yazabilirsin.">
                <select value={modelDraft} onChange={(event) => setModelDraft(event.target.value)} className="input bg-white">
                  {snapshot.aiSettings.modelOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label} - {option.note}
                    </option>
                  ))}
                  {!snapshot.aiSettings.modelOptions.some((option) => option.id === modelDraft) ? <option value={modelDraft}>{modelDraft}</option> : null}
                </select>
              </Field>
              <Field label="Özel model slug">
                <input value={modelDraft} onChange={(event) => setModelDraft(event.target.value)} className="input" placeholder={snapshot.aiSettings.defaultModel} />
              </Field>
              <button disabled={savingModel || !modelDraft.trim() || modelDraft === snapshot.aiSettings.openAiModel} className="primary-btn w-full justify-center disabled:opacity-50">
                {savingModel ? "Kaydediliyor..." : "Modeli kaydet"}
              </button>
            </form>
          </Panel>

          <Panel title="Çalışma akışı" icon={ArrowRight}>
            <ol className="space-y-2">
              <FlowStep index={1} title="Yarışma bilgisini öğret" text="Şartname, kural seti, puanlama ve sezon notları yarışma havuzuna eklenir." done={competitionDocs.length > 0} icon={Trophy} onClick={() => onNavigate("documents")} />
              <FlowStep index={2} title="Takım belgelerini ekle" text="Takıma özel proje dosyaları, görseller ve örnek raporlar yüklenir." done={teamDocs.length > 0} icon={FolderOpen} onClick={() => onNavigate("documents")} />
              <FlowStep index={3} title="Geçmiş puanları öğret" text="Önceki ÖTR/KTR puanları ve jüri yorumları takıma bağlanır." done={teamFeedback.length > 0} icon={History} onClick={() => onNavigate("feedback")} />
              <FlowStep index={4} title="Rapor sihirbazını çalıştır" text="Yarışma bilgisi ve takım belgeleri birlikte kaynak havuzuna girer." done={teamReports.length > 0} icon={FileText} onClick={() => onNavigate("wizard")} />
            </ol>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function TeamStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-neutral-50 px-2 py-1.5">
      <div className="text-base font-bold text-neutral-900">{value}</div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">{label}</div>
    </div>
  );
}

function FlowStep({
  index,
  title,
  text,
  done,
  icon: Icon,
  onClick,
}: {
  index: number;
  title: string;
  text: string;
  done: boolean;
  icon: typeof ArrowRight;
  onClick: () => void;
}) {
  return (
    <li>
      <button onClick={onClick} className="flex w-full items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3 text-left transition hover:border-neutral-300 hover:bg-neutral-50">
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
          {done ? "✓" : index}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <Icon size={14} className="text-neutral-400" /> {title}
          </span>
          <span className="mt-0.5 block text-xs leading-5 text-neutral-500">{text}</span>
        </span>
      </button>
    </li>
  );
}
