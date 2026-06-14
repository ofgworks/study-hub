# Study Hub Sistem Aciklamasi

Bu dosya `study-hub` klasorunun tamamini anlatir. `study-hub` sadece bir web uygulamasi degil; ayni zamanda Obsidian vault, AI calisma hafizasi ve yerel proje yonetim alanidir.

## Kisa Ozet

`study-hub` uc ana parcadan olusur:

- Obsidian vault: Notlar, gorevler, kararlar, sistem haritalari ve proje hafizasi burada tutulur.
- OFG-AI-SISTEM: Codex ve Claude icin AI yonetim merkezi ve kalici hafiza katmanidir.
- Yerel web uygulamasi: Next.js tabanli Study Hub / Atolye Beyni uygulamasidir. Sadece bilgisayarda `localhost` uzerinden calisir.

## Ana Roller

### Obsidian

Obsidian ana kontrol panelidir. Markdown dosyalarini gorsel olarak takip etmek, fikirleri duzenlemek, gorevleri izlemek ve karar gecmisini okumak icin kullanilir.

Ana giris dosyasi:

- `000-HOME.md`

### OFG-AI-SISTEM

`OFG-AI-SISTEM` klasoru AI yonetim merkezidir. Codex ve Claude her gorevden once buradaki ana dosyalari okuyarak baglami anlar.

Zorunlu sistem dosyalari:

- `OFG-AI-SISTEM/README.md`
- `OFG-AI-SISTEM/AGENTS.md`
- `OFG-AI-SISTEM/CLAUDE.md`
- `OFG-AI-SISTEM/00-INBOX/HIZLI-NOTLAR.md`
- `OFG-AI-SISTEM/08-GOREVLER/AKTIF-GOREVLER.md`
- `OFG-AI-SISTEM/05-KARAR-KAYITLARI/KARAR-DEFTERI.md`
- `OFG-AI-SISTEM/02-SISTEM-AKISI/SISTEM-HARITASI.md`
- `OFG-AI-SISTEM/06-AI-TALIMATLARI/AI-CALISMA-KURALLARI.md`

### Codex

Codex teknik uygulama ajanidir. Dosya duzenleme, kod gorevleri, yerel uygulama ayarlari, Markdown notlarini guncelleme ve gorev kapatma islerini yapar.

Codex kurali:

- Once sistem dosyalarini okur.
- Sonra gorevin kapsam ini belirler.
- Kod dosyalarina sadece acik gorev varsa dokunur.
- Is bitince ilgili Markdown dosyalarini gunceller.

### Claude

Claude analiz, ozetleme, strateji, raporlama ve karar destek ajanidir. Markdown hafizasini okuyarak daha uzun dusunme, rapor yazma ve karar analizi islerinde kullanilir.

Claude kurali:

- Once sistem hafizasini okur.
- Analizi ilgili nota baglar.
- Kalici karar veya sonuc varsa Markdown dosyasina islenmesini onerir veya gorev kapsaminda isler.

## Klasor Mantigi

- `000-HOME.md`: Obsidian ana paneli.
- `OFG-AI-SISTEM/`: AI yonetim merkezi.
- `OFG-AI-SISTEM/00-INBOX/`: Hizli notlar ve ham fikirler.
- `OFG-AI-SISTEM/01-PROJELER/`: Proje bazli ozet, gorev, karar ve changelog notlari.
- `OFG-AI-SISTEM/02-SISTEM-AKISI/`: Sistem haritalari ve Mermaid akislari.
- `OFG-AI-SISTEM/03-RAPOR-SABLONLARI/`: Rapor sablonlari ve basarili rapor analizleri.
- `OFG-AI-SISTEM/04-DIAGRAMLAR/`: Mermaid ve diger diyagram notlari.
- `OFG-AI-SISTEM/05-KARAR-KAYITLARI/`: Tarihli karar defteri.
- `OFG-AI-SISTEM/06-AI-TALIMATLARI/`: AI calisma kurallari.
- `OFG-AI-SISTEM/07-TOPLANTI-NOTLARI/`: Toplanti notlari.
- `OFG-AI-SISTEM/08-GOREVLER/`: Aktif ve tamamlanan gorevler.
- `OFG-AI-SISTEM/09-ARSIV/`: Eski veya tamamlanmis isler.
- `src/`: Next.js uygulama kodlari.
- `public/`: Statik dosyalar ve calisma materyalleri.
- `workspace/`: Uygulamanin yerel veri alani.
- `node_modules/`: Paket bagimliliklari. AI ajanlari bu klasore dokunmaz.

