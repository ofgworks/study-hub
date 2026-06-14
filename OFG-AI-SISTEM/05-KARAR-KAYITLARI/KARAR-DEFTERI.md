# Karar Defteri

Bu dosya önemli kararların tarihli ve izlenebilir biçimde tutulması için kullanılır.

## Karar Kaydı Formatı

### YYYY-AA-GG - Karar Başlığı

- Durum: Önerildi / Kabul Edildi / Reddedildi / Değiştirildi
- Bağlam:
- Karar:
- Gerekçe:
- Etki:
- İlgili dosyalar:
- Sonraki adımlar:

## Kayıtlar

### 2026-06-11 - Vault İskeleti Oluşturma Kararı

- Durum: Kabul Edildi
- Bağlam: Codex, Claude ve Obsidian tarafından ortak kullanılacak merkezi proje hafızası ihtiyacı.
- Karar: `OFG-AI-SISTEM` klasörü Markdown tabanlı Obsidian vault iskeleti olarak kullanılacak.
- Gerekçe: Proje hafızasının dosya tabanlı, okunabilir ve AI araçları tarafından erişilebilir olması.
- Etki: Görevler, kararlar, raporlar ve diyagramlar tek merkezde takip edilecek.
- İlgili dosyalar: [[README]], [[AGENTS]], [[CLAUDE]], [[AKTIF-GOREVLER]]
- Sonraki adımlar: Aktif projeler ve görevler bu yapıya eklenir.

### 2026-06-11 - OFG-AI Görev Hafızası Protokolü

- Durum: Kabul Edildi
- Bağlam: `study-hub` klasörünün Obsidian vault, AI kontrol paneli ve kalıcı proje hafızası olarak kullanılacak olması.
- Karar: Codex ve Claude her görevden önce `OFG-AI-SISTEM` içindeki ana sistem dosyalarını okuyacak; görev sonunda ilgili Markdown notlarını güncelleyecek.
- Gerekçe: AI çalışmalarının sohbet geçmişinde kaybolmaması, görevlerin izlenebilir olması ve kararların tarihli tutulması.
- Etki: `HIZLI-NOTLAR.md`, `AKTIF-GOREVLER.md`, `KARAR-DEFTERI.md`, `SISTEM-HARITASI.md` ve `AI-CALISMA-KURALLARI.md` aktif hafıza katmanı olarak kullanılacak.
- İlgili dosyalar: [[OFG-AI-SISTEM/README]], [[OFG-AI-SISTEM/AGENTS]], [[OFG-AI-SISTEM/CLAUDE]], [[OFG-AI-SISTEM/06-AI-TALIMATLARI/AI-CALISMA-KURALLARI]]
- Sonraki adımlar: Yeni fikirler önce hızlı notlara yazılır; AI ajanı bunları görevlere, kararlara veya proje notlarına dönüştürür.

### 2026-06-11 - Geri Bildirim Hafızası Kayıtları Düzenlenebilir Olacak

- Durum: Kabul Edildi
- Bağlam: Kullanıcı bir jüri geri bildirimi girdikten sonra bunu sonradan güncellemek veya silmek istiyor.
- Karar: Geri bildirim kayıtlarına düzenleme ve silme desteği eklenecek; kayıt düzenlenince öğrenilen puan kaybı kategorileri yeniden hesaplanacak.
- Gerekçe: Jüri geri bildirimleri zamanla düzeltilebilir veya yanlış girilebilir; hafıza kayıtlarının güncellenebilir olması gerekir.
- Etki: `FeedbackView` ekranında düzenle/sil butonları olacak. PUT/DELETE API yolları eklendi. Değişen veya silinen kayda bağlı eski geri bildirim denetimleri bayat kalmaması için temizlenecek.
- İlgili dosyalar: `src/components/brain/FeedbackView.tsx`, `src/app/api/brain/feedback/route.ts`, `src/lib/workshop.ts`
- Sonraki adımlar: Kullanıcı arayüzünde canlı kullanım sırasında düzenleme/silme deneyimi izlenir; gerekirse karar hafızası için de benzer düzenleme akışı eklenir.

### 2026-06-11 - Rapor Taslakları Silinebilir ve Tekrar Üretilebilir Olacak

