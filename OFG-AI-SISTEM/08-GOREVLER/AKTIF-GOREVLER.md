# Aktif Görevler

Bu dosya devam eden işleri checkbox formatında takip etmek için kullanılır.

## Öncelikli Görevler

- [x] OFG-AI-SISTEM Obsidian çalışma mantığını ana sistem dosyalarına işle. - Sorumlu: Codex - Tarih: 2026-06-11 - İlgili dosya: [[000-HOME]], [[README]], [[AGENTS]], [[CLAUDE]]
- [ ] Yeni proje bilgilerini `01-PROJELER/` altına ekle.
- [ ] Önemli kararları `05-KARAR-KAYITLARI/KARAR-DEFTERI.md` içine işle.
- [ ] Sistem akışı netleştiğinde `02-SISTEM-AKISI/SISTEM-HARITASI.md` dosyasını güncelle.
- [ ] Rapor üretilecekse standart rapor şablonunu kullan.

## Bekleyen Görevler

- [x] AI API bağlantı tercihini netleştir: OpenAI mi, Claude/Anthropic mi, ikisi birden mi? - Karar: Anthropic Claude API seçildi (`@anthropic-ai/sdk`). - Tarih: 2026-06-11
- [x] Seçilen API için `.env.local` kurulumunu yap ve güvenli test et. - Karar: OpenAI API etkin, `OPENAI_API_KEY` algılandı ve model seçimi UI/API ile değiştirilebilir hale getirildi. - Tarih: 2026-06-11

## Tamamlanan Görevler

- [x] Obsidian tabanlı AI proje hafızası iskeletini oluştur.
- [x] Codex ve Claude için zorunlu başlangıç okuması ve görev sonu Markdown güncelleme kuralını sistem notlarına ekle. - Tarih: 2026-06-11
- [x] Kök `study-hub` sistemini anlatan `STUDY-HUB-SISTEM.md` dosyasını oluştur. - Tarih: 2026-06-11
- [x] Geri Bildirim Hafızası kayıtlarına düzenleme ve silme desteği ekle. - Tarih: 2026-06-11 - İlgili dosyalar: `src/components/brain/FeedbackView.tsx`, `src/app/api/brain/feedback/route.ts`, `src/lib/workshop.ts`
- [x] Taslaklar & Teslim ekranında taslak silme ve sınırsız yeni taslak üretme akışını ekle. - Tarih: 2026-06-11 - İlgili dosyalar: `src/components/brain/DraftsView.tsx`, `src/components/brain/WizardView.tsx`, `src/app/api/brain/reports/[id]/route.ts`, `src/lib/workshop.ts`
- [x] Rapor Sihirbazı'nın yüklenen başarılı rapor örneklerinden format, kapak ve tablo şablonu kullanmasını sağla. - Tarih: 2026-06-11 - İlgili dosyalar: `src/lib/workshop.ts`, `src/components/brain/WizardView.tsx`, `src/components/brain/DraftsView.tsx`
- [x] Tarayıcı eklentisinin eklediği body attribute'u nedeniyle oluşan hydration uyarısını bastır. - Tarih: 2026-06-11 - İlgili dosya: `src/app/layout.tsx`
- [x] Jüri geri bildirimi formunu sadeleştir, feedback-belge ilişkisi ve takım bazlı AI jüri profili ekle. - Tarih: 2026-06-11 - İlgili dosyalar: `src/components/brain/FeedbackView.tsx`, `src/app/api/brain/feedback/route.ts`, `src/lib/workshop.ts`
- [x] Jüri profilini API/AI destekli feedback-belge karşılaştırmasına bağla ve yüklenen belgeler için düzenle/sil/yeniden indeksle akışı ekle. - Tarih: 2026-06-11 - İlgili dosyalar: `src/lib/workshop.ts`, `src/components/brain/FeedbackView.tsx`, `src/components/brain/DocumentsView.tsx`, `src/app/api/brain/documents/route.ts`, `src/app/api/brain/route.ts`, `src/app/api/brain/feedback/route.ts`
- [x] AI jüri profilini Anthropic API ile üret (`buildJuryProfileWithAi` → `@anthropic-ai/sdk`, `ANTHROPIC_API_KEY`). - Tarih: 2026-06-11 - İlgili dosya: `src/lib/workshop.ts`
- [x] Teknik kararlar (Decisions) için silme desteği ekle — backend (`deleteDecision` + DELETE endpoint) ve UI (Trash2 butonu). - Tarih: 2026-06-11 - İlgili dosyalar: `src/lib/workshop.ts`, `src/app/api/brain/decisions/route.ts`, `src/components/brain/FeedbackView.tsx`
- [x] OpenAI API entegrasyonunu tek ayar modeline bağla; düşük maliyetli `gpt-5.4-nano` varsayılanı ve sonradan değiştirilebilir model seçimi ekle. - Tarih: 2026-06-11 - İlgili dosyalar: `src/lib/workshop.ts`, `src/app/api/brain/route.ts`, `src/components/brain/DashboardView.tsx`, `.env.example`

