"use client";

import { FormEvent, useRef, useState } from "react";
import { FolderSync, Pencil, Search, Star, Trash2, Upload, X } from "lucide-react";
import type { DocumentKind, Snapshot } from "@/lib/workshop";
import { Badge, EmptyState, Field, Panel, confidenceForKind, fmtDate, fmtSize, isIndexed, kindMeta, postJson, requestJson } from "./ui";

const documentKinds: { value: DocumentKind; label: string }[] = [
  { value: "competition_brief", label: "Şartname / yarışma dokümanı" },
  { value: "technical_doc", label: "Teknik belge / proje bilgisi" },
  { value: "sample_report", label: "Başarılı rapor örneği" },
  { value: "diagram", label: "Diagram / görsel" },
  { value: "meeting_note", label: "Toplantı / karar notu" },
];

export function DocumentsView({
  snapshot,
  competitionId,
  teamId,
  notify,
  refresh,
}: {
  snapshot: Snapshot;
  competitionId: string;
  teamId: string;
  notify: (tone: "ok" | "risk" | "info", text: string) => void;
  refresh: () => Promise<void>;
}) {
  const competition = snapshot.competitions.find((item) => item.id === competitionId);
  const team = snapshot.teams.find((item) => item.id === teamId);
  const competitionDocuments = snapshot.documents.filter((doc) => doc.scope === "competition" && doc.competitionId === competitionId);
  const documents = snapshot.documents.filter((doc) => doc.scope !== "competition" && doc.teamId === teamId);
  const [folderPath, setFolderPath] = useState(team?.folderPath || "");
  const [competitionUploadKind, setCompetitionUploadKind] = useState<DocumentKind>("competition_brief");
  const [uploadKind, setUploadKind] = useState<DocumentKind>("technical_doc");
  const [busy, setBusy] = useState<"scan" | "upload" | "rescan" | null>(null);
  const [editingDoc, setEditingDoc] = useState<Snapshot["documents"][number] | null>(null);
  const [editName, setEditName] = useState("");
  const [editKind, setEditKind] = useState<DocumentKind>("technical_doc");
  const [savingDoc, setSavingDoc] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [filter, setFilter] = useState<DocumentKind | "all">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const competitionFileInputRef = useRef<HTMLInputElement>(null);

  async function scanFolder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("scan");
    try {
      const result = await postJson<{ importedCount: number }>("/api/brain", { action: "scan_folder", teamId, folderPath });
      await refresh();
      notify("ok", `${result.importedCount} dosya tarandı ve indekslendi.`);
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Klasör taranamadı. Yolun doğru olduğundan emin ol.");
    } finally {
      setBusy(null);
    }
  }

  async function uploadDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set("teamId", teamId);
    form.set("kind", uploadKind);
    form.set("isSampleReport", String(uploadKind === "sample_report"));
    setBusy("upload");
    try {
      const response = await fetch("/api/brain/upload", { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          (data as { error?: string }).error ||
            "Bu belge yüklenirken sorun oluştu. Dosya bozuk olabilir veya desteklenmeyen bir biçim içerebilir.",
        );
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
      await refresh();
      notify("ok", `"${(data as { name?: string }).name || "Belge"}" yüklendi ve indekslendi.`);
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Dosya yüklenemedi.");
    } finally {
      setBusy(null);
    }
  }

  async function uploadCompetitionDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    form.set("scope", "competition");
    form.set("competitionId", competitionId);
    form.set("kind", competitionUploadKind);
    form.set("isSampleReport", "false");
    setBusy("upload");
    try {
      const response = await fetch("/api/brain/upload", { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((data as { error?: string }).error || "Yarışma bilgisi yüklenemedi.");
      }
      if (competitionFileInputRef.current) competitionFileInputRef.current.value = "";
      await refresh();
      notify("ok", `"${(data as { name?: string }).name || "Yarışma bilgisi"}" yarışma havuzuna eklendi.`);
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Yarışma bilgisi yüklenemedi.");
    } finally {
      setBusy(null);
    }
  }

  async function rescanUploads() {
    setBusy("rescan");
    try {
      const result = await postJson<{ importedCount: number }>("/api/brain", { action: "rescan_uploads", teamId });
      await refresh();
      notify("ok", `${result.importedCount} yuklenmis dosya yeniden indekslendi.`);
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Yuklenen dosyalar yeniden indekslenemedi.");
    } finally {
      setBusy(null);
    }
  }

  function startEditDocument(doc: Snapshot["documents"][number]) {
    setEditingDoc(doc);
    setEditName(doc.name);
    setEditKind(doc.kind);
  }

  function cancelEditDocument() {
    setEditingDoc(null);
    setEditName("");
    setEditKind("technical_doc");
  }

  async function saveDocumentEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingDoc) return;
    setSavingDoc(true);
    try {
      await requestJson("/api/brain/documents", "PUT", {
        id: editingDoc.id,
        teamId: editingDoc.scope === "competition" ? undefined : teamId,
        competitionId: editingDoc.scope === "competition" ? competitionId : undefined,
        name: editName,
        kind: editKind,
        isSampleReport: editingDoc.scope === "competition" ? false : editKind === "sample_report",
      });
      cancelEditDocument();
      await refresh();
      notify("ok", "Belge bilgisi guncellendi.");
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Belge guncellenemedi.");
    } finally {
      setSavingDoc(false);
    }
  }

  async function removeDocument(doc: Snapshot["documents"][number]) {
    if (!window.confirm(`"${doc.name}" belgesi silinsin mi? Bu belge indekslerden ve bağlı kayıtlardan kaldırılacak.`)) return;
    setDeletingDocId(doc.id);
    try {
      await requestJson("/api/brain/documents", "DELETE", {
        id: doc.id,
        teamId: doc.scope === "competition" ? undefined : teamId,
        competitionId: doc.scope === "competition" ? competitionId : undefined,
      });
      if (editingDoc?.id === doc.id) cancelEditDocument();
      await refresh();
      notify("ok", "Belge silindi. Bagli rapor kaynaklari ve feedback iliskileri temizlendi.");
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Belge silinemedi.");
    } finally {
      setDeletingDocId(null);
    }
  }

  const filtered = filter === "all" ? documents : documents.filter((doc) => doc.kind === filter);
  const counts = documentKinds.map((kind) => ({ ...kind, count: documents.filter((doc) => doc.kind === kind.value).length }));

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div className="space-y-6">
        <Panel title="Yarışma bilgi havuzu" icon={Upload}>
          <div className="mb-3 rounded-lg border border-sky-200 bg-sky-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Seçili yarışma</p>
            <p className="mt-1 text-sm font-bold text-sky-950">{competition?.name || "Yarışma seçilmedi"}</p>
            <p className="mt-1 text-xs leading-5 text-sky-900">
              Şartname, kurallar, puanlama dokümanı, sezon açıklamaları ve örnek görseller burada yarışmaya öğretilir.
            </p>
            <div className="mt-2">
              <Badge tone={competitionDocuments.length > 0 ? "ok" : "warn"}>{competitionDocuments.length} yarışma bilgisi</Badge>
            </div>
          </div>
          <form onSubmit={uploadCompetitionDocument} className="space-y-3">
            <Field label="Yarışma bilgi dosyası" hint="md, pdf, docx, txt, jpeg/png ve diğer desteklenen dosyalar kullanılabilir.">
              <input ref={competitionFileInputRef} name="file" required type="file" className="input bg-white" />
            </Field>
            <Field label="Bilgi kategorisi">
              <select value={competitionUploadKind} onChange={(event) => setCompetitionUploadKind(event.target.value as DocumentKind)} className="input bg-white">
                {documentKinds.filter((kind) => kind.value !== "sample_report").map((kind) => (
                  <option key={kind.value} value={kind.value}>{kind.label}</option>
                ))}
              </select>
            </Field>
            <button disabled={busy === "upload" || !competitionId} className="primary-btn w-full justify-center disabled:opacity-50">
              <Upload size={16} /> {busy === "upload" ? "Yükleniyor..." : "Yarışmaya ekle"}
            </button>
          </form>
        </Panel>

        <Panel title="Dosya yükle" icon={Upload}>
          <form onSubmit={uploadDocument} className="space-y-3">
            <Field label="Belge" hint="Desteklenen: txt, md, pdf, docx, csv, json, html, mermaid, png, jpg, svg, webp">
              <input ref={fileInputRef} name="file" required type="file" className="input bg-white" />
            </Field>
            <Field label="Kaynak kategorisi" hint="Kategori, belgenin hangi rapor bölümleriyle eşleşeceğini belirler.">
              <select value={uploadKind} onChange={(event) => setUploadKind(event.target.value as DocumentKind)} className="input bg-white">
                {documentKinds.map((kind) => (
                  <option key={kind.value} value={kind.value}>{kind.label}</option>
                ))}
              </select>
            </Field>
            <button disabled={busy === "upload"} className="primary-btn w-full justify-center disabled:opacity-50">
              <Upload size={16} /> {busy === "upload" ? "Yükleniyor..." : "Yükle ve indeksle"}
            </button>
          </form>
        </Panel>

        <Panel title="Klasör tara" icon={FolderSync}>
          <form onSubmit={scanFolder} className="space-y-3">
            <Field label="Takım klasörü" hint="Klasördeki desteklenen tüm dosyalar otomatik kataloglanır.">
              <input value={folderPath} onChange={(event) => setFolderPath(event.target.value)} placeholder="C:\Users\...\TakimBelgeleri" className="input" />
            </Field>
            <button disabled={busy === "scan"} className="secondary-btn w-full justify-center disabled:opacity-50">
              <FolderSync size={16} /> {busy === "scan" ? "Taranıyor..." : "Klasörü tara"}
            </button>
          </form>
          <button type="button" onClick={() => void rescanUploads()} disabled={busy === "rescan"} className="secondary-btn mt-2 w-full justify-center disabled:opacity-50">
            <FolderSync size={16} /> {busy === "rescan" ? "Yeniden indeksleniyor..." : "Yüklenenleri yeniden indeksle"}
          </button>
        </Panel>

        <Panel title="Kaynak dağılımı">
          <div className="space-y-2">
            {counts.map((kind) => (
              <div key={kind.value} className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">{kind.label}</span>
                <Badge tone={kind.count > 0 ? kindMeta[kind.value].tone : "neutral"}>{kind.count}</Badge>
              </div>
            ))}
          </div>
          {documents.length > 0 && !documents.some((doc) => doc.kind === "competition_brief") ? (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              Şartname yüklenmemiş. Şartname olmadan gereksinim eşleştirme tablosu genel kurallarla çalışır.
            </p>
          ) : null}
        </Panel>

        {editingDoc ? (
          <Panel
            title="Belgeyi düzenle"
            icon={Pencil}
            actions={
              <button type="button" onClick={cancelEditDocument} className="secondary-btn text-xs">
                <X size={14} /> İptal
              </button>
            }
          >
            <form onSubmit={saveDocumentEdit} className="space-y-3">
              <Field label="Belge adı">
                <input value={editName} onChange={(event) => setEditName(event.target.value)} className="input" />
              </Field>
              <Field label="Kaynak kategorisi">
                <select value={editKind} onChange={(event) => setEditKind(event.target.value as DocumentKind)} className="input bg-white">
                  {documentKinds.map((kind) => (
                    <option key={kind.value} value={kind.value}>{kind.label}</option>
                  ))}
                </select>
              </Field>
              <button disabled={savingDoc} className="primary-btn w-full justify-center disabled:opacity-50">
                <Pencil size={16} /> {savingDoc ? "Kaydediliyor..." : "Belgeyi güncelle"}
              </button>
            </form>
          </Panel>
        ) : null}
      </div>

      <div className="space-y-6">
      <Panel title={`Yarışma bilgi kütüphanesi (${competitionDocuments.length})`}>
        {competitionDocuments.length === 0 ? (
          <EmptyState title="Bu yarışmaya bilgi eklenmemiş" text="Şartname, kural dokümanı, puanlama açıklaması veya sezon notu ekleyerek yarışmayı AI'a öğret." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {competitionDocuments.map((doc) => {
              const meta = kindMeta[doc.kind];
              const confidence = confidenceForKind(doc.kind);
              const indexed = isIndexed(doc);
              return (
                <article key={doc.id} className="rounded-xl border border-sky-200 bg-sky-50/40 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-neutral-900" title={doc.name}>{doc.name}</div>
                      <div className="mt-0.5 text-[11px] text-neutral-400">
                        {(doc.extension || "dosya").replace(".", "").toUpperCase()} · {fmtSize(doc.size)} · {fmtDate(doc.importedAt)}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Badge tone={indexed ? "ok" : "warn"}>{indexed ? "İndekslendi" : "Metin çıkarılamadı"}</Badge>
                      <button type="button" onClick={() => startEditDocument(doc)} className="rounded-md border border-neutral-200 bg-white p-1.5 text-neutral-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700" title="Belgeyi düzenle" aria-label="Belgeyi düzenle">
                        <Pencil size={14} />
                      </button>
                      <button type="button" onClick={() => void removeDocument(doc)} disabled={deletingDocId === doc.id} className="rounded-md border border-neutral-200 bg-white p-1.5 text-neutral-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50" title="Belgeyi sil" aria-label="Belgeyi sil">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-500">{doc.summary || "Bu belgeden kullanılabilir metin çıkarılamadı; arama ve rapor eşleştirmesinde sınırlı kullanılır."}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <Badge tone={confidence.tone}>{confidence.label}</Badge>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Panel>

      <Panel
        title={`Belge kütüphanesi (${documents.length})`}
        actions={
          <select value={filter} onChange={(event) => setFilter(event.target.value as DocumentKind | "all")} className="input !w-auto bg-white text-xs">
            <option value="all">Tümü</option>
            {documentKinds.map((kind) => (
              <option key={kind.value} value={kind.value}>{kind.label}</option>
            ))}
          </select>
        }
      >
        {documents.length === 0 ? (
          <EmptyState
            title="Bu proje için henüz belge yüklenmemiş"
            text="Şartname, proje bilgi dosyası veya geçmiş rapor yükleyerek başlayabilirsin. Yüklenen her belge indekslenir ve rapor bölümleriyle eşleştirilir."
          />
        ) : filtered.length === 0 ? (
          <EmptyState title="Bu kategoride belge yok" text="Filtreyi değiştir veya soldan yeni belge yükle." />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {filtered.map((doc) => {
              const meta = kindMeta[doc.kind];
              const confidence = confidenceForKind(doc.kind);
              const indexed = isIndexed(doc);
              return (
                <article key={doc.id} className="rounded-xl border border-neutral-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate text-sm font-semibold text-neutral-900">
                        {doc.isSampleReport ? <Star size={13} className="shrink-0 fill-amber-400 text-amber-400" /> : null}
                        <span className="truncate" title={doc.name}>{doc.name}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-neutral-400">
                        {(doc.extension || "dosya").replace(".", "").toUpperCase()} · {fmtSize(doc.size)} · {fmtDate(doc.importedAt)}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Badge tone={indexed ? "ok" : "warn"}>{indexed ? "İndekslendi" : "Metin çıkarılamadı"}</Badge>
                      <button
                        type="button"
                        onClick={() => startEditDocument(doc)}
                        className="rounded-md border border-neutral-200 p-1.5 text-neutral-500 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                        title="Belgeyi düzenle"
                        aria-label="Belgeyi düzenle"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeDocument(doc)}
                        disabled={deletingDocId === doc.id}
                        className="rounded-md border border-neutral-200 p-1.5 text-neutral-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
                        title="Belgeyi sil"
                        aria-label="Belgeyi sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-500">{doc.summary || "Bu belgeden kullanılabilir metin çıkarılamadı; arama ve rapor eşleştirmesinde sınırlı kullanılır."}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    <Badge tone={confidence.tone}>{confidence.label}</Badge>
                  </div>
                  <p className="mt-2 text-[11px] leading-4 text-neutral-400">Uygun bölümler: {meta.sections}</p>
                </article>
              );
            })}
          </div>
        )}
      </Panel>
      </div>
    </div>
  );
}

/* ------------------------------ kaynak arama ------------------------------- */

type SearchResult = {
  documentId: string;
  documentName: string;
  chunkId: string;
  heading: string;
  excerpt: string;
  score: number;
};

export function SearchView({
  snapshot,
  teamId,
  notify,
}: {
  snapshot: Snapshot;
  teamId: string;
  notify: (tone: "ok" | "risk" | "info", text: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const team = snapshot.teams.find((item) => item.id === teamId);
  const documents = snapshot.documents.filter(
    (doc) =>
      (doc.scope !== "competition" && doc.teamId === teamId) ||
      (doc.scope === "competition" && doc.competitionId === team?.competitionId),
  );

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearching(true);
    try {
      const data = await postJson<{ results: SearchResult[] }>("/api/brain/search", { teamId, query, limit: 10 });
      setResults(data.results);
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Arama tamamlanamadı.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <Panel title="Kaynaklı arama" icon={Search}>
      <p className="mb-4 text-sm leading-6 text-neutral-500">
        İndekslenen tüm takım belgelerinde arar; sonuçlar kaynak belge adı ve bölüm başlığıyla birlikte gelir. Rapor üretimi de aynı arama motorunu kullanır.
      </p>
      <form onSubmit={search} className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          required
          placeholder="Batarya güvenliği, test sonuçları, motor tork hesabı..."
          className="input min-w-0 flex-1"
        />
        <button disabled={searching} className="primary-btn disabled:opacity-50">
          <Search size={16} /> {searching ? "Aranıyor..." : "Ara"}
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {documents.length === 0 ? (
          <EmptyState title="Aranacak belge yok" text="Önce Belgeler ekranından şartname veya proje dosyası ekle." />
        ) : results === null ? (
          <EmptyState title="Henüz arama yapılmadı" text="Teknik bir soru yaz; en alakalı belge parçaları kaynaklarıyla listelenir." />
        ) : results.length === 0 ? (
          <EmptyState
            title="Sonuç bulunamadı"
            text="Bu konu için yeterli kaynak yok. Daha kısa anahtar kelimeler dene veya ilgili proje belgesini yükle."
          />
        ) : (
          results.map((result, index) => (
            <article key={result.chunkId} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-semibold text-sky-700">{result.documentName}</span>
                <Badge tone="info">Eşleşme #{index + 1}</Badge>
              </div>
              <h3 className="mt-1 text-sm font-semibold text-neutral-900">{result.heading}</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">{result.excerpt}</p>
            </article>
          ))
        )}
      </div>
    </Panel>
  );
}