- Durum: Kabul Edildi
- Bağlam: Kullanıcı `Taslaklar & Teslim` ekranında ürettiği taslakları silebilmek ve bir taslak oluşturduktan sonra istediği kadar yeni taslak üretebilmek istiyor.
- Karar: Rapor taslaklarına silme API'si ve arayüz butonları eklenecek; rapor sihirbazı sonuç ekranından aynı bilgilerle tekrar üretmeye veya tamamen yeni taslak başlatmaya izin verecek.
- Gerekçe: Taslak üretimi deneme-yanılma gerektiren bir süreçtir; yanlış veya eski taslakların kalması çalışma hafızasını kirletir ve tek üretimle sınırlı akış kullanıcıyı yavaşlatır.
- Etki: Silinen taslağa bağlı jüri kalite denetimleri ve geçmiş geri bildirim denetimleri de temizlenir. `Taslaklar & Teslim` ekranı hem mevcut taslak yönetimini hem yeni üretim geçişini destekler.
- İlgili dosyalar: `src/components/brain/DraftsView.tsx`, `src/components/brain/WizardView.tsx`, `src/app/api/brain/reports/[id]/route.ts`, `src/lib/workshop.ts`
- Sonraki adımlar: Kullanıcı canlı kullanımda taslak üretim sayısı, silme onayı ve sihirbaz geçişlerini dener; gerekirse taslak çoğaltma veya arşivleme seçeneği ayrıca değerlendirilir.

### 2026-06-11 - Rapor Formatı Yüklenen Örnek Raporlardan Alınacak

- Durum: Kabul Edildi
- Bağlam: Kullanıcı Rapor Sihirbazı'nın metin üretmenin ötesine geçip yüklenen başarılı rapor örneklerinin kapak, tablo, bölüm sırası ve düzen özelliklerini kullanmasını istiyor.
- Karar: Başarılı rapor örneklerinden `templateProfile` çıkarılacak; bu profil rapor taslağına kaydedilecek ve DOCX/HTML çıktısında kapak görseli, tablo iskeletleri, format kaynakları ve düzen kuralları kullanılacak.
- Gerekçe: Yarışma raporlarında biçim ve sunum, içerik kadar önemlidir. Örnek rapor formatını hafızaya almak, her taslağın aynı kurumsal/yarışma düzenine yaklaşmasını sağlar.
- Etki: Yeni rapor üretiminden önce şablon profili otomatik yenilenir. Örnek `.docx` içindeki ilk görsel kapak adayı olarak yerelde saklanır; okunabilir tablolar tablo iskeleti olarak export'a eklenir.
- İlgili dosyalar: `src/lib/workshop.ts`, `src/components/brain/WizardView.tsx`, `src/components/brain/DraftsView.tsx`
- Sonraki adımlar: Canlı kullanımda farklı örnek rapor türleriyle tablo ve kapak çıkarımı izlenir; tam birebir Word tema/stil kopyalama gerekirse ayrı bir DOCX şablon motoru değerlendirilir.

### 2026-06-11 - Jüri Feedback Belleği Takım Bazlı İzole Edilecek

- Durum: Kabul Edildi
- Bağlam: Kullanıcı feedback girişinin sade olmasını, yüklenen belgelerle ilişkilendirilebilmesini ve AI'ın her takım için ayrı jüri profili çıkarmasını istiyor.
- Karar: Jüri geri bildirimi formunda yalnızca temel rapor bilgileri, jüri yorumu, ilişkili belgeler ve kullanıcının kendi yorumu kalacak. Her feedback kaydı seçilen belge ID'leriyle bağlanacak ve yalnızca aynı takımın kayıtlarından `juryProfile` üretilecek.
- Gerekçe: Farklı takımların jüri yorumları birbirine karışırsa AI yanlış beklenti öğrenebilir. Belge bağlantısı, feedback'in hangi rapor/doküman bağlamında geldiğini kalıcı hale getirir.
- Etki: `FeedbackView` sadeleşti; `FeedbackRecord` belge ilişkisi taşır; `TeamJuryProfile` takım bazlı memory olarak tutulur. Rapor denetimleri zaten `teamId` filtresiyle çalıştığı için takımlar arası ilişkilendirme yapılmaz.
- İlgili dosyalar: `src/components/brain/FeedbackView.tsx`, `src/app/api/brain/feedback/route.ts`, `src/lib/workshop.ts`
- Sonraki adımlar: Canlı kullanımda jüri profilindeki "seviyor/sevmiyor" maddeleri gözlenir; gerekirse profile özel ağırlıklar rapor üretim prompt'una daha güçlü bağlanır.

### 2026-06-11 - Jüri Profili Feedback ve Belge Karşılaştırmasıyla Üretilecek

