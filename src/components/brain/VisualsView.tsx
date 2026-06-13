"use client";

import { useMemo, useState } from "react";
import { FileImage, FileText, Images, RefreshCw } from "lucide-react";
import type { Snapshot, VisualCategory } from "@/lib/workshop";
import { Badge, EmptyState, Panel, fmtDate, requestJson, type Tone } from "./ui";

const categoryMeta: Record<VisualCategory, { label: string; tone: Tone; hint: string }> = {
  block_diagram: { label: "Blok şeması", tone: "info", hint: "Alt sistemler ve bağlantılar" },
  flow_diagram: { label: "Akış diyagramı", tone: "ok", hint: "Süreç, algoritma ve iş akışı" },
  system_architecture: { label: "Sistem mimarisi", tone: "ai", hint: "Genel mimari ve entegrasyon" },
  mechanical_design: { label: "Mekanik tasarım", tone: "warn", hint: "Gövde, CAD, montaj ve mekanik kararlar" },
  electrical_design: { label: "Elektronik/donanım", tone: "ok", hint: "Devre, sensör, PCB ve güç mimarisi" },
  software_architecture: { label: "Yazılım mimarisi", tone: "ai", hint: "Modül, kod ve kontrol yazılımı" },
  test_setup: { label: "Test ve doğrulama", tone: "risk", hint: "Deney, validasyon ve kalibrasyon" },
  table_or_chart: { label: "Tablo/grafik", tone: "neutral", hint: "Grafik, puan ve ölçüm tabloları" },
  cover_or_branding: { label: "Kapak/logo", tone: "neutral", hint: "Kapak, logo ve sunum görselleri" },
  other_visual: { label: "Diğer görsel", tone: "neutral", hint: "Henüz net sınıflandırılamayan görseller" },
};

const categoryOrder = Object.keys(categoryMeta) as VisualCategory[];

