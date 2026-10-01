const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ─── Multer Storage ───────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `audio-${unique}${path.extname(file.originalname) || '.webm'}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'video/webm'];
  if (allowed.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'), false);
  }
};

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 25 * 1024 * 1024 } });

// ─── Upload Audio ─────────────────────────────────────────────────────────────
exports.uploadAudio = (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No audio file uploaded' });
  const audioUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({
    success: true,
    data: {
      filename: req.file.filename,
      url: audioUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
};

// ─── Delete Audio ─────────────────────────────────────────────────────────────
exports.deleteAudio = (req, res) => {
  const { filename } = req.params;
  // Security: ensure filename doesn't traverse directories
  const safeName = path.basename(filename);
  const filePath = path.join(uploadsDir, safeName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return res.json({ success: true, message: 'Audio deleted' });
  }
  res.status(404).json({ success: false, message: 'File not found' });
};