- Durum: Kabul Edildi
- Bağlam: Kullanıcı, jüri profili kartının sadece kelime yakalama ile değil, AI'ın yüklenen feedbackleri ilgili belgelerle karşılaştırıp analiz etmesiyle oluşmasını istiyor. Ayrıca elle yüklenen belgeler için düzenleme ve silme akışı gerekiyor.
- Karar: `TeamJuryProfile` üretimi önce OpenAI API ile feedback-belge karşılaştırması yapmayı deneyecek; API anahtarı yoksa aynı kayıtlar üzerinden yerel karşılaştırma analiziyle güvenli fallback çalışacak. Belgeler için PUT/DELETE endpoint'i ve arayüzde düzenle/sil/yeniden indeksle kontrolleri olacak.
- Gerekçe: Jüri yorumu ancak ilgili rapor/doküman bağlamıyla karşılaştırıldığında anlamlı memory'ye dönüşür. Belge yönetimi yapılmadan yanlış veya eski kaynaklar hafızayı kirletebilir.
- Etki: Jüri profili artık `analysisMode`, `evidenceComparisons`, sevilen/sevilmeyen kalıplar, öncelikli kontrol listesi ve stil uyarıları taşır. Belge silinince rapor kaynakları, feedback belge ilişkileri ve jüri profili temizlenir.
- İlgili dosyalar: `src/lib/workshop.ts`, `src/components/brain/FeedbackView.tsx`, `src/components/brain/DocumentsView.tsx`, `src/app/api/brain/documents/route.ts`, `src/app/api/brain/route.ts`
- Sonraki adımlar: OpenAI API anahtarı `.env.local` içinde etkinleştirildiğinde gerçek API analiz kalitesi canlı feedbacklerle gözlenir; gerekirse rapor üretim prompt'una jüri profili daha doğrudan bağlanır.

### 2026-06-11 - OpenAI API ve Değiştirilebilir Model Seçimi

- Durum: Kabul Edildi
- Bağlam: Kullanıcı `.env.local` içine `OPENAI_API_KEY` ekledi ve API'nin sisteme entegre edilmesini, düşük maliyetli model seçilmesini, modelin sonradan değiştirilebilir olmasını istedi.
- Karar: Rapor taslağı ve jüri profili AI üretimleri OpenAI API üzerinden çalışacak. Varsayılan model `gpt-5.4-nano` olacak; Dashboard içindeki AI ayarları panelinden `gpt-5.4-nano`, `gpt-5.4-mini`, `gpt-5.4` veya özel model slug seçilebilecek.
- Gerekçe: Tek API anahtarı ve tek model ayarı operasyonu basitleştirir. `gpt-5.4-nano` düşük maliyetli varsayılan olarak günlük taslak üretimi için uygundur; kritik teslimlerde model yükseltme imkanı korunur.
- Etki: `src/lib/workshop.ts` içinde model ayarı store'a eklendi; `/api/brain` üzerinden güncellenebilir hale geldi; Dashboard model seçimi gösterir.
- İlgili dosyalar: `src/lib/workshop.ts`, `src/app/api/brain/route.ts`, `src/components/brain/DashboardView.tsx`, `.env.example`
- Sonraki adımlar: Canlı rapor üretiminde kalite/maliyet dengesi izlenir; gerekirse varsayılan model `gpt-5.4-mini` veya daha güçlü modele çekilir.

### 2026-06-12 - Yarışma Odaklı Bilgi Mimarisi

- Durum: Kabul Edildi
- Bağlam: Kullanıcı sistemin yalnızca takım odaklı kalması yerine Çelikkubbe, İHA vb. farklı yarışmalar altında birden fazla takım yönetmek istiyor. Ayrıca AI'ın yarışmayı öğrenmesi için MD, PDF ve görsel gibi kaynakları takımdan bağımsız saklama ihtiyacı var.
- Karar: Ana veri modeli `Yarışma -> Takım -> Takım Belgeleri/Raporlar` hiyerarşisine taşınacak. Yarışma şartnamesi, kural dokümanı, not ve görselleri ayrı `yarışma bilgi havuzu` kapsamında tutulacak.
- Gerekçe: Aynı yarışmaya katılan farklı takımlar ortak şartname ve kural bilgisini paylaşmalı; takım raporları ve jüri hafızası ise takım bazlı kalmalı.
- Etki: Dashboard yarışma seçimi ve yarışma altında takım oluşturmayı destekler. Belgeler ekranında yarışma bilgi havuzu ve takım belge kütüphanesi ayrı görünür. Arama, kalite kontrol ve rapor sihirbazı seçili takımın kendi belgeleriyle beraber bağlı olduğu yarışma bilgisini de kullanır.
- İlgili dosyalar: `src/lib/workshop.ts`, `src/app/api/brain/route.ts`, `src/app/api/brain/upload/route.ts`, `src/app/api/brain/documents/route.ts`, `src/components/WorkshopBrainApp.tsx`, `src/components/brain/DashboardView.tsx`, `src/components/brain/DocumentsView.tsx`, `src/components/brain/WizardView.tsx`
- Sonraki adımlar: Kullanıcı ilk gerçek yarışma kayıtlarını oluşturur; mevcut eski takımlar gerekirse varsayılan `Genel Yarışma Havuzu`ndan ilgili yarışmalara taşınacak ayrı bir düzenleme akışıyla ele alınır.

