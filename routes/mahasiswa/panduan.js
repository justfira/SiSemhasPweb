const express = require('express');
const router = express.Router();
const panduanMController = require('../../controllers/mahasiswa/panduanM');

// Route mahasiswa untuk melihat panduan terbaru
router.get('/latest', panduanMController.getLatestPanduanApi);

// Route mahasiswa untuk melihat file panduan (PDF)
router.get('/file/:id', panduanMController.getPanduanFileApi);

router.get('/', function(req, res) {
  res.render('mahasiswa/panduan'); 
})
;

module.exports = router;