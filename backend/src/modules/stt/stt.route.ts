import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const router = Router();

const upload = multer({
  dest: path.join(process.cwd(), 'uploads/temp_audio/'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// STT engine dipindah ke PC putih (lebih kuat CPU-nya) via whisper-server HTTP API.
// Override via env STT_SERVICE_URL kalau lokasi service berubah.
const STT_SERVICE_URL = process.env.STT_SERVICE_URL || 'http://100.90.80.90:8300/inference';

// Jaringan Tailscale antar node kadang flapping sesaat, jadi retry ringan sebelum menyerah.
async function fetchWithRetry(url: string, init: RequestInit, attempts = 3, delayMs = 1500): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

router.post('/', upload.single('audio'), async (req, res) => {
  const inputPath = req.file?.path;
  const outputPath = inputPath ? `${inputPath}.wav` : undefined;

  try {
    if (!req.file || !inputPath || !outputPath) {
      return res.status(400).json({ success: false, message: 'Audio file is required' });
    }

    // 1. Convert to 16kHz WAV using FFmpeg (whisper.cpp requirement)
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-ar 16000',
          '-ac 1',
          '-c:a pcm_s16le' // Use 16-bit PCM for whisper.cpp
        ])
        .save(outputPath)
        .on('end', resolve)
        .on('error', reject);
    });

    // 2. Kirim ke whisper-server di PC putih untuk transkripsi
    const wavBuffer = fs.readFileSync(outputPath);
    const form = new FormData();
    form.append('file', new Blob([wavBuffer], { type: 'audio/wav' }), 'audio.wav');

    const sttResponse = await fetchWithRetry(STT_SERVICE_URL, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(60_000),
    });

    if (!sttResponse.ok) {
      console.error('STT service error:', sttResponse.status, await sttResponse.text().catch(() => ''));
      return res.status(502).json({ success: false, message: 'STT engine tidak dapat dihubungi' });
    }

    const result = await sttResponse.json() as { text?: string };

    // Clean up temporary files
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    // whisper-server bisa menyisakan newline/bracket timestamp, bersihkan.
    let text = (result.text || '').trim();
    text = text.replace(/\[.*?\]/g, '').trim();

    return res.status(200).json({ success: true, text });
  } catch (error: any) {
    console.error('STT Error:', error);
    if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    return res.status(500).json({ success: false, message: 'Gagal memproses suara' });
  }
});

export default router;