export function VisualsView({
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
  const [category, setCategory] = useState<VisualCategory | "all">("all");
  const [source, setSource] = useState<"all" | "team" | "competition">("all");
  const [busy, setBusy] = useState(false);

  const team = snapshot.teams.find((item) => item.id === teamId);
  const competition = snapshot.competitions.find((item) => item.id === competitionId);
  const visibleVisuals = useMemo(
    () =>
      snapshot.visuals.filter(
        (visual) =>
          (visual.scope !== "competition" && visual.teamId === teamId) ||
          (visual.scope === "competition" && visual.competitionId === competitionId),
      ),
    [snapshot.visuals, teamId, competitionId],
  );
  const filtered = visibleVisuals.filter((visual) => {
    const categoryMatches = category === "all" || visual.category === category;
    const sourceMatches = source === "all" || (source === "competition" ? visual.scope === "competition" : visual.scope !== "competition");
    return categoryMatches && sourceMatches;
  });
  const categoryCounts = categoryOrder.map((item) => ({
    category: item,
    count: visibleVisuals.filter((visual) => visual.category === item).length,
  }));
  const imageCount = visibleVisuals.filter((visual) => visual.assetPath).length;
  const referenceCount = visibleVisuals.length - imageCount;

  async function rescan() {
    setBusy(true);
    try {
      await requestJson("/api/brain/visuals", "POST", {
        action: "rescan_visuals",
        teamId,
        competitionId,
      });
      await refresh();
      notify("ok", "Görseller ve diagram adayları yeniden sınıflandırıldı.");
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Görseller yeniden sınıflandırılamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        <SummaryCard label="Toplam görsel" value={visibleVisuals.length} tone="info" />
        <SummaryCard label="Önizlenebilir" value={imageCount} tone="ok" />
        <SummaryCard label="PDF/metin adayı" value={referenceCount} tone="warn" />
        <SummaryCard label="Aktif kaynak" value={team?.name || competition?.name || "-"} tone="ai" />
      </div>

      <Panel
        title="Görsel sınıflandırma"
        icon={Images}
        actions={
          <button onClick={() => void rescan()} disabled={busy} className="secondary-btn text-xs disabled:opacity-50">
            <RefreshCw size={14} className={busy ? "animate-spin" : ""} /> Yeniden sınıflandır
          </button>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <FilterButton active={category === "all"} onClick={() => setCategory("all")} label="Tümü" count={visibleVisuals.length} />
          {categoryCounts.map((item) => (
            <FilterButton
              key={item.category}
              active={category === item.category}
              onClick={() => setCategory(item.category)}
              label={categoryMeta[item.category].label}
              count={item.count}
            />
          ))}
        </div>
        <div className="mb-5 flex flex-wrap gap-2">
          <FilterButton active={source === "all"} onClick={() => setSource("all")} label="Tüm kaynaklar" count={visibleVisuals.length} />
          <FilterButton active={source === "team"} onClick={() => setSource("team")} label="Takım raporları" count={visibleVisuals.filter((visual) => visual.scope !== "competition").length} />
          <FilterButton active={source === "competition"} onClick={() => setSource("competition")} label="Yarışma havuzu" count={visibleVisuals.filter((visual) => visual.scope === "competition").length} />
        </div>

        {visibleVisuals.length === 0 ? (
          <EmptyState
            title="Henüz görsel çıkarılmamış"
            text="Rapor, diagram veya görsel yükledikten sonra bu ekranda blok şemaları, akışlar, mekanik çizimler ve diğer görsel adayları sınıflandırılmış olarak görünür."
            action={
              <button onClick={() => void rescan()} disabled={busy} className="primary-btn disabled:opacity-50">
                <RefreshCw size={16} /> İlk sınıflandırmayı çalıştır
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState title="Bu filtrede görsel yok" text="Kategori veya kaynak filtresini değiştirerek diğer görsel adaylarını görebilirsin." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((visual) => {
              const meta = categoryMeta[visual.category];
              const hasImage = Boolean(visual.assetPath);
              return (
                <article key={visual.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                  <div className="flex aspect-[16/10] items-center justify-center bg-neutral-100">
                    {hasImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/api/brain/visuals/${visual.id}/image`} alt={visual.title} className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-neutral-400">
                        <FileText size={34} />
                        <span className="text-xs font-semibold">PDF/metin içi diagram adayı</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <div className="line-clamp-2 text-sm font-semibold text-neutral-900">{visual.title}</div>
                      <div className="mt-1 text-[11px] text-neutral-400">
                        {visual.scope === "competition" ? competition?.name || "Yarışma havuzu" : team?.name || "Takım"} · {fmtDate(visual.extractedAt)}
                      </div>
                    </div>
                    <p className="line-clamp-3 text-xs leading-5 text-neutral-500">{visual.summary}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <Badge tone={visual.confidence === "high" ? "ok" : visual.confidence === "medium" ? "warn" : "neutral"}>
                        {visual.confidence === "high" ? "Güven yüksek" : visual.confidence === "medium" ? "Güven orta" : "Güven düşük"}
                      </Badge>
                      <Badge tone={hasImage ? "info" : "neutral"}>{hasImage ? "Önizleme var" : "Başlık adayı"}</Badge>
                    </div>
                    <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                      <div className="flex items-start gap-2 text-xs text-neutral-600">
                        <FileImage size={14} className="mt-0.5 shrink-0 text-neutral-400" />
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-neutral-800" title={visual.documentName}>{visual.documentName}</div>
                          <div className="mt-1 text-[11px] leading-4 text-neutral-500">{meta.hint}</div>
                          {visual.keywords.length ? <div className="mt-1 text-[11px] text-neutral-400">Etiketler: {visual.keywords.join(", ")}</div> : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string | number; tone: Tone }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="truncate text-2xl font-bold text-neutral-900">{value}</div>
        <Badge tone={tone}>Görsel</Badge>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
        active ? "border-sky-300 bg-sky-50 text-sky-800" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
      }`}
    >
      {label}
      <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px]">{count}</span>
    </button>
  );
}
