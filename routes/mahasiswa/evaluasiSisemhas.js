const express = require('express');
const router = express.Router();
const evaluasiController = require('../../controllers/mahasiswa/eval');
const userGuard = require('../../middleware/decodeJWT');

// Debug log untuk melihat apakah route terpanggil
router.get('/', (req, res) => {
  console.log('DEBUG: Route /evaluasi GET terpanggil');
  res.render('mahasiswa/evaluasiSisemhas'); // pastikan path EJS-nya benar
});

router.post('/', evaluasiController.postFormEvaluasi);

module.exports = router;