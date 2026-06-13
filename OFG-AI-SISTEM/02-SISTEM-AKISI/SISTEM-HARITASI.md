# Sistem Haritası

Bu dosya sistemin genel bileşenlerini, bilgi akışını ve AI araçlarının rolünü açıklar.

## Ana Bileşenler

- Obsidian: Markdown tabanlı görsel bilgi yönetimi.
- Codex: Dosya düzenleme, görev takibi ve teknik uygulama desteği.
- Claude: Analiz, raporlama, strateji ve karar destek.
- Markdown Vault: Ortak proje hafızası.

## Örnek Sistem Akışı

```mermaid
flowchart TD
    A[00-INBOX: Hızlı Not] --> B{Not türü nedir?}
    B -->|Proje| C[01-PROJELER]
    B -->|Görev| D[08-GOREVLER]
    B -->|Karar| E[05-KARAR-KAYITLARI]
    B -->|Diyagram| F[04-DIAGRAMLAR]
    C --> G[README ve Sistem Haritası Güncellenir]
    D --> G
    E --> G
    F --> G
```

## Güncelleme Notları

Sistem yapısı, klasör sorumlulukları veya AI çalışma düzeni değiştiğinde bu dosya güncellenmelidir.

## OFG-AI Obsidian Çalışma Mantığı

```mermaid
flowchart TD
    U[Kullanıcı] --> O[Obsidian: study-hub vault]
    O --> H[000-HOME.md ana panel]
    O --> S[OFG-AI-SISTEM yönetim merkezi]

    S --> R[README.md sistem açıklaması]
    S --> A[AGENTS.md Codex kuralları]
    S --> C[CLAUDE.md Claude kuralları]
    S --> K[06-AI-TALIMATLARI çalışma kuralları]

    U --> I[00-INBOX/HIZLI-NOTLAR.md]
    I --> X{Codex veya Claude göreve başlar}

    X --> R
    X --> A
    X --> C
    X --> K
    X --> T[08-GOREVLER/AKTIF-GOREVLER.md]
    X --> D[05-KARAR-KAYITLARI/KARAR-DEFTERI.md]
    X --> M[02-SISTEM-AKISI/SISTEM-HARITASI.md]

    X --> P[01-PROJELER proje notları]
    X --> G[Görev planı ve uygulama]
    G --> T
    G --> D
    G --> M
    G --> RS[03-RAPOR-SABLONLARI]
    G --> B[BELIRSIZLIKLER notları]

    T --> O
    D --> O
    M --> O
    RS --> O
    B --> O
```

## Klasör Sorumlulukları

- `00-INBOX`: Hızlı ve dağınık fikir girişi.
- `01-PROJELER`: Proje bazlı özet, görev, karar ve changelog notları.
- `02-SISTEM-AKISI`: Sistem haritası, bilgi akışı ve Mermaid diyagramları.
- `03-RAPOR-SABLONLARI`: Rapor şablonları ve başarılı rapor analizleri.
- `04-DIAGRAMLAR`: Ayrı diyagram notları ve şema denemeleri.
- `05-KARAR-KAYITLARI`: Tarihli karar defteri.
- `06-AI-TALIMATLARI`: Codex, Claude ve diğer AI ajanları için çalışma kuralları.
- `07-TOPLANTI-NOTLARI`: Toplantı notları.
- `08-GOREVLER`: Aktif ve tamamlanmış görev listeleri.
- `09-ARSIV`: Eski veya tamamlanmış işler.

## Yarışma Odaklı Rapor Sistemi

```mermaid
flowchart TD
    Y[Yarışma] --> YB[Yarışma Bilgi Havuzu]
    YB --> K[Şartname, kurallar, notlar, PDF, MD, görsel]
    Y --> T1[Takım A]
    Y --> T2[Takım B]
    T1 --> D1[Takım Belgeleri ve Örnek Raporlar]
    T2 --> D2[Takım Belgeleri ve Örnek Raporlar]
    K --> AI[AI Arama, Kalite Kontrol ve Rapor Sihirbazı]
    D1 --> AI
    D2 --> AI
    AI --> R[Rapor Taslağı ve Teslim Çıktısı]
```

- Yarışma bilgi havuzu ortak bağlamdır; aynı yarışmadaki tüm takımlar bu bilgiden yararlanır.
- Takım belgeleri, örnek raporlar, jüri geri bildirimi ve rapor taslakları takım bazlı izole kalır.
- Eski takımlar geriye uyumluluk için `Genel Yarışma Havuzu` altında gösterilir.

## Git Worktree Ajan Izolasyonu

```mermaid
flowchart TD
    M[main branch] --> CW[codex/work branch]
    M --> CLW[claude/work branch]
    CW --> CWT[study-hub-codex worktree]
    CLW --> CLT[study-hub-claude worktree]
    CWT --> CP[Codex degisiklikleri]
    CLT --> LP[Claude degisiklikleri]
    CP --> PR[Kontrollu merge / PR]
    LP --> PR
    PR --> M
    M --> V[Vercel production]
    CW --> CV[Vercel preview: Codex]
    CLW --> LV[Vercel preview: Claude]
```

- `main` entegrasyon ve production branch'idir.
- Codex yalnizca `study-hub-codex` worktree icinde `codex/work` branch'iyle calisir.
- Claude yalnizca `study-hub-claude` worktree icinde `claude/work` branch'iyle calisir.
- Preview deploy'lar branch bazlidir; production merge kullanici onayi ister.
