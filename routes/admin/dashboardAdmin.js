// routes/admin/dashboardAdmin.js
var express = require('express');
var router = express.Router();
const userGuard = require('../../middleware/decodeJWT');

/* GET admin dashboard page. */
// Ini akan menjadi route default /admin/
router.get('/',userGuard, function(req, res, next) {
  // Render halaman admin dan beritahu frontend untuk merender 'daftarRoleUser' sebagai default
  res.render('admin/dashboardAdmin', { initialPageId: 'daftarRoleUser' });
});

/* GET Daftar Role User page. */
// Route spesifik untuk Daftar Role User
router.get('/daftar-role-user',userGuard, function(req, res, next) {
  res.render('admin/dashboardAdmin', { initialPageId: 'daftarRoleUser' });
});

router.get('/hapus-user', function(req, res, next) {
  res.render('admin/dashboardAdmin', { initialPageId: 'hapusUser' });
});

/* GET Permintaan Akses page. */
// Route spesifik untuk Permintaan Akses
router.get('/permintaan-akses',userGuard, function(req, res, next) {
  res.render('admin/dashboardAdmin', { initialPageId: 'permintaanAkses' });
});

/* GET Panduan Seminar page. */
// Route spesifik untuk Panduan Seminar
router.get('/panduan-seminar',userGuard, function(req, res, next) {
  res.render('admin/dashboardAdmin', { initialPageId: 'panduanSeminar' });
});

/* GET Panduan Seminar page. */
router.get('/panduan-seminar', function(req, res, next) {
  res.render('admin/dashboardAdmin', { initialPageId: 'panduanSeminar' });
});

/* GET Riwayat Panduan page. */
// <--- TAMBAHKAN ROUTE BARU INI ---
router.get('/panduan-riwayat', function(req, res, next) {
  // Kita bisa menggunakan EJS yang sama, hanya memberinya initialPageId yang berbeda
  res.render('admin/dashboardAdmin', { initialPageId: 'panduanRiwayat' });
  // Atau Anda bisa membuat file EJS yang benar-benar terpisah untuk ini, misal:
  // res.render('admin/panduanRiwayat', { title: 'Riwayat Panduan' });
});

/* GET Evaluasi Sistem page. */
// Route spesifik untuk Evaluasi Sistem
router.get('/evaluasi-sistem',userGuard, function(req, res, next) {
  res.render('admin/dashboardAdmin', { initialPageId: 'evaluasiSistem' });
});

/* GET Daftar Jadwal page. */
// Route spesifik untuk Daftar Jadwal
router.get('/daftar-jadwal',userGuard, function(req, res, next) {
  res.render('admin/dashboardAdmin', { initialPageId: 'daftarJadwal' });
});

module.exports = router;