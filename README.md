# BUKAPASARAN — Cloudflare Pages SEO Generator

Paket ini sudah digabung dengan file yang kamu kirim:
- `public/index.html` adalah homepage asli, disalin tanpa perubahan.
- `public/sitemap.xml` dan `public/robots.txt` adalah file asli sebagai input awal; saat build, keduanya dibuat ulang agar mencantumkan artikel dari `content/posts.json`.
- `public/_redirects` mengarahkan `/feed/` ke `/feed.xml`.

## Struktur
- `public/` — file website asli dan aset. Masukkan gambar, CSS, JS, favicon, dan folder aset lain di sini bila ada.
- `content/posts.json` — data artikel.
- `scripts/build.js` — generator HTML, sitemap, RSS, robots.
- `dist/` — hasil build untuk Cloudflare Pages.

## Cloudflare Pages dengan Git
1. Upload isi folder proyek ini ke repository GitHub.
2. Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git.
3. Framework preset: None
4. Build command: `npm run build`
5. Build output directory: `dist`
6. Root directory: kosong jika `package.json` ada di root repository.
7. Environment variable `NODE_VERSION` = `20`.
8. Deploy.

Setiap push ke branch produksi akan menjalankan build dan deploy ulang.

## Direct Upload
Cloudflare Direct Upload tidak menjalankan build. Jalankan `npm run build` di komputer dengan Node.js 20+, lalu upload isi folder `dist/`.

## Menambah artikel
Edit `content/posts.json`. Tambahkan objek dengan `title`, `slug`, `description`, `date` (YYYY-MM-DD), `category`, dan `sections` (heading + paragraphs). Gunakan slug unik.

## Perhatian penting
- Domain kanonis dikonfigurasi di `scripts/build.js` pada `SITE.origin`. Nilai default: `https://bukapasaran.org`.
- Homepage asli dari ZIP pengguna dipertahankan persis dan tidak diganti generator.
- File aset tambahan harus diletakkan di `public/` dengan struktur folder yang sama seperti referensi di HTML.
- Artikel contoh adalah draft informasional. Tinjau kebenaran dan relevansinya sebelum publikasi.
- Jangan membuat halaman tipis/duplikat hanya untuk mengejar keyword. Tidak ada jaminan ranking Google.
