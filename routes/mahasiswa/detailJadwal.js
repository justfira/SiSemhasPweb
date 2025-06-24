const express = require('express');
const router = express.Router();
const { getJadwal, getAllJadwalSemhas } = require('../../controllers/mahasiswa/detailJadwal');
const userGuard = require('../../middleware/decodeJWT');

// Rute utama untuk menampilkan semua jadwal semhas
router.get('/', userGuard, getAllJadwalSemhas);

// Rute untuk melihat detail jadwal berdasarkan ID pendaftaran (opsional)
router.get('/:id', userGuard, getJadwal);

module.exports = router;