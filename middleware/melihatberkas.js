// C:\PwebIla\tbpweb4\middleware\melihatberkas.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Direktori tempat file akan disimpan
// Pastikan ini sesuai dengan UPLOAD_DIR di controller
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'berkas'); 

// Buat direktori jika belum ada
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR); // Tentukan folder tujuan
    },
    filename: function (req, file, cb) {
        // Buat nama file unik: [tipe_berkas]-[userId/timestamp]-[random].[ext]
        const tipe = req.params.tipe || 'unknown'; // Ambil tipe dari URL
        const userId = req.user?.userId || 'guest'; // Ambil userId dari req.user jika ada
        const fileExtension = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${tipe}-${userId}-${uniqueSuffix}${fileExtension}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // Batasan ukuran file 20MB
    fileFilter: (req, file, cb) => {
        // Pastikan hanya file PDF yang diizinkan
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            // Jika bukan PDF, berikan error
            cb(new Error('Hanya file PDF yang diizinkan!'), false);
        }
    }
});

module.exports = upload;