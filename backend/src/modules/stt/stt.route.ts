import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { execFile } from 'child_process';

const router = Router();

const upload = multer({
  dest: path.join(process.cwd(), 'uploads/temp_audio/'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Audio file is required' });
    }

    const inputPath = req.file.path;
    const outputPath = `${inputPath}.wav`;

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

    // 2. Transcribe using whisper.cpp binary
    const whisperExe = path.join(process.cwd(), 'whisper-bin', 'Release', 'whisper-cli.exe');
    const modelPath = path.join(process.cwd(), 'models', 'ggml-small.bin');

    if (!fs.existsSync(whisperExe) || !fs.existsSync(modelPath)) {
      console.error(`STT Error: Missing executable or model. \\nExe: ${whisperExe} (${fs.existsSync(whisperExe)}) \\nModel: ${modelPath} (${fs.existsSync(modelPath)})`);
      return res.status(500).json({ success: false, message: 'STT engine not initialized properly' });
    }

    const whisperResult = await new Promise<string>((resolve, reject) => {
      // whisper.cpp flags:
      // -nt (no timestamps)
      // -m (model path)
      // -f (file path)
      // -l id (language indonesian)
      execFile(whisperExe, ['-m', modelPath, '-f', outputPath, '-l', 'id', '-nt'], (error, stdout, stderr) => {
        if (error) {
          console.error('Whisper exec error:', error);
          console.error('Whisper stderr:', stderr);
          return reject(error);
        }
        resolve(stdout);
      });
    });

    // Clean up temporary files
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    // Whisper output often has leading/trailing spaces or brackets. Clean it up.
    // e.g. "   [00:00:00.000 --> 00:00:05.000]   Halo dunia"
    // Since we pass -nt, it should just be raw text, but let's be safe.
    let text = whisperResult.trim();
    // Remove anything inside brackets [ ] if they somehow appear
    text = text.replace(/\[.*?\]/g, '').trim();

    return res.status(200).json({ success: true, text });
  } catch (error: any) {
    console.error('STT Error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    if (req.file && fs.existsSync(`${req.file.path}.wav`)) fs.unlinkSync(`${req.file.path}.wav`);
    return res.status(500).json({ success: false, message: 'Gagal memproses suara' });
  }
});

export default router;