## Is Akisi

1. Yeni fikir veya not `OFG-AI-SISTEM/00-INBOX/HIZLI-NOTLAR.md` icine yazilir.
2. Codex veya Claude bu notlari okur.
3. Uygulanabilir maddeler `OFG-AI-SISTEM/08-GOREVLER/AKTIF-GOREVLER.md` icine checkbox olarak eklenir.
4. Kalici kararlar `OFG-AI-SISTEM/05-KARAR-KAYITLARI/KARAR-DEFTERI.md` icine tarihli olarak yazilir.
5. Sistem akisi degisirse `OFG-AI-SISTEM/02-SISTEM-AKISI/SISTEM-HARITASI.md` guncellenir.
6. Is bitince ilgili gorev checkbox'i isaretlenir.
7. Onemli bilgi sadece sohbet gecmisinde birakilmaz; Markdown hafizasina yazilir.

## Yerel Web Uygulamasi

Bu proje Next.js tabanli bir yerel uygulama icerir.

Calistirma:

- Cift tik: `Uygulamayi_Ac.bat`
- Adres: `http://localhost:3000`
- Yerel script: `npm run dev:local`

Guvenlik:

- Uygulama `127.0.0.1:3000` uzerinde calisir.
- `0.0.0.0` kullanilmaz.
- Dis dunyaya acilmaz.
- Ngrok, Cloudflare Tunnel, port forwarding veya firewall paylasimi kullanilmaz.

Detayli yerel calistirma notu:

- `LOCAL_RUN.md`

## GitHub + Vercel + Local Calisma Modeli

Bu sistemde uc katman vardir:

- GitHub: Kod deposu ve branch izolasyonu.
- Vercel: Production ve preview deploy kontrolu.
- Local: Gercek belge, hafiza ve gunluk kullanim ortami.

Branch eslesmesi:

- `main`: Onayli ana kaynak ve Vercel production.
- `codex/work`: Codex isleri ve Vercel preview.
- `claude/work`: Claude analiz/rapor isleri ve Vercel preview.

Yerel `workspace/workshop-brain` verisi GitHub'a ve Vercel'e gitmez. Vercel'de local-only veri gorunmemesi beklenen davranistir.

Detayli is akis dosyasi:

- `DEPLOYMENT-WORKFLOW.md`

## AI API Durumu

Uygulamada OpenAI API destegi hazirlanmistir.

Beklenen yerel ortam dosyasi:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Bu bilgiler `.env.local` icinde tutulmalidir. API anahtarlari Markdown notlarina veya sohbetlere yazilmamalidir.

Claude/Anthropic API entegrasyonu su an uygulama kodunda ayrica hazir degildir. Gerekirse ayri bir gorev olarak eklenmelidir.

## Koruma Kurallari

- Dosya silinmez.
- `node_modules` klasorune dokunulmaz.
- `src`, `public`, `workspace` gibi kod/veri klasorlerine sadece acik gorev varsa dokunulur.
- Mevcut dosyalar tasinmadan once plan cikarilir.
- Markdown dosyalarinda ayni bolum iki kere eklenmez.
- Belirsizlik varsa ilgili dosyada `BELIRSIZLIKLER` basligi altinda not dusulur.

## En Onemli Dosyalar

- `000-HOME.md`: Obsidian ana paneli.
- `STUDY-HUB-SISTEM.md`: Bu dosya, tum sistemin genel aciklamasi.
- `LOCAL_RUN.md`: Yerel uygulamayi tek tikla calistirma notu.
- `OFG-AI-SISTEM/README.md`: AI sistem merkezi aciklamasi.
- `OFG-AI-SISTEM/02-SISTEM-AKISI/SISTEM-HARITASI.md`: Sistem akisi ve Mermaid diyagramlari.
- `OFG-AI-SISTEM/08-GOREVLER/AKTIF-GOREVLER.md`: Aktif gorev listesi.
- `OFG-AI-SISTEM/05-KARAR-KAYITLARI/KARAR-DEFTERI.md`: Karar gecmisi.

## Sistem Cikisi

Bu sistemin hedefi sudur:

- Obsidian gorunen kontrol paneli olsun.
- Markdown dosyalari kalici hafiza olsun.
- Codex ve Claude bu hafizayi okuyup gorev yapsin.
- Yerel web uygulamasi sadece bilgisayarda calissin.
- Yapilan isler, kararlar ve belirsizlikler kaybolmadan dosyalara islensin.
