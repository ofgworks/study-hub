# OFG AI Sistem Vault

Bu vault; Codex, Claude ve Obsidian tarafından ortak kullanılacak merkezi proje hafızasıdır. Amaç; görevleri, kararları, raporları, sistem akışlarını, toplantı notlarını ve diyagramları Markdown dosyaları içinde düzenli biçimde saklamaktır.

## Kullanım Mantığı

- Obsidian bu klasörü vault olarak açar.
- Codex ve Claude bu Markdown dosyalarını okuyarak proje bağlamını takip eder.
- Yeni fikirler önce `00-INBOX/` içine yazılır.
- Netleşen işler `01-PROJELER/`, `08-GOREVLER/` ve ilgili klasörlere taşınır.
- Önemli kararlar `05-KARAR-KAYITLARI/KARAR-DEFTERI.md` dosyasına tarihli olarak işlenir.
- Sistem akışları ve diyagramlar `02-SISTEM-AKISI/` ve `04-DIAGRAMLAR/` içinde tutulur.

## Klasörler

- `00-INBOX/`: Hızlı notlar, ham fikirler ve işlenmemiş bilgiler.
- `01-PROJELER/`: Proje tanımları, hedefler, kapsam ve durum bilgileri.
- `02-SISTEM-AKISI/`: Sistem haritaları, süreç akışları ve operasyon mantığı.
- `03-RAPOR-SABLONLARI/`: Standart rapor formatları ve iyi rapor analizleri.
- `04-DIAGRAMLAR/`: Mermaid ve diğer diyagram notları.
- `05-KARAR-KAYITLARI/`: Tarihli karar kayıtları.
- `06-AI-TALIMATLARI/`: Codex, Claude ve diğer AI araçlarının çalışma kuralları.
- `07-TOPLANTI-NOTLARI/`: Toplantı notları ve görüşme kayıtları.
- `08-GOREVLER/`: Aktif görev listeleri.
- `09-ARSIV/`: Tamamlanmış veya pasif hale gelmiş notlar.

## Güncelleme İlkesi

Her çalışma sonunda ilgili görev, karar veya rapor dosyası güncellenmelidir. Bilgi sadece sohbet geçmişinde kalmamalı; kalıcı proje hafızasına yazılmalıdır.

## OFG-AI Çalışma Modeli

`study-hub` ana çalışma alanı ve Obsidian vault olarak kullanılır. `OFG-AI-SISTEM` bu vault içindeki AI yönetim merkezidir. Obsidian görsel kontrol paneli ve proje hafızasıdır; Codex ve Claude bu hafızayı okuyarak görev yapan AI ajanlardır.

### Zorunlu Başlangıç Okuması

Codex veya Claude her yeni görevden önce şu dosyaları okumalıdır:

- `OFG-AI-SISTEM/README.md`
- `OFG-AI-SISTEM/AGENTS.md`
- `OFG-AI-SISTEM/CLAUDE.md`
- `OFG-AI-SISTEM/00-INBOX/HIZLI-NOTLAR.md`
- `OFG-AI-SISTEM/08-GOREVLER/AKTIF-GOREVLER.md`
- `OFG-AI-SISTEM/05-KARAR-KAYITLARI/KARAR-DEFTERI.md`
- `OFG-AI-SISTEM/02-SISTEM-AKISI/SISTEM-HARITASI.md`
- `OFG-AI-SISTEM/06-AI-TALIMATLARI/AI-CALISMA-KURALLARI.md`

### Rol Dağılımı

- Obsidian: Ana kontrol paneli, görsel takip ve kalıcı proje hafızası.
- Codex: Dosya düzenleme, kod görevleri, teknik uygulama ve görev kapatma.
- Claude: Analiz, strateji, özetleme, raporlama ve karar desteği.
- Markdown dosyaları: Codex ve Claude için kalıcı hafıza katmanı.

### İş Akışı

1. Yeni fikirler `00-INBOX/HIZLI-NOTLAR.md` içine yazılır.
2. AI ajanı bu notları okuyup görev listesine çevirir.
3. Yapılacak işler `08-GOREVLER/AKTIF-GOREVLER.md` içinde checkbox olarak tutulur.
4. Önemli kararlar `05-KARAR-KAYITLARI/KARAR-DEFTERI.md` içine tarihli olarak eklenir.
5. Sistem akışı ve sorumluluklar `02-SISTEM-AKISI/SISTEM-HARITASI.md` içinde Mermaid diyagramlarıyla izlenir.
6. Rapor şablonları ve başarılı rapor analizleri `03-RAPOR-SABLONLARI/` altında tutulur.
7. Her proje için ayrı özet, görev, karar ve changelog notları `01-PROJELER/` altında oluşturulur.

## Koruma Kuralları

- Dosya silinmez.
- `node_modules` klasörüne dokunulmaz.
- `src`, `public`, `workspace` gibi kod/veri klasörlerine yalnızca açık görev varsa dokunulur.
- Mevcut dosyalar taşınmadan önce plan çıkarılır.
- Markdown dosyalarında aynı bölüm iki kere eklenmez.
- Görev tamamlanınca ilgili checkbox işaretlenir.
- Yeni karar oluşursa karar defterine yazılır.
- Belirsizlik varsa ilgili nota `BELIRSIZLIKLER` başlığı altında eklenir.
