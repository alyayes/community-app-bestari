# 🌾 Community App Bestari - KWT Sorgum

Aplikasi komunitas wanita tani sorgum: **backend** (Express + MySQL + Prisma) dan **frontend** (React + Vite + Tailwind) dalam satu repo.

## 📁 Struktur

```
D:\Project Bestari\
├── backend\    → API server (port 8000)
├── frontend\   → React app (port 5173)
└── package.json → script gabungan (concurrently)
```

## 🚀 Cara Menjalankan (SATU PERINTAH)

```bash
cd "D:\Project Bestari"
npm run dev
```

Perintah ini menjalankan **backend + frontend sekaligus**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Health check: http://localhost:8000/api/health

## 🔑 Akun Login

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@kwtsorgum.id` | `admin123` |
| Anggota | `anggota@kwtsorgum.id` | `sorgum123` |

## 🛠 Setup Awal (hanya sekali)

```bash
# 1. Install semua dependency
cd "D:\Project Bestari"
npm run install:all

# 2. Push skema database ke MySQL
npm run db:push

# 3. Seed data awal (admin, user, artikel, agenda, dll)
npm run db:seed
```

> Pastikan MySQL sudah jalan & database `bestari` sudah dibuat.
> Konfigurasi koneksi di `backend/.env` (`DATABASE_URL`).

## 📦 Script Lainnya

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` / `npm start` | Jalanin backend + frontend bareng |
| `npm run build` | Build backend + frontend untuk produksi |
| `npm run install:all` | Install dependency backend + frontend |
| `npm run db:push` | Sinkronkan skema Prisma ke MySQL |
| `npm run db:seed` | Isi data awal |
