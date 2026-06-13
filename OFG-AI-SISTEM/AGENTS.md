# Codex Çalışma Kuralları

Bu dosya Codex'in bu vault içinde nasıl çalışacağını tanımlar.

## Genel Rol

Codex; dosya yapısını koruyan, Markdown hafızasını güncel tutan ve görevleri izlenebilir hale getiren teknik çalışma yardımcısıdır.

## Temel Kurallar

- Her AI görevi başlamadan önce zorunlu sistem dosyalarını oku: `README.md`, `AGENTS.md`, `CLAUDE.md`, `00-INBOX/HIZLI-NOTLAR.md`, `08-GOREVLER/AKTIF-GOREVLER.md`, `05-KARAR-KAYITLARI/KARAR-DEFTERI.md`, `02-SISTEM-AKISI/SISTEM-HARITASI.md`, `06-AI-TALIMATLARI/AI-CALISMA-KURALLARI.md`.
- Görev sonunda ilgili Obsidian Markdown dosyalarını güncelle.
- Kod dosyalarına sadece açık görev veya kullanıcı onayı varsa dokun.
- Mevcut dosyaları kullanıcı onayı olmadan silme.
- Var olan içeriği ezmeden önce dosyayı oku.
- Büyük değişikliklerden önce ilgili notlarda mevcut bağlamı kontrol et.
- Görev tamamlandığında `08-GOREVLER/AKTIF-GOREVLER.md` dosyasını güncelle.
- Kalıcı kararları `05-KARAR-KAYITLARI/KARAR-DEFTERI.md` içine tarihli olarak ekle.
- Sistem akışı değişirse `02-SISTEM-AKISI/SISTEM-HARITASI.md` dosyasını güncelle.
- Rapor üretirken `03-RAPOR-SABLONLARI/STANDART-RAPOR-SABLONU.md` yapısını dikkate al.

## Çalışma Biçimi

1. İlgili dosyaları oku.
2. Görevin kapsamını belirle.
3. Gerekli Markdown dosyalarını güncelle.
4. Yapılan değişiklikleri kısa bir raporla özetle.

## Kod ve Klasör Sınırları

- `node_modules` klasörüne dokunma.
- `src`, `public`, `workspace` gibi kod/veri klasörlerini yalnızca kullanıcı açıkça kod görevi verdiyse değiştir.
- Mevcut dosya veya klasörleri taşımadan önce plan çıkar ve kullanıcıya sun.
- Kod dışı Obsidian notlarını güncellerken mevcut bilgiyi ezme; yeni başlık veya tarihli kayıt ekle.
- Belirsizlik varsa ilgili dosyada `BELIRSIZLIKLER` başlığı aç veya mevcut başlık altına not düş.

## Yazım Standardı

- Türkçe yaz.
- Açık başlıklar kullan.
- Tarihleri `YYYY-AA-GG` formatında yaz.
- Görevleri checkbox formatında takip et.
- Diyagram gerekiyorsa Mermaid kullan.

## Git Worktree ve Branch Izolasyonu

- Codex kod veya proje dosyasi degistirecekse `C:\Users\Ömer\Desktop\study-hub-codex` worktree icinde calisir.
- Codex'in varsayilan branch'i `codex/work` olmalidir.
- Codex `main` branch'inde dogrudan kod degisikligi yapmaz.
- Codex `C:\Users\Ömer\Desktop\study-hub-claude` klasorune dokunmaz.
- `main` sadece kullanici onayi ile merge alir.
- Commit mesaji ornegi: `codex: rapor sihirbazi duzeltmesi`.
- `.env.local`, `.next`, `node_modules`, `.obsidian`, `.claude/settings.local.json` ve `workspace/workshop-brain` gibi yerel/private dosyalar commit edilmez.
