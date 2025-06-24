// routes/riwayatSemhasRouter.js

const express = require('express');
const router = express.Router();
const { getRiwayatSemhas } = require('../../controllers/mahasiswa/detailRiwayat');
const { generateRiwayatSeminarPdf } = require('../../controllers/mahasiswa/generateRiwayat')
const userGuard = require('../../middleware/decodeJWT');

// Route untuk menampilkan detail riwayat seminar
router.get('/detailRiwayat/:id',userGuard, getRiwayatSemhas);
// Route untuk generate PDF berdasarkan ID seminar
router.get('/pendaftaran/pdf/:id', userGuard, generateRiwayatSeminarPdf);

module.exports = router;