### 2026-06-12 - Görseller Sekmesi ve PDF Gömülü Görsel Çıkarımı

- Durum: Kabul Edildi
- Bağlam: Kullanıcı yüklediği raporlardan (özellikle PDF ÖTR/şartname) görselleri ve diagramları çıkarıp konu konu (blok şeması, akış, mimari vb.) sınıflandırmak ve sol menüden erişmek istiyor.
- Karar: Sol menüye `Görseller` sekmesi eklendi. PDF'lerden gömülü raster görseller harici bağımlılık olmadan çıkarılıyor: DCTDecode akışları doğrudan JPEG; FlateDecode (RGB/gri, predictor'sız) akışları Node `zlib` + `sharp` ile PNG. SMask alfa maskeleri, vektör çizimler, JPX/CCITT/JBIG2 ve CMYK akışlar atlanıyor. Çıkarılan görseller anahtar kelime kuralıyla 10 kategoriye sınıflandırılıyor.
- Gerekçe: Kullanıcının raporları PDF; gömülü görsel çıkarımı olmadan diagramlara erişilemiyordu. `pdfjs`/`pdf-parse` gibi ağır bağımlılık eklemek yerine zaten kurulu olan `sharp` ve yerleşik `zlib` kullanıldı.
- Etki: `VisualAsset` modeline `pdf_image` çıkarım yöntemi eklendi. Yeni `src/lib/pdf-images.ts` modülü PDF XObject ayrıştırması yapar. Gürültülü `text_reference` filtresi sıkılaştırıldı ("şekilde"/tablo satırı/düz cümle elenir) ve yalnızca gömülü görsel bulunmayan belgelerde devreye girer. Doğrulama: 8 gömülü görselli ÖTR'den Proteus devre şeması ve Gantt iş paketleri şeması doğru renklerle çıkarıldı; arayüzde 10 kart gerçek verilerle render edildi.
- İlgili dosyalar: `src/lib/pdf-images.ts` (yeni), `src/lib/workshop.ts`, `src/app/api/brain/visuals/route.ts`, `src/app/api/brain/visuals/[id]/image/route.ts`, `src/components/brain/VisualsView.tsx`, `src/components/WorkshopBrainApp.tsx`
- Sonraki adımlar: Sınıflandırma şu an PDF içi metin altyazılarına ve belge bağlamına dayanıyor; içerik (görsel) tabanlı sınıflandırma için ilerde Vision API değerlendirilebilir. Predictor'lu/CMYK FlateDecode görseller için destek sonradan eklenebilir.

### 2026-06-12 - PDF Metin Çıkarımı `unpdf` ile Düzeltildi (Rapor Kalitesi Kök Sorunu)

