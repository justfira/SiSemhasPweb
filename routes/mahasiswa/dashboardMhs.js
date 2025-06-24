const express = require('express');
const router = express.Router();
const { getFormDashboard } = require('../../controllers/mahasiswa/dashboard');
const userGuard = require('../../middleware/decodeJWT');
// const pendaftaranController = require('../../controllers/mahasiswa/pendaftaranController');

// // const pendaftaranController = require('../controllers/pendaftaranController');
// // router.get('/pendaftaran', pendaftaranController.getPendaftaranData);
// router.get('/pendaftaran/pdf', pendaftaranController.downloadPendaftaranPdf);

router.get('/dashboard', userGuard, getFormDashboard); // Menangani tampilan dashboard
// router.get('/pendaftaran/pdf', userGuard, pendaftaranController.downloadPendaftaranPdf); // Menangani download PDF laporan

module.exports = router;



// Rute untuk dashboard
//router.get('/dashboard', userGuard, dashboardController.getFormDashboard, (req, res) => {
  // try {
  //   console.log('User data from JWT:', req.user);

  //   if (!req.user) {
  //     return res.status(401).json({ message: 'User not found' });
  //   }

  //   const { nama_lengkap } = req.user;  // Ambil nama_lengkap dari req.user
  //   console.log('Nama Lengkap yang dikirim ke view:', nama_lengkap);

  //   res.locals.nama_lengkap = nama_lengkap;

  //   // Kirimkan nama_lengkap ke view menggunakan res.render
  //   res.render('mahasiswa/dashboardMhs', { nama_lengkap }); // <-- Ini bagian penting
  // } catch (error) {
  //   console.error('Error saat merender view:', error);
  //   return res.status(500).json({ message: 'Terjadi kesalahan saat merender halaman' });
  // }
//});