# GitHub + Vercel + Local Calisma Duzeni

Bu proje uc parcali bir calisma duzeniyle kullanilir:

- GitHub: Kod deposu, branch takibi ve ajan izolasyonu.
- Vercel: Arayuz deploy ve branch preview kontrolu.
- Local: Gercek belge, hafiza ve gunluk kullanim ortami.

Supabase bu asamada kullanilmaz. Ozel belgeler ve proje hafizasi yerelde kalir.

## Branch ve Ortam Eslesmesi

| Ortam | Branch | Klasor | Amac |
|---|---|---|---|
| Production | `main` | `C:\Users\Ömer\Desktop\study-hub` | Temiz kaynak ve onayli surum |
| Codex preview | `codex/work` | `C:\Users\Ömer\Desktop\study-hub-codex` | Codex gelistirme ve test |
| Claude preview | `claude/work` | `C:\Users\Ömer\Desktop\study-hub-claude` | Claude analiz, rapor ve strateji |

`main` branch'ine dogrudan gelistirme yapilmaz. Degisiklikler once ajan branchlerinde denenir, sonra kullanici onayiyla `main`e alinir.

## Local Veri Kurali

Asil veri ve belgeler yerelde tutulur:

- `workspace/workshop-brain`
- `.env.local`
- `.obsidian`
- `.next`
- `node_modules`

Bu dosya ve klasorler GitHub'a ve Vercel'e gonderilmez. Vercel deploy'unda local belgelerin gorunmemesi normaldir.

## Vercel Kullanimi

Vercel sadece arayuz ve branch preview kontrolu icindir.

- `main` production deploy uretir.
- `codex/work` Codex preview deploy uretir.
- `claude/work` Claude preview deploy uretir.
- Vercel'de local-only veri beklenmez.

Vercel'de AI uretimi test edilecekse ortam degiskenleri Project Settings > Environment Variables altina eklenir:

```text
OPENAI_API_KEY
OPENAI_MODEL
```

Bu degiskenler GitHub'a veya Markdown notlarina yazilmaz.

## Gunluk Akis

1. Uygulamayi asil veriyle kullanmak icin local calistir:

```powershell
npm.cmd run dev:local
```

2. Tarayicida ac:

```text
http://127.0.0.1:3000
```

3. Codex kod isi yapacaksa `study-hub-codex` klasorunde calisir.
4. Claude analiz veya rapor isi yapacaksa `study-hub-claude` klasorunde calisir.
5. Degisiklikler once ilgili branch'e push edilir.
6. Vercel preview linkinden kontrol edilir.
7. Kullanici onayi olmadan `main`e merge yapilmaz.

## Dogrulama Kontrol Listesi

Local:

- `npm.cmd run build`
- `npm.cmd run dev:local`
- Belge yukleme, arama ve rapor uretme akislari local ortamda denenir.

GitHub:

- `main`, `codex/work`, `claude/work` branchleri gorunur.
- `main` dogrudan gelistirme almaz.

Vercel:

- Production deploy `main`den gelir.
- Preview deploy'lar ajan branchlerinden gelir.
- Local-only veri eksikligi hata sayilmaz.
