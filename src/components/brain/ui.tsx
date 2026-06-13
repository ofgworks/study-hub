"use client";

import type { DocumentKind, Snapshot } from "@/lib/workshop";
import type { LucideIcon } from "lucide-react";

/* ---------------------------------- tones ---------------------------------- */
/* Renk anlamlari (urun dili):
   emerald = tamam, amber = eksik/kontrol, red = risk, sky = bilgi/kaynak, violet = AI */

export type Tone = "ok" | "warn" | "risk" | "info" | "ai" | "neutral";

const toneClasses: Record<Tone, string> = {
  ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warn: "border-amber-200 bg-amber-50 text-amber-800",
  risk: "border-red-200 bg-red-50 text-red-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
  ai: "border-violet-200 bg-violet-50 text-violet-800",
  neutral: "border-neutral-200 bg-neutral-100 text-neutral-600",
};

const dotClasses: Record<Tone, string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  risk: "bg-red-500",
  info: "bg-sky-500",
  ai: "bg-violet-500",
  neutral: "bg-neutral-400",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${toneClasses[tone]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} />
      {children}
    </span>
  );
}

/* --------------------------------- panels ---------------------------------- */

export function Panel({
  title,
  icon: Icon,
  actions,
  children,
  tone,
}: {
  title: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children: React.ReactNode;
  tone?: "warn" | "risk";
}) {
  const border = tone === "risk" ? "border-red-200" : tone === "warn" ? "border-amber-200" : "border-neutral-200";
  return (
    <section className={`rounded-xl border ${border} bg-white p-5 shadow-sm`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold text-neutral-900">
          {Icon ? <Icon size={17} className="text-neutral-400" /> : null}
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-neutral-500">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-neutral-400">{hint}</span> : null}
    </label>
  );
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-neutral-700">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-neutral-500">{text}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, sub, tone = "neutral" }: { label: string; value: string | number; sub?: string; tone?: Tone }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">{label}</span>
        <span className={`h-2 w-2 rounded-full ${dotClasses[tone]}`} />
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">{value}</div>
      {sub ? <div className="mt-1 text-xs text-neutral-500">{sub}</div> : null}
    </div>
  );
}

/* ------------------------------ document meta ------------------------------ */

export const kindMeta: Record<DocumentKind, { label: string; tone: Tone; sections: string }> = {
  competition_brief: { label: "Şartname / yarışma", tone: "info", sections: "Gereksinimler, puanlama, güvenlik, teslim kuralları" },
  sample_report: { label: "Başarılı rapor örneği", tone: "ai", sections: "Başlık yapısı, üslup ve bölüm profili" },
  technical_doc: { label: "Teknik belge", tone: "ok", sections: "Sistem tasarımı, mekanik/elektronik/yazılım bölümleri" },
  diagram: { label: "Diagram / görsel", tone: "info", sections: "Sistem mimarisi ve ilgili bölümlere görsel önerisi" },
  meeting_note: { label: "Toplantı / karar notu", tone: "warn", sections: "Güncel kararlar, aşama farkları, tutarlılık denetimi" },
};

export function confidenceForKind(kind: DocumentKind): { label: string; tone: Tone } {
  if (kind === "competition_brief" || kind === "technical_doc") return { label: "Güven: Yüksek", tone: "ok" };
  if (kind === "sample_report" || kind === "meeting_note") return { label: "Güven: Orta", tone: "warn" };
  return { label: "Güven: Düşük", tone: "neutral" };
}

export type SnapshotDocument = Snapshot["documents"][number];

export function isIndexed(doc: SnapshotDocument) {
  return Boolean(doc.summary && doc.summary.trim().length > 0);
}

/* --------------------------------- helpers --------------------------------- */

export function fmtDate(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

export function fmtSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function requestJson<T>(url: string, method: "POST" | "PUT" | "DELETE", body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Sunucuya ulaşılamadı. Uygulamanın çalıştığından emin olup tekrar dene.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || "İşlem tamamlanamadı. Lütfen tekrar dene.");
  }
  return data as T;
}

export async function postJson<T>(url: string, body?: unknown): Promise<T> {
  return requestJson<T>(url, "POST", body);
}
