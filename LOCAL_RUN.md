# Yerelde Tek Tıkla Çalıştırma

Bu proje sadece kendi bilgisayarında çalışacak şekilde hazırlanmıştır.

## Nasıl Açılır?

Proje klasöründeki `Uygulamayi_Ac.bat` dosyasına çift tıkla.

Dosya şunları yapar:

- Proje klasörüne geçer.
- Node.js ve npm var mı kontrol eder.
- Bağımlılıklar eksikse `npm install` çalıştırır.
- Uygulamayı sadece `127.0.0.1:3000` üzerinde başlatır.
- Hazır olunca varsayılan tarayıcıda `http://localhost:3000` adresini açar.

## Adres

Uygulama burada açılır:

```text
http://localhost:3000
```

## Yerelde Güvenli Olduğunu Nasıl Anlarım?

Başlatma scripti Next.js'i şu komutla çalıştırır:

```powershell
npm run dev:local
```

Bu script `package.json` içinde `--hostname 127.0.0.1 --port 3000` kullanır. Yani uygulama `0.0.0.0` ile ağdaki diğer cihazlara açılmaz; sadece bu bilgisayardaki `localhost` / `127.0.0.1` adresinden erişilir.

Ngrok, Cloudflare Tunnel, port forwarding, firewall paylaşımı veya benzeri dış erişim yöntemleri kullanılmaz.

## Kapatmak

Çift tıklama sonrası minimize edilmiş `Study Hub Local Server` adlı bir pencere açılır. Uygulamayı kapatmak için bu pencereyi kapatabilir veya pencerede `Ctrl+C` kullanabilirsin.

Port 3000 zaten bu uygulama tarafından kullanılıyorsa script sadece tarayıcıyı açar. Port 3000 başka bir uygulama tarafından kullanılıyorsa anlaşılır bir hata gösterir.
