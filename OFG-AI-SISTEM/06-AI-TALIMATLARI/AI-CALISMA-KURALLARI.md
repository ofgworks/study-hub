# AI Çalışma Kuralları

Bu dosya Codex, Claude ve diğer AI araçlarının vault içinde uyması gereken ortak kuralları içerir.

## Dosya Güvenliği

- Kullanıcı açıkça istemedikçe dosya silme.
- `node_modules` klasörüne dokunma.
- `src`, `public`, `workspace` gibi kod/veri klasörlerine yalnızca açık görev veya kullanıcı onayı varsa dokun.
- Var olan dosyayı değiştirmeden önce içeriğini oku.
- Mevcut içeriği ezme; gerekiyorsa yeni bölüm ekle.
- Büyük değişikliklerde önce kısa özet veya plan çıkar.
- Arşivleme gerekiyorsa bilgiyi `09-ARSIV/` altında sakla.

## Zorunlu Başlangıç Kontrolü

Her Codex veya Claude görevi başlamadan önce şu dosyalar okunmalıdır:

- `OFG-AI-SISTEM/README.md`
- `OFG-AI-SISTEM/AGENTS.md`
- `OFG-AI-SISTEM/CLAUDE.md`
- `OFG-AI-SISTEM/00-INBOX/HIZLI-NOTLAR.md`
- `OFG-AI-SISTEM/08-GOREVLER/AKTIF-GOREVLER.md`
- `OFG-AI-SISTEM/05-KARAR-KAYITLARI/KARAR-DEFTERI.md`
- `OFG-AI-SISTEM/02-SISTEM-AKISI/SISTEM-HARITASI.md`
- `OFG-AI-SISTEM/06-AI-TALIMATLARI/AI-CALISMA-KURALLARI.md`

Bu okuma görevin bağlamını, aktif işleri, karar geçmişini ve sistem sınırlarını belirlemek için yapılır.

## Görev Takibi

- Hızlı notlardan çıkan uygulanabilir maddeleri görev listesine dönüştür.
- Yeni görevleri `08-GOREVLER/AKTIF-GOREVLER.md` dosyasına checkbox formatında ekle.
- Tamamlanan görevleri işaretle.
- Görev tamamlandığında ilgili proje veya rapor notunu güncelle.
- Yarım kalan görevlerde sonraki adımı açıkça yaz.

## Karar Kaydı

- Kalıcı etkisi olan kararları `05-KARAR-KAYITLARI/KARAR-DEFTERI.md` içine ekle.
- Her karar kaydında tarih, bağlam, karar, gerekçe ve etki bilgisi bulunmalıdır.
- Önceki karar değiştirilecekse eski kaydı silme; yeni bir karar kaydı ekle.

## Raporlama

- Raporlarda amaç, özet, bulgu, risk, öneri ve sonraki adımlar başlıkları kullanılmalıdır.
- Kaynak veya bağlam belirsizse açıkça belirtilmelidir.
- Sadece sohbet içinde kalan önemli bilgi bırakılmamalıdır.

## Diyagramlar

- Süreç veya sistem akışı değişirse Mermaid diyagramı güncellenmelidir.
- Diyagramlar kısa, okunabilir ve bağlantılı notlarla desteklenmiş olmalıdır.

## Belirsizlikler

- Eksik bilgi varsa tahminle doldurma.
- İlgili Markdown dosyasına `BELIRSIZLIKLER` başlığı altında açık not ekle.
- Kullanıcıdan karar veya onay bekleyen noktaları görev listesinde görünür bırak.

## Git Worktree ve Branch Izolasyonu

- Kod degisikligi branch bazli izole edilir: Codex `C:\Users\Ömer\Desktop\study-hub-codex` / `codex/work`, Claude `C:\Users\Ömer\Desktop\study-hub-claude` / `claude/work` icinde calisir.
- `main` branch'i entegrasyon alani olarak korunur; kullanici onayi olmadan `main` uzerinde kod degisikligi veya merge yapilmaz.
- Ajanlar birbirinin worktree klasorune dokunmaz.
- `.env.local`, `.next`, `node_modules`, `.obsidian`, `.claude/settings.local.json` ve `workspace/workshop-brain` commit edilmez.
