var express = require('express');
var router = express.Router();
const {getFormMelihat} = require('../../controllers/mahasiswa/melihatnilai');
const userGuard = require('../../middleware/decodeJWT')

/* GET users listing. */
router.get('/', userGuard, async (req, res)=> {
  await getFormMelihat(req, res);
});

module.exports = router;