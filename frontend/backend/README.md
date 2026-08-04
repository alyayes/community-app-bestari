# Dokumentasi Backend KWT Melati Sorgum

Folder ini dipisahkan khusus untuk meletakkan konfigurasi backend, skema basis data, dan kunci API (*API Keys*).

## Konfigurasi Kunci API & Lingkungan
Semua konfigurasi kunci akses berada pada file [config.js](file:///d:/MAGANG/PROJECT/BESTARI/community-app-kwt-sorgum/backend/config.js). 

Ketika Anda ingin mengintegrasikan aplikasi ini dengan server produksi, Anda cukup:
1. Menyalin nilai `API_KEY` dan `JWT_SECRET` ke file environment server Anda (`.env`).
2. Menghubungkan client frontend dengan menggunakan URL server backend ini (default: `http://localhost:8000`).
