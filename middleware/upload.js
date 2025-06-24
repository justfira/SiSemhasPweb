const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Buat folder uploads jika belum ada
const uploadPath = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadPath, { recursive: true });

// Konfigurasi multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Hanya file PDF yang diperbolehkan'), false);
    }
    cb(null, true);
  }
});

module.exports = upload;