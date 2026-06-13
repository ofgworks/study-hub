"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, FileText, Sparkles, Wand2 } from "lucide-react";
import type { ReportDraft, ReportLanguage, Snapshot } from "@/lib/workshop";
import { Badge, EmptyState, Field, Panel, postJson } from "./ui";

const reportTypePresets = ["Ön Tasarım Raporu (ÖTR)", "Kritik Tasarım Raporu (KTR)", "Final Raporu", "Teknik Sunum"];

const steps = [
  { id: 0, label: "Rapor bilgileri" },
  { id: 1, label: "Kaynak kontrolü" },
  { id: 2, label: "Not ve üretim" },
  { id: 3, label: "Sonuç" },
];

function initialReportForm() {
  return {
    title: "",
    competition: "TEKNOFEST",
    year: String(new Date().getFullYear()),
    reportType: reportTypePresets[0],
    language: "tr" as ReportLanguage,
    brief: "",
  };
}

export function WizardView({
  snapshot,
  competitionId,
  teamId,
  notify,
  refresh,
  onOpenDraft,
  onNavigate,
}: {
  snapshot: Snapshot;
  competitionId: string;
  teamId: string;
  notify: (tone: "ok" | "risk" | "info", text: string) => void;
  refresh: () => Promise<void>;
  onOpenDraft: (reportId: string) => void;
  onNavigate: (view: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<ReportDraft | null>(null);
  const [form, setForm] = useState(initialReportForm);

  const competition = snapshot.competitions.find((item) => item.id === competitionId);
  const documents = useMemo(
    () =>
      snapshot.documents.filter(
        (doc) =>
          (doc.scope !== "competition" && doc.teamId === teamId) ||
          (doc.scope === "competition" && doc.competitionId === competitionId),
      ),
    [snapshot.documents, teamId, competitionId],
  );
  const feedbackRecords = useMemo(() => snapshot.feedbackRecords.filter((record) => record.teamId === teamId), [snapshot.feedbackRecords, teamId]);
  const decisions = useMemo(() => snapshot.decisions.filter((item) => item.teamId === teamId), [snapshot.decisions, teamId]);
  const profile = snapshot.profiles.find((item) => item.teamId === teamId && item.language === form.language);

  const briefCount = documents.filter((doc) => doc.kind === "competition_brief").length;
  const techCount = documents.filter((doc) => doc.kind === "technical_doc" || doc.kind === "meeting_note").length;
  const sampleCount = documents.filter((doc) => doc.isSampleReport).length;
  const visualCount = documents.filter((doc) => doc.kind === "diagram").length;
  const templateTableCount = profile?.tableTemplates?.length || 0;
  const templateHasCover = Boolean(profile?.coverImagePath);

  const relevantFeedback = feedbackRecords.filter(
    (record) => record.competition.toLocaleLowerCase("tr-TR").includes(form.competition.toLocaleLowerCase("tr-TR").slice(0, 5)) || feedbackRecords.length <= 3,
  );

  const infoComplete = form.title.trim().length > 2 && form.competition.trim().length > 1 && form.reportType.trim().length > 1;

  useEffect(() => {
    if (competition?.name && (form.competition === "TEKNOFEST" || !form.competition.trim())) {
      setForm((current) => ({ ...current, competition: competition.name }));
    }
  }, [competition?.name, form.competition]);

  async function generate() {
    setGenerating(true);
    notify("info", "Kaynaklar bölümlerle eşleştiriliyor ve rapor metni üretiliyor...");
    try {
      const draft = await postJson<ReportDraft>("/api/brain/reports", { ...form, teamId });
      setResult(draft);
      setStep(3);
      await refresh();
      notify(
        "ok",
        draft.generationMode === "ai"
          ? "Taslak AI desteğiyle üretildi. Her bölümün kaynakları görünür durumda."
          : "API anahtarı bulunamadığı için taslak güvenli (uydurmasız) kaynak modunda üretildi.",
      );
    } catch (error) {
      notify("risk", error instanceof Error ? error.message : "Rapor taslağı oluşturulamadı.");
    } finally {
      setGenerating(false);
    }
  }

  function resetWizard() {
    setResult(null);
    setForm(initialReportForm());
    setStep(0);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* adim cubugu */}
      <ol className="flex items-center gap-2">
        {steps.map((item, index) => {
          const state = step === item.id ? "active" : step > item.id ? "done" : "todo";
          return (
            <li key={item.id} className="flex flex-1 items-center gap-2">
              <button
                onClick={() => {
                  if (item.id < step) {
                    if (result) setResult(null);
                    setStep(item.id);
                  }
                }}
                className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                  state === "active"
                    ? "border-sky-400 bg-sky-50 text-sky-900"
                    : state === "done"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-neutral-200 bg-white text-neutral-400"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    state === "done" ? "bg-emerald-500 text-white" : state === "active" ? "bg-sky-500 text-white" : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {state === "done" ? "✓" : index + 1}
                </span>
                <span className="hidden sm:block">{item.label}</span>
              </button>
              {index < steps.length - 1 ? <span className="hidden h-px w-3 shrink-0 bg-neutral-300 sm:block" /> : null}
            </li>
          );
        })}
      </ol>

      {step === 0 ? (
        <Panel title="1 / 4 — Hangi raporu hazırlıyorsun?" icon={FileText}>
          <div className="grid gap-4">
            <Field label="Rapor türü">
              <div className="flex flex-wrap gap-2">
                {reportTypePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setForm({ ...form, reportType: preset })}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      form.reportType === preset ? "border-sky-400 bg-sky-50 text-sky-900" : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <input
                value={form.reportType}
                onChange={(event) => setForm({ ...form, reportType: event.target.value })}
                className="input mt-2"
                placeholder="Veya kendi rapor türünü yaz"
              />
            </Field>
            <Field label="Rapor başlığı">
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Örn. Hava Savunma Sistemi KTR 2026" className="input" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Yarışma">
                <input value={form.competition} onChange={(event) => setForm({ ...form, competition: event.target.value })} className="input" />
              </Field>
              <Field label="Yıl">
                <input value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} className="input" />
              </Field>
              <Field label="Dil">
                <select value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value as ReportLanguage })} className="input bg-white">
                  <option value="tr">Türkçe</option>
                  <option value="en">İngilizce</option>
                </select>
              </Field>
            </div>
            <div className="flex justify-end">
              <button disabled={!infoComplete} onClick={() => setStep(1)} className="primary-btn disabled:opacity-50">
                Kaynak kontrolüne geç <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Panel>
      ) : null}

      {step === 1 ? (
        <Panel title="2 / 4 — Kaynaklar hazır mı?" icon={BookOpenCheck}>
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadinessCard
              label="Şartname / yarışma dokümanı"
              count={briefCount}
              okText="Gereksinim eşleştirme tablosu şartnameden beslenecek."
              missingText="Şartname yok; gereksinim denetimi genel kurallarla yapılır."
              required
            />
            <ReadinessCard
              label="Teknik belge ve proje notu"
              count={techCount}
              okText="Bölüm metinleri bu belgelerden kaynaklı üretilecek."
              missingText="Teknik belge yok; bölümler eksik bilgi uyarısıyla taslaklanır."
              required
            />
            <ReadinessCard
              label="Başarılı rapor örneği"
              count={sampleCount}
              okText="Bölüm başlıkları ve üslup bu örneklerden çıkarıldı."
              missingText="Örnek yok; varsayılan mühendislik rapor şablonu kullanılır."
            />
            <ReadinessCard
              label="Diagram / görsel"
              count={visualCount}
              okText="Mevcut görseller ilgili bölümlere önerilecek."
              missingText="Görsel yok; sistem Mermaid akış önerisi üretecek."
            />
          </div>

          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Kullanılacak bölüm şablonu</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(profile?.headings || []).map((heading) => (
                <span key={heading} className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-600">{heading}</span>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Kullanılacak rapor formatı</p>
            <p className="mt-1 text-xs leading-5 text-sky-900">
              {profile?.sourceDocumentNames?.length
                ? `${profile.sourceDocumentNames.join(", ")} örneklerinden bölüm sırası, tablo mantığı ve kapak düzeni alınacak.`
                : "Henüz başarılı rapor örneği yüklenmedi; varsayılan mühendislik rapor düzeni kullanılacak."}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone={sampleCount > 0 ? "ai" : "neutral"}>{sampleCount} örnek rapor</Badge>
              <Badge tone={templateTableCount > 0 ? "ok" : "warn"}>{templateTableCount} tablo iskeleti</Badge>
              <Badge tone={templateHasCover ? "ok" : "neutral"}>{templateHasCover ? "Kapak görseli var" : "Kapak görseli yok"}</Badge>
            </div>
          </div>

          {relevantFeedback.length > 0 ? (
            <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-4">
              <p className="text-xs font-semibold text-violet-800">
                Geri bildirim hafızası devrede — {relevantFeedback.length} geçmiş kayıt bu rapora uygulanabilir:
              </p>
              <ul className="mt-2 space-y-1">
                {relevantFeedback.slice(0, 3).map((record) => (
                  <li key={record.id} className="text-xs leading-5 text-violet-900">
                    • {record.competition} {record.year} {record.reportType}: {record.learned.scoreLossCategories.slice(0, 3).join(", ") || "genel ders"}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-neutral-200 bg-white p-3 text-xs text-neutral-500">
              Geri bildirim hafızası boş. Geçmiş ÖTR/KTR puanlarını öğretirsen taslak, eski puan kayıplarına karşı da denetlenir.
            </p>
          )}

          {decisions.length > 0 ? (
            <p className="mt-3 text-xs text-neutral-500">{decisions.length} teknik karar kaydı kaynak olarak rapora eklenecek.</p>
          ) : null}

          <div className="mt-5 flex items-center justify-between">
            <button onClick={() => setStep(0)} className="secondary-btn"><ArrowLeft size={16} /> Geri</button>
            {documents.length === 0 ? (
              <button onClick={() => onNavigate("documents")} className="primary-btn">Önce belge yükle</button>
            ) : (
              <button onClick={() => setStep(2)} className="primary-btn">Devam et <ArrowRight size={16} /></button>
            )}
          </div>
        </Panel>
      ) : null}

      {step === 2 ? (
        <Panel title="3 / 4 — Bu rapora özel notun var mı?" icon={Wand2}>
          <Field
            label="Rapor notu (isteğe bağlı)"
            hint="Yeni sezon hedefleri, değişen teknik kararlar, rapora mutlaka girmesi gereken bilgiler. Boş bırakılırsa yalnızca belgeler kullanılır."
          >
            <textarea
              value={form.brief}
              onChange={(event) => setForm({ ...form, brief: event.target.value })}
              rows={7}
              placeholder="Örn. Bu sezon pan-tilt mekanizması yenilendi, ESP32 yerine STM32 kullanılıyor, 15 m senaryosu eklendi..."
              className="input resize-none"
            />
          </Field>

          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-600">
            <p className="font-semibold text-neutral-700">Üretim nasıl çalışır?</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              <li>Her bölüm için ilgili belge parçaları seçilir ve metinle birlikte kaydedilir.</li>
              <li>Belgelerde olmayan bilgi uydurulmaz; eksikler ayrı listeye yazılır.</li>
              <li>API anahtarı yoksa sistem güvenli kaynak moduna geçer — boş çıktı vermez.</li>
            </ul>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button onClick={() => setStep(1)} className="secondary-btn"><ArrowLeft size={16} /> Geri</button>
            <button onClick={generate} disabled={generating} className="primary-btn disabled:opacity-50">
              <Sparkles size={16} /> {generating ? "Üretiliyor... (kaynak eşleştirme sürüyor)" : "Raporu üret"}
            </button>
          </div>
        </Panel>
      ) : null}

      {step === 3 && result ? (
        <Panel title="4 / 4 — Taslak hazır" icon={CheckCircle2}>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-neutral-900">{result.title}</h3>
            <Badge tone={result.generationMode === "ai" ? "ai" : "info"}>
              {result.generationMode === "ai" ? "AI destekli üretim" : "Güvenli kaynak modu (API anahtarı yok)"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-neutral-500">{result.competition} · {result.year} · {result.reportType}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <ResultStat label="Bölüm" value={result.sections.length} tone="ok" />
            <ResultStat label="Kaynak parçası" value={result.sources.length} tone="info" />
            <ResultStat label="Eksik bilgi" value={result.missingInfo.length} tone={result.missingInfo.length ? "warn" : "ok"} />
          </div>

          {result.missingInfo.length > 0 ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800">Teslimden önce tamamlanması gerekenler</p>
              <ul className="mt-2 space-y-1">
                {result.missingInfo.map((item) => (
                  <li key={item} className="text-xs leading-5 text-amber-900">• {item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button onClick={() => onOpenDraft(result.id)} className="primary-btn">
              Bölümleri ve teslim panelini aç <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                setResult(null);
                setStep(2);
              }}
              className="secondary-btn"
            >
              Aynı bilgilerle tekrar üret
            </button>
            <button
              onClick={resetWizard}
              className="secondary-btn"
            >
              Yeni taslak üret
            </button>
          </div>
        </Panel>
      ) : null}

      {step === 3 && !result ? (
        <EmptyState title="Sonuç bulunamadı" text="Sihirbazı baştan çalıştır." action={<button onClick={() => setStep(0)} className="primary-btn">Başa dön</button>} />
      ) : null}
    </div>
  );
}

function ReadinessCard({
  label,
  count,
  okText,
  missingText,
  required,
}: {
  label: string;
  count: number;
  okText: string;
  missingText: string;
  required?: boolean;
}) {
  const ok = count > 0;
  return (
    <div className={`rounded-xl border p-4 ${ok ? "border-emerald-200 bg-emerald-50/50" : required ? "border-amber-300 bg-amber-50" : "border-neutral-200 bg-white"}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-neutral-900">{label}</span>
        <Badge tone={ok ? "ok" : required ? "warn" : "neutral"}>{count} dosya</Badge>
      </div>
      <p className="mt-1.5 text-xs leading-5 text-neutral-500">{ok ? okText : missingText}</p>
    </div>
  );
}

function ResultStat({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" | "info" }) {
  const cls = tone === "ok" ? "border-emerald-200 bg-emerald-50" : tone === "warn" ? "border-amber-200 bg-amber-50" : "border-sky-200 bg-sky-50";
  return (
    <div className={`rounded-xl border p-3 text-center ${cls}`}>
      <div className="text-xl font-bold text-neutral-900">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
    </div>
  );
}
