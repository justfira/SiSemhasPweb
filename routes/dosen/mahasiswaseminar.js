const express = require('express');
const router = express.Router();
const mahasiswaseminarController = require('../../controllers/dosen/mahasiswaseminar');
const userGuard = require('../../middleware/decodeJWT'); 


// router.get('/', mahasiswaseminarController.getListMahasiswa);
router.get('/', userGuard, mahasiswaseminarController.getListMahasiswa);


module.exports = router;
