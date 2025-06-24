const express = require('express');
const router = express.Router();
const pendaftaranController = require('../../controllers/mahasiswa/pendaftaran');
const userGuard = require('../../middleware/decodeJWT');

// GET: Tampilkan form
router.get('/', userGuard, pendaftaranController.getFormPendaftaran);

// POST: Submit form
router.post('/', userGuard, pendaftaranController.submitFormPendaftaran);

module.exports = router;
