/**
 * Konfigurasi Kunci API & Lingkungan Server Backend KWT
 * 
 * Simpan dan sesuaikan kunci API (API Key) serta konfigurasi koneksi database Anda di sini.
 */

module.exports = {
  // 1. Port Server untuk Backend Node.js / Express
  PORT: process.env.PORT || 8000,

  // 2. Kunci API Rahasia (API Key) untuk Otentikasi Client-Server
  API_KEY: process.env.API_KEY || 'kwt_melati_sorgum_secret_apikey_placeholder',

  // 3. URI Koneksi Database (MongoDB / PostgreSQL)
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/kwt_sorgum',

  // 4. Secret Key JWT untuk Keamanan Token Login Anggota
  JWT_SECRET: process.env.JWT_SECRET || 'kwt_melati_jwt_secret_token_12345'
};
