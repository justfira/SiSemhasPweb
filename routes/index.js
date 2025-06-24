var express = require('express');
var router = express.Router();
const methodOverride = require('method-override');
const { login, register, showLogin } = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');
const { getDashboardD } = require('../controllers/dosen/dosen'); 
const { getFormDashboard } = require('../controllers/mahasiswa/dashboard');
const { listBidangKeahlian, tambahBidangKeahlian, ubahBidangKeahlian, hapusBidangKeahlian } = require('../controllers/kadepController');

/* GET home page. */
router.get('/', (req, res) => {
  res.render('kadep');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});


router.get('/dashboard', auth, async (req, res) => {
  console.log('role:', req.user.role);

  if (req.user.role === 'ADMIN') {
    return res.render('admin/dashboardAdmin');
  } else if (req.user.role === 'DOSEN') {
    return res.render('dosen/dashboardD', { dosen: req.user });
  } else if (req.user.role === 'KADEP') {
    return res.render('kadep/dashboardKadep', { kadep: req.user });
  } else if (req.user.role === 'MAHASISWA') {
    return await getFormDashboard(req, res);
  } else {
    return res.status(403).json({ message: 'Access denied. Invalid role.' });
  }
});


router.post('/login', login);
router.post('/register', register);


// Controller Kadep
router.use(methodOverride('_method'));
router.get('/bidang-keahlian', listBidangKeahlian);
router.post('/:nip/bidang-keahlian', tambahBidangKeahlian);
router.put('/:nip/bidang-keahlian', ubahBidangKeahlian);
router.delete('/:nip/bidang-keahlian', hapusBidangKeahlian);
router.get('/dosenpenguji', (req, res) => {
  res.render('kadep/dosenpenguji');
});
router.get('/kuota', (req, res) => {
  res.render('kadep/kuota');
});
router.get('/periodependaftaran', (req, res) => {
  res.render('kadep/periodependaftaran');
});
router.get('/rekapitulasi', (req, res) => {
  res.render('kadep/rekapitulasi');
});
router.get('/rubrikpenilaian', (req, res) => {
  res.render('kadep/rubrikpenilaian');
});
router.get('/statistik', (req, res) => {
  res.render('kadep/statistikseminar');
});

module.exports = router;