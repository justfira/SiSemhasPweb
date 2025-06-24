// Lokasi: routes/dosen/penilaian.js
const express = require('express');
const router = express.Router();

const { auth: authMiddleware } = require('../../middleware/authMiddleware');
const dosenMiddleware = require('../../middleware/dosen');
const penilaianController = require('../../controllers/dosen/penilaian');


// Rute untuk menampilkan halaman (view)
router.get(
    '/',
    authMiddleware,
    dosenMiddleware,
    penilaianController.renderPenilaianPage
);

// Rute API untuk mengambil nilai yang sudah ada
router.get(
    '/api/nilai/:mahasiswaId',
    authMiddleware,
    dosenMiddleware,
    penilaianController.getExistingNilai
);

// Rute API untuk mengirim/menyimpan penilaian
router.post(
    '/api/penilaian',
    authMiddleware,
    dosenMiddleware,
    penilaianController.submitPenilaian
);

// Catatan: endpoint /api/mahasiswa-bimbingan yang dipanggil di frontend (JS) Anda tidak ada di sini.
// Jika Anda ingin menggunakannya, Anda harus menambahkannya:
/*
router.get(
    '/api/mahasiswa-bimbingan',
    authMiddleware,
    dosenMiddleware,
    penilaianController.getMahasiswaBimbinganApi // Anda perlu membuat fungsi ini di controller
);
*/

module.exports = router;