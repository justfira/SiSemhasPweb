const express = require('express');
const router = express.Router();
const { getDashboardD } = require('../../controllers/dosen/dosen');
const userGuard = require('../../middleware/decodeJWT');

// HANYA ADA SATU HANDLER YAITU getDashboardD
router.get('/', userGuard, getDashboardD);

module.exports = router;