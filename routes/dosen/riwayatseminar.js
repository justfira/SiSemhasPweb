const express = require('express');
const router = express.Router();

const riwayatSeminarController = require('../../controllers/dosen/riwayatseminar');

// UBAH CARA ANDA MENGIMPOR MIDDLEWARE INI (Sudah benar seperti ini)
const { auth: authMiddleware } = require('../../middleware/authMiddleware');
const dosenMiddleware = require('../../middleware/dosen');


// Rute untuk menampilkan halaman EJS
router.get('/', authMiddleware, dosenMiddleware, riwayatSeminarController.index);

// Rute untuk menampilkan halaman detail (ID di sini adalah id_rubik)
router.get('/detail/:id', authMiddleware, dosenMiddleware, riwayatSeminarController.detail);

// Rute untuk export data
router.get('/export', authMiddleware, dosenMiddleware, riwayatSeminarController.exportData);

// Rute API untuk DataTables
router.get('/api/data', authMiddleware, dosenMiddleware, riwayatSeminarController.getApiData);

// Rute API untuk update status (ID di sini adalah id_rubik)
router.put('/status/:id', authMiddleware, dosenMiddleware, riwayatSeminarController.updateStatus);

module.exports = router;