import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.route';
import artikelRoutes from './modules/artikel/artikel.route';
import pengumumanRoutes from './modules/pengumuman/pengumuman.route';
import agendaRoutes from './modules/agenda/agenda.route';
import threadRoutes from './modules/forum/thread.route';
import dashboardRoutes from './modules/dashboard/dashboard.route';
import adminRoutes from './modules/admin/admin.route';
import bannerRoutes from './modules/banner/banner.route';
import hargaPasarRoutes from './modules/harga-pasar/hargaPasar.route';
import uploadRoutes from './modules/upload/upload.route';
import cmsRoutes from './modules/cms/cms.route';
import sttRoutes from './modules/stt/stt.route';
import scmRoutes from './modules/scm/scm.route';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 files
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), config.upload.dir)));

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), app: 'Bestari - KWT Sorgum' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/artikel', artikelRoutes);
app.use('/api/pengumuman', pengumumanRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/thread', threadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banner', bannerRoutes);
app.use('/api/harga-pasar', hargaPasarRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/stt', sttRoutes);
app.use('/api/scm', scmRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// Error handler
app.use(errorHandler);

// Start
app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🌾 BESTARI - KWT Sorgum API           ║
  ║   Eco-Tech Feminine Agriculture         ║
  ╠══════════════════════════════════════════╣
  ║  HTTP  : http://localhost:${config.port}       ║
  ║  Env   : ${config.nodeEnv}                   ║
  ╚══════════════════════════════════════════╝
  `);

  const dir = path.join(process.cwd(), config.upload.dir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

export { app };
