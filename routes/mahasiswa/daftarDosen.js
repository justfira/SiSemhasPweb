const express = require('express');
const router = express.Router();
const { getDaftarDosen } = require('../../controllers/mahasiswa/daftarDosen');

router.get('/', getDaftarDosen);

module.exports = router;