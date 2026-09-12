import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { env } from '../config/env.js';

const uploadDir = path.resolve(env.uploadDir);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png'].includes(ext) ? ext : '.jpg';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, unique);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.maxFileSize },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpeg|jpg|png)$/.test(file.mimetype);
    if (!ok) return cb(new Error('Only JPG/PNG images are allowed'));
    cb(null, true);
  },
});