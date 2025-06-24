// // di file: middleware/auth.js
// const jwt = require('jsonwebtoken');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient(); // Inisialisasi Prisma

// const auth = async (req, res, next) => { // Pastikan ini async
//     console.log('DEBUG AUTH: req.cookies:', req.cookies); // TAMBAHKAN INI
//     console.log('DEBUG AUTH: req.cookies.token:', req.cookies.token); // DAN INI


//     const token = req.cookies.token;

//     if (!token) {
//         console.log('No token found, redirecting to login');
//         // Gunakan res.redirect jika Anda ingin mengarahkan ke halaman login
//         return res.redirect('/login');
//         // Atau return res.status(401).json({ message: 'No token, authorization denied' }); jika ini API
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         // 'decoded.id' dari JWT Anda adalah 'id_user' dari tabel 'user'

//         // Lakukan query ke tabel 'user' untuk mendapatkan 'id_dosen' yang terkait
//         // Pastikan nama model Prisma Anda untuk tabel 'user' adalah 'User' (sesuai conventions)
//         const userFromDb = await prisma.user.findUnique({ // Ganti 'user' jika nama model Anda berbeda
//             where: { id_user: decoded.id }, // decoded.id adalah id_user
//             select: { id_user: true, email: true, role: true, } // Pastikan id_dosen diambil
//         });

//         if (!userFromDb) {
//             console.error('Token valid tapi user tidak ditemukan di database.');
//             return res.redirect('/login');
//         }

//         // SET req.user dengan properti yang BENAR-BENAR Anda butuhkan
//         req.user = {
//             id_user_akun: userFromDb.id_user, // ID akun pengguna dari JWT
//             email: userFromDb.email,
//             role: userFromDb.role
//         };
//         next();
//     } catch (error) {
//         console.error('Autentikasi gagal (token tidak valid atau error lainnya):', error);
//         return res.redirect('/login');
//     }
// };

// module.exports = { auth };