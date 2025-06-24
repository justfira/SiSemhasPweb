const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Menyimpan decoded token ke dalam req.user
    console.log('Decoded user:', req.user); // Log user untuk debugging
    next();
  } catch (error) {
    console.log('Error dalam token:', error);
    return res.status(400).json({ message: 'Token tidak valid' });
  }
};

module.exports = { auth };