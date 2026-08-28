const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * File upload utility using multer with local disk storage.
 *
 * Design Decision: Files are stored in /uploads/<type>/ directories.
 * The contentUrl stored in the DB is just the relative path (e.g. "videos/abc.mp4"),
 * NOT a full URL. The Express static middleware serves /uploads at /static.
 * Swapping to S3/Cloudinary later only requires changing this file + the static route —
 * no DB migration needed since we just update the base URL prefix.
 */

// Ensure upload directories exist
const UPLOAD_ROOT = path.join(__dirname, '../../uploads');
['videos', 'pdfs', 'thumbnails', 'certificates'].forEach((dir) => {
  const fullPath = path.join(UPLOAD_ROOT, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Map MIME types to subdirectories
const getDestination = (mimetype) => {
  if (mimetype.startsWith('video/')) return 'videos';
  if (mimetype === 'application/pdf') return 'pdfs';
  if (mimetype.startsWith('image/')) return 'thumbnails';
  return 'misc';
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_ROOT, getDestination(file.mimetype));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max
});

/**
 * Returns the relative path for DB storage, e.g. "videos/1234567890.mp4"
 */
const getRelativePath = (file) => {
  const subDir = getDestination(file.mimetype);
  return `${subDir}/${file.filename}`;
};

module.exports = { upload, getRelativePath, UPLOAD_ROOT };
