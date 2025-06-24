const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const login = async (req, res) => {
  const { email, id_user, password, role, nama_lengkap } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id_user, email: user.email, role: user.role, nama_lengkap: user.nama_lengkap },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const decodedToken = jwt.decode(token);

    console.log("id cookie : ", decodedToken.userId);
    console.log("email cookie : ", decodedToken.email);
    console.log("role cookie : ", decodedToken.role);
    console.log("nama lengkap cookie : ", decodedToken.nama_lengkap);

    res.cookie('token', token, { httpOnly: true, maxAge: 3600000 }); // 1 hour expiration
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const showLogin = (req, res) => {
  res.render('login', { title: 'Login' });
};

const register = async (req, res) => {
  const { email, id_user, password, role, nama_lengkap } = req.body;

  try {
    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Cek apakah id_user sudah ada
    const existingId = await prisma.user.findUnique({
      where: { id_user },
    });

    if (existingId) {
      return res.status(400).json({ message: 'ID user already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    if (role === 'MAHASISWA') {
      // Membuat user baru untuk mahasiswa
      newUser = await prisma.user.create({
        data: { email, id_user, password: hashedPassword, role, nama_lengkap },
      });

      // Menambahkan data mahasiswa di tabel pendaftaran
      await prisma.pendaftaran.create({
        data: {
          id_user: newUser.id_user, // Menggunakan id_user yang sama untuk mahasiswa
        },
      });
    } else if (role === 'DOSEN') {
      // Membuat user baru untuk dosen
      newUser = await prisma.user.create({
        data: { email, id_user, password: hashedPassword, role, nama_lengkap },
      });

      // Menambahkan data dosen di tabel dosen (hanya menyimpan id_user untuk dosen, bidang keahlian dan jadwal dosen diinput kemudian)
      // await prisma.dosen.create({
      //   data: {
      //     id_user: newUser.id_user, // Menggunakan id_user yang sama untuk dosen
      //   },
      // });
    }

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, register,showLogin };

