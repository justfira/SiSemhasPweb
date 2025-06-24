const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = require('../../middleware/upload');
const controller = require('../../controllers/mahasiswa/upload');

router.get('/upload/:id_pendaftaran', controller.getUploadForm);

router.post('/upload/:id_pendaftaran',
  upload.fields([
    { name: 'krs', maxCount: 1 },
    { name: 'ppt', maxCount: 1 },
    { name: 'lampiran', maxCount: 1 },
    { name: 'laporan', maxCount: 1 }
  ]),
  controller.handleUpload
);

module.exports = router;
