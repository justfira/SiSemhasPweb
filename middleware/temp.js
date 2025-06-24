const multer = require('multer');
const path = require('path');

// Set multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './temp_files'); // Simpan file di folder temp_files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Berikan nama file unik berdasarkan timestamp
  },
});

const upload = multer({ storage: storage });

// Use upload.single('file') to handle a single file upload