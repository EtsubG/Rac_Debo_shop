import multer from 'multer';
import { env } from '../config/env.ts';

export const paymentProofUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.maxFileSize,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error('Only JPG, JPEG, and PNG images are allowed')
      );
    }

    cb(null, true);
  },
});