- Durum: Kabul Edildi
- Bağlam: Kullanıcı "rapor oluştur"a bastığında üretilen taslak yüklediği ÖTR/KTR örnekleriyle alakasız ve genel çıkıyordu. Kök neden: `extractText` PDF dalı dosyayı yalnızca latin1 olarak okuyup ASCII dışını siliyordu → "metin" aslında ham PDF kaynağı (`%PDF... FlateDecode stream <çöp>`) idi. Böylece (1) AI'a beslenen kaynak alıntıları çöptü, (2) şablon başlıkları gerçek rapordan çıkarılamayıp varsayılana (seed) düşüyordu.
- Karar: PDF metni `unpdf` (pdfjs tabanlı, native bağımlılıksız, serverless uyumlu) ile çıkarılacak; subset/özel kodlamalı fontlar ToUnicode CMap üzerinden çözüldüğü için Türkçe karakterler doğru gelir. El yazımı çıkarıcı subset fontlarda glyph kodu çöpü ürettiği için kütüphane tercih edildi. Ayrıca şablon profili, raporun gerçek numaralı "(N PUAN)" başlık yapısından çıkarılacak (`extractReportHeadings`). Mevcut belgeleri tazelemek için `reindexDocuments` + `/api/brain` `reindex_documents` aksiyonu eklendi.
- Gerekçe: "Yüklediğim raporlardan öğrenip onlar gibi yeni rapor yaz" hedefi tamamen temiz metin çıkarımına bağlı; bozuk metinle AI yalnızca başlık/brief'ten genel metin üretiyordu.
- Etki: `extractText` artık `unpdf` kullanır (boş dönerse eski latin1 yöntemine güvenli fallback). Reindex sonrası örnek ÖTR'den gerçek başlıklar çıktı (PROJE ÖZETİ, SİSTEM ÖN TASARIMI, Sistem Blok Şeması, Mekanik/Donanım/Yazılım Tasarım, YÖNTEM, ZAMAN VE BÜTÇE) ve üretilen yeni taslak raporun gerçek teknik içeriğine (YOLOv8, ROI, dost/düşman renk analizi, HSV menzil) dayanır hale geldi; Sistem Blok Şeması bölümüne Mermaid akış üretildi. Yeni dosya: `package.json`'a `unpdf` bağımlılığı.
- İlgili dosyalar: `src/lib/pdf-text.ts` (yeni), `src/lib/workshop.ts` (`extractText`, `refreshProfile`, `extractReportHeadings`, `reindexDocuments`), `src/app/api/brain/route.ts`, `package.json`
- Sonraki adımlar: Taranmış (görsel) PDF'lerde metin çıkmazsa OCR değerlendirilebilir. PDF tablo iskeleti çıkarımı hâlâ zayıf (PDF metninde `|` yok); tablo yapısı gerekiyorsa ayrı çözüm gerekir. Kullanıcı yeni belge yükledikçe `refreshProfile` zaten otomatik çalışır; eski belgeler için bir kez `reindex_documents` çağrıldı.

### 2026-06-14 - Codex ve Claude Branch Izolasyonu

- Durum: Kabul Edildi
- Baglam: Codex ve Claude ayni projede ayri ajanlar olarak calisacak; kod ve dosya degisikliklerinin karismamasi gerekiyor.
- Karar: Tek Git reposu kullanilacak. `main` entegrasyon branch'i olacak. Codex `study-hub-codex` worktree icinde `codex/work`, Claude `study-hub-claude` worktree icinde `claude/work` branch'iyle calisacak.
- Gerekce: Git worktree modeli ayni repoda iki ayri calisma klasoru ve branch saglayarak ajanlarin eszamanli calismasini izole eder.
- Etki: Ajanlar birbirinin worktree klasorune dokunmayacak. `main` yalnizca kullanici onayiyla merge alacak. GitHub + Vercel tarafinda branch preview deploy akisi kullanilacak.
- Ilgili dosyalar: `AGENTS.md`, `CLAUDE.md`, `.gitignore`, `OFG-AI-SISTEM/AGENTS.md`, `OFG-AI-SISTEM/CLAUDE.md`, `OFG-AI-SISTEM/02-SISTEM-AKISI/SISTEM-HARITASI.md`, `OFG-AI-SISTEM/06-AI-TALIMATLARI/AI-CALISMA-KURALLARI.md`
- Sonraki adimlar: GitHub private repo ve Vercel proje baglantisi yapildiktan sonra `main`, `codex/work`, `claude/work` branch deploy'lari dogrulanir.

### 2026-06-14 - GitHub Remote Baglantisi

- Durum: Kabul Edildi
- Baglam: Yerel `study-hub` Git reposunun GitHub hesabi altinda saklanmasi ve ajan branchlerinin uzakta izlenmesi gerekiyor.
- Karar: Remote `origin`, `https://github.com/ofgworks/study-hub.git` olarak ayarlandi. `main`, `codex/work` ve `claude/work` branchleri GitHub'a push edildi.
- Gerekce: GitHub remote, branch izolasyonunun yedekli ve Vercel preview deploy'a hazir sekilde calismasini saglar.
- Etki: `main` production/integration branch'i, `codex/work` ve `claude/work` ajan branchleri olarak GitHub'da mevcuttur.
- Ilgili dosyalar: `OFG-AI-SISTEM/08-GOREVLER/AKTIF-GOREVLER.md`, `OFG-AI-SISTEM/05-KARAR-KAYITLARI/KARAR-DEFTERI.md`
- Sonraki adimlar: Vercel tarafinda `ofgworks/study-hub` reposu baglanir ve branch preview deploy'lari dogrulanir.
