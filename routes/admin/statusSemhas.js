const express = require('express');
const router = express.Router();
const { getPendaftaran } = require('../../controllers/admin/statusSemhas');
const { updateStatus } = require('../../controllers/admin/statusSemhas');

// Route untuk menampilkan data pendaftaran
router.get('/status', getPendaftaran);

// Route untuk memperbarui status seminar
router.post('/updateStatus/:id', updateStatus);

module.exports = router;
