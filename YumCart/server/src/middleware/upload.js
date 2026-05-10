import path from 'path';
import fs from 'fs';
import multer from 'multer';

const uploadsDir = path.join(process.cwd(), 'uploads', 'foods');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || '') || '.jpg';
    cb(null, `food-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

function imageFilter(req, file, cb) {
  const ok = /\.(jpeg|jpg|png|webp|gif)$/i.test(file.originalname || '');
  if (!ok) {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
    return;
  }
  cb(null, true);
}

export const uploadFoodImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter,
});
