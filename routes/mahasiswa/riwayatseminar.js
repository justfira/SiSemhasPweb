// routes/riwayatSemhasRouter.js

const express = require('express');
const router = express.Router();
const { getRiwayatSemhas } = require('../../controllers/mahasiswa/riwayat');
const userGuard = require('../../middleware/decodeJWT')

// Route untuk menampilkan riwayat semhas
router.get('/riwayatseminar', userGuard, getRiwayatSemhas);

module.exports = router;
