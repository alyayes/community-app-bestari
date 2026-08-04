import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  jwt: {
    secret: process.env.JWT_SECRET || 'rahasia-default-ganti-di-env',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cors: {
    // Dukung multi-origin dipisah koma: "http://a,http://b" -> ["http://a","http://b"]
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean),
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  },
};
