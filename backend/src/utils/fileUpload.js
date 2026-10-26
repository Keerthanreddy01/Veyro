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

// Allowed MIME types and extensions
const ALLOWED_VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/mov',
  'video/x-quicktime',
  'video/x-m4v',
  'video/ogg',
];
const ALLOWED_VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.ogg', '.m4v'];

const ALLOWED_DOC_MIMES = ['application/pdf'];
const ALLOWED_DOC_EXTS = ['.pdf'];

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

// Map MIME types to subdirectories
const getDestination = (mimetype) => {
  if (mimetype && (mimetype.startsWith('video/') || mimetype.includes('quicktime'))) return 'videos';
  if (mimetype === 'application/pdf') return 'pdfs';
  if (mimetype && mimetype.startsWith('image/')) return 'thumbnails';
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
    let ext = path.extname(file.originalname).toLowerCase();
    // Normalize .mov extension if missing or quicktime
    if (!ext && (file.mimetype === 'video/quicktime' || file.mimetype === 'video/mov')) {
      ext = '.mov';
    } else if (!ext && file.mimetype === 'video/mp4') {
      ext = '.mp4';
    }
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mimetype = (file.mimetype || '').toLowerCase();

  const isVideo = ALLOWED_VIDEO_MIMES.includes(mimetype) || ALLOWED_VIDEO_EXTS.includes(ext);
  const isDoc = ALLOWED_DOC_MIMES.includes(mimetype) || ALLOWED_DOC_EXTS.includes(ext);
  const isImage = ALLOWED_IMAGE_MIMES.includes(mimetype) || ALLOWED_IMAGE_EXTS.includes(ext);

  if (isVideo || isDoc || isImage) {
    cb(null, true);
  } else {
    const err = new Error(
      `File type ${file.mimetype || ext} not allowed. Supported video formats: MP4, WebM, QuickTime (MOV). Supported documents: PDF.`
    );
    err.statusCode = 400;
    err.isUploadError = true;
    cb(err, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB max
});

/**
 * Validates actual binary file content header (magic bytes) to ensure the file
 * genuinely matches its declared MIME type and extension.
 */
function validateFileHeader(filePath, mimetype, originalname) {
  if (!fs.existsSync(filePath)) return false;

  const ext = path.extname(originalname || filePath).toLowerCase();
  const mime = (mimetype || '').toLowerCase();

  try {
    const buffer = Buffer.alloc(32);
    const fd = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(fd, buffer, 0, 32, 0);
    fs.closeSync(fd);

    if (bytesRead < 4) return false;

    // PDF validation (%PDF- : 0x25, 0x50, 0x44, 0x46)
    if (ext === '.pdf' || mime === 'application/pdf') {
      return buffer.slice(0, 4).toString('ascii') === '%PDF';
    }

    // WebM / Matroska validation (0x1A, 0x45, 0xDF, 0xA3)
    if (ext === '.webm' || mime === 'video/webm') {
      return buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3;
    }

    // MP4 / QuickTime MOV validation (ISO Base Media or QuickTime container atoms)
    if (
      ['.mp4', '.m4v', '.mov'].includes(ext) ||
      ['video/mp4', 'video/quicktime', 'video/mov', 'video/x-quicktime', 'video/x-m4v'].includes(mime)
    ) {
      // Check 4-byte box types at offset 4 (e.g. ftyp, moov, mdat, wide, free, skip)
      const boxType = buffer.slice(4, 8).toString('ascii');
      if (['ftyp', 'moov', 'mdat', 'wide', 'free', 'skip', 'pnot'].includes(boxType)) {
        return true;
      }
      // Or atom starting directly at byte 0
      const startBox = buffer.slice(0, 4).toString('ascii');
      if (['moov', 'mdat', 'wide', 'ftyp'].includes(startBox)) {
        return true;
      }
      return false;
    }

    // Ogg video (OggS : 0x4F, 0x67, 0x67, 0x53)
    if (ext === '.ogg' || mime === 'video/ogg') {
      return buffer.slice(0, 4).toString('ascii') === 'OggS';
    }

    // Image validations
    if (ext === '.jpg' || ext === '.jpeg' || mime === 'image/jpeg') {
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }
    if (ext === '.png' || mime === 'image/png') {
      return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    }
    if (ext === '.webp' || mime === 'image/webp') {
      return (
        buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
        buffer.slice(8, 12).toString('ascii') === 'WEBP'
      );
    }

    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Returns the relative path for DB storage, e.g. "videos/1234567890.mp4"
 */
const getRelativePath = (file) => {
  const subDir = getDestination(file.mimetype);
  return `${subDir}/${file.filename}`;
};

module.exports = {
  upload,
  getRelativePath,
  validateFileHeader,
  UPLOAD_ROOT,
  ALLOWED_VIDEO_MIMES,
  ALLOWED_VIDEO_EXTS,
};
