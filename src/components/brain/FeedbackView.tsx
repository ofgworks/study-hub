"use client";

import { FormEvent, useState } from "react";
import { BookOpenCheck, GitBranch, History, Pencil, Trash2, X } from "lucide-react";
import type { Snapshot } from "@/lib/workshop";
import { Badge, EmptyState, Field, Panel, fmtDate, postJson, requestJson } from "./ui";

const emptyFeedbackForm = {
  competition: "TEKNOFEST",
  year: String(new Date().getFullYear() - 1),
  reportType: "ÖTR",
  reportFileName: "",
  relatedDocumentIds: [] as string[],
  score: "",
  maxScore: "100",
  passStatus: "",
  juryFeedback: "",
  userComment: "",
};

type FeedbackForm = typeof emptyFeedbackForm;

function feedbackRecordToForm(record: Snapshot["feedbackRecords"][number]): FeedbackForm {
  return {
    competition: record.competition,
    year: record.year,
    reportType: record.reportType,
    reportFileName: record.reportFileName,
    relatedDocumentIds: record.relatedDocumentIds || [],
    score: record.score === null ? "" : String(record.score),
    maxScore: record.maxScore === null ? "" : String(record.maxScore),
    passStatus: record.passStatus,
    juryFeedback: record.juryFeedback,
    userComment: record.userComment,
  };
}

const emptyDecisionForm = {
  decision: "",
  previousState: "",
  newState: "",
  rationale: "",
  affectedSections: "",
  dateOrVersion: "",
};

