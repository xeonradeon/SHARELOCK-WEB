# Sherlock Web

[![License](https://img.shields.io/github/license/sannnproject/SHARELOK-WEB-VERSION)](https://github.com/sannnproject/SHARELOK-WEB-VERSION/blob/main/LICENSE)
[![Repo size](https://img.shields.io/github/repo-size/sannnproject/SHARELOK-WEB-VERSION)](https://github.com/sannnproject/SHARELOK-WEB-VERSION)
[![GitHub stars](https://img.shields.io/github/stars/sannnproject/SHARELOK-WEB-VERSION?style=social)](https://github.com/sannnproject/SHARELOK-WEB-VERSION/stargazers)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/python-%3E%3D3.8-blue)](https://www.python.org/)
[![Vercel-ready](https://img.shields.io/badge/deploy-vercel-000000?style=flat&logo=vercel)](https://vercel.com/)


Deskripsi singkat

Sherlock Web adalah antarmuka web modern yang berfungsi sebagai front-end dan wrapper untuk proyek Sherlock (https://github.com/sherlock-project/sherlock). Sherlock sendiri adalah tools OSINT untuk mencari keberadaan username pada berbagai platform. Proyek ini menggabungkan Next.js (frontend) dengan backend Python (FastAPI) yang mengeksekusi Sherlock sebagai subprocess sehingga pencarian berjalan non-blocking dan terisolasi dari proses web utama.

Teknologi & Stack

- Frontend
  - Next.js 15 (App Router)
  - Tailwind CSS
  - shadcn/ui
- Backend
  - FastAPI (Python)
  - asyncio.create_subprocess_exec untuk menjalankan Sherlock (tidak menggunakan shell=True)
- Deployment
  - Dirancang agar mudah dideploy di Vercel menggunakan runtime Python (konfigurasi di vercel.json)

Fitur utama (ringkasan)

- Pencarian non-blocking terhadap Sherlock dijalankan sebagai subprocess Python.
- Ringkasan hasil (Found, Not Found, Unknown, waktu pencarian) dan dukungan filter/tab pada UI.
- Ekspor hasil pencarian ke JSON atau CSV.
- Mode Gelap/Terang dengan preferensi yang disimpan di sisi klien.
- Desain modern dengan skeleton loading dan transisi halus menggunakan Tailwind.
- Validasi input username (regex) untuk mencegah input ilegal.

Keamanan & desain eksekusi Sherlock

- Sherlock dipanggil dari backend FastAPI menggunakan asyncio.create_subprocess_exec dengan argumen terpisah (list), bukan melalui shell. Ini mengurangi risiko command injection.
- Username divalidasi menggunakan regex: ^[a-zA-Z0-9._-]{2,30}$ — pastikan regex ini konsisten dengan validasi di UI dan backend.
- Aplikasi tidak menggunakan database secara default — hasil diproses per-request dan dapat diekspor oleh pengguna.
- Pertimbangan tambahan (direkomendasikan)
  - Terapkan rate limiting di layer API (middleware) untuk menghindari penyalahgunaan.
  - Batasi concurrency pencarian simultan (mis. queue worker atau semaphore pada proses backend) untuk menghindari overload pada environment/limit platform.

Persyaratan (requirements)

- Node.js >= 18 (untuk Next.js 15)
- Python >= 3.8
- pip untuk menginstall dependensi Python
- Sherlock (repo upstream) tersedia/terpasang atau dapat diakses oleh subprocess yang dipanggil oleh FastAPI. Pastikan path/script Sherlock yang dipanggil sudah benar.

Instalasi & Menjalankan Secara Lokal

1) Clone repository

```bash
git clone https://github.com/sannnproject/SHARELOK-WEB-VERSION.git
cd SHARELOK-WEB-VERSION
```

2) Instalasi frontend (Node.js)

```bash
# instalasi dependencies frontend
npm install
```

3) Instalasi backend (Python)

```bash
# instalasi dependencies Python
pip install -r requirements.txt
```

4) Menjalankan frontend (development)

```bash
# menjalankan Next.js dev server
npm run dev
# default: http://localhost:3000
```

5) Menjalankan backend FastAPI (opsional, jika ingin menjalankan terpisah)

```bash
# jalankan uvicorn pada module api.index:app
uvicorn api.index:app --reload --port 8000
# API akan tersedia di http://localhost:8000 (sesuaikan dengan konfigurasi CORS di frontend)
```

Catatan tentang mode development dan mock API

- Pada mode pengembangan, jika Python/Sherlock tidak tersedia di environment Node, aplikasi UI dapat menggunakan mock API yang berada di `app/api/search/route.ts`. File ini memungkinkan pengembangan UI tanpa menjalankan backend Python.
- Pastikan saat melakukan end-to-end testing atau staging, backend Python dan Sherlock tersedia agar hasil yang ditampilkan akurat.

Konfigurasi Vercel (deploy tanpa VPS)

- File `vercel.json` yang sudah ada di repo menulis ulang semua request `/api/*` ke `api/index.py` agar dieksekusi oleh runtime Python Vercel.

Contoh konfigurasi (sudah ada di repo):

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.py"
    }
  ]
}
```

Langkah singkat deploy ke Vercel

1. Buat akun Vercel dan hubungkan repository GitHub.
2. Pastikan `requirements.txt`, `vercel.json`, dan struktur `api/index.py` tetap tersedia di root/repo.
3. Deploy: Vercel akan membaca konfigurasi dan menjalankan build untuk frontend dan runtime Python untuk route `/api/*`.

Environment variables & konfigurasi

- Saat ini aplikasi tidak membutuhkan database, tetapi ada beberapa pengaturan yang mungkin perlu dikelola di environment production/staging:
  - PATH atau lokasi script Sherlock (jika menggunakan instalasi lokal).
  - Batasan/konfigurasi worker (contoh: MAX_CONCURRENT_SEARCH).
  - URL frontend (untuk pengaturan CORS jika backend dijalankan terpisah).

Contoh (tidak wajib, sesuaikan dengan implementasi):

- SHERLOCK_PATH: path ke executable/script Sherlock
- MAX_CONCURRENT_SEARCH: integer (mis. 5)
- ALLOWED_ORIGINS: daftar origin yang diperbolehkan untuk CORS

API surface (high-level)

- Endpoint frontend Next.js mengkonsumsi API internal pada path `/api/search` yang diteruskan ke `api/index.py` pada deployment Vercel.
- Backend FastAPI menerima request pencarian, memvalidasi username, men-spawn subprocess untuk menjalankan Sherlock, kemudian mengumpulkan dan mengembalikan hasil (Found/Not Found/Unknown) beserta waktu pencarian.
- Export: endpoint untuk mengunduh hasil dalam JSON/CSV (lihat implementasi di API untuk path dan parameter tepatnya).

Testing & Quality

- Jalankan linting dan tests (jika tersedia) sebelum mengirim perubahan ke main branch.
- Periksa konsistensi validasi username di UI dan backend.
- Untuk pengujian integrasi Sherlock: siapkan environment dimana Sherlock dapat dijalankan oleh proses Python (bisa dengan instalasi lokal dari https://github.com/sherlock-project/sherlock).

Catatan developer / arsitektur

- Eksekusi Sherlock dilakukan melalui asyncio.create_subprocess_exec dengan argumen array untuk menghindari penggunaan shell. Pastikan setiap perubahan yang mengubah bagaimana argumen diteruskan tetap mempertahankan pola ini.
- Jika ingin menambahkan antrean tugas (queue) atau worker, letakkan logika pemanggilan Sherlock pada worker terpisah dan komunikasikan hasilnya melalui HTTP atau mekanisme IPC yang sesuai.

Rate limiting & hardening

- Tambahkan middleware rate limit pada FastAPI (contoh: menggunakan slowapi atau limiter sejenis) bila aplikasi dipublikasikan untuk mencegah penyalahgunaan.
- Logging: Simpan log panggilan (tanpa data sensitif) untuk audit dan debugging.

Kontribusi

Jika Anda ingin berkontribusi:

1. Fork project
2. Buat branch baru: `git checkout -b feat/my-change`
3. Lakukan perubahan, jalankan tes dan lint
4. Buat pull request dan deskripsikan perubahan secara jelas

Lisensi

- Periksa file LICENSE pada repository untuk mengetahui lisensi proyek ini.

Kontak

- Untuk pertanyaan teknis atau diskusi arsitektur, buka issue di repository.
# SHARELOCK-WEB
