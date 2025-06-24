const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Middleware untuk memeriksa dan memvalidasi JWT dari cookies
const userGuard = (req, res, next) => {
  // Ambil token dari cookies
  const token = req.cookies.token; // Misalnya token disimpan dengan nama 'token' di cookie
  
  if (!token) {
    return res.status(401).send('Access denied, no token provided');
  }

  try {
    // Verifikasi token JWT dan decode isinya
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan decoded token di request object untuk digunakan di route selanjutnya
    req.user = decoded;  // Misalnya, di dalam token ada field userId, email, role, dll.
    
    next(); // Token valid, lanjutkan ke route berikutnya
  } catch (error) {
    console.error('JWT error:', error);
    return res.status(400).send('Invalid token');
  }
};

module.exports = userGuard;