export function FeedbackView({
  snapshot,
  teamId,
  notify,
  refresh,
}: {
  snapshot: Snapshot;
  teamId: string;
  notify: (tone: "ok" | "risk" | "info", text: string) => void;
  refresh: () => Promise<void>;
}) {
  const [tab, setTab] = useState<"feedback" | "decisions">("feedback");
  const records = snapshot.feedbackRecords.filter((record) => record.teamId === teamId);
  const documents = snapshot.documents.filter((doc) => doc.teamId === teamId);
  const decisions = snapshot.decisions.filter((decision) => decision.teamId === teamId);
  const juryProfile = snapshot.juryProfiles.find((profile) => profile.teamId === teamId);

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <TabButton active={tab === "feedback"} onClick={() => setTab("feedback")} icon={History} label={`Jüri geri bildirimleri (${records.length})`} />
        <TabButton active={tab === "decisions"} onClick={() => setTab("decisions")} icon={GitBranch} label={`Teknik karar hafızası (${decisions.length})`} />
      </div>
      {tab === "feedback" ? (
        <FeedbackTab teamId={teamId} records={records} documents={documents} juryProfile={juryProfile} notify={notify} refresh={refresh} />
      ) : (
        <DecisionsTab teamId={teamId} decisions={decisions} notify={notify} refresh={refresh} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof History; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
        active ? "border-sky-400 bg-sky-50 text-sky-900" : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

function FeedbackTab({
  teamId,
  records,
  documents,
  juryProfile,
  notify,
  refresh,
}: {
  teamId: string;
  records: Snapshot["feedbackRecords"];
  documents: Snapshot["documents"];
  juryProfile?: Snapshot["juryProfiles"][number];
  notify: (tone: "ok" | "risk" | "info", text: string) => void;
  refresh: () => Promise<void>;
}) {
  const [form, setForm] = useState(emptyFeedbackForm);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function set(key: Exclude<keyof FeedbackForm, "relatedDocumentIds">, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleDocument(documentId: string) {
    setForm((current) => {
      const selected = new Set(current.relatedDocumentIds);
      if (selected.has(documentId)) {
        selected.delete(documentId);
      } else {
        selected.add(documentId);
      }
      return { ...current, relatedDocumentIds: Array.from(selected) };
    });
  }

  function startEdit(record: Snapshot["feedbackRecords"][number]) {
    setEditingRecordId(record.id);
    setForm(feedbackRecordToForm(record));
  }

  function cancelEdit() {
    setEditingRecordId(null);
    setForm(emptyFeedbackForm);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const selectedDocumentNames = documents.filter((doc) => form.relatedDocumentIds.includes(doc.id)).map((doc) => doc.name);
      const payload = { ...form, reportFileName: selectedDocumentNames.join(", "), teamId, id: editingRecordId };
      const record = editingRecordId
        ? await requestJson<Snapshot["feedbackRecords"][number]>("/api/brain/feedback", "PUT", payload)
        : await postJson<Snapshot["feedbackRecords"][number]>("/api/brain/feedback", payload);
      cancelEdit();
      await refresh();
      const categories = record.learned.scoreLossCategories;
      notify(
        "ok",
        categories.length
          ? `Geri bildirim memory'ye eklendi: ${categories.length} jüri risk kategorisi çıkarıldı. Takımın jüri profili güncellendi.`
          : "Geri bildirim memory'ye eklendi. Jüri profili güncellendi; yorumları detaylandırırsan analiz güçlenir.",
      );
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Geri bildirim kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function removeRecord(record: Snapshot["feedbackRecords"][number]) {
    if (!window.confirm(`${record.competition} ${record.year} geri bildirimi silinsin mi?`)) return;
    setDeletingId(record.id);
    try {
      await requestJson("/api/brain/feedback", "DELETE", { id: record.id, teamId });
      if (editingRecordId === record.id) cancelEdit();
      await refresh();
      notify("ok", "Geri bildirim silindi. Bu kayda bagli eski denetimler de temizlendi.");
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Geri bildirim silinemedi.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Panel
        title={editingRecordId ? "Geri bildirimi düzenle" : "Geçmiş rapor sonucu öğret"}
        icon={BookOpenCheck}
        actions={
          editingRecordId ? (
            <button type="button" onClick={cancelEdit} className="secondary-btn text-xs">
              <X size={14} /> İptal
            </button>
          ) : null
        }
      >
        <form onSubmit={save} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Yarışma"><input value={form.competition} onChange={(event) => set("competition", event.target.value)} className="input" /></Field>
            <Field label="Yıl"><input value={form.year} onChange={(event) => set("year", event.target.value)} className="input" /></Field>
            <Field label="Rapor türü"><input value={form.reportType} onChange={(event) => set("reportType", event.target.value)} placeholder="ÖTR / KTR / Final" className="input" /></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Puan"><input value={form.score} onChange={(event) => set("score", event.target.value)} inputMode="numeric" className="input" /></Field>
            <Field label="Maks."><input value={form.maxScore} onChange={(event) => set("maxScore", event.target.value)} inputMode="numeric" className="input" /></Field>
          </div>
          <Field label="Sonuç"><input value={form.passStatus} onChange={(event) => set("passStatus", event.target.value)} placeholder="Finale kaldı / elendi / ön elemeyi geçti..." className="input" /></Field>
          <Field label="İlişkili belge" hint="Bu geri bildirimin bağlı olduğu yüklenmiş rapor veya dokümanı seç">
            {documents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-500">
                Henüz yüklenmiş belge yok. Önce Belgeler ekranından rapor veya doküman yükleyebilirsin.
              </div>
            ) : (
              <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2">
                {documents.map((doc) => (
                  <label key={doc.id} className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50">
                    <input
                      type="checkbox"
                      checked={form.relatedDocumentIds.includes(doc.id)}
                      onChange={() => toggleDocument(doc.id)}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-neutral-900">{doc.name}</span>
                      <span className="text-neutral-400">{doc.kind}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </Field>
          <Field label="Jüri geri bildirimi">
            <textarea value={form.juryFeedback} onChange={(event) => set("juryFeedback", event.target.value)} rows={4} placeholder="Jürinin yazılı/sözlü yorumları" className="input resize-none" />
          </Field>
          <Field label="Kendi yorumun">
            <textarea value={form.userComment} onChange={(event) => set("userComment", event.target.value)} rows={2} className="input resize-none" />
          </Field>
          <button disabled={saving} className="primary-btn w-full justify-center disabled:opacity-50">
            <BookOpenCheck size={16} /> {saving ? "Kaydediliyor..." : editingRecordId ? "Geri bildirimi güncelle" : "Geri bildirimi öğret"}
          </button>
        </form>
      </Panel>

      <div className="space-y-3">
        {juryProfile ? (
          <Panel
            title="AI jüri profili"
            icon={History}
            actions={<Badge tone={juryProfile.analysisMode === "ai" ? "ai" : "neutral"}>{juryProfile.analysisMode === "ai" ? "API analizi" : "Yerel analiz"}</Badge>}
          >
            <p className="text-xs leading-5 text-neutral-600">{juryProfile.summary}</p>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <ProfileList title="Jüri seviyor" items={juryProfile.likedPatterns} tone="ok" />
              <ProfileList title="Jüri sevmiyor" items={juryProfile.dislikedPatterns} tone="warn" />
            </div>
            {juryProfile.evidenceComparisons.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Feedback - belge karşılaştırması</p>
                <div className="mt-2 space-y-2">
                  {juryProfile.evidenceComparisons.slice(0, 5).map((item) => (
                    <div key={`${item.feedbackRecordId}-${item.documentId}-${item.feedbackPoint}`} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="truncate text-xs font-semibold text-neutral-800">{item.documentName}</span>
                        <Badge tone={evidenceTone(item.evidenceStatus)}>{item.evidenceStatus}</Badge>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-neutral-700">{item.feedbackPoint}</p>
                      {item.evidenceExcerpt ? <p className="mt-1 text-[11px] leading-4 text-neutral-500">{item.evidenceExcerpt}</p> : null}
                      <p className="mt-1 text-[11px] font-medium leading-4 text-sky-800">{item.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {juryProfile.styleWarnings.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Yazım/kanıt uyarıları</p>
                <ul className="mt-1 space-y-1">
                  {juryProfile.styleWarnings.map((item) => (
                    <li key={item} className="text-xs leading-5 text-neutral-600">• {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Panel>
        ) : null}
        {records.length === 0 ? (
          <EmptyState
            title="Geri bildirim hafızası boş"
            text="Geçmiş ÖTR/KTR puanlarını ve jüri yorumlarını girersen sistem puan kaybı kalıplarını öğrenir ve yeni raporları teslimden önce bunlara karşı denetler."
          />
        ) : (
          records.map((record) => {
            const ratio = record.score !== null && record.maxScore ? record.score / record.maxScore : null;
            return (
              <article key={record.id} className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-neutral-900">{record.competition} {record.year} · {record.reportType}</span>
                    <span className="ml-2 text-xs text-neutral-400">{fmtDate(record.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={ratio === null ? "neutral" : ratio >= 0.75 ? "ok" : ratio >= 0.5 ? "warn" : "risk"}>
                      {record.score ?? "?"} / {record.maxScore ?? "?"}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => startEdit(record)}
                      className="rounded-md border border-neutral-200 p-1.5 text-neutral-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                      title="Geri bildirimi düzenle"
                      aria-label="Geri bildirimi düzenle"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeRecord(record)}
                      disabled={deletingId === record.id}
                      className="rounded-md border border-neutral-200 p-1.5 text-neutral-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                      title="Geri bildirimi sil"
                      aria-label="Geri bildirimi sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-neutral-600">{record.learned.scoreMeaning}</p>
                {record.relatedDocumentNames.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {record.relatedDocumentNames.map((name) => (
                      <Badge key={name} tone="info">{name}</Badge>
                    ))}
                  </div>
                ) : null}
                {record.learned.scoreLossCategories.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {record.learned.scoreLossCategories.map((category) => (
                      <Badge key={category} tone="warn">{category}</Badge>
                    ))}
                  </div>
                ) : null}
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-sky-700">Çıkarılan dersler ve yeni rapor kuralları</summary>
                  <ul className="mt-2 space-y-1">
                    {record.learned.mistakesToAvoid.map((mistake) => (
                      <li key={mistake} className="text-xs leading-5 text-neutral-600">• {mistake}</li>
                    ))}
                    <li className="text-xs leading-5 font-medium text-violet-800">→ {record.learned.competitionSpecificLesson}</li>
                  </ul>
                </details>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function ProfileList({ title, items, tone }: { title: string; items: string[]; tone: "ok" | "warn" }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</p>
        <Badge tone={tone}>{items.length}</Badge>
      </div>
      <ul className="space-y-1">
        {items.slice(0, 5).map((item) => (
          <li key={item} className="text-xs leading-5 text-neutral-700">• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function evidenceTone(status: string) {
  if (status === "Belgede var") return "ok";
  if (status === "Kismen var") return "warn";
  if (status === "Belgede yok") return "risk";
  return "neutral";
}

function DecisionsTab({
  teamId,
  decisions,
  notify,
  refresh,
}: {
  teamId: string;
  decisions: Snapshot["decisions"];
  notify: (tone: "ok" | "risk" | "info", text: string) => void;
  refresh: () => Promise<void>;
}) {
  const [form, setForm] = useState(emptyDecisionForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function set<K extends keyof typeof emptyDecisionForm>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await postJson("/api/brain/decisions", {
        ...form,
        affectedSections: form.affectedSections.split(",").map((item) => item.trim()).filter(Boolean),
        teamId,
      });
      setForm(emptyDecisionForm);
      await refresh();
      notify("ok", "Teknik karar hafızaya eklendi. Yeni rapor üretiminde kaynak olarak kullanılacak.");
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Karar kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function removeDecision(id: string) {
    if (!confirm("Bu kararı silmek istediğinizden emin misiniz?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/brain/decisions?id=${encodeURIComponent(id)}&teamId=${encodeURIComponent(teamId)}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Silinemedi.");
      }
      await refresh();
      notify("info", "Karar hafızadan silindi.");
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Karar silinemedi.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <Panel title="Yeni teknik karar" icon={GitBranch}>
        <form onSubmit={save} className="space-y-3">
          <Field label="Karar"><input value={form.decision} onChange={(event) => set("decision", event.target.value)} required placeholder="Örn. motor sürücüsü değişti" className="input" /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Önceki durum"><input value={form.previousState} onChange={(event) => set("previousState", event.target.value)} className="input" /></Field>
            <Field label="Yeni durum"><input value={form.newState} onChange={(event) => set("newState", event.target.value)} required className="input" /></Field>
          </div>
          <Field label="Mühendislik gerekçesi">
            <textarea value={form.rationale} onChange={(event) => set("rationale", event.target.value)} required rows={3} className="input resize-none" />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Etkilenen bölümler" hint="Virgülle ayır"><input value={form.affectedSections} onChange={(event) => set("affectedSections", event.target.value)} className="input" /></Field>
            <Field label="Tarih / sürüm"><input value={form.dateOrVersion} onChange={(event) => set("dateOrVersion", event.target.value)} className="input" /></Field>
          </div>
          <button disabled={saving} className="primary-btn w-full justify-center disabled:opacity-50">
            <GitBranch size={16} /> {saving ? "Kaydediliyor..." : "Kararı hafızaya ekle"}
          </button>
        </form>
      </Panel>

      <div className="space-y-3">
        {decisions.length === 0 ? (
          <EmptyState
            title="Karar hafızası boş"
            text="Tasarım değişikliklerini buraya kaydet; rapor üretiminde güncel kararlar kaynak olarak kullanılır ve eski/yeni çelişkileri denetlenir."
          />
        ) : (
          decisions.map((decision) => (
            <article key={decision.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-neutral-900">{decision.decision}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400">{decision.dateOrVersion}</span>
                  <button
                    onClick={() => removeDecision(decision.id)}
                    disabled={deletingId === decision.id}
                    className="rounded p-1 text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                    title="Kararı sil"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                <div className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-900">
                  <span className="font-semibold">Önce:</span> {decision.previousState || "-"}
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-emerald-900">
                  <span className="font-semibold">Sonra:</span> {decision.newState}
                </div>
              </div>
              <p className="mt-2 text-xs leading-5 text-neutral-600">{decision.rationale}</p>
              {decision.affectedSections.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {decision.affectedSections.map((section) => (
                    <Badge key={section} tone="info">{section}</Badge>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
