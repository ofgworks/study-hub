# Genel Akış Diyagramı

Bu dosya vault içindeki bilgi ve görev akışını Mermaid formatında örnekler.

```mermaid
flowchart LR
    A[Fikir veya Not] --> B[00-INBOX]
    B --> C[Değerlendirme]
    C --> D[Proje Dosyası]
    C --> E[Görev Listesi]
    C --> F[Karar Defteri]
    D --> G[Uygulama]
    E --> G
    F --> G
    G --> H[Rapor]
    H --> I[Arşiv]
```

## Diyagram Notları

- Yeni süreçler için ayrı Mermaid blokları eklenebilir.
- Büyük sistemler için diyagramlar alt başlıklara ayrılmalıdır.
- Diyagram değiştiğinde ilgili sistem veya proje dosyasına bağlantı verilmelidir.
