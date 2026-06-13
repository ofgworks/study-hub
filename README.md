# Atölye Beyni — Proje Hafızası ve Rapor Üretim Sistemi

Mühendislik atölyesi yarışma takımları (TEKNOFEST, TÜBİTAK vb.) için yerel proje hafızası,
belge indeksleme ve kaynaklı rapor üretim sistemi.

## Çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda http://localhost:3000 adresini aç. Tüm veriler yerel olarak `workspace/workshop-brain/`
klasöründe saklanır; dışarıya hiçbir belge gönderilmez (AI üretimi hariç, aşağıya bak).

## AI destekli üretim (isteğe bağlı)

`.env.example` dosyasını `.env.local` olarak kopyalayıp `OPENAI_API_KEY` gir.
Anahtar yoksa sistem **güvenli kaynak moduna** geçer: bilgi uydurmaz, belgelerden
özetler ve eksik bilgileri listeler.

## Ekranlar

| Ekran | İşlev |
|---|---|
| Dashboard | Takımlar, proje beyni durumu, çalışma akışı |
| Belgeler | Dosya yükleme, klasör tarama, belge kartları (kategori / indeks / güven) |
| Kaynak Arama | İndekslenen belgelerde kaynaklı arama |
| Rapor Sihirbazı | 4 adımda taslak üretimi: bilgiler → kaynak kontrolü → not → sonuç |
| Taslaklar & Teslim | Bölüm kartları, kaynak görünürlüğü, jüri denetimi, eksik listesi, DOCX/PDF |
| Geri Bildirim Hafızası | Geçmiş ÖTR/KTR puanları, puan kırılımı ve teknik karar hafızası |

## Mimari

- `src/lib/workshop.ts` — çekirdek: indeksleme, arama, rapor üretimi, kalite denetimi, DOCX/HTML çıktı
- `src/app/api/brain/*` — HTTP katmanı (Next.js route handlers)
- `src/components/brain/*` — ekran bazlı UI modülleri
- `src/components/WorkshopBrainApp.tsx` — uygulama kabuğu (sidebar + bağlam çubuğu)