- [x] Sistemi yarışma odaklı yapıya taşı; takımları yarışmaların altında grupla ve yarışma bilgi havuzu ekle. - Tarih: 2026-06-12 - İlgili dosyalar: `src/lib/workshop.ts`, `src/app/api/brain/route.ts`, `src/app/api/brain/upload/route.ts`, `src/app/api/brain/documents/route.ts`, `src/components/WorkshopBrainApp.tsx`, `src/components/brain/DashboardView.tsx`, `src/components/brain/DocumentsView.tsx`, `src/components/brain/WizardView.tsx`

- [x] **Görseller akışı**: Sol menüye "Görseller" sekmesi, görsel veri modeli ve `/api/brain/visuals` + `/api/brain/visuals/[id]/image` endpointleri; belge yükleme/tarama sırasında görsel adaylarını sınıflandırma. - Tarih: 2026-06-12 - İlgili dosyalar: `src/lib/workshop.ts`, `src/app/api/brain/visuals/route.ts`, `src/app/api/brain/visuals/[id]/image/route.ts`, `src/components/brain/VisualsView.tsx`, `src/components/WorkshopBrainApp.tsx`
- [x] **PDF metin çıkarımı düzeltildi (rapor kalitesi kök sorunu)**: `extractText` PDF dalı ham latin1 yerine `unpdf` (pdfjs/ToUnicode) kullanıyor; şablon profili raporun gerçek numaralı başlıklarından (`extractReportHeadings`) kuruluyor; eski belgeler için `reindexDocuments` + `/api/brain reindex_documents` eklendi. Sonuç: üretilen taslak artık yüklenen ÖTR'nin yapısını ve teknik içeriğini taşıyor. - Tarih: 2026-06-12 - İlgili dosyalar: `src/lib/pdf-text.ts` (yeni), `src/lib/workshop.ts`, `src/app/api/brain/route.ts`, `package.json`
- [x] **PDF gömülü görsel çıkarımı**: Yüklenen PDF raporlardan gömülü raster görseller (XObject) çıkarılır — DCTDecode→JPEG doğrudan, FlateDecode (RGB/gri, predictor'sız)→sharp ile PNG; SMask/vektör/CMYK/JPX atlanır. Görseller blok şeması, akış, mimari, mekanik, elektronik, yazılım, test, tablo/grafik, kapak ve diğer olarak konu konu sınıflandırılır. Gürültülü `text_reference` filtresi sıkılaştırıldı ("şekilde"/tablo satırı elenir) ve yalnızca gömülü görsel bulunmayan belgelerde devreye girer. - Tarih: 2026-06-12 - İlgili dosyalar: `src/lib/pdf-images.ts` (yeni), `src/lib/workshop.ts`

## Görev Ekleme Formatı

- [ ] Görev açıklaması - Sorumlu: - Son tarih: - İlgili dosya:

## AI Görev Döngüsü

- [ ] Hızlı notları oku ve uygulanabilir maddeleri ayır.
- [ ] Aktif görevleri kontrol et ve çakışan iş var mı bak.
- [ ] Karar defterini kontrol et.
- [ ] Görev bittiyse ilgili checkbox'ı işaretle.
- [ ] Yeni karar oluştuysa karar defterine tarihli kayıt ekle.
- [ ] Belirsizlik varsa ilgili nota `BELIRSIZLIKLER` başlığı ekle.

## 2026-06-14 Tamamlanan Sistem Gorevleri

- [x] Codex ve Claude icin git worktree / branch izolasyonu kurallarini netlestir. - Sorumlu: Codex - Tarih: 2026-06-14 - Ilgili dosyalar: `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `OFG-AI-SISTEM/AGENTS.md`, `OFG-AI-SISTEM/CLAUDE.md`, `OFG-AI-SISTEM/06-AI-TALIMATLARI/AI-CALISMA-KURALLARI.md`, `OFG-AI-SISTEM/02-SISTEM-AKISI/SISTEM-HARITASI.md`
- [x] GitHub remote baglantisini `ofgworks/study-hub` olarak kur ve `main`, `codex/work`, `claude/work` branchlerini push et. - Sorumlu: Codex - Tarih: 2026-06-14 - Ilgili remote: `https://github.com/ofgworks/study-hub.git`
